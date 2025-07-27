"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, Star, X } from 'lucide-react';
import { useLocationHistory, LocationItem } from '@/lib/hooks/use-location-history';

interface AddressAutocompleteProps {
  onSelectAddress: (address: { name: string; longitude: number; latitude: number }) => void;
  placeholder?: string;
  showHistory?: boolean;
}

interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressAutocomplete({
  onSelectAddress,
  placeholder = "Enter an address",
  showHistory = true
}: AddressAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const {
    recentLocations,
    savedLocations,
    addRecentLocation,
    saveLocation,
    removeSavedLocation,
    isLocationSaved
  } = useLocationHistory();

  // Initialize Google Places services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const { initializeGooglePlacesServices } = await import('@/lib/maps/google-maps-loader');
        const services = await initializeGooglePlacesServices();
        
        autocompleteService.current = services.autocompleteService;
        placesService.current = services.placesService;
      } catch (error) {
        console.error('Error initializing Google Places services:', error);
        setError('Failed to initialize location services');
      }
    };

    initializeServices();
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }

    if (!autocompleteService.current) {
      setError('Location services not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tunisiaBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(30.2, 7.5), // Southwest
        new google.maps.LatLng(37.6, 11.6) // Northeast
      );
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ['geocode'],
        componentRestrictions: { country: 'tn' }, // Adjust as needed
        bounds: tunisiaBounds,
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsLoading(false);

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map(prediction => ({
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: {
                main_text: prediction.structured_formatting?.main_text || prediction.description,
                secondary_text: prediction.structured_formatting?.secondary_text || ''
              }
            })));
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setSuggestions([]);
          } else {
            console.error('Error fetching suggestions:', status);
            setError('Failed to fetch location suggestions');
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error in fetchSuggestions:', error);
      setError('Failed to fetch location suggestions');
      setSuggestions([]);
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    setFocusedIndex(-1);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't hide dropdown if focus is moving to dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Delay hiding dropdown to allow clicks on items
    setTimeout(() => setShowDropdown(false), 200);
  };

  const allHistoryItems = showHistory ? [...recentLocations, ...savedLocations] : [];
  const filteredHistoryItems = searchTerm
    ? allHistoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : allHistoryItems.slice(0, 5);

  const allItems = [...filteredHistoryItems, ...suggestions];

  const getPlaceDetails = useCallback(async (placeId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!placesService.current) {
        resolve(null);
        return;
      }

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['name', 'geometry', 'formatted_address']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          resolve({
            name: place.formatted_address || place.name,
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            }
          });
        } else {
          console.error('Error fetching place details:', status);
          resolve(null);
        }
      });
    });
  }, []);

  const handleSelect = async (suggestion: GooglePlacePrediction) => {
    setSearchTerm(suggestion.description);
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);

    try {
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      if (placeDetails?.geometry?.location) {
        const address = {
          name: suggestion.description,
          longitude: placeDetails.geometry.location.lng,
          latitude: placeDetails.geometry.location.lat,
        };

        addRecentLocation(address);
        onSelectAddress(address);
      } else {
        setError('Failed to get location details');
      }
    } catch (error) {
      console.error('Error selecting address:', error);
      setError('Failed to select location');
    }
  };

  const handleSelectHistoryItem = (item: LocationItem) => {
    setSearchTerm(item.name);
    setShowDropdown(false);
    setError(null);

    // Add to recent if it's a saved location
    if (item.type === 'saved') {
      addRecentLocation({
        name: item.name,
        longitude: item.longitude,
        latitude: item.latitude
      });
    }

    onSelectAddress({
      name: item.name,
      longitude: item.longitude,
      latitude: item.latitude
    });
  };

  const handleSaveLocation = (item: LocationItem) => {
    saveLocation({
      name: item.name,
      longitude: item.longitude,
      latitude: item.latitude
    });
  };

  const handleRemoveSavedLocation = (id: string) => {
    removeSavedLocation(id);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          const item = allItems[focusedIndex];
          if ('place_id' in item) {
            handleSelect(item as GooglePlacePrediction);
          } else {
            handleSelectHistoryItem(item as LocationItem);
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="pr-10"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>

      {error && (
        <div className="absolute z-10 w-full bg-red-50 border border-red-200 rounded-md mt-1 p-2">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {showDropdown && !error && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-80 overflow-y-auto border border-gray-200"
          role="listbox"
        >
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
              Loading...
            </div>
          )}

          {/* History Items */}
        

          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div>
              {filteredHistoryItems.length > 0 && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  Search Results
                </div>
              )}
              {suggestions.map((suggestion, index) => {
                const itemIndex = filteredHistoryItems.length + index;
                return (
                  <div
                    key={suggestion.place_id}
                    className={`p-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${focusedIndex === itemIndex ? 'bg-blue-50' : 'hover:bg-gray-100'
                      }`}
                    role="option"
                    aria-selected={focusedIndex === itemIndex}
                    onClick={() => handleSelect(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-500 truncate">{suggestion.structured_formatting.main_text} </div>
                        <div className="text-xs text-gray-500 truncate">{suggestion.structured_formatting.secondary_text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!isLoading && suggestions.length === 0 && filteredHistoryItems.length === 0 && searchTerm && (
            <div className="p-3 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// {!isLoading && filteredHistoryItems.length > 0 && (
//   <div>
//     <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
//       {searchTerm ? 'Matching History' : 'Recent & Saved'}
//     </div>
//     {filteredHistoryItems.map((item, index) => (
      
//       <div
//         key={item.id}
//         className={`flex items-center justify-between p-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${focusedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'
//           }`}
//         role="option"
//         aria-selected={focusedIndex === index}
//         onClick={() => handleSelectHistoryItem(item)}
//       >

//         {item.name}
//         <div className="flex items-center flex-1 min-w-0">
          
//           <span className="truncate">{item.name}</span>
//         </div>
//         {/* <div className="flex items-center ml-2">
//           {item.type === 'recent' && !isLocationSaved(item) && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-6 w-6 p-0"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleSaveLocation(item);
//               }}
//               title="Save location"
//             >
//               <Star className="h-3 w-3" />
//             </Button>
//           )}
//           {item.type === 'saved' && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleRemoveSavedLocation(item.id);
//               }}
//               title="Remove saved location"
//             >
//               <X className="h-3 w-3" />
//             </Button>
//           )}
//         </div> */}
//       </div>
//     ))}
//   </div>
// )}