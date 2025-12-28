/**
 * @fileoverview Color conversion utilities for image processing.
 * 
 * Contains functions for converting between color representations
 * (RGB, hex, grayscale) used throughout the application.
 */

// =============================================================================
// GRAYSCALE CONVERSION
// =============================================================================

/**
 * Converts RGB values to grayscale using luminance formula.
 * Uses ITU-R BT.709 coefficients: 0.299R + 0.587G + 0.114B
 * 
 * This formula accounts for human perception - we're more sensitive
 * to green light than red, and more sensitive to red than blue.
 * 
 * @param r - Red channel value (0-255)
 * @param g - Green channel value (0-255)
 * @param b - Blue channel value (0-255)
 * @returns Grayscale value (0-255)
 * 
 * @example
 * toGray(255, 0, 0)   // Returns ~76 (pure red)
 * toGray(0, 255, 0)   // Returns ~150 (pure green - brightest)
 * toGray(0, 0, 255)   // Returns ~29 (pure blue - darkest)
 * toGray(128, 128, 128) // Returns 128 (gray stays gray)
 */
export const toGray = (r: number, g: number, b: number): number => {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
};

// =============================================================================
// HEX CONVERSION
// =============================================================================

/**
 * Converts RGB values to hexadecimal color string.
 * 
 * @param r - Red channel value (0-255)
 * @param g - Green channel value (0-255)
 * @param b - Blue channel value (0-255)
 * @returns Hex color string (e.g., "#FF5733")
 * 
 * @example
 * rgbToHex(255, 87, 51) // Returns "#FF5733"
 * rgbToHex(0, 0, 0)     // Returns "#000000"
 * rgbToHex(255, 255, 255) // Returns "#FFFFFF"
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Parses a hex color string to RGB values.
 * 
 * @param hex - Hex color string (with or without #)
 * @returns Object with r, g, b values
 * 
 * @example
 * hexToRgb("#FF5733") // Returns { r: 255, g: 87, b: 51 }
 * hexToRgb("000000")  // Returns { r: 0, g: 0, b: 0 }
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
};

// =============================================================================
// COLOR MANIPULATION
// =============================================================================

/**
 * Clamps a value to valid pixel range (0-255).
 * Used after convolution operations that may produce out-of-range values.
 * 
 * @param value - The value to clamp
 * @returns Clamped value between 0 and 255
 */
export const clampPixelValue = (value: number): number => {
  return Math.max(0, Math.min(255, Math.round(value)));
};

/**
 * Determines if a color is considered "light" for contrast purposes.
 * Uses relative luminance calculation.
 * 
 * @param r - Red channel value (0-255)
 * @param g - Green channel value (0-255)
 * @param b - Blue channel value (0-255)
 * @returns True if the color is light (should use dark text)
 */
export const isLightColor = (r: number, g: number, b: number): boolean => {
  // Using perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

/**
 * Gets appropriate text color (black or white) for a given background.
 * 
 * @param r - Background red value
 * @param g - Background green value
 * @param b - Background blue value
 * @returns "#000000" for light backgrounds, "#FFFFFF" for dark
 */
export const getContrastTextColor = (r: number, g: number, b: number): string => {
  return isLightColor(r, g, b) ? '#000000' : '#FFFFFF';
};
