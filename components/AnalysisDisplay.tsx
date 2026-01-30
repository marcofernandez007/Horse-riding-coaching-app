
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
        <button onClick={onClose} className="text-gray-500 hover:text-black">New Analysis →</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual Frame */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={image} alt="Analyzed frame" className="w-full h-auto" />
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
              <div>
                <span className="font-bold text-[#1a2e23]">Posture:</span> {result.riderFeedback.posture}
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
              <span className="text-2xl font-bold text-[#1a2e23]">{result.horseFeedback.score}%</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="font-bold text-[#1a2e23]">Rhythm:</span> {result.horseFeedback.rhythm}
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Engagement:</span> {result.horseFeedback.engagement}
              </div>
              <div>
                <span className="font-bold text-[#1a2e23]">Frame:</span> {result.horseFeedback.frame}
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
