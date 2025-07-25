// Charging station data transformer

import { BaseTransformer } from './index';
import { ChargingStationResponseDto, Coordinates } from '../types';
import { normalizeChargingStation } from './data-normalizers';
import { isValidChargingStation } from './type-guards';
import { calculateDistance } from './coordinate-utils';

// Enhanced station data structure
export interface EnhancedStationData extends ChargingStationResponseDto {
  coordinates: Coordinates;
  availableConnectors: number;
  statusColor: 'green' | 'yellow' | 'red';
  distanceFromUser?: number;
}

// Station transformer class
export class StationDataTransformer extends BaseTransformer<
  ChargingStationResponseDto,
  EnhancedStationData
> {
  private userLocation?: Coordinates;

  constructor(userLocation?: Coordinates) {
    super();
    this.userLocation = userLocation;
  }

  validate(input: unknown): input is ChargingStationResponseDto {
    return isValidChargingStation(input);
  }

  transform(input: ChargingStationResponseDto): EnhancedStationData {
    const normalized = normalizeChargingStation(input);
    
    // Calculate distance from user if location is available
    let distanceFromUser: number | undefined;
    if (this.userLocation) {
      distanceFromUser = calculateDistance(this.userLocation, normalized.coordinates);
    }
    
    return {
      ...normalized,
      distanceFromUser,
    };
  }

  // Update user location for distance calculations
  setUserLocation(location: Coordinates) {
    this.userLocation = location;
  }

  // Transform array of stations
  transformArray(stations: ChargingStationResponseDto[]): EnhancedStationData[] {
    return stations
      .map(station => this.safeTransform(station))
      .filter((station): station is EnhancedStationData => station !== null);
  }

  // Sort stations by distance from user
  sortByDistance(stations: EnhancedStationData[]): EnhancedStationData[] {
    return stations.sort((a, b) => {
      if (a.distanceFromUser === undefined && b.distanceFromUser === undefined) return 0;
      if (a.distanceFromUser === undefined) return 1;
      if (b.distanceFromUser === undefined) return -1;
      return a.distanceFromUser - b.distanceFromUser;
    });
  }

  // Filter stations by availability
  filterByAvailability(stations: EnhancedStationData[], minAvailable: number = 1): EnhancedStationData[] {
    return stations.filter(station => station.availableConnectors >= minAvailable);
  }

  // Filter stations by connector type
  filterByConnectorType(stations: EnhancedStationData[], connectorType: string): EnhancedStationData[] {
    return stations.filter(station => 
      station.connectors.some(connector => 
        connector.type.toLowerCase() === connectorType.toLowerCase()
      )
    );
  }

  // Filter stations by status
  filterByStatus(stations: EnhancedStationData[], status: string[]): EnhancedStationData[] {
    return stations.filter(station => status.includes(station.status));
  }

  // Get stations within radius
  getStationsWithinRadius(stations: EnhancedStationData[], radiusKm: number): EnhancedStationData[] {
    if (!this.userLocation) return stations;
    
    return stations.filter(station => {
      if (station.distanceFromUser === undefined) return false;
      return station.distanceFromUser <= radiusKm;
    });
  }

  // Group stations by status
  groupByStatus(stations: EnhancedStationData[]): Record<string, EnhancedStationData[]> {
    return stations.reduce((groups, station) => {
      const status = station.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(station);
      return groups;
    }, {} as Record<string, EnhancedStationData[]>);
  }

  // Get station statistics
  getStationStatistics(stations: EnhancedStationData[]) {
    const total = stations.length;
    const operational = stations.filter(s => s.status === 'OPERATIONAL').length;
    const available = stations.filter(s => s.availableConnectors > 0).length;
    const totalConnectors = stations.reduce((sum, s) => sum + s.connectors.length, 0);
    const availableConnectors = stations.reduce((sum, s) => sum + s.availableConnectors, 0);
    
    return {
      total,
      operational,
      available,
      totalConnectors,
      availableConnectors,
      operationalPercentage: total > 0 ? Math.round((operational / total) * 100) : 0,
      availabilityPercentage: totalConnectors > 0 ? Math.round((availableConnectors / totalConnectors) * 100) : 0,
    };
  }
}

// Export factory function for creating transformer with user location
export function createStationTransformer(userLocation?: Coordinates): StationDataTransformer {
  return new StationDataTransformer(userLocation);
}

// Export default instance
export const stationTransformer = new StationDataTransformer();