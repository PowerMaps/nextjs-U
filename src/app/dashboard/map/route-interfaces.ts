export interface StationCostDetail {
  stationId: string;
  stationName: string;
  connectorType: string;
  connectorPower: number;
  pricePerKwh: number;
  energyCharged: number;
  chargingTime: number;
  cost: number;
  batteryPercentageOnArrival?: number;
  batteryPercentageAfterCharging?: number;
  energyNeededForNextLeg?: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'private' | 'semi_public' | 'workplace' | 'residential';
  description?: string;
  isActive: boolean;
  openingTime?: string;
  closingTime?: string;
  isVerified: boolean;
  rate?: number;
  connectors: Array<{
    id: string;
    type: string;
    power: number;
    status: string;
    pricePerKwh?: number;
  }>;
}

export interface EVRouteResponse {
  success: boolean;
  route: any;
  chargingStations: ChargingStation[];
  analysis: {
    totalDistance: number;
    totalTime: number;
    estimatedCost: number;
    energyConsumption: number;
    chargingTime: number;
    batteryLevelAtDestination: number;
    costBreakdown?: StationCostDetail[]; // Added cost breakdown by station/connector
    initialBatteryPercentage?: number; // Starting battery percentage
    batteryCapacity?: number; // Vehicle battery capacity in kWh
  };
  metadata: {
    calculatedAt: Date;
    vehicleUsed: string;
    needsCharging: boolean;
    routeOptimized: boolean;
    weatherConsidered: boolean;
    vehicleConnectorType?: string; // Added vehicle connector type
    vehicleEfficiency?: number; // Vehicle energy efficiency (kWh/km)
    vehicleRange?: number; // Estimated vehicle range (km)
    weather?: {
      temperature: number;
      conditions: string;
      windSpeed: number;
      rangeImpact: number;
      impactBreakdown?: {
        temperature: number;
        wind: number;
        precipitation: number;
        other: number;
      };
      recommendations?: string[];
    };
  };
}