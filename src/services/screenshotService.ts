// Screenshot Service - Handle screen capture functionality
// Uses modern getDisplayMedia API with fallback handling

export interface ScreenshotOptions {
  video?: MediaTrackConstraints;
  audio?: boolean;
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

export interface ScreenshotResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  timestamp: Date;
}

class ScreenshotService {
  private defaultOptions: ScreenshotOptions = {
    video: {
      mediaSource: 'screen',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  };

  // Check if screen capture is supported
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  // Main method to capture screenshot
  async captureScreen(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
    if (!this.isSupported()) {
      throw new Error('Screen capture is not supported in this browser');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: mergedOptions.video,
        audio: mergedOptions.audio
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      
      // Wait for video to load
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play()
            .then(() => resolve())
            .catch(reject);
        };
        video.onerror = reject;
      });

      // Wait for first frame
      await new Promise<void>((resolve) => {
        const checkVideoReady = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve();
          } else {
            requestAnimationFrame(checkVideoReady);
          }
        };
        checkVideoReady();
      });

      // Calculate dimensions with aspect ratio preservation
      const { width, height } = this.calculateDimensions(
        video.videoWidth,
        video.videoHeight,
        mergedOptions.maxWidth!,
        mergedOptions.maxHeight!
      );

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Stop the video stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob and data URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png', mergedOptions.quality);
      });

      const dataUrl = canvas.toDataURL('image/png', mergedOptions.quality);

      return {
        dataUrl,
        blob,
        width,
        height,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Người dùng từ chối quyền chụp màn hình');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Trình duyệt không hỗ trợ chụp màn hình');
        } else if (error.name === 'NotFoundError') {
          throw new Error('Không tìm thấy màn hình để chụp');
        }
      }
      
      throw new Error('Không thể chụp màn hình. Vui lòng thử lại.');
    }
  }

  // Capture specific element (if possible)
  async captureElement(element: HTMLElement, options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
    // This is a fallback method using html2canvas-like approach
    // For now, we'll just capture the full screen
    return this.captureScreen(options);
  }

  // Calculate optimal dimensions while preserving aspect ratio
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  // Compress image data URL
  compressImage(dataUrl: string, quality: number = 0.8, maxWidth: number = 1920): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate new dimensions
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxWidth * (img.height / img.width)
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    });
  }

  // Convert data URL to blob
  dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  // Get screenshot metadata
  getMetadata(screenshot: ScreenshotResult) {
    return {
      size: screenshot.blob.size,
      sizeFormatted: this.formatFileSize(screenshot.blob.size),
      dimensions: `${screenshot.width}x${screenshot.height}`,
      timestamp: screenshot.timestamp.toISOString(),
      type: 'image/png'
    };
  }

  // Format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check browser compatibility and show helpful messages
  getCompatibilityInfo() {
    const isSupported = this.isSupported();
    const userAgent = navigator.userAgent;
    
    let browserName = 'Unknown';
    let isRecommended = false;
    
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      isRecommended = true;
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      isRecommended = true;
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      isRecommended = false; // Limited support
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      isRecommended = true;
    }

    return {
      isSupported,
      browserName,
      isRecommended,
      message: isSupported 
        ? 'Trình duyệt hỗ trợ chụp màn hình' 
        : 'Trình duyệt không hỗ trợ chụp màn hình. Vui lòng sử dụng Chrome, Firefox hoặc Edge.'
    };
  }
}

// Export singleton instance
export const screenshotService = new ScreenshotService();
