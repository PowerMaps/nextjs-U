// Data normalization utilities

import { 
  ChargingStationResponseDto, 
  NotificationResponseDto, 
  PaginatedResponseDto,
  WalletTransactionResponseDto,
  VehicleResponseDto,
  RouteResponseDto,
  Coordinates
} from '../types';
import { coordinateArrayToObject, normalizeCoordinates } from './coordinate-utils';
import { TransformationError, TransformationErrorType } from './index';

// Normalize charging station data
export function normalizeChargingStation(station: ChargingStationResponseDto): ChargingStationResponseDto & {
  coordinates: Coordinates;
  availableConnectors: number;
  statusColor: 'green' | 'yellow' | 'red';
  distanceFromUser?: number;
} {
  try {
    // Extract and normalize coordinates
    const coordinates = coordinateArrayToObject((station as any).location.coordinates);
    
    // Calculate available connectors
    const availableConnectors = station.connectors?.filter(
      connector => connector.status === 'AVAILABLE'
    ).length || 0;
    
    // Determine status color
    let statusColor: 'green' | 'yellow' | 'red';
    switch ((station as any).status) {
      case 'OPERATIONAL':
        statusColor = availableConnectors > 0 ? 'green' : 'yellow';
        break;
      case 'LIMITED':
        statusColor = 'yellow';
        break;
      case 'MAINTENANCE':
      case 'OFFLINE':
        statusColor = 'red';
        break;
      default:
        statusColor = 'red';
    }
    
    return {
      ...station,
      coordinates,
      availableConnectors,
      statusColor,
      // Ensure arrays are defined
      connectors: station.connectors || [],
    };
  } catch (error) {
    throw new TransformationError(
      TransformationErrorType.COORDINATE_CONVERSION_ERROR,
      `Failed to normalize charging station: ${error instanceof Error ? error.message : 'Unknown error'}`,
      station
    );
  }
}

// Normalize notification data for better display
export function normalizeNotification(notification: NotificationResponseDto): NotificationResponseDto & {
  isRecent: boolean;
  timeAgo: string;
  priority: 'low' | 'medium' | 'high';
} {
  const createdAt = new Date(notification.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  
  // Determine if notification is recent (within 24 hours)
  const isRecent = diffHours < 24;
  
  // Generate human-readable time ago
  let timeAgo: string;
  if (diffMs < 60000) { // Less than 1 minute
    timeAgo = 'Just now';
  } else if (diffMs < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diffMs / 60000);
    timeAgo = `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) { // Less than 24 hours
    const hours = Math.floor(diffHours);
    timeAgo = `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) { // Less than 7 days
    const days = Math.floor(diffDays);
    timeAgo = `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    timeAgo = createdAt.toLocaleDateString();
  }
  
  // Determine priority based on type and recency
  let priority: 'low' | 'medium' | 'high';
  const highPriorityTypes = ['payment', 'security', 'error', 'alert'];
  const mediumPriorityTypes = ['reservation', 'charging', 'reminder'];
  
  if (highPriorityTypes.some(type => notification.type.toLowerCase().includes(type))) {
    priority = 'high';
  } else if (mediumPriorityTypes.some(type => notification.type.toLowerCase().includes(type))) {
    priority = 'medium';
  } else {
    priority = 'low';
  }
  
  return {
    ...notification,
    isRecent,
    timeAgo,
    priority,
  };
}

// Normalize paginated response data
export function normalizePaginatedResponse<T, U>(
  response: PaginatedResponseDto<T>,
  itemNormalizer: (item: T) => U
): PaginatedResponseDto<U> & {
  hasMore: boolean;
  isEmpty: boolean;
  totalCount: number;
} {
  const normalizedItems = response.items.map(itemNormalizer);
  const hasMore = response.meta.currentPage < response.meta.totalPages;
  const isEmpty = response.meta.totalItems === 0;
  const totalCount = response.meta.totalItems;
  
  return {
    items: normalizedItems,
    meta: response.meta,
    hasMore,
    isEmpty,
    totalCount,
  };
}

// Normalize wallet transaction data
export function normalizeWalletTransaction(transaction: WalletTransactionResponseDto): WalletTransactionResponseDto & {
  formattedAmount: string;
  isPositive: boolean;
  statusColor: 'green' | 'yellow' | 'red';
  typeIcon: string;
} {
  const isPositive = ['DEPOSIT'].includes(transaction.type);
  const formattedAmount = `${isPositive ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}`;
  
  let statusColor: 'green' | 'yellow' | 'red';
  switch (transaction.status) {
    case 'COMPLETED':
      statusColor = 'green';
      break;
    case 'PENDING':
      statusColor = 'yellow';
      break;
    case 'FAILED':
      statusColor = 'red';
      break;
    default:
      statusColor = 'yellow';
  }
  
  let typeIcon: string;
  switch (transaction.type) {
    case 'DEPOSIT':
      typeIcon = '↓';
      break;
    case 'WITHDRAWAL':
      typeIcon = '↑';
      break;
    case 'TRANSFER':
      typeIcon = '↔';
      break;
    case 'PAYMENT':
      typeIcon = '💳';
      break;
    default:
      typeIcon = '•';
  }
  
  return {
    ...transaction,
    formattedAmount,
    isPositive,
    statusColor,
    typeIcon,
  };
}

// Normalize vehicle data
export function normalizeVehicle(vehicle: VehicleResponseDto): VehicleResponseDto & {
  displayName: string;
  efficiencyRating: 'excellent' | 'good' | 'average' | 'poor';
  rangeCategory: 'short' | 'medium' | 'long';
} {
  // Create display name
  const displayName = vehicle.nickname || `${vehicle.make} ${vehicle.model}`;
  
  // Determine efficiency rating (lower kWh/100km is better)
  let efficiencyRating: 'excellent' | 'good' | 'average' | 'poor';
  if (vehicle.efficiency <= 15) {
    efficiencyRating = 'excellent';
  } else if (vehicle.efficiency <= 20) {
    efficiencyRating = 'good';
  } else if (vehicle.efficiency <= 25) {
    efficiencyRating = 'average';
  } else {
    efficiencyRating = 'poor';
  }
  
  // Determine range category
  let rangeCategory: 'short' | 'medium' | 'long';
  if (vehicle.range < 200) {
    rangeCategory = 'short';
  } else if (vehicle.range < 400) {
    rangeCategory = 'medium';
  } else {
    rangeCategory = 'long';
  }
  
  return {
    ...vehicle,
    displayName,
    efficiencyRating,
    rangeCategory,
  };
}

// Normalize route response data
export function normalizeRouteResponse(route: RouteResponseDto): RouteResponseDto & {
  statistics: {
    distance: string;
    duration: string;
    energyConsumption: string;
    estimatedCost: string;
    chargingStops: number;
  };
  isOptimal: boolean;
} {
  const analysis = route.analysis;
  
  // Format statistics for display
  const statistics = {
    distance: `${(analysis.totalDistance / 1000).toFixed(1)} km`,
    duration: formatDuration(analysis.totalTime),
    energyConsumption: `${analysis.energyConsumption.toFixed(1)} kWh`,
    estimatedCost: `$${analysis.estimatedCost.toFixed(2)}`,
    chargingStops: route.chargingStations?.length || 0,
  };
  
  // Determine if route is optimal based on metadata
  const isOptimal = route.metadata?.routeOptimized || false;
  
  return {
    ...route,
    statistics,
    isOptimal,
  };
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Normalize address data for autocomplete
export interface StandardizedAddress {
  name: string;
  coordinates: Coordinates;
  formattedAddress: string;
}

export function normalizeAddress(addressData: {
  name?: string;
  address?: string;
  coordinates?: Coordinates | [number, number];
  location?: {
    coordinates: [number, number];
  };
}): StandardizedAddress {
  let coordinates: Coordinates;
  
  // Extract coordinates from various formats
  if (addressData.coordinates) {
    if (Array.isArray(addressData.coordinates)) {
      coordinates = coordinateArrayToObject(addressData.coordinates);
    } else {
      coordinates = normalizeCoordinates(addressData.coordinates);
    }
  } else if (addressData.location?.coordinates) {
    coordinates = coordinateArrayToObject(addressData.location.coordinates);
  } else {
    throw new TransformationError(
      TransformationErrorType.MISSING_REQUIRED_FIELD,
      'Address data must include coordinates',
      addressData
    );
  }
  
  const name = addressData.name || 'Unknown Location';
  const formattedAddress = addressData.address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  
  return {
    name,
    coordinates,
    formattedAddress,
  };
}

// Generic data sanitizer
export function sanitizeApiResponse<T>(
  data: T,
  requiredFields: (keyof T)[]
): T {
  if (!data || typeof data !== 'object') {
    throw new TransformationError(
      TransformationErrorType.INVALID_INPUT,
      'Data must be an object',
      data
    );
  }
  
  // Check for required fields
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      throw new TransformationError(
        TransformationErrorType.MISSING_REQUIRED_FIELD,
        `Required field '${String(field)}' is missing or null`,
        data
      );
    }
  }
  
  return data;
}