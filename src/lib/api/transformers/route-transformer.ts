// Route data transformer

import { BaseTransformer } from './index';
import { RouteResponseDto, ChargingStationResponseDto } from '../types';
import { normalizeRouteResponse, normalizeChargingStation } from './data-normalizers';
import { isValidRouteResponse } from './type-guards';

// Enhanced route calculation result
export interface RouteCalculationResult {
  route: RouteResponseDto | null;
  isCalculating: boolean;
  error: string | null;
  statistics: {
    distance: string;
    duration: string;
    energyConsumption: string;
    estimatedCost: string;
    chargingStops: number;
  };
  chargingStations: (ChargingStationResponseDto & {
    coordinates: { lat: number; lng: number };
    availableConnectors: number;
    statusColor: 'green' | 'yellow' | 'red';
  })[];
  isOptimal: boolean;
}

// Route transformer class
export class RouteDataTransformer extends BaseTransformer<
  RouteResponseDto,
  RouteCalculationResult
> {
  validate(input: unknown): input is RouteResponseDto {
    return isValidRouteResponse(input);
  }

  transform(input: RouteResponseDto): RouteCalculationResult {
    const normalized = normalizeRouteResponse(input);
    
    // Transform charging stations along the route
    const chargingStations = normalized.chargingStations?.map(station => 
      normalizeChargingStation(station)
    ) || [];
    
    return {
      route: normalized,
      isCalculating: false,
      error: null,
      statistics: normalized.statistics,
      chargingStations,
      isOptimal: normalized.isOptimal,
    };
  }

  // Create loading state
  createLoadingState(): RouteCalculationResult {
    return {
      route: null,
      isCalculating: true,
      error: null,
      statistics: {
        distance: '0 km',
        duration: '0 min',
        energyConsumption: '0 kWh',
        estimatedCost: '$0.00',
        chargingStops: 0,
      },
      chargingStations: [],
      isOptimal: false,
    };
  }

  // Create error state
  createErrorState(error: string): RouteCalculationResult {
    return {
      route: null,
      isCalculating: false,
      error,
      statistics: {
        distance: '0 km',
        duration: '0 min',
        energyConsumption: '0 kWh',
        estimatedCost: '$0.00',
        chargingStops: 0,
      },
      chargingStations: [],
      isOptimal: false,
    };
  }

  // Get route summary
  getRouteSummary(result: RouteCalculationResult): {
    hasRoute: boolean;
    needsCharging: boolean;
    totalStops: number;
    estimatedTime: string;
    estimatedCost: string;
  } {
    return {
      hasRoute: result.route !== null,
      needsCharging: result.chargingStations.length > 0,
      totalStops: result.chargingStations.length,
      estimatedTime: result.statistics.duration,
      estimatedCost: result.statistics.estimatedCost,
    };
  }

  // Get charging recommendations
  getChargingRecommendations(result: RouteCalculationResult): {
    recommendedStops: typeof result.chargingStations;
    optionalStops: typeof result.chargingStations;
    emergencyStops: typeof result.chargingStations;
  } {
    const stations = result.chargingStations;
    
    // This would typically be based on route analysis data
    // For now, we'll use simple heuristics
    const recommendedStops = stations.filter(station => 
      station.statusColor === 'green' && station.availableConnectors > 0
    );
    
    const optionalStops = stations.filter(station => 
      station.statusColor === 'yellow' && station.availableConnectors > 0
    );
    
    const emergencyStops = stations.filter(station => 
      station.statusColor === 'red' || station.availableConnectors === 0
    );
    
    return {
      recommendedStops,
      optionalStops,
      emergencyStops,
    };
  }

  // Calculate route efficiency score
  calculateEfficiencyScore(result: RouteCalculationResult): {
    score: number; // 0-100
    factors: {
      distance: number;
      time: number;
      cost: number;
      chargingStops: number;
    };
  } {
    if (!result.route) {
      return {
        score: 0,
        factors: { distance: 0, time: 0, cost: 0, chargingStops: 0 }
      };
    }

    // Simple scoring algorithm (would be more sophisticated in real implementation)
    const analysis = result.route.analysis;
    
    // Distance efficiency (shorter is better, normalized to 0-25)
    const distanceScore = Math.max(0, 25 - (analysis.totalDistance / 1000) * 0.05);
    
    // Time efficiency (faster is better, normalized to 0-25)
    const timeScore = Math.max(0, 25 - (analysis.totalTime / 60) * 0.1);
    
    // Cost efficiency (cheaper is better, normalized to 0-25)
    const costScore = Math.max(0, 25 - analysis.estimatedCost * 0.5);
    
    // Charging stops (fewer is better, normalized to 0-25)
    const chargingScore = Math.max(0, 25 - result.chargingStations.length * 5);
    
    const totalScore = Math.round(distanceScore + timeScore + costScore + chargingScore);
    
    return {
      score: Math.min(100, Math.max(0, totalScore)),
      factors: {
        distance: Math.round(distanceScore),
        time: Math.round(timeScore),
        cost: Math.round(costScore),
        chargingStops: Math.round(chargingScore),
      },
    };
  }
}

// Export singleton instance
export const routeTransformer = new RouteDataTransformer();