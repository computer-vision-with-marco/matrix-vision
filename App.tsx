/**
 * @fileoverview Main Application Component - Computer Vision Lab.
 * 
 * This is the entry point component for the Computer Vision educational tool.
 * It orchestrates the overall application flow including:
 * - Input source selection (camera/upload)
 * - Real-time image processing with convolution
 * - Interactive learning modals
 * - Matrix visualization
 * 
 * @module App
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Eye,
  Camera,
  Upload,
  Download,
  Play,
  RefreshCcw,
  Info,
  ChevronRight,
  Layers,
  Grid3X3,
  Sparkles,
  Zap,
  Lightbulb,
  X,
  Image as ImageIcon,
} from 'lucide-react';

// Types
import type { PixelData, MatrixMode, LearnModalType, AlgorithmInfo } from './types';

// Constants
import { PRESET_ALGORITHMS } from './constants';

// Components
import { 
  MatrixVisualizer, 
  ConvolutionDemo, 
  KernelDemo, 
  MatrixDemo,
  AlgorithmModal,
  CameraSelector 
} from './components';

// =============================================================================
// TYPES
// =============================================================================

/** Camera connection status */
type CameraStatus = 'idle' | 'connecting' | 'initializing' | 'ready' | 'error';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Main Application Component.
 * 
 * Provides an interactive environment for learning computer vision concepts
 * through real-time image processing and educational demonstrations.
 */
