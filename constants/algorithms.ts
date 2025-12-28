/**
 * @fileoverview Algorithm configurations for the Computer Vision Lab.
 * 
 * Contains preset algorithms with their kernels, divisors, and educational
 * deep-dive content for the interactive learning experience.
 */

import type { AlgorithmInfo, Kernel } from '../types';

// =============================================================================
// PRESET ALGORITHMS
// =============================================================================

/**
 * Collection of preset computer vision algorithms.
 * Each algorithm includes:
 * - Convolution kernel configuration
 * - Educational deep-dive content
 * - Real-world applications
 * 
 * @constant
 */
export const PRESET_ALGORITHMS: Record<string, AlgorithmInfo> = {
  identity: {
    name: 'Identity',
    description: 'No change - outputs original pixel values',
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ] as Kernel,
    divisor: 1,
    learn: 'The identity kernel shows you exactly what convolution does - it picks one pixel and ignores neighbors.',
    formula: 'Output = 0×neighbors + 1×center = center pixel',
    deepDive: {
      whatItDoes: 'Outputs the exact same image. It\'s like a "do nothing" filter, but it\'s actually super useful for understanding how all other kernels work!',
      howItWorks: 'The single "1" in the center means: "take 100% of the center pixel, 0% of everything else." Every other kernel is just a variation of this idea.',
      mathExplained: 'If center pixel = 150, then: (0×top + 0×left + 1×150 + 0×right + 0×bottom) ÷ 1 = 150. The pixel stays exactly the same!',
      realWorld: [
        'Testing if your convolution code works correctly',
        'A/B testing to compare "before and after" effects',
        'Placeholder in filter pipelines that can be swapped out',
      ],
      funFact: 'The identity kernel is the "control group" of image processing. Scientists use it to prove their other filters actually do something!',
    },
  },

  'edge-detection': {
    name: 'Edge Detection',
    description: 'Highlights boundaries between regions',
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ] as Kernel,
    divisor: 1,
    learn: 'Edge detection finds where colors change dramatically - like the outline of objects!',
    formula: 'Output = 8×center - sum(all neighbors)',
    deepDive: {
      whatItDoes: 'Finds the "outlines" in an image by detecting where pixel values change suddenly. Edges appear bright, flat areas become dark.',
      howItWorks: 'The center pixel is multiplied by 8, then we subtract all 8 neighbors. If neighbors are similar to center, they cancel out (result ≈ 0, dark). If neighbors are different, you get a big positive or negative number (bright edge).',
      mathExplained: 'Flat area: center=100, all neighbors=100 → 8×100 - 8×100 = 0 (black). Edge: center=200, neighbors=50 → 8×200 - 8×50 = 1200 (bright!). The bigger the difference, the stronger the edge.',
      realWorld: [
        'Self-driving cars detecting lane markings and road boundaries',
        'Medical imaging to outline tumors or organs',
        'Face detection - finding the edges of eyes, nose, mouth',
        'Document scanning to find page boundaries',
      ],
      funFact: 'Your own eyes do edge detection! Your retina enhances edges through "lateral inhibition" - neurons suppress their neighbors to make boundaries pop.',
    },
  },

  'gaussian-blur': {
    name: 'Gaussian Blur',
    description: 'Smooth noise reduction using weighted average',
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ] as Kernel,
    divisor: 16,
    learn: 'Gaussian blur averages pixels together, with closer pixels mattering more - like looking through frosted glass!',
    formula: 'Output = weighted_average(neighbors) ÷ 16',
    deepDive: {
      whatItDoes: 'Smoothly blends each pixel with its neighbors using a bell-curve pattern. Center pixel matters most, corners matter least. Great for reducing noise while keeping general shapes.',
      howItWorks: 'The numbers (1,2,4,2,1) form a discrete approximation of a Gaussian bell curve. Center gets 4× weight, edges get 2×, corners get 1×. Dividing by 16 (sum of all weights) keeps brightness the same.',
      mathExplained: 'For a bright pixel surrounded by dark: center=200, sides=50, corners=50. Result: (1×50 + 2×50 + 1×50 + 2×50 + 4×200 + 2×50 + 1×50 + 2×50 + 1×50) ÷ 16 = (800 + 400) ÷ 16 = 75. The bright pixel gets averaged down!',
      realWorld: [
        'Instagram/Snapchat beauty filters (skin smoothing)',
        'Reducing noise in low-light photos',
        'Preprocessing before edge detection to reduce false edges',
        'Creating depth-of-field effects (background blur)',
      ],
      funFact: 'Gaussian blur is named after Carl Friedrich Gauss, an 18th-century mathematician. The same math that describes blur also describes how errors spread in statistics!',
    },
  },

  sharpen: {
    name: 'Sharpen',
    description: 'Enhances edges and fine details',
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ] as Kernel,
    divisor: 1,
    learn: 'Sharpening amplifies differences between a pixel and its neighbors - making details pop!',
    formula: 'Output = 5×center - sum(adjacent neighbors)',
    deepDive: {
      whatItDoes: 'Makes edges and fine details more pronounced by exaggerating the difference between each pixel and its immediate neighbors. It\'s the opposite of blur!',
      howItWorks: 'The center pixel is multiplied by 5, then we subtract the 4 adjacent neighbors (not corners). This amplifies any differences. If a pixel is brighter than neighbors, it becomes even brighter. If darker, even darker.',
      mathExplained: 'Slight edge: center=110, neighbors=100 → 5×110 - 4×100 = 550 - 400 = 150. The small difference (10) became a big difference (50)! Flat area: center=100, neighbors=100 → 5×100 - 4×100 = 100. No change when there\'s nothing to enhance.',
      realWorld: [
        'Enhancing blurry photos or old scanned documents',
        'Making text more readable in low-quality images',
        'Satellite imagery to reveal terrain details',
        'Medical imaging to highlight fine structures',
      ],
      funFact: 'Too much sharpening creates "halos" around edges - bright outlines that look unnatural. This is why overdone HDR photos look weird!',
    },
  },
};

// =============================================================================
// ALGORITHM KEYS & HELPERS
// =============================================================================

/**
 * Valid algorithm key type derived from PRESET_ALGORITHMS.
 */
export type AlgorithmKey = keyof typeof PRESET_ALGORITHMS;

/**
 * Array of all algorithm keys for iteration.
 */
export const ALGORITHM_KEYS = Object.keys(PRESET_ALGORITHMS) as AlgorithmKey[];

/**
 * Get an algorithm by key with type safety.
 * @param key - The algorithm identifier
 * @returns The algorithm configuration or undefined
 */
export const getAlgorithm = (key: string): AlgorithmInfo | undefined => {
  return PRESET_ALGORITHMS[key];
};
