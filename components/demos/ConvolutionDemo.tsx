/**
 * @fileoverview Interactive Convolution Demo component.
 * 
 * A step-by-step interactive walkthrough explaining convolution operations.
 * Each step builds on the previous, with interactive visualizations and
 * hands-on exercises to help users understand the core concepts.
 */

import React, { useState } from 'react';
import { Layers, X } from 'lucide-react';
import type { DemoProps } from '../../types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Step definitions for the convolution walkthrough.
 */
const STEPS = [
  {
    title: 'What Does a Kernel DO?',
    desc: 'A kernel transforms each pixel by looking at its neighbors. Different kernels = different transformations. Let\'s see some examples!',
    visual: 'filters'
  },
  {
    title: 'The Core Idea',
    desc: 'To compute one output pixel, we look at that pixel AND its 8 neighbors. The kernel tells us how much each neighbor contributes.',
    visual: 'idea'
  },
  {
    title: 'Meet the Kernel',
    desc: 'A kernel is just a 3×3 grid of numbers. Each number says "how much" of that neighbor to include in the mix.',
    visual: 'kernel'
  },
  {
    title: 'The Recipe in Action',
    desc: 'Place the kernel over 9 pixels. Multiply each pixel by its weight. Add them up. That is your new pixel!',
    visual: 'recipe'
  },
  {
    title: 'Try It: Slide the Kernel!',
    desc: 'Click the arrows to move the kernel. Watch how the math changes at each position!',
    visual: 'sliding'
  },
  {
    title: 'Different Recipe = Different Effect',
    desc: 'Change the kernel numbers, change the effect. Blur averages neighbors. Sharpen amplifies differences.',
    visual: 'effects'
  },
  {
    title: 'What is a "Layer"?',
    desc: 'When we apply a kernel to an entire image, we create a new image called a "feature map". This process is ONE layer.',
    visual: 'layer'
  },
  {
    title: 'Stacking Layers = Deep Learning',
    desc: 'Stack multiple layers: Layer 1 finds edges. Layer 2 finds shapes. Layer 3 finds objects. This is how AI "sees"!',
    visual: 'stacking'
  }
];

/**
 * Sample 5x5 image for sliding demo.
 */
const IMAGE_PIXELS = [
  [80,  90,  85,  88,  82],
  [92,  95, 200,  93,  87],
  [84, 210, 220, 205,  89],
  [91,  88, 195,  92,  86],
  [83,  85,  87,  84,  81]
];

/**
 * Blur kernel for demonstrations.
 */
const BLUR_KERNEL = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
const KERNEL_SUM = 16;

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Interactive Convolution Demo component.
 * 
 * Provides an 8-step walkthrough explaining how convolution works,
 * with interactive visualizations at each step.
 * 
 * @param props - Component props
 * @param props.onClose - Callback to close the modal
 */
