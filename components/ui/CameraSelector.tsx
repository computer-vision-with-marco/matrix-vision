/**
 * @fileoverview Camera selector modal component.
 * 
 * Allows users to choose from available camera devices.
 */

import React from 'react';
import { Camera } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface CameraSelectorProps {
  /** Available camera devices */
  cameras: MediaDeviceInfo[];
  /** Currently selected device ID */
  selectedCameraId: string;
  /** Callback when a camera is selected */
  onSelect: (deviceId: string) => void;
  /** Callback to close the modal */
  onClose: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Modal for selecting from multiple camera devices.
 */
export const CameraSelector: React.FC<CameraSelectorProps> = ({
  cameras,
  selectedCameraId,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold">Select Camera</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Choose which camera to use for live processing
          </p>
        </div>

        {/* Camera list */}
        <div className="p-2">
          {cameras.map((camera, index) => (
            <button
              key={camera.deviceId}
              onClick={() => onSelect(camera.deviceId)}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                selectedCameraId === camera.deviceId
                  ? 'bg-violet-500/10 border border-violet-500/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedCameraId === camera.deviceId ? 'bg-violet-500' : 'bg-white/10'
                }`}
              >
                <Camera size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {camera.label || `Camera ${index + 1}`}
                </div>
                <div className="text-xs text-neutral-500 truncate font-mono">
                  {camera.deviceId.slice(0, 24)}...
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraSelector;
