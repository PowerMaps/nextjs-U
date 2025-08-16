/**
 * Web camera adapter using MediaDevices API
 */

import { CameraAdapter, CameraOptions, CameraPhoto, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebCameraAdapter extends AbstractBaseAdapter implements CameraAdapter {
  async initialize(): Promise<void> {
    try {
      const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      this.setAvailable(hasCamera);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize web camera:', error);
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
      throw new PlatformError(
        'Camera not supported',
        'web',
        'CAMERA_UNSUPPORTED',
        false
      );
    }

    try {
      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      return true;
    } catch (error) {
      console.warn('Camera permission denied:', error);
      return false;
    }
  }

  async getPhoto(options?: CameraOptions): Promise<CameraPhoto> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Camera not supported',
        'web',
        'CAMERA_UNSUPPORTED',
        false
      );
    }

    const source = options?.source || 'prompt';
    
    if (source === 'photos' || source === 'prompt') {
      // Use file input for photo selection
      return this.getPhotoFromFileInput(options);
    } else {
      // Use camera capture
      return this.getPhotoFromCamera(options);
    }
  }

  private async getPhotoFromFileInput(options?: CameraOptions): Promise<CameraPhoto> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      if (options?.source === 'camera') {
        input.capture = 'environment'; // Use rear camera on mobile
      }

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new PlatformError(
            'No file selected',
            'web',
            'CAMERA_NO_FILE',
            true
          ));
          return;
        }

        try {
          const photo = await this.processFile(file, options);
          resolve(photo);
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new PlatformError(
          'Camera operation cancelled',
          'web',
          'CAMERA_CANCELLED',
          true
        ));
      };

      input.click();
    });
  }

  private async getPhotoFromCamera(options?: CameraOptions): Promise<CameraPhoto> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer rear camera
      });

      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new PlatformError(
            'Canvas context not available',
            'web',
            'CAMERA_CANVAS_ERROR',
            false
          ));
          return;
        }

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Create a simple capture interface
          const captureButton = document.createElement('button');
          captureButton.textContent = 'Capture Photo';
          captureButton.style.position = 'fixed';
          captureButton.style.bottom = '20px';
          captureButton.style.left = '50%';
          captureButton.style.transform = 'translateX(-50%)';
          captureButton.style.zIndex = '9999';
          captureButton.style.padding = '10px 20px';
          captureButton.style.backgroundColor = '#007bff';
          captureButton.style.color = 'white';
          captureButton.style.border = 'none';
          captureButton.style.borderRadius = '5px';
          captureButton.style.cursor = 'pointer';

          video.style.position = 'fixed';
          video.style.top = '0';
          video.style.left = '0';
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
          video.style.zIndex = '9998';

          document.body.appendChild(video);
          document.body.appendChild(captureButton);

          captureButton.onclick = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const quality = (options?.quality || 90) / 100;
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(video);
            document.body.removeChild(captureButton);

            const photo: CameraPhoto = {
              dataUrl,
              webPath: dataUrl,
              format: 'jpeg',
            };

            if (options?.resultType === 'base64') {
              photo.base64String = dataUrl.split(',')[1];
            }

            resolve(photo);
          };
        };
      });
    } catch (error) {
      throw new PlatformError(
        'Failed to access camera',
        'web',
        'CAMERA_ACCESS_ERROR',
        true
      );
    }
  }

  private async processFile(file: File, options?: CameraOptions): Promise<CameraPhoto> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        if (!dataUrl) {
          reject(new PlatformError(
            'Failed to read file',
            'web',
            'CAMERA_FILE_READ_ERROR',
            true
          ));
          return;
        }

        const photo: CameraPhoto = {
          dataUrl,
          webPath: dataUrl,
          format: file.type.split('/')[1] || 'jpeg',
        };

        if (options?.resultType === 'base64') {
          photo.base64String = dataUrl.split(',')[1];
        }

        // Apply quality compression if needed
        if (options?.quality && options.quality < 100) {
          this.compressImage(dataUrl, options.quality / 100)
            .then(compressedDataUrl => {
              photo.dataUrl = compressedDataUrl;
              photo.webPath = compressedDataUrl;
              if (options.resultType === 'base64') {
                photo.base64String = compressedDataUrl.split(',')[1];
              }
              resolve(photo);
            })
            .catch(() => {
              // If compression fails, return original
              resolve(photo);
            });
        } else {
          resolve(photo);
        }
      };

      reader.onerror = () => {
        reject(new PlatformError(
          'Failed to read file',
          'web',
          'CAMERA_FILE_READ_ERROR',
          true
        ));
      };

      reader.readAsDataURL(file);
    });
  }

  private async compressImage(dataUrl: string, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }
}