export const ConvolutionDemo: React.FC<DemoProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [kernelPos, setKernelPos] = useState(4); // Center position (0-8)

  const currentStep = STEPS[step];

  /**
   * Converts linear kernel position (0-8) to grid coordinates.
   */
  const posToCoord = (pos: number) => ({ x: pos % 3, y: Math.floor(pos / 3) });

  /**
   * Renders the visualization for the current step.
   */
  const renderVisual = () => {
    switch (currentStep.visual) {
      case 'filters':
        return <FiltersVisual />;
      case 'idea':
        return <IdeaVisual />;
      case 'kernel':
        return <KernelVisual />;
      case 'recipe':
        return <RecipeVisual />;
      case 'sliding':
        return <SlidingVisual kernelPos={kernelPos} setKernelPos={setKernelPos} />;
      case 'effects':
        return <EffectsVisual />;
      case 'layer':
        return <LayerVisual />;
      case 'stacking':
        return <StackingVisual />;
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
            <Layers size={20} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-lg">What is Convolution?</h3>
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
          onClick={() => {
            if (step === STEPS.length - 1) {
              onClose();
            } else {
              setStep(step + 1);
            }
          }}
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
 * Shows different filter effects (blur, sharpen, edge detection).
 */
const FiltersVisual: React.FC = () => {
  // Create a simple gradient pattern for visual demo
  const originalPixels = Array(16).fill(0).map((_, i) => {
    const x = i % 4, y = Math.floor(i / 4);
    return Math.floor(80 + x * 30 + y * 20 + Math.sin(x + y) * 20);
  });
  
  // Simulated blur (average of neighbors)
  const blurredPixels = originalPixels.map((p, i) => {
    const neighbors = [originalPixels[i-1], originalPixels[i+1], originalPixels[i-4], originalPixels[i+4], p].filter(Boolean);
    return Math.floor(neighbors.reduce((a,b) => a+b, 0) / neighbors.length);
  });
  
  // Simulated sharpen (exaggerate differences)
  const sharpenedPixels = originalPixels.map((p, i) => {
    const neighbors = [originalPixels[i-1], originalPixels[i+1], originalPixels[i-4], originalPixels[i+4]].filter(Boolean);
    const avg = neighbors.length ? neighbors.reduce((a,b) => a+b, 0) / neighbors.length : p;
    return Math.min(255, Math.max(0, Math.floor(p + (p - avg) * 1.5)));
  });
  
  // Simulated edge detection
  const edgePixels = originalPixels.map((p, i) => {
    const neighbors = [originalPixels[i-1], originalPixels[i+1], originalPixels[i-4], originalPixels[i+4]].filter(Boolean);
    const diff = neighbors.length ? Math.abs(p - neighbors.reduce((a,b) => a+b, 0) / neighbors.length) : 0;
    return Math.min(255, Math.floor(diff * 3));
  });

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="text-center">
        <div className="grid grid-cols-4 gap-0.5 mb-2">
          {originalPixels.map((p, i) => (
            <div key={i} className="w-6 h-6 rounded-sm" style={{ backgroundColor: `rgb(${p},${p},${p})` }} />
          ))}
        </div>
        <div className="text-[9px] text-neutral-400">Original</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-sm">→</span>
          <div className="grid grid-cols-4 gap-0.5">
            {blurredPixels.map((p, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgb(${p},${p},${p})` }} />
            ))}
          </div>
          <span className="text-[9px] text-neutral-500">Blur</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-sm">→</span>
          <div className="grid grid-cols-4 gap-0.5">
            {sharpenedPixels.map((p, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgb(${p},${p},${p})` }} />
            ))}
          </div>
          <span className="text-[9px] text-neutral-500">Sharpen</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-sm">→</span>
          <div className="grid grid-cols-4 gap-0.5">
            {edgePixels.map((p, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgb(${p},${p},${p})` }} />
            ))}
          </div>
          <span className="text-[9px] text-neutral-500">Edges</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Shows the core idea of looking at neighbors.
 */
const IdeaVisual: React.FC = () => {
  const flatPixels = [80,90,85,88,82, 92,95,200,93,87, 84,210,220,205,89, 91,88,195,92,86, 83,85,87,84,81];
  
  return (
    <div className="text-center">
      <div className="inline-grid grid-cols-5 gap-1 mb-4">
        {flatPixels.map((v, i) => {
          const isCenter = i === 12;
          const isNeighbor = [6,7,8,11,12,13,16,17,18].includes(i);
          return (
            <div 
              key={i} 
              className={`w-8 h-8 rounded text-[8px] font-mono flex items-center justify-center transition-all
                ${isCenter ? 'bg-violet-500 text-white ring-2 ring-violet-400 scale-110 z-10' : 
                  isNeighbor ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-neutral-500'}`}
              style={{ backgroundColor: isCenter || isNeighbor ? undefined : `rgb(${v},${v},${v})` }}
            >
              {v}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-neutral-400">
        To compute the <span className="text-violet-400 font-bold">center pixel</span>, 
        we look at its <span className="text-violet-300">8 neighbors</span>
      </div>
    </div>
  );
};

/**
 * Shows the kernel structure with weights.
 */
const KernelVisual: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="text-center">
        <div className="text-[10px] text-neutral-500 mb-2">Blur Kernel (weights)</div>
        <div className="grid grid-cols-3 gap-1">
          {[1,2,1,2,4,2,1,2,1].map((v, i) => (
            <div 
              key={i} 
              className={`w-12 h-12 rounded flex flex-col items-center justify-center 
                ${i === 4 ? 'bg-violet-500/50 ring-2 ring-violet-400' : 'bg-violet-500/20'}`}
            >
              <span className="text-lg font-bold text-violet-300">{v}</span>
              <span className="text-[8px] text-neutral-500">{i === 4 ? 'center' : ''}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-left text-xs text-neutral-400 max-w-[140px]">
        <p className="mb-2">Higher number = more influence</p>
        <p>Center pixel (4) matters most. Corners (1) matter least.</p>
      </div>
    </div>
  );
};

/**
 * Shows the multiply-and-sum recipe.
 */
const RecipeVisual: React.FC = () => {
  const pixels = [100, 120, 110, 130, 150, 140, 105, 125, 115];
  const weights = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const products = pixels.map((p, i) => p * weights[i]);
  const sum = products.reduce((a, b) => a + b, 0);
  const result = Math.round(sum / 16);
  
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div>
          <div className="text-[9px] text-neutral-500 mb-1">Pixels</div>
          <div className="grid grid-cols-3 gap-0.5">
            {pixels.map((p, i) => (
              <div key={i} className="w-8 h-8 bg-white/10 rounded text-[9px] font-mono flex items-center justify-center">{p}</div>
            ))}
          </div>
        </div>
        <span className="text-neutral-400">×</span>
        <div>
          <div className="text-[9px] text-neutral-500 mb-1">Kernel</div>
          <div className="grid grid-cols-3 gap-0.5">
            {weights.map((w, i) => (
              <div key={i} className="w-8 h-8 bg-violet-500/30 rounded text-[9px] font-mono flex items-center justify-center text-violet-300">{w}</div>
            ))}
          </div>
        </div>
        <span className="text-neutral-400">=</span>
        <div className="text-center">
          <div className="text-[9px] text-neutral-500 mb-1">Sum ÷ 16</div>
          <div className="w-12 h-12 bg-violet-500 rounded flex items-center justify-center">
            <span className="text-lg font-bold text-white">{result}</span>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-neutral-500">
        ({pixels.map((p, i) => `${p}×${weights[i]}`).join(' + ')}) ÷ 16 = <span className="text-violet-400 font-bold">{result}</span>
      </div>
    </div>
  );
};

/**
 * Interactive sliding kernel visualization.
 */
const SlidingVisual: React.FC<{ kernelPos: number; setKernelPos: (pos: number) => void }> = ({ 
  kernelPos, 
  setKernelPos 
}) => {
  const posToCoord = (pos: number) => ({ x: pos % 3, y: Math.floor(pos / 3) });
  const { x: kx, y: ky } = posToCoord(kernelPos);
  
  // Get the 3x3 window at current position
  const windowPixels: number[] = [];
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 3; dx++) {
      windowPixels.push(IMAGE_PIXELS[ky + dy][kx + dx]);
    }
  }
  
  // Calculate result
  const kernelFlat = BLUR_KERNEL.flat();
  const slideProducts = windowPixels.map((p, i) => p * kernelFlat[i]);
  const slideSum = slideProducts.reduce((a, b) => a + b, 0);
  const slideResult = Math.round(slideSum / KERNEL_SUM);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6">
        {/* Image with kernel overlay */}
        <div className="relative">
          <div className="text-[9px] text-neutral-500 mb-1 text-center">Image (click arrows to move)</div>
          <div className="grid grid-cols-5 gap-0.5">
            {IMAGE_PIXELS.flat().map((p, i) => {
              const px = i % 5, py = Math.floor(i / 5);
              const inKernel = px >= kx && px < kx + 3 && py >= ky && py < ky + 3;
              const isCenter = px === kx + 1 && py === ky + 1;
              return (
                <div 
                  key={i} 
                  className={`w-7 h-7 rounded-sm text-[7px] font-mono flex items-center justify-center transition-all
                    ${isCenter ? 'ring-2 ring-violet-400 bg-violet-500 text-white z-10' : 
                      inKernel ? 'bg-violet-500/30 text-violet-200' : ''}`}
                  style={{ 
                    backgroundColor: inKernel ? undefined : `rgb(${p},${p},${p})`, 
                    color: !inKernel && p > 128 ? '#000' : undefined 
                  }}
                >
                  {p}
                </div>
              );
            })}
          </div>
          {/* Navigation buttons */}
          <div className="flex justify-center gap-2 mt-2">
            <button 
              onClick={() => setKernelPos(Math.max(0, kernelPos - 1))} 
              disabled={kernelPos === 0}
              className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20 disabled:opacity-30"
            >
              ←
            </button>
            <span className="text-[10px] text-neutral-400 py-1">Position {kernelPos + 1}/9</span>
            <button 
              onClick={() => setKernelPos(Math.min(8, kernelPos + 1))} 
              disabled={kernelPos === 8}
              className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20 disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
        
        {/* Calculation */}
        <div className="text-center">
          <div className="text-[9px] text-neutral-500 mb-1">Kernel × Pixels</div>
          <div className="grid grid-cols-3 gap-0.5 mb-2">
            {windowPixels.map((p, i) => (
              <div key={i} className="w-8 h-6 bg-white/5 rounded text-[7px] font-mono flex items-center justify-center">
                <span className="text-neutral-400">{p}</span>
                <span className="text-violet-400 mx-0.5">×</span>
                <span className="text-violet-300">{kernelFlat[i]}</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-neutral-500">
            Sum = {slideSum} ÷ 16 = <span className="text-violet-400 font-bold">{slideResult}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Shows different kernel effects side by side.
 */
const EffectsVisual: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="grid grid-cols-3 gap-px mb-2 mx-auto w-fit">
            {[1,2,1,2,4,2,1,2,1].map((v, i) => (
              <div key={i} className="w-5 h-5 bg-violet-500/30 rounded-sm text-[7px] font-mono flex items-center justify-center text-violet-300">{v}</div>
            ))}
          </div>
          <div className="text-[9px] text-violet-400 font-medium">BLUR</div>
          <div className="text-[8px] text-neutral-500">Average neighbors</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-3 gap-px mb-2 mx-auto w-fit">
            {[0,-1,0,-1,5,-1,0,-1,0].map((v, i) => (
              <div key={i} className={`w-5 h-5 rounded-sm text-[7px] font-mono flex items-center justify-center 
                ${v > 0 ? 'bg-violet-500/40 text-violet-300' : v < 0 ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-neutral-500'}`}>{v}</div>
            ))}
          </div>
          <div className="text-[9px] text-violet-400 font-medium">SHARPEN</div>
          <div className="text-[8px] text-neutral-500">Amplify center</div>
        </div>
        <div className="text-center">
          <div className="grid grid-cols-3 gap-px mb-2 mx-auto w-fit">
            {[-1,-1,-1,-1,8,-1,-1,-1,-1].map((v, i) => (
              <div key={i} className={`w-5 h-5 rounded-sm text-[7px] font-mono flex items-center justify-center 
                ${v > 0 ? 'bg-violet-500/40 text-violet-300' : 'bg-red-500/30 text-red-300'}`}>{v}</div>
            ))}
          </div>
          <div className="text-[9px] text-violet-400 font-medium">EDGE DETECT</div>
          <div className="text-[8px] text-neutral-500">Find differences</div>
        </div>
      </div>
      <div className="text-[10px] text-neutral-500 text-center">Same process, different numbers = completely different results!</div>
    </div>
  );
};

/**
 * Shows how a kernel creates a feature map (one layer).
 */
const LayerVisual: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="grid grid-cols-4 gap-0.5 mb-1">
            {Array(16).fill(0).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-sm" style={{ backgroundColor: `rgb(${80 + i * 10},${80 + i * 10},${80 + i * 10})` }} />
            ))}
          </div>
          <div className="text-[9px] text-neutral-400">Original Image</div>
        </div>
        <div className="text-center">
          <div className="text-violet-400 text-lg">+</div>
          <div className="grid grid-cols-3 gap-0.5">
            {[-1,-1,-1,-1,8,-1,-1,-1,-1].map((v, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm text-[6px] font-mono flex items-center justify-center ${v > 0 ? 'bg-violet-500/40' : 'bg-red-500/30'}`}>{v}</div>
            ))}
          </div>
          <div className="text-[9px] text-neutral-400">Kernel</div>
        </div>
        <div className="text-violet-400 text-xl">=</div>
        <div className="text-center">
          <div className="grid grid-cols-4 gap-0.5 mb-1 border-2 border-violet-500/50 rounded p-0.5">
            {Array(16).fill(0).map((_, i) => {
              const edge = (i % 4 === 0 || i % 4 === 3 || i < 4 || i >= 12) ? 200 : 30;
              return <div key={i} className="w-5 h-5 rounded-sm" style={{ backgroundColor: `rgb(${edge},${edge},${edge})` }} />;
            })}
          </div>
          <div className="text-[9px] text-violet-400 font-medium">Feature Map</div>
          <div className="text-[8px] text-neutral-500">(edges detected!)</div>
        </div>
      </div>
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 max-w-md mx-auto">
        <div className="text-[11px] text-neutral-300">
          <strong className="text-violet-300">One Layer</strong> = Apply kernel to entire image → Get a "feature map"
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">
          The feature map highlights whatever the kernel was designed to find (edges, blurs, etc.)
        </div>
      </div>
    </div>
  );
};

/**
 * Shows how stacking layers creates deep learning.
 */
const StackingVisual: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-neutral-400 to-neutral-600 flex items-center justify-center text-lg">🖼️</div>
          <div className="text-[8px] text-neutral-500 mt-1">Photo</div>
        </div>
        <div className="text-violet-400">→</div>
        <div className="text-center">
          <div className="w-12 h-12 rounded border border-violet-500/50 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border border-white/30" />
          </div>
          <div className="text-[8px] text-violet-400 mt-1">Layer 1</div>
          <div className="text-[7px] text-neutral-500">Edges</div>
        </div>
        <div className="text-violet-400">→</div>
        <div className="text-center">
          <div className="w-12 h-12 rounded border border-violet-500/50 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-white/30" />
          </div>
          <div className="text-[8px] text-violet-400 mt-1">Layer 2</div>
          <div className="text-[7px] text-neutral-500">Shapes</div>
        </div>
        <div className="text-violet-400">→</div>
        <div className="text-center">
          <div className="w-12 h-12 rounded border border-violet-500/50 bg-black/50 flex items-center justify-center text-lg">👁️</div>
          <div className="text-[8px] text-violet-400 mt-1">Layer 3</div>
          <div className="text-[7px] text-neutral-500">Eyes, ears...</div>
        </div>
        <div className="text-violet-400">→</div>
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-violet-500/20 flex items-center justify-center text-lg">🐱</div>
          <div className="text-[8px] text-violet-400 mt-1">Output</div>
          <div className="text-[7px] text-neutral-500">"It's a cat!"</div>
        </div>
      </div>
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 max-w-lg mx-auto">
        <div className="text-[11px] text-violet-300 font-medium mb-1">
          CNN = Convolutional Neural Network
        </div>
        <div className="text-[10px] text-neutral-400">
          Many layers stacked together. Each layer learns different kernels automatically from millions of examples.
          Early layers find simple patterns (edges). Later layers combine them into complex features (faces, objects).
        </div>
      </div>
    </div>
  );
};

export default ConvolutionDemo;
