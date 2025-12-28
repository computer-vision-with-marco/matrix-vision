/**
 * @fileoverview Custom hook for camera/webcam management.
 * 
 * Provides a clean interface for accessing the user's camera,
 * handling permissions, and managing the video stream lifecycle.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { CameraStatus } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface UseCameraOptions {
  /** Preferred video width (default: 640) */
  width?: number;
  /** Preferred video height (default: 480) */
  height?: number;
  /** Preferred facing mode: 'user' (front) or 'environment' (back) */
  facingMode?: 'user' | 'environment';
}

interface UseCameraReturn {
  /** Reference to attach to the video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Current camera status */
  status: CameraStatus;
  /** Error message if status is 'error' */
  error: string | null;
  /** Starts the camera stream */
  startCamera: () => Promise<void>;
  /** Stops the camera stream */
  stopCamera: () => void;
  /** Whether the camera is ready to capture frames */
  isReady: boolean;
  /** Available camera devices */
  devices: MediaDeviceInfo[];
  /** Currently selected device ID */
  selectedDeviceId: string | null;
  /** Switch to a different camera device */
  selectDevice: (deviceId: string) => Promise<void>;
  /** Refresh the list of available devices */
  refreshDevices: () => Promise<void>;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Custom hook for managing webcam/camera access.
 * 
 * Handles the full camera lifecycle including:
 * - Permission requests
 * - Device enumeration
 * - Stream management
 * - Cleanup on unmount
 * 
 * @param options - Configuration options for video constraints
 * @returns Camera control functions and state
 * 
 * @example
 * const { videoRef, startCamera, stopCamera, isReady } = useCamera();
 * 
 * useEffect(() => {
 *   startCamera();
 *   return () => stopCamera();
 * }, []);
 * 
 * return <video ref={videoRef} autoPlay />;
 */
export const useCamera = (options: UseCameraOptions = {}): UseCameraReturn => {
  const { width = 640, height = 480, facingMode = 'user' } = options;

  // State
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Enumerates available video input devices.
   */
  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === 'videoinput'
      );
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      return [];
    }
  }, []);

  /**
   * Starts the camera stream with specified constraints.
   */
  const startCamera = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      // Build video constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          ...(selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode }),
        },
        audio: false,
      };

      setStatus('initializing');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => resolve())
              .catch(reject);
          };

          videoRef.current.onerror = () => {
            reject(new Error('Video element error'));
          };
        });
      }

      // Refresh device list now that we have permission
      await refreshDevices();

      // Set selected device ID from the active track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }

      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera access failed';
      
      // Provide user-friendly error messages
      if (message.includes('NotAllowed') || message.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access.');
      } else if (message.includes('NotFound')) {
        setError('No camera found. Please connect a camera.');
      } else if (message.includes('NotReadable') || message.includes('TrackStart')) {
        setError('Camera is in use by another application.');
      } else {
        setError(message);
      }

      setStatus('error');
    }
  }, [width, height, facingMode, selectedDeviceId, refreshDevices]);

  /**
   * Stops the camera stream and releases resources.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus('idle');
    setError(null);
  }, []);

  /**
   * Switches to a different camera device.
   */
  const selectDevice = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      
      // If camera is running, restart with new device
      if (status === 'ready') {
        stopCamera();
        // Small delay to allow cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));
        await startCamera();
      }
    },
    [status, stopCamera, startCamera]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initial device enumeration
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    videoRef,
    status,
    error,
    startCamera,
    stopCamera,
    isReady: status === 'ready',
    devices,
    selectedDeviceId,
    selectDevice,
    refreshDevices,
  };
};

export default useCamera;
