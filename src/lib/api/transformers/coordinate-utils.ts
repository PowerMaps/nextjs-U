// Coordinate conversion and utility functions

import { Coordinates } from '../types';
import { TransformationError, TransformationErrorType } from './index';

// Convert coordinate array [lng, lat] to Coordinates object {lat, lng}
export function coordinateArrayToObject(coordinates: [number, number]): Coordinates {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new TransformationError(
      TransformationErrorType.COORDINATE_CONVERSION_ERROR,
      'Invalid coordinate array format. Expected [lng, lat]',
      coordinates
    );
  }

  const [lng, lat] = coordinates;

  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new TransformationError(
      TransformationErrorType.TYPE_MISMATCH,
      'Coordinate values must be numbers',
      coordinates
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new TransformationError(
      TransformationErrorType.COORDINATE_CONVERSION_ERROR,
      'Coordinate values out of valid range',
      coordinates
    );
  }

  return { lat, lng };
}

// Convert Coordinates object {lat, lng} to coordinate array [lng, lat]
export function coordinateObjectToArray(coordinates: Coordinates): [number, number] {
  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    throw new TransformationError(
      TransformationErrorType.COORDINATE_CONVERSION_ERROR,
      'Invalid coordinates object format. Expected {lat: number, lng: number}',
      coordinates
    );
  }

  const { lat, lng } = coordinates;

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new TransformationError(
      TransformationErrorType.COORDINATE_CONVERSION_ERROR,
      'Coordinate values out of valid range',
      coordinates
    );
  }

  return [lng, lat];
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLatRad = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLngRad = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// Check if coordinates are within a certain radius
export function isWithinRadius(center: Coordinates, point: Coordinates, radiusKm: number): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

// Normalize coordinates to ensure they're within valid ranges
export function normalizeCoordinates(coordinates: Coordinates): Coordinates {
  let { lat, lng } = coordinates;

  // Normalize latitude to [-90, 90]
  lat = Math.max(-90, Math.min(90, lat));

  // Normalize longitude to [-180, 180]
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return { lat, lng };
}

// Parse coordinates from various string formats
export function parseCoordinatesFromString(coordString: string): Coordinates | null {
  if (!coordString || typeof coordString !== 'string') {
    return null;
  }

  // Remove whitespace and common separators
  const cleaned = coordString.trim().replace(/[,;|]/g, ' ');

  // Try to extract numbers
  const numbers = cleaned.match(/-?\d+\.?\d*/g);

  if (!numbers || numbers.length < 2) {
    return null;
  }

  const [first, second] = numbers.map(Number);

  // Determine if it's lat,lng or lng,lat based on ranges
  // If first number is in [-90, 90] range, assume it's lat,lng
  // Otherwise assume lng,lat
  let lat: number, lng: number;

  if (first >= -90 && first <= 90 && (second < -90 || second > 90)) {
    lat = first;
    lng = second;
  } else if (second >= -90 && second <= 90 && (first < -90 || first > 90)) {
    lat = second;
    lng = first;
  } else {
    // Both could be valid, assume lat,lng format
    lat = first;
    lng = second;
  }

  try {
    return normalizeCoordinates({ lat, lng });
  } catch {
    return null;
  }
}

// Format coordinates for display
export function formatCoordinates(coordinates: Coordinates, precision: number = 6): string {
  const lat = coordinates.lat.toFixed(precision);
  const lng = coordinates.lng.toFixed(precision);
  return `${lat}, ${lng}`;
}

// Get coordinate bounds for a given center and radius
export function getCoordinateBounds(
  center: Coordinates,
  radiusKm: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  // Approximate conversion: 1 degree ≈ 111 km
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));

  return {
    north: Math.min(90, center.lat + latDelta),
    south: Math.max(-90, center.lat - latDelta),
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };
}

// Validate and sanitize coordinate input
export function sanitizeCoordinates(input: unknown): Coordinates | null {
  try {
    // Handle coordinate array format
    if (Array.isArray(input) && input.length === 2) {
      return coordinateArrayToObject(input as [number, number]);
    }

    // Handle coordinate object format
    if (input && typeof input === 'object' && 'lat' in input && 'lng' in input) {
      const coords = input as { lat: unknown; lng: unknown };
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return normalizeCoordinates({ lat: coords.lat, lng: coords.lng });
      }
    }

    // Handle string format
    if (typeof input === 'string') {
      return parseCoordinatesFromString(input);
    }

    return null;
  } catch (error) {
    console.error('Error sanitizing coordinates:', error);
    return null;
  }
}
