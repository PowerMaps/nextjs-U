"use client";

import React, { useState, useCallback, useRef } from 'react';
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

export function AddressAutocomplete({ onSelectAddress, placeholder = "Enter an address", showHistory = true }: AddressAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const { 
    recentLocations, 
    savedLocations, 
    addRecentLocation, 
    saveLocation, 
    removeSavedLocation, 
    isLocationSaved 
  } = useLocationHistory();

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
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

  const handleBlur = () => {
    // Delay hiding dropdown to allow clicks on items
    setTimeout(() => setShowDropdown(false), 200);
  };

  const allHistoryItems = showHistory ? [...recentLocations, ...savedLocations] : [];
  const filteredHistoryItems = searchTerm 
    ? allHistoryItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allHistoryItems.slice(0, 5); // Show only first 5 when no search term

  const getPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const handleSelect = async (suggestion: any) => {
    setSearchTerm(suggestion.description);
    setSuggestions([]);
    setShowDropdown(false);
    
    const placeDetails = await getPlaceDetails(suggestion.place_id);
    if (placeDetails && placeDetails.geometry) {
      const address = {
        name: suggestion.description,
        longitude: placeDetails.geometry.location.lng,
        latitude: placeDetails.geometry.location.lat,
      };
      
      // Add to recent locations
      addRecentLocation(address);
      
      onSelectAddress(address);
    }
  };

  const handleSelectHistoryItem = (item: LocationItem) => {
    setSearchTerm(item.name);
    setShowDropdown(false);
    
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

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
        />
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-80 overflow-y-auto border border-gray-200">
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
              Loading...
            </div>
          )}
          
          {/* History Items */}
          {!isLoading && filteredHistoryItems.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                {searchTerm ? 'Matching History' : 'Recent & Saved'}
              </div>
              {filteredHistoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                >
                  <div 
                    className="flex items-center flex-1 min-w-0"
                    onClick={() => handleSelectHistoryItem(item)}
                  >
                    {item.type === 'recent' ? (
                      <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    ) : (
                      <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center ml-2">
                    {item.type === 'recent' && !isLocationSaved(item) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveLocation(item);
                        }}
                        title="Save location"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    {item.type === 'saved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSavedLocation(item.id);
                        }}
                        title="Remove saved location"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div>
              {filteredHistoryItems.length > 0 && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  Search Results
                </div>
              )}
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(suggestion)}
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{suggestion.structured_formatting.main_text}</div>
                      <div className="text-xs text-gray-500 truncate">{suggestion.structured_formatting.secondary_text}</div>
                    </div>
                  </div>
                </div>
              ))}
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