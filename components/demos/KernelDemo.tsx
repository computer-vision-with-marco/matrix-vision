/**
 * @fileoverview Interactive Kernel Demo component.
 * 
 * A step-by-step interactive walkthrough explaining how kernels work.
 * Includes interactive kernel builder and real-time effect visualization.
 */

import React, { useState } from 'react';
import { Grid3X3, X } from 'lucide-react';
import type { DemoProps } from '../../types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Step definitions for the kernel walkthrough.
 */
const STEPS = [
  {
    title: 'What is a Kernel?',
    desc: 'A kernel is a 3×3 grid of numbers—a "recipe" that transforms pixels. Click each cell to see what it means!',
    visual: 'intro'
  },
  {
    title: 'The Position Map',
    desc: 'Each kernel position corresponds to a pixel relative to the target. Click to highlight!',
    visual: 'anatomy'
  },
  {
    title: 'Positive vs Negative',
    desc: 'Click any number to see its effect. Positive adds brightness, negative subtracts, zero ignores.',
    visual: 'numbers'
  },
  {
    title: 'Try Different Kernels!',
    desc: 'Click each kernel type to see how it transforms the sample image.',
    visual: 'effects'
  },
  {
    title: 'The Math: Sum Must Balance',
    desc: 'If weights sum to 1: brightness unchanged. Sum > 1: brighter. Sum = 0: only edges remain!',
    visual: 'sum'
  },
  {
    title: 'Build Your Own Kernel!',
    desc: 'Click any cell to cycle its value. See how your custom kernel affects the image!',
    visual: 'custom'
  },
  {
    title: 'CNNs Learn Kernels',
    desc: 'In deep learning, networks discover optimal kernels automatically from data!',
    visual: 'cnn'
  }
];

/**
 * Sample 5x5 grayscale image for demonstrating kernel effects.
 */
const SAMPLE_IMAGE = [
  [80, 80, 80, 80, 80],
  [80, 180, 180, 180, 80],
  [80, 180, 220, 180, 80],
  [80, 180, 180, 180, 80],
  [80, 80, 80, 80, 80]
];

/**
 * Example kernels with their descriptions.
 */
const KERNEL_EXAMPLES = [
  { name: 'Identity', kernel: [[0,0,0],[0,1,0],[0,0,0]], effect: 'No change - passes through', divisor: 1 },
  { name: 'Blur', kernel: [[1,2,1],[2,4,2],[1,2,1]], effect: 'Smooths/softens image', divisor: 16 },
  { name: 'Sharpen', kernel: [[0,-1,0],[-1,5,-1],[0,-1,0]], effect: 'Enhances edges', divisor: 1 },
  { name: 'Edge', kernel: [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]], effect: 'Detects boundaries', divisor: 1 },
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns CSS class for kernel cell based on its value.
 */
const getKernelColor = (v: number): string => {
  if (v > 0) return 'bg-violet-500/50 text-violet-200';
  if (v < 0) return 'bg-red-500/50 text-red-200';
  return 'bg-white/10 text-neutral-500';
};

/**
 * Applies kernel to sample image and returns result.
 */
const applyKernelDemo = (kernel: number[][], divisor: number): number[][] => {
  const result: number[][] = [];
  for (let y = 1; y < 4; y++) {
    const row: number[] = [];
    for (let x = 1; x < 4; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += SAMPLE_IMAGE[y + ky][x + kx] * kernel[ky + 1][kx + 1];
        }
      }
      row.push(Math.min(255, Math.max(0, Math.round(sum / divisor))));
    }
    result.push(row);
  }
  return result;
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Interactive Kernel Demo component.
 * 
 * Provides a 7-step walkthrough explaining how kernels work,
 * with an interactive kernel builder at the end.
 */
