
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

  const renderCell = (pixel: PixelData) => {
    switch (mode) {
      case 'hex':
        return pixel.hex.toUpperCase();
      case 'gray':
        return pixel.gray.toString().padStart(3, '0');
      case 'rgb':
      default:
        return `${pixel.r},${pixel.g},${pixel.b}`;
    }
  };

  const isNeighbor = (x: number, y: number) => {
    if (!hovered) return false;
    return Math.abs(x - hovered.x) <= 1 && Math.abs(y - hovered.y) <= 1;
  };

  return (
    <div className="overflow-auto border border-slate-700 rounded-lg bg-slate-950 p-4 max-h-[600px] shadow-inner relative group">
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
                className={`flex items-center justify-center mono text-[8px] leading-tight select-none transition-all duration-75 
                  ${active ? 'z-20 scale-110 ring-1 ring-white/50' : 'z-0'} 
                  ${isCenter ? 'ring-2 ring-yellow-400 scale-125' : ''}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: pixel.hex,
                  color: pixel.gray > 128 ? '#000' : '#fff',
                  opacity: hovered && !active ? 0.4 : 1
                }}
                title={`R:${pixel.r} G:${pixel.g} B:${pixel.b} Hex:${pixel.hex}`}
              >
                <span className={cellSize < 30 ? 'hidden' : 'block'}>
                  {renderCell(pixel)}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      {hovered && (
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-700 p-2 rounded text-[10px] mono text-slate-300 pointer-events-none z-30 shadow-xl">
          <div className="text-yellow-400 mb-1 font-bold">RECEPTIVE FIELD (3x3)</div>
          <div>Target: {hovered.x}, {hovered.y}</div>
          <div>Matrix Operation Active</div>
        </div>
      )}
    </div>
  );
};
