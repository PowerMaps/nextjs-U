// Core data transformation interfaces and utilities

import { 
  Coordinates, 
  ChargingStationResponseDto, 
  NotificationResponseDto, 
  PaginatedResponseDto,
  RouteResponseDto,
  RouteAnalysis
} from '../types';

// Base transformer interface
export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
  validate(input: unknown): input is TInput;
}

// Error types for transformation
export enum TransformationErrorType {
  INVALID_INPUT = 'invalid_input',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  TYPE_MISMATCH = 'type_mismatch',
  COORDINATE_CONVERSION_ERROR = 'coordinate_conversion_error',
}

export class TransformationError extends Error {
  constructor(
    public type: TransformationErrorType,
    message: string,
    public originalData?: unknown
  ) {
    super(message);
    this.name = 'TransformationError';
  }
}

// Base transformer class
export abstract class BaseTransformer<TInput, TOutput> implements DataTransformer<TInput, TOutput> {
  abstract transform(input: TInput): TOutput;
  abstract validate(input: unknown): input is TInput;

  protected safeTransform(input: unknown): TOutput | null {
    try {
      if (!this.validate(input)) {
        return null;
      }
      return this.transform(input);
    } catch (error) {
      console.error('Transformation error:', error);
      return null;
    }
  }
}

// Re-export all transformers and utilities
export * from './type-guards';
export * from './coordinate-utils';
export * from './data-normalizers';
export * from './notification-transformer';
export * from './station-transformer';
export * from './route-transformer';
export * from './address-transformer';

// Export transformer instances for easy access
export { notificationTransformer } from './notification-transformer';
export { stationTransformer, createStationTransformer } from './station-transformer';
export { routeTransformer } from './route-transformer';
export { addressTransformer } from './address-transformer';