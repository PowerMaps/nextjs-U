# Enhanced Connector Availability Checking

This module provides comprehensive hooks for checking connector availability with real-time updates, debouncing, caching, and conflict detection.

## Features

- ✅ Real-time availability checking with debounced API calls
- ✅ Conflict detection with detailed booking information
- ✅ Alternative time slot suggestions
- ✅ Nearby station alternatives
- ✅ Intelligent caching mechanism
- ✅ Multiple time slot checking
- ✅ Real-time updates with WebSocket-like behavior
- ✅ Comprehensive error handling and retry logic

## Main Hooks

### `useConnectorAvailability`

The primary hook for checking connector availability with enhanced features.

```typescript
const {
  data: availability,
  isLoading,
  isError,
  error,
  isChecking,
  hasConflicts,
  hasSuggestions,
  hasAlternatives,
  isValidTimeRange,
  refetchAvailability
} = useConnectorAvailability(connectorId, startTime, endTime, {
  enabled: true,
  includeAlternatives: true,
  maxAlternatives: 3,
  realTimeUpdates: true,
  debounceMs: 500
});
```

**Parameters:**
- `connectorId`: The ID of the connector to check
- `startTime`: ISO string of the desired start time
- `endTime`: ISO string of the desired end time
- `options`: Configuration object with the following properties:
  - `enabled`: Whether to enable the query (default: true)
  - `includeAlternatives`: Include nearby station alternatives (default: true)
  - `maxAlternatives`: Maximum number of alternatives to return (default: 3)
  - `realTimeUpdates`: Enable real-time polling (default: true)
  - `debounceMs`: Debounce delay in milliseconds (default: 500)

**Returns:**
- All standard React Query properties (`data`, `isLoading`, `isError`, etc.)
- `isChecking`: Whether the hook is currently fetching data
- `hasConflicts`: Whether there are conflicting bookings
- `hasSuggestions`: Whether there are suggested alternative times
- `hasAlternatives`: Whether there are nearby station alternatives
- `isValidTimeRange`: Whether the provided time range is valid
- `refetchAvailability`: Function to manually refetch availability

### `useMultipleAvailabilityCheck`

Check availability for multiple time slots simultaneously.

```typescript
const {
  data,
  isLoading,
  availabilityResults,
  availableSlots,
  unavailableSlots
} = useMultipleAvailabilityCheck(connectorId, timeSlots, {
  enabled: true,
  includeAlternatives: false
});
```

### `useRealTimeAvailability`

Enhanced real-time availability checking with configurable polling.

```typescript
const availability = useRealTimeAvailability(connectorId, startTime, endTime, {
  enabled: true,
  updateInterval: 15000 // 15 seconds
});
```

### `useAvailabilityCache`

Cache management utilities for availability data.

```typescript
const {
  prefetchAvailability,
  invalidateAvailability,
  getCachedAvailability
} = useAvailabilityCache();

// Prefetch availability data
await prefetchAvailability(connectorId, startTime, endTime);

// Invalidate cache for a specific connector
invalidateAvailability(connectorId);

// Get cached data without triggering a request
const cachedData = getCachedAvailability(connectorId, startTime, endTime);
```

## Data Types

### `AvailabilityResult`

```typescript
interface AvailabilityResult {
  available: boolean;
  conflictingBookings: ConflictingBooking[];
  suggestedTimes: TimeSlot[];
  nearbyAlternatives?: NearbyAlternative[];
  reason?: string;
  checkedAt: string;
}
```

### `TimeSlot`

```typescript
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  estimatedCost?: number;
}
```

### `ConflictingBooking`

```typescript
interface ConflictingBooking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}
```

### `NearbyAlternative`

```typescript
interface NearbyAlternative {
  stationId: string;
  stationName: string;
  distance: number;
  availableSlots: TimeSlot[];
}
```

## Usage Examples

### Basic Availability Check

```typescript
function BookingForm({ connectorId }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const { data: availability, isLoading, hasConflicts } = useConnectorAvailability(
    connectorId,
    startTime,
    endTime
  );
  
  if (isLoading) return <div>Checking availability...</div>;
  
  return (
    <div>
      {availability?.available ? (
        <button>Book Now</button>
      ) : (
        <div>
          <p>Not available</p>
          {hasConflicts && <ConflictsList conflicts={availability.conflictingBookings} />}
          {availability.suggestedTimes.length > 0 && (
            <AlternativeTimesList suggestions={availability.suggestedTimes} />
          )}
        </div>
      )}
    </div>
  );
}
```

### Real-time Updates

```typescript
function RealTimeAvailabilityMonitor({ connectorId, startTime, endTime }) {
  const availability = useRealTimeAvailability(connectorId, startTime, endTime, {
    updateInterval: 10000 // Update every 10 seconds
  });
  
  return (
    <div>
      <div className={availability.data?.available ? 'available' : 'unavailable'}>
        Status: {availability.data?.available ? 'Available' : 'Not Available'}
      </div>
      <small>Last checked: {availability.data?.checkedAt}</small>
    </div>
  );
}
```

### Multiple Time Slots

```typescript
function TimeSlotPicker({ connectorId }) {
  const timeSlots = [
    { startTime: '2024-01-01T09:00:00Z', endTime: '2024-01-01T11:00:00Z' },
    { startTime: '2024-01-01T11:00:00Z', endTime: '2024-01-01T13:00:00Z' },
    { startTime: '2024-01-01T13:00:00Z', endTime: '2024-01-01T15:00:00Z' },
  ];
  
  const { availableSlots, unavailableSlots } = useMultipleAvailabilityCheck(
    connectorId,
    timeSlots
  );
  
  return (
    <div>
      <h3>Available Times</h3>
      {availableSlots.map((slot, index) => (
        <TimeSlotButton key={index} slot={slot} />
      ))}
      
      <h3>Unavailable Times</h3>
      {unavailableSlots.map((slot, index) => (
        <DisabledTimeSlot key={index} slot={slot} />
      ))}
    </div>
  );
}
```

## Performance Considerations

1. **Debouncing**: API calls are debounced to prevent excessive requests when time parameters change rapidly.

2. **Caching**: Availability results are cached for 30 seconds to improve performance and reduce server load.

3. **Real-time Updates**: Use sparingly and with appropriate intervals to balance real-time data with performance.

4. **Prefetching**: Use `prefetchAvailability` to load data before it's needed, improving user experience.

## Error Handling

The hooks include comprehensive error handling:

- Network errors are retried up to 2 times
- Validation errors (400, 422) are not retried
- Fallback mock data is provided during development
- Clear error messages are provided for different failure scenarios

## Testing

Comprehensive tests are included in `__tests__/useConnectorAvailability.test.ts` covering:

- Basic availability checking
- Conflict detection
- Alternative suggestions
- Time range validation
- Caching behavior
- Error scenarios

Run tests with:
```bash
npm test -- --testPathPatterns=useConnectorAvailability.test.ts
```