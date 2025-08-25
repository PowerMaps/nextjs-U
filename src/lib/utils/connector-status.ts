// Connector status utilities and type guards
import type { ConnectorStatus } from '@/lib/api/types';

export const CONNECTOR_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  IN_USE: 'IN_USE' as const,
  OFFLINE: 'OFFLINE' as const,
  RESERVED: 'RESERVED' as const,
} as const;

/**
 * Type guard to check if a string is a valid connector status
 */
export function isValidConnectorStatus(status: string): status is ConnectorStatus {
  return Object.values(CONNECTOR_STATUS).includes(status as ConnectorStatus);
}

/**
 * Normalizes connector status to uppercase enum value
 */
export function normalizeConnectorStatus(status: string): ConnectorStatus {
  const normalized = status.toUpperCase() as ConnectorStatus;
  
  // Handle common variations
  if (normalized === 'OCCUPIED') {
    return CONNECTOR_STATUS.IN_USE;
  }
  if (normalized === 'MAINTENANCE') {
    return CONNECTOR_STATUS.OFFLINE;
  }
  
  if (isValidConnectorStatus(normalized)) {
    return normalized;
  }
  
  // Default to OFFLINE for unknown statuses
  return CONNECTOR_STATUS.OFFLINE;
}

/**
 * Checks if a connector is available for booking
 */
export function isConnectorAvailable(status: string): boolean {
  return normalizeConnectorStatus(status) === CONNECTOR_STATUS.AVAILABLE;
}

/**
 * Gets the display color class for a connector status
 */
export function getConnectorStatusColor(status: string): string {
  const normalizedStatus = normalizeConnectorStatus(status);
  
  switch (normalizedStatus) {
    case CONNECTOR_STATUS.AVAILABLE:
      return 'bg-green-100 text-green-800';
    case CONNECTOR_STATUS.IN_USE:
      return 'bg-red-100 text-red-800';
    case CONNECTOR_STATUS.RESERVED:
      return 'bg-yellow-100 text-yellow-800';
    case CONNECTOR_STATUS.OFFLINE:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Gets the display name for a connector status
 */
export function getConnectorStatusDisplayName(status: string): string {
  const normalizedStatus = normalizeConnectorStatus(status);
  
  switch (normalizedStatus) {
    case CONNECTOR_STATUS.AVAILABLE:
      return 'Available';
    case CONNECTOR_STATUS.IN_USE:
      return 'In Use';
    case CONNECTOR_STATUS.RESERVED:
      return 'Reserved';
    case CONNECTOR_STATUS.OFFLINE:
      return 'Offline';
    default:
      return 'Unknown';
  }
}