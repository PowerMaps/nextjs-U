// Address data transformer for autocomplete and location handling

import { BaseTransformer } from './index';
import { Coordinates } from '../types';
import { normalizeAddress, StandardizedAddress } from './data-normalizers';
import { isValidCoordinates } from './type-guards';
import { sanitizeCoordinates, formatCoordinates } from './coordinate-utils';

// Address autocomplete response structure
export interface AddressAutocompleteResponse {
  suggestions: StandardizedAddress[];
  query: string;
  hasMore: boolean;
}

// Raw address data from various sources
export interface RawAddressData {
  name?: string;
  address?: string;
  coordinates?: Coordinates | [number, number];
  location?: {
    coordinates: [number, number];
  };
  formatted_address?: string;
  display_name?: string;
  place_name?: string;
  geometry?: {
    coordinates: [number, number];
  };
}

// Address transformer class
export class AddressDataTransformer extends BaseTransformer<
  RawAddressData,
  StandardizedAddress
> {
  validate(input: unknown): input is RawAddressData {
    if (!input || typeof input !== 'object') return false;
    
    const data = input as Record<string, unknown>;
    
    // Must have some form of coordinates
    const hasCoordinates = 
      data.coordinates ||
      (data.location as any)?.coordinates ||
      (data.geometry as any)?.coordinates;
    
    return !!hasCoordinates;
  }

  transform(input: RawAddressData): StandardizedAddress {
    return normalizeAddress(input);
  }

  // Transform array of address suggestions
  transformSuggestions(
    suggestions: RawAddressData[],
    query: string,
    hasMore: boolean = false
  ): AddressAutocompleteResponse {
    const transformedSuggestions = suggestions
      .map(suggestion => this.safeTransform(suggestion))
      .filter((suggestion): suggestion is StandardizedAddress => suggestion !== null);
    
    return {
      suggestions: transformedSuggestions,
      query,
      hasMore,
    };
  }

  // Create standardized address from coordinates
  createFromCoordinates(coordinates: Coordinates, name?: string): StandardizedAddress {
    const sanitized = sanitizeCoordinates(coordinates);
    if (!sanitized) {
      throw new Error('Invalid coordinates provided');
    }
    
    return {
      name: name || 'Custom Location',
      coordinates: sanitized,
      formattedAddress: formatCoordinates(sanitized),
    };
  }

  // Create standardized address from string input
  createFromString(input: string): StandardizedAddress | null {
    const coordinates = sanitizeCoordinates(input);
    if (!coordinates) return null;
    
    return {
      name: 'Custom Location',
      coordinates,
      formattedAddress: input,
    };
  }

  // Validate and clean address input
  validateAddressInput(input: unknown): {
    isValid: boolean;
    coordinates?: Coordinates;
    error?: string;
  } {
    // Try to extract coordinates from various formats
    const coordinates = sanitizeCoordinates(input);
    
    if (coordinates) {
      return {
        isValid: true,
        coordinates,
      };
    }
    
    // Check if it's a valid address object
    if (this.validate(input)) {
      try {
        const transformed = this.transform(input);
        return {
          isValid: true,
          coordinates: transformed.coordinates,
        };
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : 'Transformation failed',
        };
      }
    }
    
    return {
      isValid: false,
      error: 'Invalid address format',
    };
  }

  // Sort suggestions by relevance to query
  sortByRelevance(
    suggestions: StandardizedAddress[],
    query: string
  ): StandardizedAddress[] {
    const queryLower = query.toLowerCase();
    
    return suggestions.sort((a, b) => {
      // Exact name matches first
      const aNameMatch = a.name.toLowerCase().includes(queryLower);
      const bNameMatch = b.name.toLowerCase().includes(queryLower);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Address matches second
      const aAddressMatch = a.formattedAddress.toLowerCase().includes(queryLower);
      const bAddressMatch = b.formattedAddress.toLowerCase().includes(queryLower);
      
      if (aAddressMatch && !bAddressMatch) return -1;
      if (!aAddressMatch && bAddressMatch) return 1;
      
      // Alphabetical order as fallback
      return a.name.localeCompare(b.name);
    });
  }

  // Filter suggestions by distance from a point
  filterByDistance(
    suggestions: StandardizedAddress[],
    center: Coordinates,
    maxDistanceKm: number
  ): StandardizedAddress[] {
    const { calculateDistance } = require('./coordinate-utils');
    
    return suggestions.filter(suggestion => {
      const distance = calculateDistance(center, suggestion.coordinates);
      return distance <= maxDistanceKm;
    });
  }

  // Group suggestions by proximity
  groupByProximity(
    suggestions: StandardizedAddress[],
    radiusKm: number = 1
  ): StandardizedAddress[][] {
    const groups: StandardizedAddress[][] = [];
    const used = new Set<number>();
    const { calculateDistance } = require('./coordinate-utils');
    
    suggestions.forEach((suggestion, index) => {
      if (used.has(index)) return;
      
      const group = [suggestion];
      used.add(index);
      
      // Find nearby suggestions
      suggestions.forEach((other, otherIndex) => {
        if (used.has(otherIndex) || index === otherIndex) return;
        
        const distance = calculateDistance(suggestion.coordinates, other.coordinates);
        if (distance <= radiusKm) {
          group.push(other);
          used.add(otherIndex);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }

  // Create address from map click coordinates
  createFromMapClick(
    coordinates: Coordinates,
    reverseGeocodeName?: string
  ): StandardizedAddress {
    return {
      name: reverseGeocodeName || 'Selected Location',
      coordinates,
      formattedAddress: reverseGeocodeName || formatCoordinates(coordinates),
    };
  }
}

// Export singleton instance
export const addressTransformer = new AddressDataTransformer();