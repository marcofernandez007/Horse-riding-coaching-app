
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  image: string;
  onClose: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, image, onClose }) => {
  return (
    <div className="animate-fadeIn space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1a2e23]">Session Analysis</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black font-medium transition-colors">New Analysis →</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual Frame & Kinematic Quick Stats */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={image} alt="Analyzed frame" className="w-full h-auto" />
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
             <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rider Kinematics</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>Elbow:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.elbowAngleDeg}°</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>Hip:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.hipAngleDeg}°</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>Knee:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.kneeAngleDeg}°</span></li>
                  <li className="flex justify-between"><span>Alignment:</span> <span className="font-bold text-[#c1a062]">{result.riderFeedback.jointAngles.verticalAlignmentScore}/100</span></li>
                </ul>
             </div>
             <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Horse Biomechanics</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>Cadence:</span> <span className="font-bold text-[#1a2e23]">{result.horseFeedback.gaitMetrics.cadenceBpm} BPM</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>Stride:</span> <span className="font-bold text-[#1a2e23] uppercase">{result.horseFeedback.gaitMetrics.strideLength}</span></li>
                  <li className="flex justify-between"><span>Suspension:</span> <span className="font-bold text-[#c1a062]">{result.horseFeedback.gaitMetrics.suspensionQualityScore}/100</span></li>
                </ul>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#c1a062] mb-3 uppercase tracking-widest text-xs">Coach's Summary</h3>
            <p className="text-lg leading-relaxed text-[#1a2e23] italic">"{result.summary}"</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          {/* Rider Breakdown */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a2e23]">Rider Technique</h3>
              <span className="text-2xl font-bold text-[#c1a062]">{result.riderFeedback.score}%</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <span className="font-bold text-[#1a2e23] block mb-1">Posture & Dynamic Stability:</span>
                <p className="text-gray-600 leading-snug">{result.riderFeedback.posture}</p>
                
                <div className="space-y-2 pt-2">
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">Neutral Spine:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c1a062]" style={{width: `${result.riderFeedback.jointAngles.backCurvatureScore}%`}}></div>
                    </div>
                    <span className="font-mono w-8 text-right">{result.riderFeedback.jointAngles.backCurvatureScore}%</span>
                  </div>

                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">Spinal Mobility:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{width: `${result.riderFeedback.jointAngles.spinalMobilityScore}%`}}></div>
                    </div>
                    <span className="font-mono w-8 text-right">{result.riderFeedback.jointAngles.spinalMobilityScore}%</span>
                  </div>

                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">Dynamic Balance:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400" style={{width: `${result.riderFeedback.jointAngles.dynamicBalanceScore}%`}}></div>
                    </div>
                    <span className="font-mono w-8 text-right">{result.riderFeedback.jointAngles.dynamicBalanceScore}%</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Leg Position:</span> {result.riderFeedback.legPosition}
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Contact:</span> {result.riderFeedback.handContact}
              </div>
            </div>
          </section>

          {/* Horse Breakdown */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a2e23]">Horse Performance</h3>
              <span className="text-2xl font-bold text-[#c1a062]">{result.horseFeedback.score}%</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-[#1a2e23] block mb-1">Rhythm & Mechanics:</span>
                <p className="text-gray-600 leading-snug">{result.horseFeedback.rhythm}</p>
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Engagement:</span> {result.horseFeedback.engagement}
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Frame & Carriage:</span> {result.horseFeedback.frame}
              </div>
            </div>
          </section>

          {/* Drills */}
          <section className="bg-[#1a2e23] text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-[#c1a062]">Recommended Drills</h3>
            <ul className="space-y-3">
              {result.drills.map((drill, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#c1a062] flex items-center justify-center text-[#1a2e23] text-xs font-bold shrink-0">{idx + 1}</span>
                  <span className="text-sm opacity-90">{drill}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
