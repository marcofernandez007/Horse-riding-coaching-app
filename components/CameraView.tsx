
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeEquestrianFrame, getLiveFeedback } from '../services/geminiService';
import { AnalysisResult, LiveFeedback, UserProfile } from '../types';
import { translations } from '../services/i18n';

interface CameraViewProps {
  onAnalysisComplete: (result: AnalysisResult, image: string) => void;
  profile: UserProfile;
}

const LIVE_COACHING_THROTTLE_MS = 5000; 

const ScoreRing: React.FC<{ score: number; label: string; color: string; subLabel: string }> = ({ score, label, color, subLabel }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const isCritical = score < 70;
  
  const activeStrokeColor = isCritical ? '#ef4444' : color;

  return (
    <div className={`flex flex-col items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border transition-all duration-700 ${isCritical ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' : 'border-white/10'}`}>
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
          <circle 
            cx="32" cy="32" r={radius} 
            stroke={activeStrokeColor} 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-mono font-bold transition-colors duration-500 ${isCritical ? 'text-red-400' : 'text-white'}`}>
            {score}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-tighter transition-colors duration-500 ${isCritical ? 'text-red-400' : 'text-white/90'}`}>
          {label}
        </p>
        <p className={`text-[8px] uppercase tracking-widest font-semibold transition-colors duration-500 ${isCritical ? 'text-red-500/80' : 'text-[#c1a062]'}`}>
          {subLabel}
        </p>
      </div>
    </div>
  );
};

