
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeEquestrianFrame, getLiveFeedback } from '../services/geminiService';
import { AnalysisResult, LiveFeedback } from '../types';

interface CameraViewProps {
  onAnalysisComplete: (result: AnalysisResult, image: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onAnalysisComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const liveIntervalRef = useRef<number | null>(null);

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
      console.error(err);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    return canvasRef.current.toDataURL('image/jpeg', 0.6);
  }, []);

  const runLiveCoaching = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData) return;

    try {
      const feedback = await getLiveFeedback(imageData);
      setLiveFeedback(feedback);
      if (feedback.alert) {
        speakFeedback(feedback.alert);
      }
    } catch (err) {
      console.error("Live feedback error:", err);
    }
  }, [captureFrame]);

  useEffect(() => {
    if (isLiveMode && isCameraActive) {
      liveIntervalRef.current = window.setInterval(runLiveCoaching, 4000);
      runLiveCoaching(); // Run immediately
    } else {
      if (liveIntervalRef.current) {
        window.clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
      setLiveFeedback(null);
    }
    return () => {
      if (liveIntervalRef.current) window.clearInterval(liveIntervalRef.current);
    };
  }, [isLiveMode, isCameraActive, runLiveCoaching]);

  const captureAndAnalyze = async () => {
    if (isAnalyzing) return;
    const imageData = captureFrame();
    if (!imageData) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeEquestrianFrame(imageData);
      onAnalysisComplete(result, imageData);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await analyzeEquestrianFrame(base64);
        onAnalysisComplete(result, base64);
      } catch (err) {
        setError('Analysis failed. Please try again.');
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative">
        <div className="aspect-video bg-black relative">
          {!isCameraActive && !isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
              <p className="text-lg opacity-80">Camera is off</p>
              <button 
                onClick={startCamera}
                className="bg-[#c1a062] hover:bg-[#b08e50] text-[#1a2e23] font-bold py-3 px-8 rounded-full transition-all"
              >
                Enable Camera
              </button>
              <div className="text-sm opacity-60">or</div>
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 py-2 px-6 rounded-full transition-all">
                Upload Photo/Video
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          />

          {/* Real-time HUD */}
          {isLiveMode && liveFeedback && (
            <div className="absolute inset-0 pointer-events-none flex flex-col p-6 animate-fadeIn">
              {/* Alert Message */}
              <div className="self-center mt-4">
                <div className="bg-[#c1a062] text-[#1a2e23] font-bold py-3 px-10 rounded-full text-2xl shadow-2xl border-2 border-white animate-pulse">
                  {liveFeedback.alert}
                </div>
              </div>

              {/* Metrics Overlay */}
              <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
                  <div className="text-[10px] uppercase font-bold text-[#c1a062]">Posture</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${liveFeedback.postureScore}%` }}></div>
                    </div>
                    <span className="text-xs font-mono">{liveFeedback.postureScore}</span>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
                  <div className="text-[10px] uppercase font-bold text-[#c1a062]">Contact</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${liveFeedback.contactScore}%` }}></div>
                    </div>
                    <span className="text-xs font-mono">{liveFeedback.contactScore}</span>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
                  <div className="text-[10px] uppercase font-bold text-[#c1a062]">Leg Pos</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${liveFeedback.legScore}%` }}></div>
                    </div>
                    <span className="text-xs font-mono">{liveFeedback.legScore}</span>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
                  <div className="text-[10px] uppercase font-bold text-[#c1a062]">Carriage</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 transition-all duration-1000" style={{ width: `${liveFeedback.carriageScore}%` }}></div>
                    </div>
                    <span className="text-xs font-mono">{liveFeedback.carriageScore}</span>
                  </div>
                </div>
              </div>

              {/* Scanning effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c1a062]/5 to-transparent h-1/4 animate-scan pointer-events-none"></div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c1a062] border-t-transparent mb-4"></div>
              <p className="font-medium animate-pulse">Conducting Full Biomechanical Audit...</p>
            </div>
          )}
        </div>
        
        {isCameraActive && (
          <div className="p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4 border-t">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`py-3 px-6 rounded-full font-bold transition-all flex items-center space-x-2 ${
                  isLiveMode 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-gray-100 text-[#1a2e23] hover:bg-gray-200'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-white animate-ping' : 'bg-gray-400'}`}></span>
                <span>{isLiveMode ? 'Stop Live Coach' : 'Start Live Coach'}</span>
              </button>
            </div>

            <button 
              onClick={captureAndAnalyze}
              disabled={isAnalyzing || isLiveMode}
              className="bg-[#1a2e23] hover:bg-[#253f31] text-white font-bold py-4 px-12 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title={isLiveMode ? "Disable Live Mode to capture static analysis" : ""}
            >
              <span>Capture Detailed Analysis</span>
            </button>
            
            <div className="text-xs text-gray-400 max-w-[200px] text-center md:text-right">
              {isLiveMode ? "Live mode uses high-speed visual scanning." : "Detailed mode provides full coaching reports."}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">&times;</button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraView;
