// components/maps/unified-address-input.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Locate, MapPin, Search, X } from 'lucide-react';
import { useGeolocation } from '@/lib/api/hooks/useGeolocation';

interface AddressResult {
  name: string;
  latitude: number;
  longitude: number;
  type: 'search' | 'current_location';
  placeId?: string;
}

interface UnifiedAddressInputProps {
  placeholder?: string;
  onSelectAddress: (address: AddressResult) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
}

export const UnifiedAddressInput: React.FC<UnifiedAddressInputProps> = ({
  placeholder = "Search address or use current location",
  onSelectAddress,
  value = "",
  className = "",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { getCurrentLocation, loading: locationLoading, error: locationError } = useGeolocation();

  // Auto-complete service
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        console.log('Google Maps Places API is available');
        autocompleteService.current = new google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService (it needs a map or div)
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
        setIsGoogleMapsLoaded(true);
      } else {
        console.log('Google Maps Places API not yet available, retrying...');
        // Retry after a short delay
        setTimeout(checkGoogleMaps, 1000);
      }
    };
    
    checkGoogleMaps();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change and search
  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue);
    
    if (newValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Initialize services if not already done
      if (!autocompleteService.current && window.google?.maps?.places) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
      }

      if (!placesService.current && window.google?.maps?.places) {
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
      }

      if (autocompleteService.current) {
        const request = {
          input: newValue,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'tn' }, // Tunisia - adjust as needed
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          console.log('Autocomplete status:', status);
          console.log('Predictions:', predictions);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const searchResults: (AddressResult & { placeId: string })[] = predictions.slice(0, 5).map(prediction => ({
              name: prediction.description,
              latitude: 0, // Will be filled when selected
              longitude: 0, // Will be filled when selected
              type: 'search' as const,
              placeId: prediction.place_id
            }));
            
            console.log('Search results:', searchResults);
            setSuggestions(searchResults);
            setShowSuggestions(true);
          } else {
            console.log('No predictions or error:', status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
          setIsSearching(false);
        });
      } else {
        console.error('AutocompleteService not available');
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setIsSearching(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressResult & { placeId?: string }) => {
    console.log('Suggestion selected:', suggestion);
    
    if (suggestion.placeId && placesService.current) {
      console.log('Getting place details for:', suggestion.placeId);
      
      const request = {
        placeId: suggestion.placeId,
        fields: ['geometry', 'formatted_address', 'name']
      };

      placesService.current.getDetails(request, (place, status) => {
        console.log('Place details status:', status);
        console.log('Place details:', place);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const result: AddressResult = {
            name: place.formatted_address || place.name || suggestion.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            type: 'search'
          };
          
          console.log('Final result:', result);
          setInputValue(result.name);
          setShowSuggestions(false);
          onSelectAddress(result);
        } else {
          console.error('Failed to get place details:', status);
          // Fallback: use the suggestion name and try geocoding
          setInputValue(suggestion.name);
          setShowSuggestions(false);
        }
      });
    } else {
      console.warn('No placeId or placesService not available');
      setInputValue(suggestion.name);
      setShowSuggestions(false);
    }
  };

  // Handle current location
  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Reverse geocode to get address
        try {
          const geocoder = new google.maps.Geocoder();
          const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
            geocoder.geocode(
              { location: { lat: location.lat, lng: location.lng } },
              (results, status) => {
                if (status === 'OK' && results) {
                  resolve({ results } as google.maps.GeocoderResponse);
                } else {
                  reject(new Error(`Geocoding failed: ${status}`));
                }
              }
            );
          });

          const address = response.results?.[0]?.formatted_address || 'Current Location';
          
          const result: AddressResult = {
            name: address,
            latitude: location.lat,
            longitude: location.lng,
            type: 'current_location'
          };

          setInputValue(result.name);
          setShowSuggestions(false);
          onSelectAddress(result);

        } catch (geocodeError) {
          console.warn('Geocoding failed, using coordinates:', geocodeError);
          
          const result: AddressResult = {
            name: `Current Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
            latitude: location.lat,
            longitude: location.lng,
            type: 'current_location'
          };

          setInputValue(result.name);
          setShowSuggestions(false);
          onSelectAddress(result);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Handle clear input
  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={isGoogleMapsLoaded ? placeholder : "Loading address search..."}
            disabled={disabled || !isGoogleMapsLoaded}
            className="pl-10 pr-10"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Current Location Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={disabled || locationLoading}
          className="ml-2 h-10 px-3 flex-shrink-0"
          title="Use current location"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion as any)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {locationError}
        </div>
      )}
    </div>
  );
};