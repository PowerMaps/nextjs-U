/**
 * Native camera adapter using Capacitor Camera
 */

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { CameraAdapter, CameraOptions, CameraPhoto, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeCameraAdapter extends AbstractBaseAdapter implements CameraAdapter {
  async initialize(): Promise<void> {
    try {
      // Camera is always available in native context
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize native camera:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      hasCamera: this.isAvailable(),
    };
  }

  async requestPermissions(): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.isAvailable()) {
      throw new PlatformError('Camera not supported', 'native', 'CAMERA_UNSUPPORTED', false);
    }

    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        return requestResult.camera === 'granted' && requestResult.photos === 'granted';
      }

      return true;
    } catch (error) {
      throw new PlatformError(
        'Failed to request camera permissions',
        'native',
        'CAMERA_PERMISSION_ERROR',
        true
      );
    }
  }

  async getPhoto(options?: CameraOptions): Promise<CameraPhoto> {
    await this.ensureInitialized();

    if (!this.isAvailable()) {
      throw new PlatformError('Camera not supported', 'native', 'CAMERA_UNSUPPORTED', false);
    }

    try {
      // Check and request permissions if needed
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new PlatformError(
          'Camera permissions denied',
          'native',
          'CAMERA_PERMISSION_DENIED',
          false
        );
      }

      const photo: Photo = await Camera.getPhoto({
        quality: options?.quality ?? 90,
        allowEditing: options?.allowEditing ?? false,
        resultType: this.convertResultType(options?.resultType),
        source: this.convertSource(options?.source),
      });

      return this.convertPhoto(photo);
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }

      // Handle user cancellation
      if (error instanceof Error && error.message && error.message.includes('cancelled')) {
        throw new PlatformError('Camera operation cancelled', 'native', 'CAMERA_CANCELLED', true);
      }

      throw new PlatformError(
        `Failed to get photo: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'CAMERA_ERROR',
        true
      );
    }
  }

  private convertResultType(resultType?: 'base64' | 'uri' | 'dataUrl'): CameraResultType {
    switch (resultType) {
      case 'base64':
        return CameraResultType.Base64;
      case 'dataUrl':
        return CameraResultType.DataUrl;
      case 'uri':
      default:
        return CameraResultType.Uri;
    }
  }

  private convertSource(source?: 'camera' | 'photos' | 'prompt'): CameraSource {
    switch (source) {
      case 'camera':
        return CameraSource.Camera;
      case 'photos':
        return CameraSource.Photos;
      case 'prompt':
      default:
        return CameraSource.Prompt;
    }
  }

  private convertPhoto(photo: Photo): CameraPhoto {
    const result: CameraPhoto = {
      format: photo.format,
    };

    if (photo.base64String) {
      result.base64String = photo.base64String;
    }

    if (photo.dataUrl) {
      result.dataUrl = photo.dataUrl;
    }

    if (photo.path) {
      result.path = photo.path;
    }

    if (photo.webPath) {
      result.webPath = photo.webPath;
    }

    return result;
  }
}
