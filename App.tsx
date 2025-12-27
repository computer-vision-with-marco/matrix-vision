
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Settings, 
  Download, 
  Grid, 
  RefreshCcw, 
  Info,
  Camera,
  Play,
  Zap,
  Cpu,
  Binary,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PixelData, MatrixMode, Kernel, VisionAlgorithm } from './types';
import { MatrixVisualizer } from './components/MatrixVisualizer';

const PRESET_ALGORITHMS: VisionAlgorithm[] = [
  { 
    name: 'Identity', 
    description: 'Raw pixel matrix without transformation.',
    kernel: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    divisor: 1
  },
  { 
    name: 'Edge Detection', 
    description: 'Sobel operator: Calculates gradients to find boundaries.',
    kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    divisor: 1
  },
  { 
    name: 'Gaussian Blur', 
    description: 'Smooths noise by averaging neighbor values.',
    kernel: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    divisor: 16
  },
  { 
    name: 'Sharpen', 
    description: 'Enhances details by increasing local contrast.',
    kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    divisor: 1
  }
];

const App: React.FC = () => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'camera'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [resolution, setResolution] = useState<number>(32);
  const [matrix, setMatrix] = useState<PixelData[][]>([]);
  const [mode, setMode] = useState<MatrixMode>('rgb');
  const [activeAlgo, setActiveAlgo] = useState<VisionAlgorithm>(PRESET_ALGORITHMS[0]);
  const [isLive, setIsLive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'connecting' | 'initializing' | 'ready' | 'error'>('idle');
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  const applyConvolution = useCallback((input: PixelData[][], algo: VisionAlgorithm): PixelData[][] => {
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
            const py = Math.min(Math.max(y + ky, 0), height - 1);
            const px = Math.min(Math.max(x + kx, 0), width - 1);
            const weight = k[ky + 1][kx + 1];
            
            r += input[py][px].r * weight;
            g += input[py][px].g * weight;
            b += input[py][px].b * weight;
          }
        }

        const finalR = Math.min(Math.max(Math.round(r / div), 0), 255);
        const finalG = Math.min(Math.max(Math.round(g / div), 0), 255);
        const finalB = Math.min(Math.max(Math.round(b / div), 0), 255);
        const finalGray = Math.round(0.299 * finalR + 0.587 * finalG + 0.114 * finalB);
        const finalHex = `#${((1 << 24) + (finalR << 16) + (finalG << 8) + finalB).toString(16).slice(1)}`;

        row.push({ 
          r: finalR, 
          g: finalG, 
          b: finalB, 
          a: 255, 
          hex: finalHex, 
          gray: finalGray 
        });
      }
      output.push(row);
    }
    return output;
  }, []);

  const processFrame = useCallback((source: HTMLImageElement | HTMLVideoElement, res: number) => {
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
    
    let baseMatrix: PixelData[][] = [];
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

  const animate = useCallback(() => {
    if (isLive && videoRef.current && videoRef.current.readyState === 4) {
      processFrame(videoRef.current, resolution);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isLive, resolution, processFrame]);

  useEffect(() => {
    if (isLive) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isLive, animate]);

  const startCamera = async (deviceId?: string) => {
    try {
      setCameraStatus('connecting');
      setCameraStatusMessage('Requesting camera access...');
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 640 }, height: { ideal: 480 } }
      };
      
      setCameraStatusMessage('Connecting to camera hardware...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        setCameraStatus('initializing');
        setCameraStatusMessage('Initializing video stream...');
        
        // Clear any existing event handlers
        videoRef.current.onloadedmetadata = null;
        videoRef.current.oncanplay = null;
        
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Use play() promise and loadeddata event for reliable detection
        try {
          setCameraStatusMessage('Starting video playback...');
          await videoRef.current.play();
          
          // Wait for actual video data
          if (videoRef.current.readyState >= 2) {
            setCameraStatus('ready');
            setCameraStatusMessage('Camera ready');
          } else {
            // Wait for video to have enough data
            videoRef.current.onloadeddata = () => {
              setCameraStatus('ready');
              setCameraStatusMessage('Camera ready');
            };
            
            // Fallback timeout in case events don't fire
            setTimeout(() => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                setCameraStatus('ready');
                setCameraStatusMessage('Camera ready');
              }
            }, 500);
          }
        } catch (playError) {
          console.error('Video play error:', playError);
          setCameraStatus('ready'); // Still try to proceed
          setCameraStatusMessage('Camera ready');
        }
      }
      setSourceMode('camera');
      setIsLive(true);
      setShowCameraSelector(false);
    } catch (err) {
      setCameraStatus('error');
      setCameraStatusMessage('Failed to access camera');
      alert("Could not access camera. Please check permissions and try again.");
    }
  };

  const handleCameraButtonClick = async () => {
    try {
      setCameraStatus('connecting');
      setCameraStatusMessage('Requesting camera permission...');
      
      // Request permission first to get device labels - then immediately stop it
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the temporary stream immediately - we just needed permission
      tempStream.getTracks().forEach(track => track.stop());
      
      setCameraStatusMessage('Enumerating camera devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      if (videoDevices.length === 1) {
        // Only one camera, use it directly
        setSelectedCameraId(videoDevices[0].deviceId);
        startCamera(videoDevices[0].deviceId);
      } else if (videoDevices.length > 1) {
        // Multiple cameras, show selector
        setCameraStatus('idle');
        setCameraStatusMessage('');
        setShowCameraSelector(true);
      } else {
        setCameraStatus('error');
        setCameraStatusMessage('No cameras found');
        alert("No cameras found.");
      }
    } catch (err) {
      setCameraStatus('error');
      setCameraStatusMessage('Camera permission denied');
      alert("Could not access camera. Please allow camera permissions and try again.");
    }
  };

  const selectCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    startCamera(deviceId);
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsLive(false);
    setShowCameraSelector(false);
    setCameraStatus('idle');
    setCameraStatusMessage('');
  };

  useEffect(() => {
    if (sourceMode === 'upload' && image) {
      const img = new Image();
      img.src = image;
      img.onload = () => processFrame(img, resolution);
    }
  }, [image, resolution, sourceMode, processFrame, activeAlgo]);

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

  const downloadData = () => {
    if (!matrix.length) return;
    let content = matrix.map(row => row.map(p => {
      if (mode === 'rgb') return `"${p.r},${p.g},${p.b}"`;
      if (mode === 'hex') return p.hex;
      return p.gray;
    }).join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixel_matrix_${activeAlgo.name}_${resolution}x.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight">
              <Grid className="text-indigo-400 w-10 h-10" />
              PixelMatrix <span className="text-indigo-400">Pro</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Computational Imaging & Computer Vision Lab</p>
          </div>
          
          <div className="flex gap-3 relative">
            <button 
              onClick={handleCameraButtonClick}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                sourceMode === 'camera' ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Camera size={20} />
              Live CV Feed
            </button>
            
            {/* Camera Selector Dropdown */}
            {showCameraSelector && cameras.length > 1 && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Camera size={16} className="text-emerald-400" />
                    Select Camera
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {cameras.map((camera, index) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => selectCamera(camera.deviceId)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-3 ${
                        selectedCameraId === camera.deviceId ? 'bg-emerald-600/20 border-l-2 border-emerald-500' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedCameraId === camera.deviceId ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}>
                        <Camera size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {camera.label || `Camera ${index + 1}`}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          {camera.deviceId.slice(0, 20)}...
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-700 bg-slate-900/30">
                  <button
                    onClick={() => setShowCameraSelector(false)}
                    className="w-full px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                sourceMode === 'upload' ? 'bg-indigo-600 shadow-indigo-900/20' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Upload size={20} />
              Source Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        </header>

        {!image && sourceMode === 'upload' && cameraStatus === 'idle' ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
            <Cpu className="w-16 h-16 text-slate-600 mb-6" />
            <h2 className="text-2xl font-semibold text-slate-300">Awaiting Signal Input</h2>
            <p className="text-slate-500 mt-2">Initialize laboratory by uploading a source file or activating camera</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-8">
                
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Binary size={16} className="text-indigo-400" /> Vision Algorithms
                  </h3>
                  <div className="space-y-3">
                    {PRESET_ALGORITHMS.map(algo => (
                      <button
                        key={algo.name}
                        onClick={() => setActiveAlgo(algo)}
                        className={`w-full p-4 rounded-xl border text-left transition-all group ${
                          activeAlgo.name === algo.name 
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-inner' 
                          : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span className={activeAlgo.name === algo.name ? 'text-indigo-300' : 'text-slate-300'}>{algo.name}</span>
                          {activeAlgo.name === algo.name && <Zap size={14} className="text-yellow-400 animate-pulse" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{algo.description}</p>
                        
                        {/* Kernel Visualizer */}
                        <div className="mt-3 grid grid-cols-3 gap-1 max-w-[120px]">
                          {algo.kernel.flat().map((val, i) => (
                            <div key={i} className={`h-6 flex items-center justify-center text-[10px] mono border ${
                              activeAlgo.name === algo.name ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-700 bg-black/30'
                            }`}>
                              {val}
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings size={16} /> Sampling Params
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs text-slate-400 uppercase">Grid Stride</label>
                        <span className="text-xs font-mono text-indigo-400">{resolution}px</span>
                      </div>
                      <input 
                        type="range" min="8" max="128" step="8" value={resolution}
                        onChange={(e) => setResolution(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase block mb-3">Memory Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['rgb', 'hex', 'gray'] as MatrixMode[]).map((m) => (
                          <button
                            key={m} onClick={() => setMode(m)}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                   <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video relative group">
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all ${sourceMode === 'camera' ? 'block' : 'hidden'}`} />
                    {sourceMode === 'upload' && image && <img src={image} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="Preview" />}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-[10px] font-mono bg-black/80 px-2 py-1 border border-slate-700 text-slate-400 uppercase">Input Feed</div>
                    </div>
                    {/* Camera Switch Button */}
                    {sourceMode === 'camera' && cameras.length > 1 && (
                      <button
                        onClick={handleCameraButtonClick}
                        className="absolute bottom-2 right-2 p-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Switch Camera"
                      >
                        <RefreshCcw size={14} className="text-slate-300" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Layers className="text-indigo-400" />
                    <h2 className="text-xl font-bold tracking-tight">Active Matrix Computation</h2>
                    {isLive && sourceMode === 'camera' && <span className="flex items-center gap-2 text-[10px] text-emerald-400 animate-pulse font-mono border border-emerald-500/20 px-2 py-0.5 rounded-full bg-emerald-500/5">REAL-TIME CONVOLUTION</span>}
                  </div>
                  <button onClick={downloadData} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 flex items-center gap-2 text-xs font-bold transition-all shadow-lg active:scale-95">
                    <Download size={14} /> EXPORT CSV
                  </button>
                </div>

                <div className="flex-grow flex items-center justify-center bg-slate-950/50 rounded-xl min-h-[500px] relative border border-slate-800/50">
                  {matrix.length > 0 ? (
                    <MatrixVisualizer 
                      matrix={matrix} 
                      mode={mode} 
                      cellSize={resolution > 80 ? (resolution > 110 ? 10 : 16) : (resolution > 40 ? 24 : 32)} 
                    />
                  ) : (cameraStatus === 'connecting' || cameraStatus === 'initializing') ? (
                    <div className="text-slate-400 flex flex-col items-center max-w-md text-center px-6">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
                        <Camera className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {cameraStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
                        {cameraStatus === 'initializing' && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
                        <span className="mono text-sm uppercase tracking-wider text-slate-300">{cameraStatusMessage}</span>
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        <div className="flex items-start gap-3 text-left">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${cameraStatus === 'connecting' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                            {cameraStatus !== 'connecting' ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-300">Browser Permission</div>
                            <div className="text-[10px] text-slate-500">Requesting access to your camera device</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-left">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${cameraStatus === 'initializing' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-500'}`}>
                            {cameraStatus === 'initializing' ? <Loader2 size={14} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-300">Hardware Initialization</div>
                            <div className="text-[10px] text-slate-500">Camera sensor warming up & calibrating</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-left">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-700 text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-300">Video Stream Ready</div>
                            <div className="text-[10px] text-slate-500">First frame capture & matrix generation</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-[10px] text-slate-500">
                        <Info size={12} className="inline mr-1 text-indigo-400" />
                        Camera initialization typically takes 1-3 seconds. External webcams or virtual cameras may take longer.
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center animate-pulse">
                      <RefreshCcw className="w-12 h-12 mb-4 animate-spin opacity-20" />
                      <span className="mono text-xs uppercase tracking-widest">Compiling Linear Algebra...</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-indigo-300/80 leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 font-bold text-indigo-400 uppercase tracking-wider">
                      <Info size={14} /> CV Logic
                    </div>
                    Computer vision treats images as 2D tensors. By applying a 3x3 kernel (convolution), we can extract high-level features like edges or textures. This is the fundamental operation behind Convolutional Neural Networks (CNNs).
                  </div>
                  <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-[10px] mono text-slate-500 overflow-hidden">
                    <div className="mb-2 text-slate-400 font-bold uppercase tracking-wider">Computation Log</div>
                    <div>&gt; Applied {activeAlgo.name} kernel</div>
                    <div>&gt; Resolution: {resolution}x{matrix.length || 0}</div>
                    <div>&gt; Mode: {mode.toUpperCase()}</div>
                    <div>&gt; Tensors: Rank 2 (sRGB Space)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-[10px] tracking-widest uppercase">
        PixelMatrix Pro v2.0 • Digital Signal Processing Lab • sRGB Decomposition Interface
      </footer>
    </div>
  );
};

export default App;
