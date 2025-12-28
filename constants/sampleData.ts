/**
 * @fileoverview Sample data used in interactive demo components.
 * 
 * Contains static sample images and data structures for the educational
 * demonstrations. Using static data prevents jittery animations and provides
 * consistent learning experiences.
 */

// =============================================================================
// SAMPLE IMAGE DATA
// =============================================================================

/**
 * 5x5 grayscale sample image for the MatrixDemo component.
 * Values represent intensity (0-255) in a pattern suitable for
 * demonstrating pixel relationships and spatial concepts.
 * 
 * Pattern creates a subtle gradient with variation for visual interest.
 */
export const SAMPLE_IMAGE_5X5: number[][] = [
  [120, 135, 140, 138, 125],
  [130, 180, 195, 175, 135],
  [145, 200, 220, 190, 150],
  [135, 175, 185, 165, 140],
  [125, 140, 145, 135, 130],
];

/**
 * 7x7 grayscale sample image for the ConvolutionDemo component.
 * Larger grid provides more context for kernel sliding demonstrations.
 */
export const SAMPLE_IMAGE_7X7: number[][] = [
  [100, 110, 120, 130, 120, 110, 100],
  [110, 140, 160, 170, 160, 140, 110],
  [120, 160, 200, 220, 200, 160, 120],
  [130, 170, 220, 255, 220, 170, 130],
  [120, 160, 200, 220, 200, 160, 120],
  [110, 140, 160, 170, 160, 140, 110],
  [100, 110, 120, 130, 120, 110, 100],
];

/**
 * Small 3x3 input image for basic convolution examples.
 * Simple values make mental math easier for learners.
 */
export const SAMPLE_INPUT_3X3: number[][] = [
  [50, 80, 50],
  [80, 200, 80],
  [50, 80, 50],
];

// =============================================================================
// DEMO STEP CONFIGURATIONS
// =============================================================================

/**
 * Steps for the ConvolutionDemo interactive walkthrough.
 * Each step builds on the previous to explain convolution concepts.
 */
export const CONVOLUTION_DEMO_STEPS = [
  {
    title: "What is Convolution?",
    desc: "Convolution is a mathematical operation that combines an image with a small 'filter' (called a kernel) to transform it. Think of it like sliding a magnifying glass over every pixel.",
    visual: "overview"
  },
  {
    title: "Meet the Kernel",
    desc: "A kernel is a small grid of numbers (usually 3×3). Each number tells us how much to 'weight' the pixel underneath it. The center number affects the target pixel.",
    visual: "kernel"
  },
  {
    title: "The Sliding Window",
    desc: "The kernel slides across the image, one pixel at a time. At each position, it creates one new pixel value. Use the slider to move the kernel!",
    visual: "sliding"
  },
  {
    title: "The Math: Multiply & Sum",
    desc: "At each position: multiply each kernel value by the pixel underneath, then add all results together. This single number becomes the new pixel!",
    visual: "math"
  },
  {
    title: "Normalization",
    desc: "After summing, we often divide by a number to keep values in valid range (0-255). For blur, divide by sum of weights. For edge detection, no division needed!",
    visual: "normalize"
  },
  {
    title: "See It In Action",
    desc: "Watch how different kernels transform the image. Notice how edge detection finds boundaries while blur smooths everything out.",
    visual: "comparison"
  },
  {
    title: "Edge Cases (Literally!)",
    desc: "What happens at image borders where the kernel 'hangs off'? Common solutions: pad with zeros, mirror the edge, or skip border pixels entirely.",
    visual: "edges"
  },
  {
    title: "You're Ready!",
    desc: "You now understand convolution - the foundation of image filtering, CNNs, and computer vision! Every Instagram filter, every self-driving car uses this.",
    visual: "summary"
  }
];

/**
 * Steps for the KernelDemo interactive walkthrough.
 */
