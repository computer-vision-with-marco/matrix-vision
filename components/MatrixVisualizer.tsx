
import React, { useState } from 'react';
import { PixelData, MatrixMode } from '../types';

interface MatrixVisualizerProps {
  matrix: PixelData[][];
  mode: MatrixMode;
  cellSize: number;
}

export const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ matrix, mode, cellSize }) => {
  const [hovered, setHovered] = useState<{x: number, y: number} | null>(null);

  if (!matrix.length) return null;

  // Render cell content based on mode and size
  const renderCell = (pixel: PixelData) => {
    switch (mode) {
      case 'hex':
        // For small cells, show short hex (no #), for larger show full
        return cellSize >= 40 ? pixel.hex.toUpperCase() : pixel.hex.slice(1, 4).toUpperCase();
      case 'gray':
        return pixel.gray.toString();
      case 'rgb':
      default:
        // For small cells show condensed, larger show full
        if (cellSize < 32) return `${pixel.r},${pixel.g},${pixel.b}`.replace(/,/g, '\n');
        return `${pixel.r},${pixel.g},${pixel.b}`;
    }
  };

  // Get font size based on cell size and mode
  const getFontSize = () => {
    if (mode === 'rgb' && cellSize < 32) return 'text-[4px] leading-[1.1]';
    if (cellSize < 20) return 'text-[5px]';
    if (cellSize < 28) return 'text-[6px]';
    if (cellSize < 40) return 'text-[7px]';
    return 'text-[8px]';
  };

  const isNeighbor = (x: number, y: number) => {
    if (!hovered) return false;
    return Math.abs(x - hovered.x) <= 1 && Math.abs(y - hovered.y) <= 1;
  };

  return (
    <div className="overflow-auto border border-white/10 rounded-lg bg-black/30 p-4 max-h-[500px] shadow-inner relative group">
      <div 
        className="inline-grid gap-px" 
        style={{ 
          gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
          width: 'max-content'
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {matrix.map((row, y) => 
          row.map((pixel, x) => {
            const active = isNeighbor(x, y);
            const isCenter = hovered?.x === x && hovered?.y === y;
            
            return (
              <div
                key={`${x}-${y}`}
                onMouseEnter={() => setHovered({x, y})}
                className={`flex items-center justify-center mono leading-tight select-none transition-all duration-75 
                  ${active ? 'z-20 scale-110 ring-1 ring-violet-400/70' : 'z-0'} 
                  ${isCenter ? 'ring-2 ring-violet-500 scale-125' : ''}
                  ${getFontSize()}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: pixel.hex,
                  color: pixel.gray > 128 ? '#000' : '#fff',
                  opacity: hovered && !active ? 0.3 : 1
                }}
                title={`R:${pixel.r} G:${pixel.g} B:${pixel.b} Gray:${pixel.gray} Hex:${pixel.hex}`}
              >
                {cellSize >= 16 && (
                  <span className="font-mono font-medium whitespace-pre-line text-center">
                    {renderCell(pixel)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {hovered && (
        <div className="absolute top-2 right-2 bg-[#0a0a0a]/95 border border-violet-500/30 p-3 rounded-lg text-[10px] mono text-neutral-300 pointer-events-none z-30 shadow-xl">
          <div className="text-violet-400 mb-1.5 font-bold uppercase tracking-wider">Receptive Field (3×3)</div>
          <div className="text-neutral-400">Position: <span className="text-white">[{hovered.x}, {hovered.y}]</span></div>
          <div className="text-neutral-500 mt-1">Kernel slides over this region</div>
        </div>
      )}
    </div>
  );
};
