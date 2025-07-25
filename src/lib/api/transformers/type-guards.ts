// Type guard functions for API response validation

import { 
  Coordinates, 
  ChargingStationResponseDto, 
  NotificationResponseDto, 
  PaginatedResponseDto,
  RouteResponseDto,
  WalletTransactionResponseDto,
  VehicleResponseDto,
  UserResponseDto
} from '../types';

// Utility type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Coordinate validation
export function isValidCoordinates(value: unknown): value is Coordinates {
  if (!isObject(value)) return false;
  
  const coords = value as Record<string, unknown>;
  return (
    isNumber(coords.lat) && 
    isNumber(coords.lng) &&
    coords.lat >= -90 && coords.lat <= 90 &&
    coords.lng >= -180 && coords.lng <= 180
  );
}

// Validate coordinate array format [lng, lat]
export function isValidCoordinateArray(value: unknown): value is [number, number] {
  if (!isArray(value) || value.length !== 2) return false;
  
  const [lng, lat] = value;
  return (
    isNumber(lng) && 
    isNumber(lat) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// Paginated response validation
export function isValidPaginatedResponse<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is PaginatedResponseDto<T> {
  if (!isObject(value)) return false;
  
  const response = value as Record<string, unknown>;
  
  // Check if items array exists and is valid
  if (!isArray(response.items)) return false;
  
  // Validate each item in the array
  const items = response.items;
  if (!items.every(itemValidator)) return false;
  
  // Check meta object
  if (!isObject(response.meta)) return false;
  
  const meta = response.meta as Record<string, unknown>;
  return (
    isNumber(meta.totalItems) &&
    isNumber(meta.itemCount) &&
    isNumber(meta.itemsPerPage) &&
    isNumber(meta.totalPages) &&
    isNumber(meta.currentPage) &&
    meta.totalItems >= 0 &&
    meta.itemCount >= 0 &&
    meta.itemsPerPage > 0 &&
    meta.totalPages >= 0 &&
    meta.currentPage > 0
  );
}

// Notification validation
export function isValidNotification(value: unknown): value is NotificationResponseDto {
  if (!isObject(value)) return false;
  
  const notification = value as Record<string, unknown>;
  return (
    isString(notification.id) &&
    isString(notification.type) &&
    isString(notification.title) &&
    isString(notification.message) &&
    isBoolean(notification.read) &&
    isString(notification.createdAt) &&
    isObject(notification.user)
  );
}

// Charging station validation
export function isValidChargingStation(value: unknown): value is ChargingStationResponseDto {
  if (!isObject(value)) return false;
  
  const station = value as Record<string, unknown>;
  
  // Check required fields
  if (
    !isString(station.id) ||
    !isString(station.name) ||
    !isString(station.address) ||
    !isString(station.city) ||
    !isString(station.status) ||
    !isString(station.operator) ||
    !isString(station.createdAt) ||
    !isString(station.updatedAt)
  ) {
    return false;
  }
  
  // Check location object
  if (!isObject(station.location)) return false;
  const location = station.location as Record<string, unknown>;
  
  if (!isString(location.type) || !isValidCoordinateArray(location.coordinates)) {
    return false;
  }
  
  // Check arrays
  if (!isArray(station.connectors) || !isArray(station.amenities) || !isArray(station.pricing) || !isArray(station.reviews)) {
    return false;
  }
  
  // Check rating
  if (!isNumber(station.rating) || station.rating < 0 || station.rating > 5) {
    return false;
  }
  
  return true;
}

// Vehicle validation
export function isValidVehicle(value: unknown): value is VehicleResponseDto {
  if (!isObject(value)) return false;
  
  const vehicle = value as Record<string, unknown>;
  return (
    isString(vehicle.id) &&
    isString(vehicle.make) &&
    isString(vehicle.model) &&
    isNumber(vehicle.year) &&
    isNumber(vehicle.batteryCapacity) &&
    isNumber(vehicle.range) &&
    isNumber(vehicle.efficiency) &&
    isString(vehicle.connectorType) &&
    isNumber(vehicle.chargingPower) &&
    isString(vehicle.createdAt) &&
    isString(vehicle.updatedAt) &&
    isObject(vehicle.owner) &&
    vehicle.year > 1900 &&
    vehicle.year <= new Date().getFullYear() + 2 &&
    vehicle.batteryCapacity > 0 &&
    vehicle.range > 0 &&
    vehicle.efficiency > 0 &&
    vehicle.chargingPower > 0
  );
}

// Wallet transaction validation
export function isValidWalletTransaction(value: unknown): value is WalletTransactionResponseDto {
  if (!isObject(value)) return false;
  
  const transaction = value as Record<string, unknown>;
  
  const validTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'];
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
  
  return (
    isString(transaction.id) &&
    isNumber(transaction.amount) &&
    isString(transaction.type) &&
    validTypes.includes(transaction.type as string) &&
    isString(transaction.status) &&
    validStatuses.includes(transaction.status as string) &&
    isString(transaction.description) &&
    isString(transaction.createdAt) &&
    isObject(transaction.wallet)
  );
}

// Route response validation
export function isValidRouteResponse(value: unknown): value is RouteResponseDto {
  if (!isObject(value)) return false;
  
  const route = value as Record<string, unknown>;
  return (
    isBoolean(route.success) &&
    isArray(route.chargingStations) &&
    isObject(route.analysis) &&
    isObject(route.metadata)
  );
}

// User validation
export function isValidUser(value: unknown): value is UserResponseDto {
  if (!isObject(value)) return false;
  
  const user = value as Record<string, unknown>;
  
  const validRoles = ['USER', 'OPERATOR', 'ADMIN'];
  
  return (
    isString(user.id) &&
    isString(user.email) &&
    isString(user.firstName) &&
    isString(user.lastName) &&
    isString(user.role) &&
    validRoles.includes(user.role as string) &&
    isString(user.createdAt) &&
    isString(user.updatedAt) &&
    isObject(user.preferences) &&
    user.email.includes('@')
  );
}

// Generic validation helper
export function validateApiResponse<T>(
  data: unknown,
  validator: (value: unknown) => value is T,
  errorMessage?: string
): T {
  if (!validator(data)) {
    throw new Error(errorMessage || 'Invalid API response format');
  }
  return data;
}

// Batch validation for arrays
export function validateArrayResponse<T>(
  data: unknown,
  itemValidator: (value: unknown) => value is T,
  errorMessage?: string
): T[] {
  if (!isArray(data)) {
    throw new Error(errorMessage || 'Expected array response');
  }
  
  const validItems: T[] = [];
  const invalidItems: unknown[] = [];
  
  data.forEach((item, index) => {
    if (itemValidator(item)) {
      validItems.push(item);
    } else {
      invalidItems.push({ index, item });
    }
  });
  
  if (invalidItems.length > 0) {
    console.warn('Some items failed validation:', invalidItems);
  }
  
  return validItems;
}