const App: React.FC = () => {
  // =========================================================================
  // STATE
  // =========================================================================
  
  // Input source state
  const [sourceMode, setSourceMode] = useState<'upload' | 'camera'>('upload');
  const [image, setImage] = useState<string | null>(null);
  
  // Processing state
  const [resolution, setResolution] = useState<number>(32);
  const [matrix, setMatrix] = useState<PixelData[][]>([]);
  const [mode, setMode] = useState<MatrixMode>('rgb');
  const [activeAlgo, setActiveAlgo] = useState<AlgorithmInfo>(PRESET_ALGORITHMS.identity);
  const [isLive, setIsLive] = useState(false);
  
  // Camera state
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string>('');
  
  // Modal state
  const [learnModal, setLearnModal] = useState<LearnModalType>(null);

  // =========================================================================
  // REFS
  // =========================================================================
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  // =========================================================================
  // PROCESSING FUNCTIONS
  // =========================================================================

  /**
   * Applies convolution kernel to pixel matrix.
   * 
   * @param input - Source pixel matrix
   * @param algo - Algorithm with kernel configuration
   * @returns Processed pixel matrix
   */
  const applyConvolution = useCallback((
    input: PixelData[][], 
    algo: AlgorithmInfo
  ): PixelData[][] => {
    // Identity kernel returns input unchanged
    if (algo.name === 'Identity') return input;
    
    const height = input.length;
    const width = input[0]?.length || 0;
    const output: PixelData[][] = [];
    const k = algo.kernel;
    const div = algo.divisor;

    for (let y = 0; y < height; y++) {
      const row: PixelData[] = [];
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        // Apply 3x3 kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            // Clamp coordinates to image bounds
            const py = Math.min(Math.max(y + ky, 0), height - 1);
            const px = Math.min(Math.max(x + kx, 0), width - 1);
            const weight = k[ky + 1][kx + 1];
            
            r += input[py][px].r * weight;
            g += input[py][px].g * weight;
            b += input[py][px].b * weight;
          }
        }

        // Normalize and clamp to valid range
        const finalR = Math.min(Math.max(Math.round(r / div), 0), 255);
        const finalG = Math.min(Math.max(Math.round(g / div), 0), 255);
        const finalB = Math.min(Math.max(Math.round(b / div), 0), 255);
        const finalGray = Math.round(0.299 * finalR + 0.587 * finalG + 0.114 * finalB);
        const finalHex = `#${((1 << 24) + (finalR << 16) + (finalG << 8) + finalB).toString(16).slice(1)}`;

        row.push({ r: finalR, g: finalG, b: finalB, a: 255, hex: finalHex, gray: finalGray });
      }
      output.push(row);
    }
    return output;
  }, []);

  /**
   * Processes a frame from image/video source into pixel matrix.
   * 
   * @param source - Image or video element
   * @param res - Target resolution
   */
  const processFrame = useCallback((
    source: HTMLImageElement | HTMLVideoElement, 
    res: number
  ) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    if (sourceWidth === 0 || sourceHeight === 0) return;

    const aspectRatio = sourceWidth / sourceHeight;
    const width = res;
    const height = Math.round(res / aspectRatio);
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(source, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Build base pixel matrix
    const baseMatrix: PixelData[][] = [];
    for (let y = 0; y < height; y++) {
      const row: PixelData[] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        row.push({ r, g, b, a, hex, gray });
      }
      baseMatrix.push(row);
    }

    setMatrix(applyConvolution(baseMatrix, activeAlgo));
  }, [activeAlgo, applyConvolution]);

  // =========================================================================
  // ANIMATION LOOP
  // =========================================================================

  /**
   * Animation loop for live video processing.
   */
  const animate = useCallback(() => {
    if (isLive && videoRef.current && videoRef.current.readyState === 4) {
      processFrame(videoRef.current, resolution);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isLive, resolution, processFrame]);

  // Start/stop animation loop
  useEffect(() => {
    if (isLive) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => { 
      if (requestRef.current) cancelAnimationFrame(requestRef.current); 
    };
  }, [isLive, animate]);

  // =========================================================================
  // CAMERA FUNCTIONS
  // =========================================================================

  /**
   * Starts camera stream with optional device ID.
   */
  const startCamera = async (deviceId?: string) => {
    try {
      setCameraStatus('connecting');
      setCameraStatusMessage('Requesting camera access...');
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 640 }, height: { ideal: 480 } }
      };
      
      setCameraStatusMessage('Connecting to camera...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        setCameraStatus('initializing');
        setCameraStatusMessage('Initializing stream...');
        
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        try {
          await videoRef.current.play();
          setCameraStatus('ready');
          setCameraStatusMessage('Camera ready');
        } catch {
          setCameraStatus('ready');
          setCameraStatusMessage('Camera ready');
        }
      }
      setSourceMode('camera');
      setIsLive(true);
      setShowCameraSelector(false);
    } catch {
      setCameraStatus('error');
      setCameraStatusMessage('Failed to access camera');
      alert("Could not access camera. Please check permissions.");
    }
  };

  /**
   * Handles camera button click - enumerates devices or shows selector.
   */
  const handleCameraButtonClick = async () => {
    try {
      setCameraStatus('connecting');
      setCameraStatusMessage('Requesting permission...');
      
      // Request permission first
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());
      
      // Enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      if (videoDevices.length === 1) {
        setSelectedCameraId(videoDevices[0].deviceId);
        startCamera(videoDevices[0].deviceId);
      } else if (videoDevices.length > 1) {
        setCameraStatus('idle');
        setCameraStatusMessage('');
        setShowCameraSelector(true);
      } else {
        setCameraStatus('error');
        alert("No cameras found.");
      }
    } catch {
      setCameraStatus('error');
      alert("Camera permission denied.");
    }
  };

  /**
   * Selects and starts a specific camera.
   */
  const selectCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    startCamera(deviceId);
  };

  /**
   * Stops camera stream and cleans up.
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsLive(false);
    setShowCameraSelector(false);
    setCameraStatus('idle');
    setCameraStatusMessage('');
  };

  // =========================================================================
  // IMAGE UPLOAD
  // =========================================================================

  // Process uploaded image when dependencies change
  useEffect(() => {
    if (sourceMode === 'upload' && image) {
      const img = new Image();
      img.src = image;
      img.onload = () => processFrame(img, resolution);
    }
  }, [image, resolution, sourceMode, processFrame]);

  /**
   * Handles file upload from input.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSourceMode('upload');
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // EXPORT
  // =========================================================================

  /**
   * Downloads matrix data as CSV.
   */
  const downloadData = () => {
    if (!matrix.length) return;
    
    const content = matrix.map(row => row.map(p => {
      if (mode === 'rgb') return `"${p.r},${p.g},${p.b}"`;
      if (mode === 'hex') return p.hex;
      return p.gray;
    }).join(",")).join("\n");
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matrix_${activeAlgo.name.toLowerCase().replace(' ', '_')}_${resolution}x.csv`;
    link.click();
  };

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================

  /**
   * Gets algorithm from modal key.
   */
  const getAlgorithmFromModalKey = (key: string): AlgorithmInfo | null => {
    const keyMap: Record<string, keyof typeof PRESET_ALGORITHMS> = {
      'identity': 'identity',
      'edge-detection': 'edge-detection',
      'gaussian-blur': 'gaussian-blur',
      'sharpen': 'sharpen',
    };
    const algoKey = keyMap[key];
    return algoKey ? PRESET_ALGORITHMS[algoKey] : null;
  };

  /**
   * Applies algorithm and closes modal.
   */
  const handleApplyAlgorithm = (algo: AlgorithmInfo) => {
    setActiveAlgo(algo);
    setLearnModal(null);
  };

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const hasInput = image || sourceMode === 'camera';
  const algorithmsArray = Object.values(PRESET_ALGORITHMS);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Eye size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Computer Vision Lab</h1>
              <p className="text-xs text-neutral-500">Learn how machines see</p>
            </div>
          </div>
          <button
            onClick={() => setLearnModal('convolution')}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            <Info size={14} />
            What is Convolution?
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Landing screen - no input yet */}
        {!hasInput && cameraStatus === 'idle' ? (
          <LandingScreen
            onCameraClick={handleCameraButtonClick}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        ) : (
          /* Main processing view */
          <MainView
            sourceMode={sourceMode}
            image={image}
            matrix={matrix}
            mode={mode}
            resolution={resolution}
            activeAlgo={activeAlgo}
            isLive={isLive}
            cameras={cameras}
            cameraStatus={cameraStatus}
            cameraStatusMessage={cameraStatusMessage}
            videoRef={videoRef}
            setMode={setMode}
            setResolution={setResolution}
            setActiveAlgo={setActiveAlgo}
            setLearnModal={setLearnModal}
            handleCameraButtonClick={handleCameraButtonClick}
            downloadData={downloadData}
            algorithmsArray={algorithmsArray}
          />
        )}

        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*" 
        />

        {/* Learn Modal */}
        {learnModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden my-8">
              {/* Algorithm deep dives */}
              {['identity', 'edge-detection', 'gaussian-blur', 'sharpen'].includes(learnModal) && (() => {
                const algo = getAlgorithmFromModalKey(learnModal);
                if (!algo) return null;
                return (
                  <AlgorithmModal
                    algorithm={algo}
                    onClose={() => setLearnModal(null)}
                    onApply={handleApplyAlgorithm}
                  />
                );
              })()}

              {/* Interactive demos */}
              {learnModal === 'convolution' && (
                <ConvolutionDemo onClose={() => setLearnModal(null)} />
              )}
              {learnModal === 'kernel' && (
                <KernelDemo onClose={() => setLearnModal(null)} />
              )}
              {learnModal === 'matrix' && (
                <MatrixDemo onClose={() => setLearnModal(null)} />
              )}
            </div>
          </div>
        )}

        {/* Camera selector modal */}
        {showCameraSelector && cameras.length > 1 && (
          <CameraSelector
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            onSelect={selectCamera}
            onClose={() => {
              setShowCameraSelector(false);
              setCameraStatus('idle');
            }}
          />
        )}
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Landing screen shown when no input is selected.
 */
const LandingScreen: React.FC<{
  onCameraClick: () => void;
  onUploadClick: () => void;
}> = ({ onCameraClick, onUploadClick }) => (
  <div className="space-y-12">
    {/* Hero */}
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold mb-4">
        See How <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-violet-500">Computers</span> See
      </h2>
      <p className="text-neutral-400 max-w-xl mx-auto text-lg">
        Every image is just a matrix of numbers. Learn the fundamental operations that power computer vision and AI.
      </p>
    </div>

    {/* Input options */}
    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <button
        onClick={onCameraClick}
        className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-violet-500/50 hover:bg-white/[0.04] transition-all text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
          <Camera className="text-violet-500" size={24} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Live Camera</h3>
        <p className="text-sm text-neutral-500">
          Process your webcam feed in real-time and see convolution happening live.
        </p>
      </button>

      <button
        onClick={onUploadClick}
        className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-violet-500/50 hover:bg-white/[0.04] transition-all text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
          <ImageIcon className="text-violet-500" size={24} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
        <p className="text-sm text-neutral-500">
          Upload any image to decompose it into a pixel matrix and apply filters.
        </p>
      </button>
    </div>

    {/* Learning cards */}
    <div className="pt-8">
      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-6 text-center">
        What you will learn
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <Grid3X3 className="text-violet-500 mb-3" size={20} />
          <h4 className="font-medium mb-1">Image as Matrix</h4>
          <p className="text-xs text-neutral-500">
            Images are 2D arrays of pixel values, each containing RGB color channels (0-255).
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <Sparkles className="text-violet-500 mb-3" size={20} />
          <h4 className="font-medium mb-1">Convolution</h4>
          <p className="text-xs text-neutral-500">
            Slide a small kernel matrix over the image, multiplying and summing values at each position.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <Eye className="text-violet-500 mb-3" size={20} />
          <h4 className="font-medium mb-1">Feature Detection</h4>
          <p className="text-xs text-neutral-500">
            Different kernels extract different features: edges, textures, patterns—the building blocks of CV.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Main processing view with all controls.
 */
const MainView: React.FC<{
  sourceMode: 'upload' | 'camera';
  image: string | null;
  matrix: PixelData[][];
  mode: MatrixMode;
  resolution: number;
  activeAlgo: AlgorithmInfo;
  isLive: boolean;
  cameras: MediaDeviceInfo[];
  cameraStatus: CameraStatus;
  cameraStatusMessage: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setMode: (mode: MatrixMode) => void;
  setResolution: (res: number) => void;
  setActiveAlgo: (algo: AlgorithmInfo) => void;
  setLearnModal: (modal: LearnModalType) => void;
  handleCameraButtonClick: () => void;
  downloadData: () => void;
  algorithmsArray: AlgorithmInfo[];
}> = ({
  sourceMode,
  image,
  matrix,
  mode,
  resolution,
  activeAlgo,
  isLive,
  cameras,
  cameraStatus,
  cameraStatusMessage,
  videoRef,
  setMode,
  setResolution,
  setActiveAlgo,
  setLearnModal,
  handleCameraButtonClick,
  downloadData,
  algorithmsArray,
}) => {
  // Hidden file input ref for this component
  const localFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Left Column - Input & Controls */}
      <div className="lg:col-span-3 space-y-4">
        {/* Input Source */}
        <InputSourcePanel
          sourceMode={sourceMode}
          image={image}
          isLive={isLive}
          cameras={cameras}
          videoRef={videoRef}
          onCameraClick={handleCameraButtonClick}
          onUploadClick={() => localFileRef.current?.click()}
        />
        <input 
          type="file" 
          ref={localFileRef} 
          className="hidden" 
          accept="image/*"
        />

        {/* Resolution Slider */}
        <ResolutionPanel
          resolution={resolution}
          matrixHeight={matrix.length}
          setResolution={setResolution}
        />

        {/* Display Format */}
        <DisplayFormatPanel mode={mode} setMode={setMode} />

        {/* Export Button */}
        <button 
          onClick={downloadData} 
          disabled={!matrix.length}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export Matrix (CSV)
        </button>
      </div>

      {/* Center Column - Matrix Display */}
      <div className="lg:col-span-6">
        <MatrixDisplayPanel
          matrix={matrix}
          mode={mode}
          resolution={resolution}
          isLive={isLive}
          cameraStatus={cameraStatus}
          cameraStatusMessage={cameraStatusMessage}
        />
      </div>

      {/* Right Column - Kernel Selection & Learning */}
      <div className="lg:col-span-3 space-y-4">
        {/* Kernel Selection */}
        <KernelSelectionPanel
          algorithms={algorithmsArray}
          activeAlgo={activeAlgo}
          setActiveAlgo={setActiveAlgo}
          setLearnModal={setLearnModal}
        />

        {/* Active Kernel Info */}
        <ActiveKernelPanel activeAlgo={activeAlgo} />

        {/* Concept Links */}
        <ConceptLinksPanel setLearnModal={setLearnModal} />

        {/* Tip */}
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <p className="text-[10px] text-neutral-500">
            <span className="text-neutral-400 font-medium">💡 Tip:</span> Hover over pixels to see the 3×3 receptive field—the 9 pixels the kernel uses to compute each output.
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PANEL COMPONENTS
// =============================================================================

/**
 * Input source panel with video/image preview.
 */
const InputSourcePanel: React.FC<{
  sourceMode: 'upload' | 'camera';
  image: string | null;
  isLive: boolean;
  cameras: MediaDeviceInfo[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCameraClick: () => void;
  onUploadClick: () => void;
}> = ({ sourceMode, image, isLive, cameras, videoRef, onCameraClick, onUploadClick }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
      <span className="text-xs font-medium text-neutral-400">Input Source</span>
      <div className="flex gap-1">
        <button 
          onClick={onCameraClick} 
          className={`p-1.5 rounded-md transition-colors ${
            sourceMode === 'camera' ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-500 hover:bg-white/10'
          }`}
        >
          <Camera size={14} />
        </button>
        <button 
          onClick={onUploadClick} 
          className={`p-1.5 rounded-md transition-colors ${
            sourceMode === 'upload' ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-500 hover:bg-white/10'
          }`}
        >
          <Upload size={14} />
        </button>
      </div>
    </div>
    <div className="aspect-video relative bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover ${sourceMode === 'camera' ? 'block' : 'hidden'}`} 
      />
      {sourceMode === 'upload' && image && (
        <img src={image} className="w-full h-full object-cover" alt="Source" />
      )}
      {isLive && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white/80">LIVE</span>
        </div>
      )}
      {sourceMode === 'camera' && cameras.length > 1 && (
        <button 
          onClick={onCameraClick} 
          className="absolute bottom-2 right-2 p-1.5 bg-black/70 rounded-lg hover:bg-black/90 transition-colors"
        >
          <RefreshCcw size={12} className="text-white/70" />
        </button>
      )}
    </div>
  </div>
);

