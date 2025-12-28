/**
 * @fileoverview Image processing utilities for convolution and filtering.
 * 
 * Contains the core image processing functions including convolution,
 * pixel extraction, and frame processing for real-time video.
 */

import type { PixelData, Kernel } from '../types';
import { toGray, rgbToHex, clampPixelValue } from './colorConversion';

// =============================================================================
// CONVOLUTION OPERATIONS
// =============================================================================

/**
 * Applies a 3x3 convolution kernel to image data.
 * 
 * Convolution slides a kernel over the image and computes weighted sums
 * at each position. This is the foundation of image filtering operations.
 * 
 * @param imageData - Source image data from canvas
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param kernel - 3x3 convolution kernel
 * @param divisor - Normalization divisor (usually sum of kernel weights)
 * @returns New ImageData with convolution applied
 * 
 * @example
 * // Apply edge detection
 * const edgeKernel = [[-1,-1,-1], [-1,8,-1], [-1,-1,-1]];
 * const result = applyConvolution(imageData, 640, 480, edgeKernel, 1);
 */
export const applyConvolution = (
  imageData: ImageData,
  width: number,
  height: number,
  kernel: Kernel,
  divisor: number
): ImageData => {
  const src = imageData.data;
  const output = new Uint8ClampedArray(src.length);

  // Process each pixel (excluding 1px border for 3x3 kernel)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;

      // Apply kernel to 3x3 neighborhood
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          // Calculate source pixel index
          const srcIdx = ((y + ky) * width + (x + kx)) * 4;
          // Get kernel weight (kernel is [row][col], so [ky+1][kx+1])
          const weight = kernel[ky + 1][kx + 1];

          // Accumulate weighted RGB values
          r += src[srcIdx] * weight;
          g += src[srcIdx + 1] * weight;
          b += src[srcIdx + 2] * weight;
        }
      }

      // Calculate output pixel index
      const outIdx = (y * width + x) * 4;

      // Normalize by divisor and clamp to valid range
      output[outIdx] = clampPixelValue(r / divisor);
      output[outIdx + 1] = clampPixelValue(g / divisor);
      output[outIdx + 2] = clampPixelValue(b / divisor);
      output[outIdx + 3] = 255; // Full opacity
    }
  }

  // Handle border pixels (copy from source)
  copyBorderPixels(src, output, width, height);

  return new ImageData(output, width, height);
};

/**
 * Copies border pixels from source to output (convolution can't process edges).
 * 
 * @param src - Source pixel array
 * @param output - Output pixel array
 * @param width - Image width
 * @param height - Image height
 */
const copyBorderPixels = (
  src: Uint8ClampedArray,
  output: Uint8ClampedArray,
  width: number,
  height: number
): void => {
  // Top and bottom rows
  for (let x = 0; x < width; x++) {
    // Top row
    const topIdx = x * 4;
    output[topIdx] = src[topIdx];
    output[topIdx + 1] = src[topIdx + 1];
    output[topIdx + 2] = src[topIdx + 2];
    output[topIdx + 3] = src[topIdx + 3];

    // Bottom row
    const bottomIdx = ((height - 1) * width + x) * 4;
    output[bottomIdx] = src[bottomIdx];
    output[bottomIdx + 1] = src[bottomIdx + 1];
    output[bottomIdx + 2] = src[bottomIdx + 2];
    output[bottomIdx + 3] = src[bottomIdx + 3];
  }

  // Left and right columns
  for (let y = 0; y < height; y++) {
    // Left column
    const leftIdx = y * width * 4;
    output[leftIdx] = src[leftIdx];
    output[leftIdx + 1] = src[leftIdx + 1];
    output[leftIdx + 2] = src[leftIdx + 2];
    output[leftIdx + 3] = src[leftIdx + 3];

    // Right column
    const rightIdx = (y * width + width - 1) * 4;
    output[rightIdx] = src[rightIdx];
    output[rightIdx + 1] = src[rightIdx + 1];
    output[rightIdx + 2] = src[rightIdx + 2];
    output[rightIdx + 3] = src[rightIdx + 3];
  }
};

// =============================================================================
// PIXEL EXTRACTION
// =============================================================================

/**
 * Extracts pixel data from a canvas at specified position.
 * Creates a PixelData object with all color representations.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns PixelData object with RGB, hex, and grayscale values
 */
export const extractPixelData = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): PixelData => {
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];
  const a = pixel[3];

  return {
    r,
    g,
    b,
    a,
    hex: rgbToHex(r, g, b),
    gray: toGray(r, g, b),
  };
};

/**
 * Extracts a grid of pixel data from a canvas region.
 * Used for the matrix visualizer display.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @param gridSize - Number of pixels in each dimension
 * @returns 2D array of PixelData
 */
export const extractPixelGrid = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  gridSize: number
): PixelData[][] => {
  const grid: PixelData[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const rowData: PixelData[] = [];
    for (let col = 0; col < gridSize; col++) {
      rowData.push(extractPixelData(ctx, startX + col, startY + row));
    }
    grid.push(rowData);
  }

  return grid;
};

// =============================================================================
// GRAYSCALE CONVERSION
// =============================================================================

/**
 * Converts image data to grayscale.
 * 
 * @param imageData - Source image data
 * @returns New ImageData in grayscale
 */
export const convertToGrayscale = (imageData: ImageData): ImageData => {
  const output = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = toGray(
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2]
    );
    output[i] = gray;
    output[i + 1] = gray;
    output[i + 2] = gray;
    output[i + 3] = imageData.data[i + 3];
  }

  return new ImageData(output, imageData.width, imageData.height);
};

// =============================================================================
// DEMO UTILITIES
// =============================================================================

/**
 * Applies a kernel to a sample grayscale image (for demo purposes).
 * Uses a simplified single-channel convolution.
 * 
 * @param sampleImage - 2D array of grayscale values
 * @param kernel - 3x3 kernel
 * @param divisor - Normalization divisor
 * @param kernelRow - Kernel center row position
 * @param kernelCol - Kernel center column position
 * @returns The computed output value for the center position
 */
export const computeDemoConvolution = (
  sampleImage: number[][],
  kernel: number[][],
  divisor: number,
  kernelRow: number,
  kernelCol: number
): number => {
  let sum = 0;

  for (let ky = 0; ky < 3; ky++) {
    for (let kx = 0; kx < 3; kx++) {
      const imgRow = kernelRow - 1 + ky;
      const imgCol = kernelCol - 1 + kx;

      if (
        imgRow >= 0 &&
        imgRow < sampleImage.length &&
        imgCol >= 0 &&
        imgCol < sampleImage[0].length
      ) {
        sum += sampleImage[imgRow][imgCol] * kernel[ky][kx];
      }
    }
  }

  return clampPixelValue(sum / divisor);
};
