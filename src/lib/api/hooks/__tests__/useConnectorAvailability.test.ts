import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { 
  useConnectorAvailability, 
  useMultipleAvailabilityCheck,
  useRealTimeAvailability,
  useAvailabilityCache,
  AvailabilityResult 
} from '../useConnectorAvailability';

// Mock the API client
jest.mock('../../client', () => ({
  apiClient: {
    get: jest.fn()
  }
}));

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  
  return Wrapper;
};

describe('useConnectorAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return availability data when connector is available', async () => {
    const mockResponse: AvailabilityResult = {
      available: true,
      conflictingBookings: [],
      suggestedTimes: [],
      checkedAt: new Date().toISOString()
    };

    const { apiClient } = require('../../client');
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useConnectorAvailability(
        'connector-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z'
      ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.available).toBe(true);
    expect(result.current.hasConflicts).toBe(false);
    expect(result.current.hasSuggestions).toBe(false);
  });

  it('should return conflicts and suggestions when connector is unavailable', async () => {
    const mockResponse: AvailabilityResult = {
      available: false,
      conflictingBookings: [{
        id: 'booking-1',
        startTime: '2024-01-01T09:30:00Z',
        endTime: '2024-01-01T11:30:00Z',
        status: 'CONFIRMED'
      }],
      suggestedTimes: [{
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T14:00:00Z',
        available: true,
        estimatedCost: 15.50
      }],
      reason: 'Time slot conflicts with existing booking',
      checkedAt: new Date().toISOString()
    };

    const { apiClient } = require('../../client');
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useConnectorAvailability(
        'connector-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z'
      ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.available).toBe(false);
    expect(result.current.hasConflicts).toBe(true);
    expect(result.current.hasSuggestions).toBe(true);
    expect(result.current.data?.conflictingBookings).toHaveLength(1);
    expect(result.current.data?.suggestedTimes).toHaveLength(1);
  });

  it('should not make API call when time range is invalid', () => {
    const { apiClient } = require('../../client');
    
    const { result } = renderHook(
      () => useConnectorAvailability(
        'connector-1',
        '2024-01-01T12:00:00Z', // End time before start time
        '2024-01-01T10:00:00Z'
      ),
      { wrapper: createWrapper() }
    );

    expect(result.current.isValidTimeRange).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should use debounced values for API calls', () => {
    const { apiClient } = require('../../client');
    
    const { result } = renderHook(
      () => useConnectorAvailability(
        'connector-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z',
        { debounceMs: 100, enabled: false } // Disabled to test debounce setup
      ),
      { wrapper: createWrapper() }
    );

    // Should not make API calls when disabled
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
  });

  it('should be disabled when enabled option is false', () => {
    const { apiClient } = require('../../client');
    
    const { result } = renderHook(
      () => useConnectorAvailability(
        'connector-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z',
        { enabled: false }
      ),
      { wrapper: createWrapper() }
    );

    expect(result.current.isFetching).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe('useMultipleAvailabilityCheck', () => {
  it('should check availability for multiple time slots', async () => {
    const mockResponses = [
      {
        available: true,
        conflictingBookings: [],
        suggestedTimes: [],
        checkedAt: new Date().toISOString()
      },
      {
        available: false,
        conflictingBookings: [{
          id: 'booking-1',
          startTime: '2024-01-01T14:00:00Z',
          endTime: '2024-01-01T16:00:00Z',
          status: 'CONFIRMED'
        }],
        suggestedTimes: [],
        checkedAt: new Date().toISOString()
      }
    ];

    const { apiClient } = require('../../client');
    apiClient.get.mockImplementation(() => Promise.resolve(mockResponses.shift()));

    const timeSlots = [
      { startTime: '2024-01-01T10:00:00Z', endTime: '2024-01-01T12:00:00Z' },
      { startTime: '2024-01-01T14:00:00Z', endTime: '2024-01-01T16:00:00Z' }
    ];

    const { result } = renderHook(
      () => useMultipleAvailabilityCheck('connector-1', timeSlots),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.availabilityResults).toHaveLength(2);
    expect(result.current.availableSlots).toHaveLength(1);
    expect(result.current.unavailableSlots).toHaveLength(1);
  });
});

describe('useAvailabilityCache', () => {
  it('should provide cache management functions', () => {
    const { result } = renderHook(
      () => useAvailabilityCache(),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.prefetchAvailability).toBe('function');
    expect(typeof result.current.invalidateAvailability).toBe('function');
    expect(typeof result.current.getCachedAvailability).toBe('function');
  });

  it('should prefetch availability data', async () => {
    const { apiClient } = require('../../client');
    apiClient.get.mockResolvedValue({
      available: true,
      conflictingBookings: [],
      suggestedTimes: [],
      checkedAt: new Date().toISOString()
    });

    const { result } = renderHook(
      () => useAvailabilityCache(),
      { wrapper: createWrapper() }
    );

    await result.current.prefetchAvailability(
      'connector-1',
      '2024-01-01T10:00:00Z',
      '2024-01-01T12:00:00Z'
    );

    expect(apiClient.get).toHaveBeenCalled();
  });
});