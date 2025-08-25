'use client';

import React, { useState } from 'react';
import { useConnectorAvailability, useAvailabilityCache } from '../useConnectorAvailability';

// Example component showing how to use the enhanced availability checking hook
export function AvailabilityExample() {
  const [connectorId, setConnectorId] = useState('connector-1');
  const [startTime, setStartTime] = useState('2024-01-01T10:00:00Z');
  const [endTime, setEndTime] = useState('2024-01-01T12:00:00Z');
  const [enabled, setEnabled] = useState(true);

  // Use the availability hook with real-time updates and debouncing
  const {
    data: availability,
    isLoading,
    isError,
    error,
    isChecking,
    hasConflicts,
    hasSuggestions,
    isValidTimeRange,
    refetchAvailability
  } = useConnectorAvailability(connectorId, startTime, endTime, {
    enabled,
    includeAlternatives: true,
    maxAlternatives: 3,
    realTimeUpdates: true,
    debounceMs: 500
  });

  // Use cache management
  const { prefetchAvailability, invalidateAvailability } = useAvailabilityCache();

  const handlePrefetch = () => {
    prefetchAvailability(connectorId, startTime, endTime);
  };

  const handleInvalidate = () => {
    invalidateAvailability(connectorId);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connector Availability Checker</h2>
      
      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Connector ID:</label>
          <input
            type="text"
            value={connectorId}
            onChange={(e) => setConnectorId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time:</label>
            <input
              type="datetime-local"
              value={startTime.slice(0, 16)}
              onChange={(e) => setStartTime(e.target.value + ':00Z')}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Time:</label>
            <input
              type="datetime-local"
              value={endTime.slice(0, 16)}
              onChange={(e) => setEndTime(e.target.value + ':00Z')}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mr-2"
            />
            Enable checking
          </label>
          
          <button
            onClick={() => refetchAvailability()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          
          <button
            onClick={handlePrefetch}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Prefetch
          </button>
          
          <button
            onClick={handleInvalidate}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        <span className={`px-2 py-1 rounded ${isValidTimeRange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isValidTimeRange ? 'Valid time range' : 'Invalid time range'}
        </span>
        
        {isChecking && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
            Checking availability...
          </span>
        )}
        
        {hasConflicts && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
            Has conflicts
          </span>
        )}
        
        {hasSuggestions && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
            Has suggestions
          </span>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="p-4 bg-gray-100 rounded">
          Loading availability data...
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Error: {error?.message || 'Failed to check availability'}
        </div>
      )}

      {availability && (
        <div className="space-y-4">
          {/* Availability status */}
          <div className={`p-4 rounded ${availability.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-semibold">
              {availability.available ? '✅ Available' : '❌ Not Available'}
            </h3>
            {availability.reason && (
              <p className="text-sm mt-1">{availability.reason}</p>
            )}
            <p className="text-xs mt-1">
              Checked at: {new Date(availability.checkedAt).toLocaleString()}
            </p>
          </div>

          {/* Conflicting bookings */}
          {availability.conflictingBookings.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Conflicting Bookings:</h4>
              <ul className="space-y-1">
                {availability.conflictingBookings.map((booking) => (
                  <li key={booking.id} className="text-sm text-yellow-700">
                    {booking.id}: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()} ({booking.status})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested times */}
          {availability.suggestedTimes.length > 0 && (
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Suggested Alternative Times:</h4>
              <ul className="space-y-2">
                {availability.suggestedTimes.map((slot, index) => (
                  <li key={index} className="text-sm text-blue-700 p-2 bg-white rounded border">
                    <div className="flex justify-between items-center">
                      <span>
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                      </span>
                      {slot.estimatedCost && (
                        <span className="font-medium">
                          ${slot.estimatedCost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby alternatives */}
          {availability.nearbyAlternatives && availability.nearbyAlternatives.length > 0 && (
            <div className="p-4 bg-purple-50 rounded">
              <h4 className="font-semibold text-purple-800 mb-2">Nearby Alternative Stations:</h4>
              <ul className="space-y-2">
                {availability.nearbyAlternatives.map((station) => (
                  <li key={station.stationId} className="text-sm text-purple-700 p-2 bg-white rounded border">
                    <div className="font-medium">{station.stationName}</div>
                    <div className="text-xs">Distance: {station.distance}km</div>
                    <div className="text-xs">Available slots: {station.availableSlots.length}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailabilityExample;