/**
 * @fileoverview Interactive Matrix/Image Demo component.
 * 
 * A step-by-step interactive walkthrough explaining how images are represented
 * as matrices of numbers. Includes RGB exploration, grayscale conversion,
 * and pixel-level interaction.
 */

import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import type { DemoProps } from '../../types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Step definitions for the matrix walkthrough.
 */
const STEPS = [
  {
    title: 'The Secret: Images are Numbers',
    desc: 'Every photo you have ever seen is just a giant grid of numbers. Let us decode this!',
    visual: 'intro'
  },
  {
    title: 'Pixels: The Building Blocks',
    desc: 'Click + and - to zoom in. Watch how a smooth image becomes visible squares (pixels)!',
    visual: 'zoom'
  },
  {
    title: 'One Pixel = One Color',
    desc: 'Click any pixel to see its exact position and brightness value.',
    visual: 'pixel'
  },
  {
    title: 'RGB: The Color Recipe',
    desc: 'Drag the sliders to mix your own color! Every pixel stores 3 numbers: Red, Green, Blue.',
    visual: 'rgb'
  },
  {
    title: 'From Color to Grayscale',
    desc: 'Click any color to see its grayscale value. This formula weighs green highest (our eyes are most sensitive to it).',
    visual: 'gray'
  },
  {
    title: 'The Matrix: What AI Sees',
    desc: 'Click any cell to highlight it. This grid of numbers IS the image to a computer!',
    visual: 'matrix'
  },
  {
    title: 'Dimensions Matter',
    desc: 'Image size = Width × Height. A 1080p video frame has 1920×1080 = over 2 million pixels!',
    visual: 'dimensions'
  }
];

/**
 * Static sample image data (4x4 mini grayscale image).
 * Using static data prevents jittery animations.
 */
const SAMPLE_IMAGE = [
  [182, 92, 98, 128],
  [167, 251, 229, 234],
  [198, 42, 238, 119],
  [247, 141, 243, 181]
];

/**
 * Color examples for the grayscale conversion demo.
 */
const COLOR_EXAMPLES = [
  { name: 'Red', r: 255, g: 0, b: 0 },
  { name: 'Orange', r: 255, g: 128, b: 0 },
  { name: 'Yellow', r: 255, g: 255, b: 0 },
  { name: 'Green', r: 0, g: 255, b: 0 },
  { name: 'Cyan', r: 0, g: 255, b: 255 },
  { name: 'Blue', r: 0, g: 0, b: 255 },
  { name: 'Purple', r: 128, g: 0, b: 255 },
  { name: 'White', r: 255, g: 255, b: 255 },
];

/**
 * Resolution examples for the dimensions demo.
 */
const RESOLUTION_EXAMPLES = [
  { name: 'Thumbnail', w: 64, h: 64, pixels: '4K' },
  { name: 'SD Video', w: 640, h: 480, pixels: '307K' },
  { name: 'HD 720p', w: 1280, h: 720, pixels: '922K' },
  { name: 'Full HD', w: 1920, h: 1080, pixels: '2.07M' },
  { name: '4K UHD', w: 3840, h: 2160, pixels: '8.29M' },
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Converts RGB to grayscale using luminance formula.
 */
const toGray = (r: number, g: number, b: number): number => {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Interactive Matrix Demo component.
 * 
 * Provides a 7-step walkthrough explaining how images are represented
 * as matrices of numbers, with interactive visualizations.
 */
export const MatrixDemo: React.FC<DemoProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [hoveredPixel, setHoveredPixel] = useState<number | null>(null);
  const [rgbValues, setRgbValues] = useState({ r: 128, g: 64, b: 192 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedGrayPixel, setSelectedGrayPixel] = useState<number | null>(null);

  const currentStep = STEPS[step];

  /**
   * Renders the visualization for the current step.
   */
  const renderVisual = () => {
    switch (currentStep.visual) {
      case 'intro':
        return <IntroVisual />;
      case 'zoom':
        return <ZoomVisual zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />;
      case 'pixel':
        return <PixelVisual hoveredPixel={hoveredPixel} setHoveredPixel={setHoveredPixel} />;
      case 'rgb':
        return <RgbVisual rgbValues={rgbValues} setRgbValues={setRgbValues} />;
      case 'gray':
        return (
          <GrayVisual 
            selectedGrayPixel={selectedGrayPixel} 
            setSelectedGrayPixel={setSelectedGrayPixel}
          />
        );
      case 'matrix':
        return <MatrixVisual hoveredPixel={hoveredPixel} setHoveredPixel={setHoveredPixel} />;
      case 'dimensions':
        return <DimensionsVisual />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-violet-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Eye size={20} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-lg">Images as Matrices</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <X size={18} className="text-neutral-400" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-violet-500' : 
                i < step ? 'bg-violet-500/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-6">
          <div className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1">
            Step {step + 1} of {STEPS.length}
          </div>
          <h4 className="text-xl font-semibold mb-2">{currentStep.title}</h4>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">{currentStep.desc}</p>
        </div>

        {/* Visual */}
        <div className="bg-black/30 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
          {renderVisual()}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
        <button 
          onClick={() => setStep(Math.max(0, step - 1))} 
          disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        <button 
          onClick={() => step === STEPS.length - 1 ? onClose() : setStep(step + 1)}
          className="px-6 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
        >
          {step === STEPS.length - 1 ? 'Got it!' : 'Next →'}
        </button>
      </div>
    </>
  );
};

// =============================================================================
// VISUAL COMPONENTS
// =============================================================================

/**
 * Introduction visual showing image = numbers concept.
 */
const IntroVisual: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="text-center">
        <div className="grid grid-cols-4 gap-0.5 p-2 rounded-lg overflow-hidden">
          {SAMPLE_IMAGE.flat().map((v, i) => (
            <div key={i} className="w-6 h-6 rounded-sm" style={{ backgroundColor: `rgb(${v},${v},${v})` }} />
          ))}
        </div>
        <div className="text-xs text-neutral-400 mt-2">What you see</div>
      </div>
      <div className="text-3xl text-violet-400">=</div>
      <div className="text-center">
        <div className="grid grid-cols-4 gap-0.5 p-2 bg-black/50 rounded-lg">
          {SAMPLE_IMAGE.flat().map((v, i) => (
            <div key={i} className="w-8 h-6 bg-white/10 rounded-sm flex items-center justify-center text-[8px] font-mono text-neutral-300">
              {v}
            </div>
          ))}
        </div>
        <div className="text-xs text-neutral-400 mt-2">What computer sees</div>
      </div>
    </div>
  );
};

interface ZoomState {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}

/**
 * Zoom visual showing pixel emergence.
 */
const ZoomVisual: React.FC<ZoomState> = ({ zoomLevel, setZoomLevel }) => {
  const zoomSizes = [4, 8, 16, 24];
  const currentSize = zoomSizes[Math.min(zoomLevel, 3)];
  const gapSize = zoomLevel >= 2 ? 1 : 0;
  
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => setZoomLevel(Math.max(0, zoomLevel - 1))} 
          disabled={zoomLevel === 0}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-lg font-bold"
        >
          −
        </button>
        <div className="text-center">
          <div className="bg-black/30 p-3 rounded-lg inline-block">
            <div className="grid grid-cols-4" style={{ gap: `${gapSize}px` }}>
              {SAMPLE_IMAGE.flat().map((v, i) => (
                <div 
                  key={i} 
                  className="rounded-sm transition-all" 
                  style={{ 
                    width: `${currentSize}px`, 
                    height: `${currentSize}px`, 
                    backgroundColor: `rgb(${v},${v},${v})`,
                  }} 
                />
              ))}
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-2">
            Zoom: {['1×', '2×', '4×', '6×'][zoomLevel]}
          </div>
        </div>
        <button 
          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))} 
          disabled={zoomLevel === 3}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-lg font-bold"
        >
          +
        </button>
      </div>
      <div className="text-xs text-neutral-500">
        {zoomLevel < 2 ? 'Looks smooth...' : zoomLevel < 3 ? 'Starting to see squares!' : 'These squares are PIXELS!'}
      </div>
    </div>
  );
};

interface HoverState {
  hoveredPixel: number | null;
  setHoveredPixel: (pixel: number | null) => void;
}

/**
 * Pixel selection visual showing coordinates.
 */
const PixelVisual: React.FC<HoverState> = ({ hoveredPixel, setHoveredPixel }) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-6">
        <div className="bg-black/30 p-2 rounded-lg">
          <div className="grid grid-cols-4 gap-1">
            {SAMPLE_IMAGE.flat().map((v, i) => {
              const isSelected = hoveredPixel === i;
              return (
                <button 
                  key={i} 
                  onClick={() => setHoveredPixel(isSelected ? null : i)}
                  className={`w-10 h-10 rounded-sm transition-all ${
                    isSelected ? 'ring-2 ring-violet-400 scale-110 z-10' : 'hover:ring-1 hover:ring-white/30'
                  }`}
                  style={{ backgroundColor: `rgb(${v},${v},${v})` }}
                >
                  {isSelected && (
                    <span className="text-[8px] font-mono text-white drop-shadow-lg">{v}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {hoveredPixel !== null && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 text-left">
            <div className="text-xs text-violet-400 font-medium mb-2">Selected Pixel</div>
            <div className="space-y-1 text-sm">
              <div className="text-neutral-300">
                Row: <span className="text-violet-300 font-mono">{Math.floor(hoveredPixel / 4)}</span>
              </div>
              <div className="text-neutral-300">
                Column: <span className="text-violet-300 font-mono">{hoveredPixel % 4}</span>
              </div>
              <div className="text-neutral-300">
                Value: <span className="text-violet-300 font-mono">{SAMPLE_IMAGE.flat()[hoveredPixel]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="text-[10px] text-neutral-500">Click a pixel to see its coordinates and value</div>
    </div>
  );
};

interface RgbState {
  rgbValues: { r: number; g: number; b: number };
  setRgbValues: (values: { r: number; g: number; b: number }) => void;
}

/**
 * RGB color mixer visual.
 */
const RgbVisual: React.FC<RgbState> = ({ rgbValues, setRgbValues }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-red-400 font-mono w-8">R</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValues.r} 
              onChange={(e) => setRgbValues({ ...rgbValues, r: +e.target.value })}
              className="w-32 accent-red-500" 
            />
            <span className="font-mono text-sm w-8 text-neutral-300">{rgbValues.r}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-mono w-8">G</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValues.g} 
              onChange={(e) => setRgbValues({ ...rgbValues, g: +e.target.value })}
              className="w-32 accent-green-500" 
            />
            <span className="font-mono text-sm w-8 text-neutral-300">{rgbValues.g}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-mono w-8">B</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValues.b} 
              onChange={(e) => setRgbValues({ ...rgbValues, b: +e.target.value })}
              className="w-32 accent-blue-500" 
            />
            <span className="font-mono text-sm w-8 text-neutral-300">{rgbValues.b}</span>
          </div>
        </div>
        <div className="text-center">
          <div 
            className="w-20 h-20 rounded-lg shadow-lg" 
            style={{ backgroundColor: `rgb(${rgbValues.r},${rgbValues.g},${rgbValues.b})` }} 
          />
          <div className="text-[9px] font-mono text-neutral-400 mt-2">
            ({rgbValues.r}, {rgbValues.g}, {rgbValues.b})
          </div>
        </div>
      </div>
      <div className="bg-black/30 rounded-lg p-3 max-w-md mx-auto">
        <div className="text-[10px] text-neutral-400 text-center">
          Each pixel stores <span className="text-red-400">R</span>, <span className="text-green-400">G</span>, <span className="text-blue-400">B</span> values (0-255 each) = <span className="text-violet-400">16.7 million</span> possible colors!
        </div>
      </div>
    </div>
  );
};

interface GrayState {
  selectedGrayPixel: number | null;
  setSelectedGrayPixel: (pixel: number | null) => void;
}

/**
 * Grayscale conversion visual.
 */
const GrayVisual: React.FC<GrayState> = ({ selectedGrayPixel, setSelectedGrayPixel }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {COLOR_EXAMPLES.map((c, i) => {
          const gray = toGray(c.r, c.g, c.b);
          const isSelected = selectedGrayPixel === i;
          return (
            <button 
              key={i} 
              onClick={() => setSelectedGrayPixel(isSelected ? null : i)}
              className={`text-center transition-all ${isSelected ? 'scale-110' : ''}`}
            >
              <div className="flex gap-1 justify-center">
                <div 
                  className={`w-8 h-8 rounded ${isSelected ? 'ring-2 ring-violet-400' : ''}`}
                  style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }} 
                />
                {isSelected && (
                  <>
                    <span className="text-neutral-500 self-center">→</span>
                    <div 
                      className="w-8 h-8 rounded ring-2 ring-violet-400"
                      style={{ backgroundColor: `rgb(${gray},${gray},${gray})` }} 
                    />
                  </>
                )}
              </div>
              <div className="text-[8px] text-neutral-500 mt-1">{c.name}</div>
              {isSelected && <div className="text-[8px] text-violet-400 font-mono">{gray}</div>}
            </button>
          );
        })}
      </div>
      <div className="bg-black/30 rounded-lg p-3 max-w-sm mx-auto">
        <div className="text-[9px] font-mono text-neutral-400 text-center">
          Gray = <span className="text-red-400">0.299×R</span> + <span className="text-green-400">0.587×G</span> + <span className="text-blue-400">0.114×B</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Matrix representation visual.
 */
const MatrixVisual: React.FC<HoverState> = ({ hoveredPixel, setHoveredPixel }) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="grid grid-cols-4 gap-0.5">
            {SAMPLE_IMAGE.flat().map((v, i) => (
              <div key={i} className="w-6 h-6 rounded-sm" style={{ backgroundColor: `rgb(${v},${v},${v})` }} />
            ))}
          </div>
          <div className="text-[9px] text-neutral-500 mt-2">Image</div>
        </div>
        <div className="text-violet-400 text-2xl">=</div>
        <div className="text-center">
          <div className="bg-black/50 rounded-lg p-1 inline-block">
            <div className="grid grid-cols-4 gap-0.5">
              {SAMPLE_IMAGE.flat().map((v, i) => {
                const isSelected = hoveredPixel === i;
                return (
                  <button 
                    key={i} 
                    onClick={() => setHoveredPixel(isSelected ? null : i)}
                    className={`w-10 h-8 rounded-sm flex items-center justify-center text-[9px] font-mono transition-all
                      ${isSelected 
                        ? 'bg-violet-500 text-white ring-2 ring-violet-400' 
                        : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                      }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-[9px] text-neutral-500 mt-2">Matrix (4×4)</div>
        </div>
      </div>
      {hoveredPixel !== null && (
        <div className="text-[10px] text-violet-400">
          matrix[{Math.floor(hoveredPixel / 4)}][{hoveredPixel % 4}] = {SAMPLE_IMAGE.flat()[hoveredPixel]}
        </div>
      )}
    </div>
  );
};

/**
 * Dimensions/resolution visual.
 */
const DimensionsVisual: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3">
        {RESOLUTION_EXAMPLES.map((ex, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 text-center min-w-[100px]">
            <div className="text-[10px] text-neutral-500">{ex.name}</div>
            <div className="text-sm font-mono text-violet-300">{ex.w}×{ex.h}</div>
            <div className="text-[9px] text-neutral-400">{ex.pixels} pixels</div>
          </div>
        ))}
      </div>
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 max-w-md mx-auto">
        <div className="text-[10px] text-neutral-300 text-center">
          A 4K image has <span className="text-violet-400 font-bold">8.29 million</span> pixels. 
          With RGB, that's <span className="text-violet-400 font-bold">24.87 million</span> numbers to process!
        </div>
      </div>
    </div>
  );
};

export default MatrixDemo;
