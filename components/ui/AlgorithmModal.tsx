/**
 * @fileoverview Learn modal for algorithm deep dives.
 * 
 * Displays detailed information about each algorithm including
 * kernel visualization, formulas, and real-world applications.
 */

import React from 'react';
import { X, Eye, Sparkles, Zap, Lightbulb, Grid3X3 } from 'lucide-react';
import type { AlgorithmInfo } from '../../types';

// =============================================================================
// TYPES
// =============================================================================

interface AlgorithmModalProps {
  /** Algorithm to display */
  algorithm: AlgorithmInfo;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to apply this algorithm */
  onApply: (algo: AlgorithmInfo) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns CSS class for kernel cell based on its value.
 */
const getKernelCellClass = (val: number): string => {
  if (val > 0) return 'bg-violet-500/30 text-violet-300';
  if (val < 0) return 'bg-red-500/30 text-red-300';
  return 'bg-white/10 text-neutral-500';
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Modal displaying detailed algorithm information.
 * 
 * Shows kernel visualization, formulas, explanations,
 * real-world applications, and fun facts.
 */
export const AlgorithmModal: React.FC<AlgorithmModalProps> = ({ 
  algorithm, 
  onClose, 
  onApply 
}) => {
  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-violet-500/10">
        <div>
          <h3 className="font-semibold text-lg">{algorithm.name}</h3>
          <p className="text-xs text-neutral-500">{algorithm.description}</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} className="text-neutral-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Kernel Visualization */}
        <div className="flex items-start gap-6">
          <div>
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">
              Kernel Matrix
            </span>
            <div className="grid grid-cols-3 gap-1 w-24">
              {algorithm.kernel.flat().map((val, i) => (
                <div 
                  key={i} 
                  className={`aspect-square flex items-center justify-center text-sm font-mono rounded ${getKernelCellClass(val)}`}
                >
                  {val}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] font-mono text-neutral-500 text-center">
              ÷ {algorithm.divisor}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">
              Formula
            </span>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-violet-300">
              {algorithm.formula}
            </div>
          </div>
        </div>

        {/* What it does */}
        <div>
          <h4 className="font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Eye size={14} className="text-violet-400" /> What it does
          </h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {algorithm.deepDive.whatItDoes}
          </p>
        </div>

        {/* How it works */}
        <div>
          <h4 className="font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" /> How it works
          </h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {algorithm.deepDive.howItWorks}
          </p>
        </div>

        {/* Math explained */}
        <div>
          <h4 className="font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Grid3X3 size={14} className="text-violet-400" /> The Math
          </h4>
          <pre className="bg-black/30 rounded-lg p-4 text-xs font-mono text-neutral-300 whitespace-pre-wrap">
            {algorithm.deepDive.mathExplained}
          </pre>
        </div>

        {/* Real world */}
        <div>
          <h4 className="font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Zap size={14} className="text-violet-400" /> Real-World Applications
          </h4>
          <ul className="space-y-1">
            {algorithm.deepDive.realWorld.map((use, i) => (
              <li key={i} className="text-sm text-neutral-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-violet-500" />
                {use}
              </li>
            ))}
          </ul>
        </div>

        {/* Fun fact */}
        <div className="bg-gradient-to-r from-violet-500/10 to-violet-500/10 rounded-xl p-4 border border-violet-500/20">
          <h4 className="font-medium text-violet-400 mb-2 flex items-center gap-2">
            <Lightbulb size={14} /> Fun Fact
          </h4>
          <p className="text-sm text-neutral-300">
            {algorithm.deepDive.funFact}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-black/20">
        <button 
          onClick={() => onApply(algorithm)} 
          className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
        >
          Apply {algorithm.name} Filter
        </button>
      </div>
    </>
  );
};

export default AlgorithmModal;
