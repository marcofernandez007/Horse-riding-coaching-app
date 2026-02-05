
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

  return (
    <div className={`flex flex-col items-center bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 transition-all duration-500 ${isCritical ? 'animate-ringPulse' : ''}`}>
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
          <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-white">{score}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-tighter text-white/90">{label}</p>
        <p className="text-[8px] uppercase tracking-widest text-[#c1a062] font-semibold">{subLabel}</p>
      </div>
    </div>
  );
};

const CameraView: React.FC<CameraViewProps> = ({ onAnalysisComplete, profile }) => {
  const t = translations[profile.language] || translations.English;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingLive = useRef(false);
  const liveTimeoutRef = useRef<number | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ result: AnalysisResult; image: string } | null>(null);
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
        setError(null);
      }
    } catch (err) {
      setError(t.camera.error);
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

  const runLiveCoachingStep = useCallback(async () => {
    if (isProcessingLive.current || !isLiveMode || !isCameraActive || pendingAnalysis) return;
    const imageData = captureFrame();
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
  }, [captureFrame, isLiveMode, isCameraActive, pendingAnalysis, profile.language]);

  useEffect(() => {
    if (isLiveMode && isCameraActive && !pendingAnalysis) runLiveCoachingStep();
    return () => { if (liveTimeoutRef.current) window.clearTimeout(liveTimeoutRef.current); };
  }, [isLiveMode, isCameraActive, pendingAnalysis, runLiveCoachingStep]);

  const captureAndAnalyze = async () => {
    if (isAnalyzing) return;
    const imageData = captureFrame();
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

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border relative">
        <div className="aspect-video bg-black relative">
          {!pendingAnalysis ? (
            <>
              {!isCameraActive && !isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 z-10">
                  <button onClick={startCamera} className="bg-[#c1a062] text-[#1a2e23] font-bold py-3 px-8 rounded-full">{t.camera.launch}</button>
                  <label className="cursor-pointer bg-white/10 py-2 px-6 rounded-full">{t.camera.upload}<input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} /></label>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} />
            </>
          ) : (
            <img src={pendingAnalysis.image} className="w-full h-full object-cover" alt="Captured" />
          )}

          {pendingAnalysis && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-30">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
                <h3 className="text-xl font-bold text-[#1a2e23]">{t.camera.complete}</h3>
                <p className="text-sm text-gray-600 italic">"{pendingAnalysis.result.summary}"</p>
                <div className="flex gap-3">
                  <button onClick={() => {onAnalysisComplete(pendingAnalysis.result, pendingAnalysis.image); setPendingAnalysis(null);}} className="flex-1 bg-[#c1a062] text-[#1a2e23] font-bold py-3 rounded-xl">{t.camera.log}</button>
                  <button onClick={() => setPendingAnalysis(null)} className="flex-1 border text-gray-500 font-bold py-3 rounded-xl">{t.camera.discard}</button>
                </div>
              </div>
            </div>
          )}

          {isLiveMode && liveFeedback && !pendingAnalysis && (
            <div className="absolute inset-0 pointer-events-none p-6 z-20">
              <div className="absolute top-4 left-4"><ScoreRing score={liveFeedback.postureScore} label={t.analysis.technique} color="#4ade80" subLabel={t.analysis.metrics.alignment} /></div>
              <div className="absolute top-4 right-4"><ScoreRing score={liveFeedback.contactScore} label={t.analysis.metrics.balance} color="#60a5fa" subLabel={t.analysis.metrics.balance} /></div>
              <div className="flex h-full items-center justify-center">
                <div className="bg-[#c1a062] text-[#1a2e23] font-bold py-4 px-12 rounded-2xl text-2xl animate-pulse">{liveFeedback.alert}</div>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/70 z-40">
              <p className="font-bold text-xl">{t.camera.progress}</p>
            </div>
          )}
        </div>
        
        {isCameraActive && !pendingAnalysis && (
          <div className="p-4 bg-white flex justify-between items-center border-t">
            <button onClick={() => setIsLiveMode(!isLiveMode)} className={`py-3 px-6 rounded-full font-bold ${isLiveMode ? 'bg-red-500 text-white' : 'bg-gray-100 text-[#1a2e23]'}`}>
              {isLiveMode ? t.camera.stopLive : t.camera.startLive}
            </button>
            <button onClick={captureAndAnalyze} disabled={isAnalyzing || isLiveMode} className="bg-[#1a2e23] text-white font-bold py-4 px-12 rounded-full disabled:opacity-50">{t.camera.detailed}</button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