export const KernelDemo: React.FC<DemoProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [selectedKernel, setSelectedKernel] = useState(0);
  const [customKernel, setCustomKernel] = useState([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const currentStep = STEPS[step];

  /**
   * Renders the visualization for the current step.
   */
  const renderVisual = () => {
    switch (currentStep.visual) {
      case 'intro':
        return <IntroVisual hoveredCell={hoveredCell} setHoveredCell={setHoveredCell} />;
      case 'anatomy':
        return <AnatomyVisual hoveredCell={hoveredCell} setHoveredCell={setHoveredCell} />;
      case 'numbers':
        return <NumbersVisual hoveredCell={hoveredCell} setHoveredCell={setHoveredCell} />;
      case 'effects':
        return (
          <EffectsVisual 
            selectedKernel={selectedKernel} 
            setSelectedKernel={setSelectedKernel}
          />
        );
      case 'sum':
        return (
          <SumVisual 
            selectedKernel={selectedKernel} 
            setSelectedKernel={setSelectedKernel}
          />
        );
      case 'custom':
        return (
          <CustomVisual 
            customKernel={customKernel} 
            setCustomKernel={setCustomKernel}
          />
        );
      case 'cnn':
        return <CnnVisual />;
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
            <Grid3X3 size={20} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-lg">What is a Kernel?</h3>
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

interface HoverState {
  hoveredCell: number | null;
  setHoveredCell: (cell: number | null) => void;
}

/**
 * Introduction visual showing the sharpen kernel.
 */
const IntroVisual: React.FC<HoverState> = ({ hoveredCell, setHoveredCell }) => {
  const introKernel = KERNEL_EXAMPLES[2].kernel; // Sharpen
  const cellLabels = ['↖', '↑', '↗', '←', '●', '→', '↙', '↓', '↘'];
  
  return (
    <div className="flex items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-[10px] text-neutral-500 mb-2">Sharpen Kernel</div>
        <div className="grid grid-cols-3 gap-1 p-3 bg-white/5 rounded-lg">
          {introKernel.flat().map((v, i) => (
            <button 
              key={i} 
              onClick={() => setHoveredCell(hoveredCell === i ? null : i)}
              className={`w-12 h-12 flex flex-col items-center justify-center text-sm font-mono font-bold rounded transition-all
                ${hoveredCell === i ? 'ring-2 ring-violet-400 scale-110' : ''} ${getKernelColor(v)}`}
            >
              <span>{v}</span>
              <span className="text-[8px] opacity-50">{cellLabels[i]}</span>
            </button>
          ))}
        </div>
      </div>
      {hoveredCell !== null && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 max-w-[180px]">
          <div className="text-xs text-violet-400 mb-2">Cell {hoveredCell + 1}</div>
          <div className="text-sm text-neutral-300">
            {introKernel.flat()[hoveredCell] > 0 
              ? `Add ${introKernel.flat()[hoveredCell]}× the ${cellLabels[hoveredCell]} neighbor` 
              : introKernel.flat()[hoveredCell] < 0 
                ? `Subtract ${Math.abs(introKernel.flat()[hoveredCell])}× the ${cellLabels[hoveredCell]} neighbor` 
                : `Ignore the ${cellLabels[hoveredCell]} neighbor`
            }
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Anatomy visual showing position labels.
 */
const AnatomyVisual: React.FC<HoverState> = ({ hoveredCell, setHoveredCell }) => {
  const positions = [
    { label: 'Top-Left', pos: '[-1,-1]' },
    { label: 'Top', pos: '[-1, 0]' },
    { label: 'Top-Right', pos: '[-1,+1]' },
    { label: 'Left', pos: '[0,-1]' },
    { label: 'CENTER', pos: '[0, 0]' },
    { label: 'Right', pos: '[0,+1]' },
    { label: 'Bot-Left', pos: '[+1,-1]' },
    { label: 'Bottom', pos: '[+1, 0]' },
    { label: 'Bot-Right', pos: '[+1,+1]' }
  ];
  
  return (
    <div className="text-center space-y-4">
      <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
        {positions.map((p, i) => (
          <button 
            key={i} 
            onClick={() => setHoveredCell(hoveredCell === i ? null : i)}
            className={`w-24 h-14 flex flex-col items-center justify-center text-[9px] rounded transition-all
              ${i === 4 ? 'bg-violet-500/40 ring-2 ring-violet-500' : 'bg-white/10 hover:bg-white/20'}
              ${hoveredCell === i ? 'ring-2 ring-violet-400 scale-105' : ''}`}
          >
            <span className={i === 4 ? 'text-violet-300 font-bold' : 'text-neutral-400'}>{p.label}</span>
            <span className="text-[8px] text-neutral-500 font-mono">{p.pos}</span>
          </button>
        ))}
      </div>
      {hoveredCell !== null && (
        <div className="text-xs text-violet-400">
          Kernel[{Math.floor(hoveredCell / 3)}][{hoveredCell % 3}] → Pixel at {positions[hoveredCell].pos}
        </div>
      )}
    </div>
  );
};

/**
 * Numbers visual explaining positive vs negative values.
 */
const NumbersVisual: React.FC<HoverState> = ({ hoveredCell, setHoveredCell }) => {
  const examples = [
    { v: 5, desc: 'Multiply pixel by 5 and ADD to result', effect: 'Brightens, amplifies' },
    { v: -1, desc: 'Multiply pixel by 1 and SUBTRACT from result', effect: 'Darkens, inverts contribution' },
    { v: 0, desc: 'Pixel is completely ignored', effect: 'No contribution' },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-6">
        {examples.map((ex, i) => (
          <button 
            key={i} 
            onClick={() => setHoveredCell(hoveredCell === i ? null : i)}
            className={`text-center transition-all ${hoveredCell === i ? 'scale-110' : ''}`}
          >
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-mono font-bold text-xl
              ${hoveredCell === i ? 'ring-2 ring-violet-400' : ''} ${getKernelColor(ex.v)}`}>
              {ex.v > 0 ? `+${ex.v}` : ex.v}
            </div>
          </button>
        ))}
      </div>
      {hoveredCell !== null && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 max-w-md mx-auto text-center">
          <div className="text-sm text-neutral-300 mb-1">{examples[hoveredCell].desc}</div>
          <div className="text-xs text-neutral-500">{examples[hoveredCell].effect}</div>
        </div>
      )}
    </div>
  );
};

interface KernelSelectState {
  selectedKernel: number;
  setSelectedKernel: (kernel: number) => void;
}

/**
 * Effects visual showing different kernel transformations.
 */
const EffectsVisual: React.FC<KernelSelectState> = ({ selectedKernel, setSelectedKernel }) => {
  const currentKernel = KERNEL_EXAMPLES[selectedKernel];
  const outputImage = applyKernelDemo(currentKernel.kernel, currentKernel.divisor);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {KERNEL_EXAMPLES.map((k, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedKernel(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedKernel === i ? 'bg-violet-500 text-white' : 'bg-white/10 text-neutral-400 hover:bg-white/20'}`}
          >
            {k.name}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-[9px] text-neutral-500 mb-1">Original</div>
          <div className="grid grid-cols-3 gap-0.5 p-1 bg-black/30 rounded">
            {SAMPLE_IMAGE.slice(1, 4).map((row, y) => row.slice(1, 4).map((v, x) => (
              <div key={`${y}-${x}`} className="w-8 h-8 rounded-sm"
                style={{ backgroundColor: `rgb(${v},${v},${v})` }} />
            )))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-neutral-500 mb-1">Kernel</div>
          <div className="grid grid-cols-3 gap-0.5">
            {currentKernel.kernel.flat().map((v, i) => (
              <div key={i} className={`w-6 h-6 flex items-center justify-center text-[8px] font-mono rounded ${getKernelColor(v)}`}>{v}</div>
            ))}
          </div>
        </div>
        <div className="text-violet-400 text-xl">=</div>
        <div className="text-center">
          <div className="text-[9px] text-violet-400 mb-1">Result</div>
          <div className="grid grid-cols-3 gap-0.5 p-1 bg-violet-500/10 rounded border border-violet-500/30">
            {outputImage.flat().map((v, i) => (
              <div key={i} className="w-8 h-8 rounded-sm"
                style={{ backgroundColor: `rgb(${v},${v},${v})` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-500">{currentKernel.effect}</div>
    </div>
  );
};

/**
 * Sum visual showing how kernel sums affect brightness.
 */
const SumVisual: React.FC<KernelSelectState> = ({ selectedKernel, setSelectedKernel }) => {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
      {KERNEL_EXAMPLES.map((k, i) => {
        const sum = k.kernel.flat().reduce((a, b) => a + b, 0);
        const normalized = k.divisor > 1 ? `${sum}÷${k.divisor}=1` : sum;
        return (
          <button 
            key={i} 
            onClick={() => setSelectedKernel(i)}
            className={`bg-white/5 rounded-lg p-3 text-center transition-all hover:bg-white/10
              ${selectedKernel === i ? 'ring-2 ring-violet-500' : ''}`}
          >
            <div className="text-xs text-neutral-400 mb-1">{k.name}</div>
            <div className="grid grid-cols-3 gap-px mb-2 w-fit mx-auto">
              {k.kernel.flat().map((v, j) => (
                <div key={j} className={`w-4 h-4 text-[6px] font-mono flex items-center justify-center rounded ${getKernelColor(v)}`}>{v}</div>
              ))}
            </div>
            <div className="text-lg font-mono font-bold text-violet-400">Σ = {normalized}</div>
            <div className="text-[10px] text-neutral-500 mt-1">
              {sum === 0 ? 'Only shows edges!' : sum === 1 || k.divisor > 1 ? 'Brightness preserved' : 'Adjusts brightness'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface CustomKernelState {
  customKernel: number[][];
  setCustomKernel: (kernel: number[][]) => void;
}

/**
 * Custom kernel builder visual.
 */
const CustomVisual: React.FC<CustomKernelState> = ({ customKernel, setCustomKernel }) => {
  const cycleValues = [0, 1, 2, -1, -2, 4, 8];
  const customSum = customKernel.flat().reduce((a, b) => a + b, 0);
  const customDivisor = customSum > 0 ? customSum : 1;
  const customOutput = applyKernelDemo(customKernel, customDivisor);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-[9px] text-neutral-500 mb-1">Your Kernel (click to change)</div>
          <div className="grid grid-cols-3 gap-1 p-2 bg-white/5 rounded-lg">
            {customKernel.flat().map((v, i) => {
              const row = Math.floor(i / 3), col = i % 3;
              return (
                <button 
                  key={i} 
                  onClick={() => {
                    const newKernel = customKernel.map(r => [...r]);
                    const currentIdx = cycleValues.indexOf(v);
                    newKernel[row][col] = cycleValues[(currentIdx + 1) % cycleValues.length];
                    setCustomKernel(newKernel);
                  }}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-mono font-bold rounded transition-all hover:scale-110 ${getKernelColor(v)}`}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <div className="text-[9px] text-neutral-500 mt-2">Sum = {customSum}</div>
        </div>
        <div className="text-violet-400 text-xl">=</div>
        <div className="text-center">
          <div className="text-[9px] text-violet-400 mb-1">Result</div>
          <div className="grid grid-cols-3 gap-0.5 p-1 bg-violet-500/10 rounded border border-violet-500/30">
            {customOutput.flat().map((v, i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-sm flex items-center justify-center text-[8px] font-mono"
                style={{ backgroundColor: `rgb(${v},${v},${v})`, color: v > 128 ? '#000' : '#fff' }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center">
        <button 
          onClick={() => setCustomKernel([[0,-1,0],[-1,5,-1],[0,-1,0]])} 
          className="text-[10px] text-violet-400 hover:underline"
        >
          Reset to Sharpen
        </button>
      </div>
    </div>
  );
};

/**
 * CNN visual showing learned kernels.
 */
const CnnVisual: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[...Array(12)].map((_, i) => {
          // Generate deterministic pseudo-random kernel visualization
          const seed = i * 7;
          return (
            <div key={i} className="text-center">
              <div className="grid grid-cols-3 gap-px w-fit">
                {[...Array(9)].map((_, j) => {
                  const val = ((seed + j * 13) % 5) - 2; // -2 to 2
                  return (
                    <div key={j} className={`w-3 h-3 rounded-sm ${getKernelColor(val)}`} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 max-w-md mx-auto">
        <div className="text-sm text-neutral-300 mb-2">
          CNNs learn <span className="text-violet-400 font-bold">thousands</span> of kernels!
        </div>
        <div className="text-xs text-neutral-500">
          Layer 1: Edge detectors (horizontal, vertical, diagonal)<br />
          Layer 2: Corner and curve detectors<br />
          Layer 3+: Eyes, wheels, textures, faces...
        </div>
      </div>
    </div>
  );
};

export default KernelDemo;
