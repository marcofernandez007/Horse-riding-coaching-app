
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeEquestrianFrame, getLiveFeedback } from '../services/geminiService';
import { AnalysisResult, LiveFeedback } from '../types';

interface CameraViewProps {
  onAnalysisComplete: (result: AnalysisResult, image: string) => void;
}

const LIVE_COACHING_THROTTLE_MS = 5000; // Analyzes frame every 5 seconds
const BURST_FRAME_COUNT = 12;
const BURST_DURATION_SECONDS = 1.5; // High frequency: 12 frames in 1.5s (~8fps)
const MAX_FILE_SIZE_MB = 50;

/**
 * Helper component for circular score gauges used in the Live HUD
 */
const ScoreRing: React.FC<{ score: number; label: string; color: string; subLabel: string }> = ({ score, label, color, subLabel }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const isCritical = score < 70;

  return (
    <div className={`flex flex-col items-center bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 transition-all duration-500 ${isCritical ? 'animate-ringPulse' : ''}`}>
      <div className="relative w-16 h-16">
        {/* Background Track */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/10"
          />
          {/* Progress Stroke */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
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

const CameraView: React.FC<CameraViewProps> = ({ onAnalysisComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingLive = useRef(false);
  const liveTimeoutRef = useRef<number | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ result: AnalysisResult; image: string } | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Cleanup for video preview URLs
  useEffect(() => {
    return () => {
      if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
    };
  }, [previewVideoUrl]);

  // Load available system voices for dynamic synthesis
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();
  }, []);

  /**
   * Provides dynamic audio feedback with varying pitch, rate, and voice profile.
   */
  const speakFeedback = (
    text: string, 
    category: 'posture' | 'leg' | 'horse' | 'contact' | 'general' = 'general',
    score: number = 100
  ) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voices.length > 0) {
        const isHorseCategory = category === 'horse';
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        const riderVoice = enVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Google')) || enVoices[0];
        const horseVoice = enVoices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Premium')) && v !== riderVoice) || enVoices[1] || enVoices[0];
        
        utterance.voice = isHorseCategory ? horseVoice : riderVoice;
      }

      let pitch = 1.0;
      let rate = 1.0;

      if (score < 65) {
        rate = 1.25; 
        pitch = category === 'horse' ? 1.3 : 0.85; 
      } else if (score < 85) {
        rate = 1.05;
        pitch = 1.0;
      } else {
        rate = 0.9; 
        pitch = 1.1;
      }

      switch (category) {
        case 'posture': pitch *= 0.9; break;
        case 'leg': rate *= 1.15; break;
        case 'horse': pitch *= 1.1; break;
        case 'contact': rate *= 0.85; break;
      }
      
      utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));
      utterance.rate = Math.max(0.5, Math.min(2.0, rate));
      
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
      setError('Could not access camera. Please ensure permissions are granted in your browser settings.');
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

  const runLiveCoachingStep = useCallback(async () => {
    if (isProcessingLive.current || !isLiveMode || !isCameraActive || pendingAnalysis) return;
    
    const imageData = captureFrame();
    if (!imageData) return;

    isProcessingLive.current = true;
    try {
      const feedback = await getLiveFeedback(imageData);
      setLiveFeedback(feedback);
      
      if (feedback.alert) {
        const scores = [
          { category: 'posture' as const, val: feedback.postureScore },
          { category: 'contact' as const, val: feedback.contactScore },
          { category: 'leg' as const, val: feedback.legScore },
          { category: 'horse' as const, val: feedback.carriageScore },
        ];
        
        const priorityIssue = scores.reduce((prev, curr) => (prev.val < curr.val) ? prev : curr);
        const category = priorityIssue.val < 85 ? priorityIssue.category : 'general';
        speakFeedback(feedback.alert, category, priorityIssue.val);
      }
    } catch (err) {
      console.error("Live feedback error:", err);
    } finally {
      isProcessingLive.current = false;
      if (isLiveMode) {
        liveTimeoutRef.current = window.setTimeout(runLiveCoachingStep, LIVE_COACHING_THROTTLE_MS);
      }
    }
  }, [captureFrame, isLiveMode, isCameraActive, pendingAnalysis]);

  useEffect(() => {
    if (isLiveMode && isCameraActive && !pendingAnalysis) {
      runLiveCoachingStep();
    } else {
      if (liveTimeoutRef.current) {
        window.clearTimeout(liveTimeoutRef.current);
        liveTimeoutRef.current = null;
      }
      isProcessingLive.current = false;
      setLiveFeedback(null);
    }
    return () => {
      if (liveTimeoutRef.current) window.clearTimeout(liveTimeoutRef.current);
    };
  }, [isLiveMode, isCameraActive, pendingAnalysis, runLiveCoachingStep]);

  const captureAndAnalyze = async () => {
    if (isAnalyzing) return;
    const imageData = captureFrame();
    if (!imageData) return;
    
    setIsAnalyzing(true);
    setIsLiveMode(false);
    try {
      const result = await analyzeEquestrianFrame(imageData);
      setPendingAnalysis({ result, image: imageData });
      
      const avgScore = Math.round((result.riderFeedback.score + result.horseFeedback.score) / 2);
      speakFeedback(`Analysis complete. Overall score ${avgScore} percent. ${result.drills[0] || ''}`, 'general', avgScore);
    } catch (err: any) {
      setError(err.message || 'Detailed analysis failed. Please try a different frame or check your connection.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSession = () => {
    if (pendingAnalysis) {
      onAnalysisComplete(pendingAnalysis.result, pendingAnalysis.image);
      setPendingAnalysis(null);
      if (previewVideoUrl) {
        URL.revokeObjectURL(previewVideoUrl);
        setPreviewVideoUrl(null);
      }
    }
  };

  const handleDiscard = () => {
    setPendingAnalysis(null);
    if (previewVideoUrl) {
      URL.revokeObjectURL(previewVideoUrl);
      setPreviewVideoUrl(null);
    }
  };

  const extractBurstFrames = (file: File, frameCount: number = BURST_FRAME_COUNT): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      const frames: string[] = [];
      let currentFrameIdx = 0;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (!duration || isNaN(duration)) {
          reject(new Error("Video duration is invalid. The file might be corrupted."));
          return;
        }

        const startTime = Math.max(0, (duration / 2) - (BURST_DURATION_SECONDS / 2));
        
        const seekToNextFrame = () => {
          if (currentFrameIdx >= frameCount) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }
          const timestamp = startTime + (BURST_DURATION_SECONDS / frameCount) * currentFrameIdx;
          video.currentTime = Math.min(duration - 0.1, timestamp);
        };

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            frames.push(dataUrl);
            currentFrameIdx++;
            seekToNextFrame();
          } else {
            reject(new Error('Internal processing error: Failed to create rendering context.'));
          }
        };
        seekToNextFrame();
      };
      
      video.onerror = () => {
        reject(new Error(`The video file "${file.name}" could not be loaded. It may be in an unsupported format or corrupted.`));
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPendingAnalysis(null);
    if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);

    // Initial validation
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please upload a clip under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError(`Unsupported file type: ${file.type || 'unknown'}. Please upload a common video (MP4, MOV) or image (JPG, PNG) format.`);
      return;
    }

    setIsAnalyzing(true);
    setIsLiveMode(false);

    try {
      if (isVideo) {
        // Create preview URL for the main player
        const url = URL.createObjectURL(file);
        setPreviewVideoUrl(url);

        const frames = await extractBurstFrames(file, BURST_FRAME_COUNT);
        if (frames.length === 0) throw new Error("Could not extract any frames from the video. Please try a different file.");
        
        const result = await analyzeEquestrianFrame(frames);
        setPendingAnalysis({ result, image: frames[Math.floor(frames.length / 2)] });
        const avgScore = Math.round((result.riderFeedback.score + result.horseFeedback.score) / 2);
        speakFeedback(`Video burst audit complete. Performance score ${avgScore} percent.`, 'general', avgScore);
      } else {
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(file);
        });
        const result = await analyzeEquestrianFrame(imageData);
        setPendingAnalysis({ result, image: imageData });
      }
    } catch (err: any) {
      setError(err.message || 'Biomechanical audit failed. Please ensure the video has clear visibility of both horse and rider.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative">
        <div className="aspect-video bg-black relative overflow-hidden">
          {/* Main Viewport Logic */}
          {isAnalyzing && previewVideoUrl ? (
            <video 
              src={previewVideoUrl} 
              controls 
              className="w-full h-full object-contain"
            />
          ) : !pendingAnalysis ? (
            <>
              {!isCameraActive && !isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 z-10">
                  <p className="text-lg opacity-80 text-center px-4">Camera is inactive</p>
                  <button 
                    onClick={startCamera}
                    className="bg-[#c1a062] hover:bg-[#b08e50] text-[#1a2e23] font-bold py-3 px-8 rounded-full transition-all shadow-lg"
                  >
                    Launch Live Coach
                  </button>
                  <div className="text-sm opacity-60">or</div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 py-2 px-6 rounded-full transition-all border border-white/20">
                    Upload Performance (Photo/Video)
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
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
            </>
          ) : (
            <img src={pendingAnalysis.image} className="w-full h-full object-cover" alt="Captured" />
          )}

          {/* Analysis Overlay (Post-Capture) */}
          {pendingAnalysis && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-30 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a2e23]">Burst Motion Analysis</h3>
                    <p className="text-xs text-[#c1a062] font-bold uppercase tracking-wider">Temporal Biomechanical Audit</p>
                  </div>
                  <div className="bg-[#1a2e23] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Score: {Math.round((pendingAnalysis.result.riderFeedback.score + pendingAnalysis.result.horseFeedback.score) / 2)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 italic leading-relaxed">"{pendingAnalysis.result.summary}"</p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Rider Score</div>
                    <div className="text-xl font-bold text-[#c1a062]">{pendingAnalysis.result.riderFeedback.score}%</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Horse Score</div>
                    <div className="text-xl font-bold text-[#1a2e23]">{pendingAnalysis.result.horseFeedback.score}%</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleSaveSession}
                    className="flex-1 bg-[#c1a062] hover:bg-[#b08e50] text-[#1a2e23] font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Log Session</span>
                  </button>
                  <button 
                    onClick={handleDiscard}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold py-3 rounded-xl transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Coaching HUD - Enhanced with Integrated Gauges */}
          {isLiveMode && liveFeedback && !pendingAnalysis && (
            <div className="absolute inset-0 pointer-events-none flex flex-col p-6 animate-fadeIn z-20">
              {/* Dynamic Score HUD (Corners) */}
              <div className="absolute top-4 left-4">
                <ScoreRing 
                  score={liveFeedback.postureScore} 
                  label="Posture" 
                  color="#4ade80" 
                  subLabel="Alignment" 
                />
              </div>
              <div className="absolute top-4 right-4">
                <ScoreRing 
                  score={liveFeedback.contactScore} 
                  label="Contact" 
                  color="#60a5fa" 
                  subLabel="Elasticity" 
                />
              </div>
              <div className="absolute bottom-4 left-4">
                <ScoreRing 
                  score={liveFeedback.legScore} 
                  label="Leg Pos" 
                  color="#facc15" 
                  subLabel="Stability" 
                />
              </div>
              <div className="absolute bottom-4 right-4">
                <ScoreRing 
                  score={liveFeedback.carriageScore} 
                  label="Carriage" 
                  color="#c084fc" 
                  subLabel="Frame" 
                />
              </div>

              {/* Coaching Alert - Floating Center */}
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-[#c1a062] text-[#1a2e23] font-bold py-4 px-12 rounded-2xl text-2xl shadow-[0_0_50px_rgba(193,160,98,0.3)] border-2 border-white/20 animate-pulse text-center max-w-md pointer-events-auto">
                  <span className="text-[10px] block uppercase tracking-widest text-[#1a2e23]/60 mb-1">Live Coaching Command</span>
                  {liveFeedback.alert}
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c1a062]/5 to-transparent h-1/4 animate-scan pointer-events-none"></div>
            </div>
          )}
          
          {/* Analysis Loading Overlay */}
          {isAnalyzing && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-white z-40 transition-colors duration-500 ${previewVideoUrl ? 'bg-black/40 pointer-events-none' : 'bg-black/70'}`}>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c1a062] border-t-transparent mb-4 shadow-[0_0_20px_rgba(193,160,98,0.4)]"></div>
              <div className="bg-black/60 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center pointer-events-auto">
                <p className="font-bold text-xl animate-pulse text-center tracking-tight">AI Coaching in Progress...</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#c1a062] mt-1">Deep Biomechanical Scan</p>
                {previewVideoUrl && (
                  <p className="text-[10px] opacity-60 mt-3 italic">You can scrub through the footage while we analyze</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Controls Bar */}
        {isCameraActive && !pendingAnalysis && (
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
                <span>{isLiveMode ? 'Pause Audio Coach' : 'Resume Audio Coach'}</span>
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
            
            <div className="text-xs text-gray-400 max-w-[200px] text-center md:text-right font-medium">
              {isLiveMode ? `Biomechanical scan every ${LIVE_COACHING_THROTTLE_MS/1000}s.` : "Detailed mode provides a comprehensive kinematic report."}
            </div>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">Process Error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-lg hover:opacity-70 ml-4">&times;</button>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes ringPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 0 rgba(239, 68, 68, 0.2); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-ringPulse {
          animation: ringPulse 2s infinite ease-in-out;
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CameraView;
