
export interface PixelData {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
  gray: number;
}

export type MatrixMode = 'rgb' | 'hex' | 'gray';

export type Kernel = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export interface VisionAlgorithm {
  name: string;
  description: string;
  kernel: Kernel;
  divisor: number;
}
