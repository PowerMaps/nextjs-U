// Basic tests for data transformers

import {
  notificationTransformer,
  stationTransformer,
  routeTransformer,
  addressTransformer,
  isValidCoordinates,
  isValidNotification,
  isValidChargingStation,
  coordinateArrayToObject,
  coordinateObjectToArray,
  calculateDistance,
} from '../index';

import {
  NotificationResponseDto,
  ChargingStationResponseDto,
  PaginatedResponseDto,
  RouteResponseDto,
  Coordinates,
} from '../../types';

describe('Type Guards', () => {
  test('isValidCoordinates should validate coordinate objects', () => {
    expect(isValidCoordinates({ lat: 40.7128, lng: -74.0060 })).toBe(true);
    expect(isValidCoordinates({ lat: 91, lng: -74.0060 })).toBe(false);
    expect(isValidCoordinates({ lat: 40.7128, lng: -181 })).toBe(false);
    expect(isValidCoordinates({ lat: 'invalid', lng: -74.0060 })).toBe(false);
    expect(isValidCoordinates(null)).toBe(false);
  });

  test('isValidNotification should validate notification objects', () => {
    const validNotification: NotificationResponseDto = {
      id: '1',
      type: 'info',
      title: 'Test',
      message: 'Test message',
      read: false,
      createdAt: '2023-01-01T00:00:00Z',
      user: {} as any,
    };

    expect(isValidNotification(validNotification)).toBe(true);
    expect(isValidNotification({ ...validNotification, id: undefined })).toBe(false);
    expect(isValidNotification({ ...validNotification, read: 'invalid' })).toBe(false);
  });
});

describe('Coordinate Utils', () => {
  test('coordinateArrayToObject should convert array to object', () => {
    const result = coordinateArrayToObject([-74.0060, 40.7128]);
    expect(result).toEqual({ lat: 40.7128, lng: -74.0060 });
  });

  test('coordinateObjectToArray should convert object to array', () => {
    const result = coordinateObjectToArray({ lat: 40.7128, lng: -74.0060 });
    expect(result).toEqual([-74.0060, 40.7128]);
  });

  test('calculateDistance should calculate distance between coordinates', () => {
    const coord1: Coordinates = { lat: 40.7128, lng: -74.0060 }; // NYC
    const coord2: Coordinates = { lat: 34.0522, lng: -118.2437 }; // LA
    
    const distance = calculateDistance(coord1, coord2);
    expect(distance).toBeGreaterThan(3900); // Approximately 3944 km
    expect(distance).toBeLessThan(4000);
  });
});

describe('Notification Transformer', () => {
  test('should transform paginated notification response', () => {
    const mockResponse: PaginatedResponseDto<NotificationResponseDto> = {
      items: [
        {
          id: '1',
          type: 'info',
          title: 'Test 1',
          message: 'Test message 1',
          read: false,
          createdAt: new Date().toISOString(),
          user: {} as any,
        },
        {
          id: '2',
          type: 'warning',
          title: 'Test 2',
          message: 'Test message 2',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user: {} as any,
        },
      ],
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    };

    const result = notificationTransformer.transform(mockResponse);
    
    expect(result.notifications).toHaveLength(2);
    expect(result.unreadCount).toBe(1);
    expect(result.totalCount).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(result.notifications[0]).toHaveProperty('timeAgo');
    expect(result.notifications[0]).toHaveProperty('priority');
    expect(result.notifications[0]).toHaveProperty('isRecent');
  });
});

describe('Station Transformer', () => {
  test('should transform charging station data', () => {
    const mockStation: ChargingStationResponseDto = {
      id: '1',
      name: 'Test Station',
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128],
      },
      address: '123 Test St',
      city: 'Test City',
      status: 'OPERATIONAL',
      connectors: [
        {
          id: '1',
          type: 'CCS',
          power: 50,
          status: 'AVAILABLE',
          station: {} as any,
        },
        {
          id: '2',
          type: 'CHAdeMO',
          power: 50,
          status: 'IN_USE',
          station: {} as any,
        },
      ],
      amenities: ['WiFi', 'Restroom'],
      openingHours: '24/7',
      operator: 'Test Operator',
      pricing: [],
      rating: 4.5,
      reviews: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const result = stationTransformer.transform(mockStation);
    
    expect(result.coordinates).toEqual({ lat: 40.7128, lng: -74.0060 });
    expect(result.availableConnectors).toBe(1);
    expect(result.statusColor).toBe('green');
    expect(result.connectors).toHaveLength(2);
  });
});

describe('Address Transformer', () => {
  test('should transform raw address data', () => {
    const rawAddress = {
      name: 'Test Location',
      address: '123 Test St, Test City',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    };

    const result = addressTransformer.transform(rawAddress);
    
    expect(result.name).toBe('Test Location');
    expect(result.formattedAddress).toBe('123 Test St, Test City');
    expect(result.coordinates).toEqual({ lat: 40.7128, lng: -74.0060 });
  });

  test('should create address from coordinates', () => {
    const coordinates: Coordinates = { lat: 40.7128, lng: -74.0060 };
    const result = addressTransformer.createFromCoordinates(coordinates, 'Custom Location');
    
    expect(result.name).toBe('Custom Location');
    expect(result.coordinates).toEqual(coordinates);
    expect(result.formattedAddress).toContain('40.712800');
  });
});