export const KERNEL_DEMO_STEPS = [
  {
    title: "What is a Kernel?",
    desc: "A kernel (also called filter or mask) is a small matrix of numbers that defines a specific image transformation. Different numbers = different effects!",
    visual: "intro"
  },
  {
    title: "The 3×3 Grid",
    desc: "Most kernels are 3×3 because that's the smallest size that captures relationships between a pixel and ALL its neighbors (8 surrounding pixels).",
    visual: "grid"
  },
  {
    title: "Identity: The 'Do Nothing' Kernel",
    desc: "A single 1 in the center, zeros everywhere else. This outputs the exact same image - it's our baseline for understanding other kernels.",
    visual: "identity"
  },
  {
    title: "Blur: Average Your Neighbors",
    desc: "When all kernel values are similar, the output is an average of nearby pixels. This smooths the image, reducing noise and details.",
    visual: "blur"
  },
  {
    title: "Edge Detection: Find Differences",
    desc: "When the center is positive and neighbors are negative (or vice versa), the kernel detects changes. Flat areas → dark. Edges → bright!",
    visual: "edge"
  },
  {
    title: "Build Your Own Kernel!",
    desc: "Click on any cell to change its value. Watch how your custom kernel transforms the sample image. Experiment freely!",
    visual: "builder"
  },
  {
    title: "Kernel Wisdom",
    desc: "Key insights: Sum of values affects brightness. Symmetric kernels create uniform effects. The divisor normalizes output to valid pixel range.",
    visual: "tips"
  }
];

/**
 * Steps for the MatrixDemo interactive walkthrough.
 */
export const MATRIX_DEMO_STEPS = [
  {
    title: "Images Are Just Numbers",
    desc: "Every digital image is a grid (matrix) of numbers. Each number represents how bright or what color a tiny square (pixel) should be.",
    visual: "intro"
  },
  {
    title: "Meet the Pixel",
    desc: "A pixel is the smallest unit of an image. On your screen right now, millions of pixels are creating this text. Each one has a precise color value.",
    visual: "pixel"
  },
  {
    title: "RGB: The Color Recipe",
    desc: "Every color is a mix of Red, Green, and Blue. Each channel is 0-255. (255,0,0) = pure red. (0,255,0) = pure green. (128,128,128) = gray.",
    visual: "rgb"
  },
  {
    title: "Grayscale: One Number Per Pixel",
    desc: "For simplicity, we often convert to grayscale: one number (0-255) per pixel. 0 = black, 255 = white, values in between = shades of gray.",
    visual: "grayscale"
  },
  {
    title: "Image Dimensions",
    desc: "A 1920×1080 image has 1920 columns and 1080 rows = 2,073,600 pixels! That's over 2 million numbers a computer processes for one image.",
    visual: "dimensions"
  },
  {
    title: "Explore the Matrix",
    desc: "Hover over pixels in the grid. See how position (row, column) maps to exact color values. This is exactly how computers 'see' images!",
    visual: "explore"
  },
  {
    title: "Why Matrices Matter",
    desc: "Understanding that images are number grids is the key to all computer vision. Filters, AI, compression - all just math on matrices!",
    visual: "summary"
  }
];

// =============================================================================
// PRESET KERNEL EXAMPLES
// =============================================================================

/**
 * Example kernels for the KernelDemo builder section.
 */
export const KERNEL_EXAMPLES = [
  {
    name: 'Identity',
    kernel: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    effect: 'No change',
    divisor: 1
  },
  {
    name: 'Box Blur',
    kernel: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    effect: 'Simple blur',
    divisor: 9
  },
  {
    name: 'Gaussian',
    kernel: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    effect: 'Smooth blur',
    divisor: 16
  },
  {
    name: 'Sharpen',
    kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    effect: 'Enhance edges',
    divisor: 1
  },
  {
    name: 'Edge Detect',
    kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    effect: 'Find boundaries',
    divisor: 1
  },
  {
    name: 'Emboss',
    kernel: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
    effect: '3D effect',
    divisor: 1
  }
];

// =============================================================================
// COLOR & RESOLUTION EXAMPLES
// =============================================================================

/**
 * Preset color examples for the RGB visualization.
 */
export const COLOR_EXAMPLES = [
  { name: 'Red', r: 255, g: 0, b: 0 },
  { name: 'Green', r: 0, g: 255, b: 0 },
  { name: 'Blue', r: 0, g: 0, b: 255 },
  { name: 'Yellow', r: 255, g: 255, b: 0 },
  { name: 'Cyan', r: 0, g: 255, b: 255 },
  { name: 'Magenta', r: 255, g: 0, b: 255 },
  { name: 'White', r: 255, g: 255, b: 255 },
  { name: 'Gray', r: 128, g: 128, b: 128 },
];

/**
 * Common image resolution examples.
 */
export const RESOLUTION_EXAMPLES = [
  { name: 'VGA', w: 640, h: 480, pixels: '307K' },
  { name: 'HD', w: 1280, h: 720, pixels: '921K' },
  { name: 'Full HD', w: 1920, h: 1080, pixels: '2.07M' },
  { name: '4K UHD', w: 3840, h: 2160, pixels: '8.29M' },
];
