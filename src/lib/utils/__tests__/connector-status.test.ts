import {
  isValidConnectorStatus,
  normalizeConnectorStatus,
  isConnectorAvailable,
  getConnectorStatusColor,
  getConnectorStatusDisplayName,
  CONNECTOR_STATUS
} from '../connector-status';

describe('Connector Status Utilities', () => {
  describe('isValidConnectorStatus', () => {
    it('should return true for valid status values', () => {
      expect(isValidConnectorStatus('AVAILABLE')).toBe(true);
      expect(isValidConnectorStatus('IN_USE')).toBe(true);
      expect(isValidConnectorStatus('OFFLINE')).toBe(true);
      expect(isValidConnectorStatus('RESERVED')).toBe(true);
    });

    it('should return false for invalid status values', () => {
      expect(isValidConnectorStatus('invalid')).toBe(false);
      expect(isValidConnectorStatus('available')).toBe(false);
      expect(isValidConnectorStatus('')).toBe(false);
    });
  });

  describe('normalizeConnectorStatus', () => {
    it('should normalize lowercase status to uppercase', () => {
      expect(normalizeConnectorStatus('available')).toBe(CONNECTOR_STATUS.AVAILABLE);
      expect(normalizeConnectorStatus('in_use')).toBe(CONNECTOR_STATUS.IN_USE);
      expect(normalizeConnectorStatus('offline')).toBe(CONNECTOR_STATUS.OFFLINE);
      expect(normalizeConnectorStatus('reserved')).toBe(CONNECTOR_STATUS.RESERVED);
    });

    it('should handle common variations', () => {
      expect(normalizeConnectorStatus('occupied')).toBe(CONNECTOR_STATUS.IN_USE);
      expect(normalizeConnectorStatus('OCCUPIED')).toBe(CONNECTOR_STATUS.IN_USE);
      expect(normalizeConnectorStatus('maintenance')).toBe(CONNECTOR_STATUS.OFFLINE);
      expect(normalizeConnectorStatus('MAINTENANCE')).toBe(CONNECTOR_STATUS.OFFLINE);
    });

    it('should default to OFFLINE for unknown statuses', () => {
      expect(normalizeConnectorStatus('unknown')).toBe(CONNECTOR_STATUS.OFFLINE);
      expect(normalizeConnectorStatus('')).toBe(CONNECTOR_STATUS.OFFLINE);
      expect(normalizeConnectorStatus('invalid')).toBe(CONNECTOR_STATUS.OFFLINE);
    });
  });

  describe('isConnectorAvailable', () => {
    it('should return true only for available status', () => {
      expect(isConnectorAvailable('AVAILABLE')).toBe(true);
      expect(isConnectorAvailable('available')).toBe(true);
      expect(isConnectorAvailable('Available')).toBe(true);
    });

    it('should return false for non-available statuses', () => {
      expect(isConnectorAvailable('IN_USE')).toBe(false);
      expect(isConnectorAvailable('OFFLINE')).toBe(false);
      expect(isConnectorAvailable('RESERVED')).toBe(false);
      expect(isConnectorAvailable('occupied')).toBe(false);
    });
  });

  describe('getConnectorStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getConnectorStatusColor('AVAILABLE')).toBe('bg-green-100 text-green-800');
      expect(getConnectorStatusColor('IN_USE')).toBe('bg-red-100 text-red-800');
      expect(getConnectorStatusColor('RESERVED')).toBe('bg-yellow-100 text-yellow-800');
      expect(getConnectorStatusColor('OFFLINE')).toBe('bg-gray-100 text-gray-800');
    });

    it('should handle case variations', () => {
      expect(getConnectorStatusColor('available')).toBe('bg-green-100 text-green-800');
      expect(getConnectorStatusColor('occupied')).toBe('bg-red-100 text-red-800');
    });
  });

  describe('getConnectorStatusDisplayName', () => {
    it('should return correct display names', () => {
      expect(getConnectorStatusDisplayName('AVAILABLE')).toBe('Available');
      expect(getConnectorStatusDisplayName('IN_USE')).toBe('In Use');
      expect(getConnectorStatusDisplayName('RESERVED')).toBe('Reserved');
      expect(getConnectorStatusDisplayName('OFFLINE')).toBe('Offline');
    });

    it('should handle case variations and common aliases', () => {
      expect(getConnectorStatusDisplayName('available')).toBe('Available');
      expect(getConnectorStatusDisplayName('occupied')).toBe('In Use');
      expect(getConnectorStatusDisplayName('maintenance')).toBe('Offline');
    });
  });
});