/**
 * Resolution control panel.
 */
const ResolutionPanel: React.FC<{
  resolution: number;
  matrixHeight: number;
  setResolution: (res: number) => void;
}> = ({ resolution, matrixHeight, setResolution }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-neutral-400">Resolution</span>
      <span className="text-xs font-mono text-violet-400">{resolution}×{matrixHeight || '?'}</span>
    </div>
    <input 
      type="range" 
      min="8" 
      max="64" 
      step="8" 
      value={resolution}
      onChange={(e) => setResolution(parseInt(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
    />
    <p className="text-[10px] text-neutral-600 mt-2">
      Lower = see individual pixels • Higher = more detail
    </p>
  </div>
);

/**
 * Display format selector panel.
 */
const DisplayFormatPanel: React.FC<{
  mode: MatrixMode;
  setMode: (mode: MatrixMode) => void;
}> = ({ mode, setMode }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
    <span className="text-xs font-medium text-neutral-400 block mb-3">Display Format</span>
    <div className="grid grid-cols-3 gap-1.5">
      {(['rgb', 'hex', 'gray'] as MatrixMode[]).map((m) => (
        <button 
          key={m} 
          onClick={() => setMode(m)}
          className={`py-2 rounded-lg text-xs font-medium uppercase transition-all ${
            mode === m 
              ? 'bg-white/10 text-white' 
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Matrix display panel with loading states.
 */
const MatrixDisplayPanel: React.FC<{
  matrix: PixelData[][];
  mode: MatrixMode;
  resolution: number;
  isLive: boolean;
  cameraStatus: CameraStatus;
  cameraStatusMessage: string;
}> = ({ matrix, mode, resolution, isLive, cameraStatus, cameraStatusMessage }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10 h-full flex flex-col">
    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Pixel Matrix</span>
        {isLive && (
          <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
            Real-time
          </span>
        )}
      </div>
      <span className="text-xs text-neutral-500 font-mono">
        {matrix.length ? `${matrix[0]?.length}×${matrix.length} pixels` : ''}
      </span>
    </div>
    
    <div className="flex-1 flex items-center justify-center p-4 min-h-[400px]">
      {matrix.length > 0 ? (
        <MatrixVisualizer 
          matrix={matrix} 
          mode={mode} 
          cellSize={resolution > 48 ? 12 : resolution > 32 ? 16 : 24} 
        />
      ) : (cameraStatus === 'connecting' || cameraStatus === 'initializing') ? (
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
            <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500" size={24} />
          </div>
          <p className="text-sm text-neutral-400">{cameraStatusMessage}</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Play className="text-neutral-600" size={24} />
          </div>
          <p className="text-sm text-neutral-500">Waiting for input...</p>
        </div>
      )}
    </div>
  </div>
);

/**
 * Helper function to get kernel cell CSS class.
 */
const getKernelCellClass = (val: number, isActive: boolean): string => {
  if (isActive) {
    if (val > 0) return 'bg-violet-500/30 text-violet-300';
    if (val < 0) return 'bg-red-500/30 text-red-300';
    return 'bg-white/10 text-neutral-500';
  }
  return 'bg-white/5 text-neutral-500';
};

/**
 * Kernel selection panel.
 */
const KernelSelectionPanel: React.FC<{
  algorithms: AlgorithmInfo[];
  activeAlgo: AlgorithmInfo;
  setActiveAlgo: (algo: AlgorithmInfo) => void;
  setLearnModal: (modal: LearnModalType) => void;
}> = ({ algorithms, activeAlgo, setActiveAlgo, setLearnModal }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10">
    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
      <span className="text-xs font-medium text-neutral-400">Convolution Kernel</span>
      <button 
        onClick={() => setLearnModal('kernel')} 
        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
      >
        <Info size={10} /> What's a kernel?
      </button>
    </div>
    <div className="p-2">
      {algorithms.map((algo) => {
        const isActive = activeAlgo.name === algo.name;
        return (
          <div 
            key={algo.name} 
            className={`rounded-lg transition-all mb-1 last:mb-0 ${
              isActive 
                ? 'bg-violet-500/10 border border-violet-500/30' 
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <button onClick={() => setActiveAlgo(algo)} className="w-full p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isActive ? 'text-violet-400' : 'text-neutral-300'}`}>
                  {algo.name}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mb-2">{algo.description}</p>
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-3 gap-0.5 w-14">
                  {algo.kernel.flat().map((val, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square flex items-center justify-center text-[8px] font-mono rounded-sm ${getKernelCellClass(val, isActive)}`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
                <div className="text-[9px] font-mono text-neutral-500">{algo.formula}</div>
              </div>
            </button>
            {isActive && (
              <div className="px-3 pb-3">
                <button 
                  onClick={() => setLearnModal(algo.name.toLowerCase().replace(' ', '-') as LearnModalType)}
                  className="w-full py-1.5 rounded-md bg-violet-500/20 text-violet-400 text-[10px] font-medium hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Lightbulb size={10} /> Learn how {algo.name} works
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Active kernel information panel.
 */
const ActiveKernelPanel: React.FC<{
  activeAlgo: AlgorithmInfo;
}> = ({ activeAlgo }) => (
  <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/10 border border-violet-500/20 p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-violet-400" />
        <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">Active Filter</span>
      </div>
    </div>
    <h4 className="font-medium mb-2">{activeAlgo.name}</h4>
    <p className="text-xs text-neutral-400 leading-relaxed mb-3">{activeAlgo.learn}</p>
    <div className="bg-black/30 rounded-lg p-2 font-mono text-[10px] text-neutral-300 mb-3">
      {activeAlgo.formula}
    </div>
    <div className="text-[10px] text-neutral-500">
      <span className="text-neutral-400 font-medium">Real-world use:</span> {activeAlgo.deepDive.realWorld[0]}
    </div>
  </div>
);

/**
 * Concept quick links panel.
 */
const ConceptLinksPanel: React.FC<{
  setLearnModal: (modal: LearnModalType) => void;
}> = ({ setLearnModal }) => (
  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
    <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">
      Learn Concepts
    </span>
    <div className="space-y-1">
      <button 
        onClick={() => setLearnModal('matrix')} 
        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-2"
      >
        <Eye size={12} className="text-violet-400" />
        <span className="text-xs text-neutral-300">Images as Matrices</span>
        <ChevronRight size={12} className="text-neutral-500 ml-auto" />
      </button>
      <button 
        onClick={() => setLearnModal('convolution')} 
        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-2"
      >
        <Layers size={12} className="text-violet-400" />
        <span className="text-xs text-neutral-300">What is Convolution?</span>
        <ChevronRight size={12} className="text-neutral-500 ml-auto" />
      </button>
      <button 
        onClick={() => setLearnModal('kernel')} 
        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-2"
      >
        <Grid3X3 size={12} className="text-violet-400" />
        <span className="text-xs text-neutral-300">What is a Kernel?</span>
        <ChevronRight size={12} className="text-neutral-500 ml-auto" />
      </button>
    </div>
  </div>
);

export default App;
