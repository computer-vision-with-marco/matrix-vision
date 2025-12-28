/**
 * @fileoverview Custom hook for image processing operations.
 * 
 * Provides a centralized interface for applying convolution filters,
 * extracting pixel data, and managing processed image state.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PixelData, Kernel } from '../types';
import { 
  applyConvolution, 
  extractPixelData, 
  extractPixelGrid 
} from '../utils/imageProcessing';
import { PRESET_ALGORITHMS } from '../constants/algorithms';

// =============================================================================
// TYPES
// =============================================================================

interface UseImageProcessorOptions {
  /** Grid size for pixel extraction (default: 12) */
  gridSize?: number;
  /** Target FPS for live processing (default: 15) */
  targetFps?: number;
}

interface UseImageProcessorReturn {
  /** Currently selected algorithm key */
  selectedAlgorithm: string;
  /** Set the active algorithm */
  setSelectedAlgorithm: (algorithm: string) => void;
  /** Whether to show processed or original image */
  showProcessed: boolean;
  /** Toggle processed view */
  setShowProcessed: (show: boolean) => void;
  /** Current pixel grid data for visualizer */
  pixelGrid: PixelData[][] | null;
  /** Process a video frame (call in animation loop) */
  processVideoFrame: (
    video: HTMLVideoElement,
    originalCanvas: HTMLCanvasElement,
    processedCanvas: HTMLCanvasElement
  ) => void;
  /** Process an uploaded image */
  processImage: (
    image: HTMLImageElement,
    originalCanvas: HTMLCanvasElement,
    processedCanvas: HTMLCanvasElement
  ) => void;
  /** Update pixel grid from current canvas position */
  updatePixelGrid: (
    canvas: HTMLCanvasElement,
    x: number,
    y: number
  ) => void;
  /** Start live processing loop */
  startProcessing: () => void;
  /** Stop live processing loop */
  stopProcessing: () => void;
  /** Whether processing loop is running */
  isProcessing: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Custom hook for image processing operations.
 * 
 * Handles:
 * - Real-time video frame processing
 * - Static image processing
 * - Pixel grid extraction for visualizer
 * - Algorithm selection and application
 * 
 * @param options - Configuration options
 * @returns Processing functions and state
 * 
 * @example
 * const {
 *   selectedAlgorithm,
 *   setSelectedAlgorithm,
 *   processVideoFrame,
 *   pixelGrid
 * } = useImageProcessor();
 */
export const useImageProcessor = (
  options: UseImageProcessorOptions = {}
): UseImageProcessorReturn => {
  const { gridSize = 12, targetFps = 15 } = options;
  const frameInterval = 1000 / targetFps;

  // State
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('identity');
  const [showProcessed, setShowProcessed] = useState(true);
  const [pixelGrid, setPixelGrid] = useState<PixelData[][] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for animation loop
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Gets the current algorithm configuration.
   */
  const getCurrentAlgorithm = useCallback(() => {
    return PRESET_ALGORITHMS[selectedAlgorithm] || PRESET_ALGORITHMS.identity;
  }, [selectedAlgorithm]);

  /**
   * Processes a single video frame.
   */
  const processVideoFrame = useCallback(
    (
      video: HTMLVideoElement,
      originalCanvas: HTMLCanvasElement,
      processedCanvas: HTMLCanvasElement
    ) => {
      const origCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
      const procCtx = processedCanvas.getContext('2d', { willReadFrequently: true });

      if (!origCtx || !procCtx || video.readyState < 2) return;

      // Draw original frame
      origCtx.drawImage(video, 0, 0, originalCanvas.width, originalCanvas.height);

      // Get image data
      const imageData = origCtx.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
      );

      // Apply convolution
      const algorithm = getCurrentAlgorithm();
      const processed = applyConvolution(
        imageData,
        originalCanvas.width,
        originalCanvas.height,
        algorithm.kernel,
        algorithm.divisor
      );

      // Draw processed result
      procCtx.putImageData(processed, 0, 0);

      // Store reference for pixel grid extraction
      processedCanvasRef.current = showProcessed ? processedCanvas : originalCanvas;
    },
    [getCurrentAlgorithm, showProcessed]
  );

  /**
   * Processes a static image.
   */
  const processImage = useCallback(
    (
      image: HTMLImageElement,
      originalCanvas: HTMLCanvasElement,
      processedCanvas: HTMLCanvasElement
    ) => {
      const origCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
      const procCtx = processedCanvas.getContext('2d', { willReadFrequently: true });

      if (!origCtx || !procCtx) return;

      // Calculate aspect-ratio-preserving dimensions
      const aspectRatio = image.width / image.height;
      let drawWidth = originalCanvas.width;
      let drawHeight = originalCanvas.height;

      if (aspectRatio > drawWidth / drawHeight) {
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawWidth = drawHeight * aspectRatio;
      }

      const offsetX = (originalCanvas.width - drawWidth) / 2;
      const offsetY = (originalCanvas.height - drawHeight) / 2;

      // Clear canvases
      origCtx.fillStyle = '#000';
      origCtx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
      procCtx.fillStyle = '#000';
      procCtx.fillRect(0, 0, processedCanvas.width, processedCanvas.height);

      // Draw image
      origCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      // Get image data and apply convolution
      const imageData = origCtx.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
      );

      const algorithm = getCurrentAlgorithm();
      const processed = applyConvolution(
        imageData,
        originalCanvas.width,
        originalCanvas.height,
        algorithm.kernel,
        algorithm.divisor
      );

      procCtx.putImageData(processed, 0, 0);

      // Store reference for pixel grid extraction
      processedCanvasRef.current = showProcessed ? processedCanvas : originalCanvas;
    },
    [getCurrentAlgorithm, showProcessed]
  );

  /**
   * Updates the pixel grid from canvas position.
   */
  const updatePixelGrid = useCallback(
    (canvas: HTMLCanvasElement, x: number, y: number) => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Store position for continuous updates
      gridPositionRef.current = { x, y };

      // Extract pixel grid
      const startX = Math.max(0, Math.min(x, canvas.width - gridSize));
      const startY = Math.max(0, Math.min(y, canvas.height - gridSize));

      const grid = extractPixelGrid(ctx, startX, startY, gridSize);
      setPixelGrid(grid);
    },
    [gridSize]
  );

  /**
   * Animation loop for continuous processing.
   */
  const animate = useCallback(
    (
      video: HTMLVideoElement,
      originalCanvas: HTMLCanvasElement,
      processedCanvas: HTMLCanvasElement,
      timestamp: number
    ) => {
      if (!isProcessing) return;

      // Throttle to target FPS
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp;
        processVideoFrame(video, originalCanvas, processedCanvas);
      }

      animationFrameRef.current = requestAnimationFrame((ts) =>
        animate(video, originalCanvas, processedCanvas, ts)
      );
    },
    [isProcessing, frameInterval, processVideoFrame]
  );

  /**
   * Starts the processing loop.
   */
  const startProcessing = useCallback(() => {
    setIsProcessing(true);
  }, []);

  /**
   * Stops the processing loop.
   */
  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    selectedAlgorithm,
    setSelectedAlgorithm,
    showProcessed,
    setShowProcessed,
    pixelGrid,
    processVideoFrame,
    processImage,
    updatePixelGrid,
    startProcessing,
    stopProcessing,
    isProcessing,
  };
};

export default useImageProcessor;
