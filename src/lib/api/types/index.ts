// Common types used across API interfaces

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponseDto<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// User types
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  defaultVehicleId?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reservationReminders: boolean;
  chargingAlerts: boolean;
  paymentNotifications: boolean;
  specialOffers: boolean;
  stationUpdates: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferences?: Partial<UserPreferences>;
}

// Wallet types
export interface WalletResponseDto {
  id: string;
  balance: number;
  currency: string;
  owner: UserResponseDto;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionResponseDto {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  reference?: string;
  createdAt: string;
  wallet: WalletResponseDto;
}

export interface TopUpWalletDto {
  amount: number;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
}

export interface TransferFundsDto {
  toWalletId: string;
  amount: number;
  description?: string;
}

// Vehicle types
export interface VehicleResponseDto {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  nickname?: string;
  batteryCapacity: number; // kWh
  range: number; // km
  efficiency: number; // kWh/100km
  connectorType: string;
  chargingPower: number; // kW
  createdAt: string;
  updatedAt: string;
  owner: UserResponseDto;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  nickname?: string;
  batteryCapacity: number;
  range: number;
  efficiency: number;
  connectorType: string;
  chargingPower: number;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  nickname?: string;
  batteryCapacity?: number;
  range?: number;
  efficiency?: number;
  connectorType?: string;
  chargingPower?: number;
}

// Route types
export interface RouteRequestDto {
  origin: string | Coordinates;
  destination: string | Coordinates;
  vehicleId: string;
  routeConfig?: RouteOptions;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteOptions {
  considerWeather?: boolean;
  considerTraffic?: boolean;
  optimizeForCost?: boolean;
  optimizeForTime?: boolean;
  priorityMode?: 'balanced' | 'fastest' | 'cheapest' | 'shortest';
  includeAlternatives?: boolean;
}

export interface RouteResponseDto {
  success: boolean;
  route: any; // Map route data
  chargingStations: ChargingStationResponseDto[];
  analysis: RouteAnalysis;
  metadata: RouteMetadata;
}

export interface RouteAnalysis {
  totalDistance: number;
  totalTime: number;
  estimatedCost: number;
  energyConsumption: number;
  chargingTime: number;
  batteryLevelAtDestination: number;
  costBreakdown?: StationCostDetail[];
  initialBatteryPercentage?: number;
  batteryCapacity?: number;
}

export interface RouteMetadata {
  calculatedAt: string;
  vehicleUsed: string;
  needsCharging: boolean;
  routeOptimized: boolean;
  weatherConsidered: boolean;
  vehicleConnectorType?: string;
  vehicleEfficiency?: number;
  vehicleRange?: number;
  weather?: WeatherInfo;
}

export interface StationCostDetail {
  stationId: string;
  stationName: string;
  cost: number;
  energyAdded: number;
}

export interface ChargingStationResponseDto {
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
  connectors: ConnectorResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorResponseDto {
  id: string;
  type: string;
  power: number;
  status: 'AVAILABLE' | 'IN_USE' | 'OFFLINE' | 'RESERVED';
  station: ChargingStationResponseDto;
  pricePerKwh?: number;
}

export interface BookingRequestDto {
  connectorId: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  estimatedEnergyNeeded?: number; // kWh
}

export interface BookingResponseDto {
  id: string;
  connectorId: string;
  connector: ConnectorResponseDto;
  userId: string;
  startTime: string;
  endTime: string;
  estimatedEnergyNeeded?: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingResponseDto {
  id: string;
  connectorType: string;
  pricePerKwh: number;
  currency: string;
  description?: string;
}

export interface ReviewResponseDto {
  id: string;
  rating: number;
  comment?: string;
  user: UserResponseDto;
  createdAt: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  icon: string;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto extends CreateUserDto {}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Notification types
export interface NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
  user: UserResponseDto;
}

export interface UpdateNotificationDto {
  read?: boolean;
}

export interface NotificationSettingsDto {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  reservationReminders?: boolean;
  chargingAlerts?: boolean;
  paymentNotifications?: boolean;
  specialOffers?: boolean;
  stationUpdates?: boolean;
}