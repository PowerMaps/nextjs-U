"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface GeocodingSearchProps {
  onSelectLocation: (location: { name: string; longitude: number; latitude: number }) => void;
}

export function GeocodingSearch({ onSelectLocation }: GeocodingSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const debounceRef = useRef<NodeJS.Timeout>();

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error during geocoding search:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleSelect = (result: any) => {
    setSearchTerm(result.name);
    setResults([]);
    onSelectLocation({
      name: result.name,
      longitude: result.geometry.location.lng,
      latitude: result.geometry.location.lat,
    });
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleChange}
          className="flex-grow"
        />
        <Button type="button" disabled={isLoading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isLoading && <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 p-2">Loading...</div>}
      {results.length > 0 && !isLoading && (
        <ul className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <li
              key={result.place_id || index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(result)}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-sm text-gray-500">{result.formatted_address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}