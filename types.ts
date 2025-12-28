/**
 * @fileoverview Type definitions for the Computer Vision Lab application.
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the application, including pixel data structures, display modes, and
 * algorithm configurations.
 */

// =============================================================================
// PIXEL & IMAGE TYPES
// =============================================================================

/**
 * Represents the color data for a single pixel.
 * Contains RGB values, alpha channel, hex representation, and grayscale value.
 */
export interface PixelData {
  /** Red channel value (0-255) */
  r: number;
  /** Green channel value (0-255) */
  g: number;
  /** Blue channel value (0-255) */
  b: number;
  /** Alpha channel value (0-255), typically 255 for opaque */
  a: number;
  /** Hexadecimal color representation (e.g., "#FF5733") */
  hex: string;
  /** Grayscale value calculated using luminance formula (0-255) */
  gray: number;
}

/**
 * Display modes for the matrix visualizer.
 * - 'rgb': Shows R,G,B values (e.g., "255,128,0")
 * - 'hex': Shows hexadecimal color (e.g., "#FF8000")
 * - 'gray': Shows grayscale value (e.g., "180")
 */
export type MatrixMode = 'rgb' | 'hex' | 'gray';

// =============================================================================
// KERNEL & ALGORITHM TYPES
// =============================================================================

/**
 * A 3x3 convolution kernel matrix.
 * Used for image filtering operations like blur, sharpen, and edge detection.
 */
export type Kernel = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

/**
 * Basic vision algorithm configuration with kernel and divisor.
 */
export interface VisionAlgorithm {
  /** Display name of the algorithm */
  name: string;
  /** Short description of what the algorithm does */
  description: string;
  /** The 3x3 convolution kernel */
  kernel: Kernel;
  /** Divisor for normalizing kernel output (sum of positive weights for blur, 1 for edge) */
  divisor: number;
}

/**
 * Extended algorithm information with educational deep-dive content.
 * Used for the interactive learning modals.
 */
export interface AlgorithmInfo extends VisionAlgorithm {
  /** One-sentence learning takeaway */
  learn: string;
  /** Mathematical formula representation */
  formula: string;
  /** Detailed educational content */
  deepDive: AlgorithmDeepDive;
}

/**
 * Deep-dive educational content for each algorithm.
 */
export interface AlgorithmDeepDive {
  /** Plain English explanation of the algorithm's effect */
  whatItDoes: string;
  /** Step-by-step explanation of the mechanism */
  howItWorks: string;
  /** Mathematical breakdown with examples */
  mathExplained: string;
  /** List of real-world applications */
  realWorld: string[];
  /** Interesting fact about the algorithm or its history */
  funFact: string;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

/**
 * Camera connection status for the live feed feature.
 */
export type CameraStatus = 'idle' | 'connecting' | 'initializing' | 'ready' | 'error';

/**
 * Input source mode for the application.
 */
export type SourceMode = 'upload' | 'camera';

/**
 * Modal identifiers for the learning system.
 * - Algorithm names: 'identity', 'edge-detection', 'gaussian-blur', 'sharpen'
 * - Concept names: 'convolution', 'kernel', 'matrix'
 */
export type LearnModalType = 
  | 'identity' 
  | 'edge-detection' 
  | 'gaussian-blur' 
  | 'sharpen'
  | 'convolution'
  | 'kernel'
  | 'matrix'
  | null;

// =============================================================================
// DEMO COMPONENT TYPES
// =============================================================================

/**
 * Props for interactive demo modal components.
 */
export interface DemoProps {
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Step configuration for interactive demo components.
 */
export interface DemoStep {
  /** Step title displayed prominently */
  title: string;
  /** Description text explaining the step */
  desc: string;
  /** Identifier for the visual component to render */
  visual: string;
}

/**
 * Kernel example used in the KernelDemo component.
 */
export interface KernelExample {
  /** Display name */
  name: string;
  /** The 3x3 kernel matrix */
  kernel: number[][];
  /** Description of the effect */
  effect: string;
  /** Divisor for normalization */
  divisor: number;
}

/**
 * Color example used in the MatrixDemo RGB section.
 */
export interface ColorExample {
  /** Color name */
  name: string;
  /** Red value (0-255) */
  r: number;
  /** Green value (0-255) */
  g: number;
  /** Blue value (0-255) */
  b: number;
}

/**
 * Resolution example for the dimensions visualization.
 */
export interface ResolutionExample {
  /** Resolution name (e.g., "Full HD") */
  name: string;
  /** Width in pixels */
  w: number;
  /** Height in pixels */
  h: number;
  /** Formatted pixel count (e.g., "2.07M") */
  pixels: string;
}