const CameraView: React.FC<CameraViewProps> = ({ onAnalysisComplete, profile }) => {
  const t = translations[profile.language] || translations.English;
  const videoRef = useRef<HTMLVideoElement>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingLive = useRef(false);
  const liveTimeoutRef = useRef<number | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ result: AnalysisResult; image: string } | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [showLogConfirm, setShowLogConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: any = { 'English': 'en-US', 'Spanish': 'es-ES', 'German': 'de-DE', 'French': 'fr-FR', 'Italian': 'it-IT', 'Portuguese': 'pt-PT', 'Arabic': 'ar-SA', 'Mandarin': 'zh-CN', 'Japanese': 'ja-JP', 'Dutch': 'nl-NL' };
      utterance.lang = langMap[profile.language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setUploadedVideoUrl(null);
        setError(null);
      }
    } catch (err) {
      setError(t.camera.error);
    }
  };

  const captureFrameFromVideo = useCallback((videoEl: HTMLVideoElement | null) => {
    if (!videoEl || !canvasRef.current) return null;
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;
    canvasRef.current.width = videoEl.videoWidth;
    canvasRef.current.height = videoEl.videoHeight;
    context.drawImage(videoEl, 0, 0);
    return canvasRef.current.toDataURL('image/jpeg', 0.6);
  }, []);

  const runLiveCoachingStep = useCallback(async () => {
    if (isProcessingLive.current || !isLiveMode || !isCameraActive || pendingAnalysis) return;
    const imageData = captureFrameFromVideo(videoRef.current);
    if (!imageData) return;
    isProcessingLive.current = true;
    try {
      const feedback = await getLiveFeedback(imageData, profile.language);
      setLiveFeedback(feedback);
      if (feedback.alert) speakFeedback(feedback.alert);
    } catch (err) {
      console.error(err);
    } finally {
      isProcessingLive.current = false;
      if (isLiveMode) liveTimeoutRef.current = window.setTimeout(runLiveCoachingStep, LIVE_COACHING_THROTTLE_MS);
    }
  }, [captureFrameFromVideo, isLiveMode, isCameraActive, pendingAnalysis, profile.language]);

  useEffect(() => {
    if (isLiveMode && isCameraActive && !pendingAnalysis) runLiveCoachingStep();
    return () => { if (liveTimeoutRef.current) window.clearTimeout(liveTimeoutRef.current); };
  }, [isLiveMode, isCameraActive, pendingAnalysis, runLiveCoachingStep]);

  const captureAndAnalyze = async () => {
    if (isAnalyzing) return;
    const videoSource = uploadedVideoUrl ? uploadedVideoRef.current : videoRef.current;
    const imageData = captureFrameFromVideo(videoSource);
    if (!imageData) return;
    
    setIsAnalyzing(true);
    setIsLiveMode(false);
    try {
      const result = await analyzeEquestrianFrame(imageData, profile.language);
      setPendingAnalysis({ result, image: imageData });
      speakFeedback(result.summary);
    } catch (err: any) {
      setError(err.message);
    } finally { setIsAnalyzing(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setIsCameraActive(false);
      setPendingAnalysis(null);
      return;
    }

    // Image fallback
    setIsAnalyzing(true);
    setIsCameraActive(false);
    setUploadedVideoUrl(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      try {
        const result = await analyzeEquestrianFrame(imageData, profile.language);
        setPendingAnalysis({ result, image: imageData });
      } catch (err) { setError("Analysis error"); }
      finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const confirmLog = () => {
    if (pendingAnalysis) {
      onAnalysisComplete(pendingAnalysis.result, pendingAnalysis.image);
      setPendingAnalysis(null);
      setUploadedVideoUrl(null);
      setShowLogConfirm(false);
    }
  };

  const discardSession = () => {
    setPendingAnalysis(null);
    setUploadedVideoUrl(null);
    setShowLogConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border relative">
        <div className="aspect-video bg-black relative">
          {!pendingAnalysis ? (
            <>
              {/* No active stream or video */}
              {!isCameraActive && !uploadedVideoUrl && !isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 z-10">
                  <button onClick={startCamera} className="bg-[#c1a062] text-[#1a2e23] font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">{t.camera.launch}</button>
                  <label className="cursor-pointer bg-white/10 py-2 px-6 rounded-full hover:bg-white/20 transition-colors">
                    {t.camera.upload}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
              
              {/* Live Camera View */}
              {isCameraActive && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}

              {/* Uploaded Video View */}
              {uploadedVideoUrl && (
                <video 
                  ref={uploadedVideoRef} 
                  src={uploadedVideoUrl} 
                  className="w-full h-full object-contain" 
                  controls 
                  playsInline
                />
              )}
            </>
          ) : (
            <img src={pendingAnalysis.image} className="w-full h-full object-cover" alt="Captured" />
          )}

          {pendingAnalysis && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-30">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
                {!showLogConfirm ? (
                  <>
                    <h3 className="text-xl font-bold text-[#1a2e23]">{t.camera.complete}</h3>
                    <p className="text-sm text-gray-600 italic">"{pendingAnalysis.result.summary}"</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowLogConfirm(true)} className="flex-1 bg-[#c1a062] text-[#1a2e23] font-bold py-3 rounded-xl hover:bg-[#b08e50] transition-colors">{t.camera.log}</button>
                      <button onClick={discardSession} className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">{t.camera.discard}</button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-[#c1a062]/10 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-[#c1a062]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1a2e23]">Save this Session?</h3>
                      <p className="text-sm text-gray-500 mt-1">This will be added to your training history.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={confirmLog} className="flex-1 bg-[#1a2e23] text-white font-bold py-3 rounded-xl hover:bg-[#253f31] transition-colors">Yes, Log Session</button>
                      <button onClick={() => setShowLogConfirm(false)} className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLiveMode && liveFeedback && !pendingAnalysis && (
            <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 z-20">
              <div className="absolute top-4 left-4">
                <ScoreRing 
                  score={liveFeedback.postureScore} 
                  label={t.analysis.technique} 
                  color="#4ade80" 
                  subLabel={t.analysis.metrics.alignment} 
                />
              </div>
              <div className="absolute top-4 right-4">
                <ScoreRing 
                  score={liveFeedback.contactScore} 
                  label={t.analysis.metrics.balance} 
                  color="#60a5fa" 
                  subLabel={t.analysis.metrics.balance} 
                />
              </div>
              <div className="flex h-full items-center justify-center pt-20">
                <div className="bg-[#c1a062] text-[#1a2e23] font-bold py-4 px-12 rounded-2xl text-xl sm:text-2xl animate-pulse shadow-2xl border border-white/20">
                  {liveFeedback.alert}
                </div>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 z-40 backdrop-blur-[4px] transition-all duration-300">
              <div className="w-14 h-14 border-4 border-[#c1a062] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(193,160,98,0.5)]"></div>
              <p className="font-bold text-xl tracking-tight text-white drop-shadow-md">{t.camera.progress}</p>
              <p className="text-xs text-white/70 mt-2 uppercase tracking-widest font-medium">Kinematic Audit in Progress</p>
            </div>
          )}
        </div>
        
        {(isCameraActive || uploadedVideoUrl) && !pendingAnalysis && (
          <div className="p-4 bg-white flex flex-col sm:flex-row gap-3 justify-between items-center border-t">
            <div className="flex gap-3 w-full sm:w-auto">
              {isCameraActive && (
                <button onClick={() => setIsLiveMode(!isLiveMode)} className={`flex-1 sm:flex-none py-3 px-8 rounded-full font-bold transition-all shadow-sm ${isLiveMode ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-[#1a2e23] hover:bg-gray-200'}`}>
                  {isLiveMode ? t.camera.stopLive : t.camera.startLive}
                </button>
              )}
              {uploadedVideoUrl && (
                <label className="flex-1 sm:flex-none cursor-pointer bg-gray-100 text-[#1a2e23] font-bold py-3 px-8 rounded-full text-center hover:bg-gray-200 transition-colors shadow-sm">
                  Change Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>
            
            <button 
              onClick={captureAndAnalyze} 
              disabled={isAnalyzing || isLiveMode} 
              className="w-full sm:w-auto bg-[#1a2e23] text-white font-bold py-4 px-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#253f31] transition-all shadow-md active:scale-95"
            >
              {isAnalyzing ? "Processing..." : t.camera.detailed}
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
