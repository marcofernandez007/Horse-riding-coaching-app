
import React from 'react';
import { AnalysisResult, UserProfile } from '../types';
import { translations } from '../services/i18n';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  image: string;
  onClose: () => void;
  profile: UserProfile;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, image, onClose, profile }) => {
  const t = translations[profile.language] || translations.English;

  return (
    <div className="animate-fadeIn space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1a2e23]">{t.analysis.title}</h2>
        <button onClick={onClose} className="text-[#c1a062] hover:text-[#b08e50] font-bold transition-colors uppercase tracking-widest text-xs">
          {t.analysis.newBtn} →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={image} alt="Analyzed frame" className="w-full h-auto" />
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
             <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analysis.kinematics}</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>{t.analysis.metrics.elbow}:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.elbowAngleDeg}°</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>{t.analysis.metrics.hip}:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.hipAngleDeg}°</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>{t.analysis.metrics.knee}:</span> <span className="font-bold text-[#1a2e23]">{result.riderFeedback.jointAngles.kneeAngleDeg}°</span></li>
                  <li className="flex justify-between"><span>{t.analysis.metrics.alignment}:</span> <span className="font-bold text-[#c1a062]">{result.riderFeedback.jointAngles.verticalAlignmentScore}/100</span></li>
                </ul>
             </div>
             <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analysis.biomechanics}</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>{t.analysis.metrics.cadence}:</span> <span className="font-bold text-[#1a2e23]">{result.horseFeedback.gaitMetrics.cadenceBpm} BPM</span></li>
                  <li className="flex justify-between border-b border-gray-50 pb-1"><span>{t.analysis.metrics.stride}:</span> <span className="font-bold text-[#1a2e23] uppercase">{result.horseFeedback.gaitMetrics.strideLength}</span></li>
                  <li className="flex justify-between"><span>{t.analysis.metrics.suspension}:</span> <span className="font-bold text-[#c1a062]">{result.horseFeedback.gaitMetrics.suspensionQualityScore}/100</span></li>
                </ul>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#c1a062] mb-3 uppercase tracking-widest text-xs">{t.analysis.summaryHeader}</h3>
            <p className="text-lg leading-relaxed text-[#1a2e23] italic">"{result.summary}"</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a2e23]">{t.analysis.technique}</h3>
              <span className="text-2xl font-bold text-[#c1a062]">{result.riderFeedback.score}%</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <span className="font-bold text-[#1a2e23] block mb-1">{t.analysis.metrics.spine} & {t.analysis.metrics.balance}:</span>
                <p className="text-gray-600 leading-snug">{result.riderFeedback.posture}</p>
                
                <div className="space-y-2 pt-2">
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">{t.analysis.metrics.spine}:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c1a062]" style={{width: `${result.riderFeedback.jointAngles.backCurvatureScore}%`}}></div>
                    </div>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">{t.analysis.metrics.mobility}:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{width: `${result.riderFeedback.jointAngles.spinalMobilityScore}%`}}></div>
                    </div>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400 w-24">{t.analysis.metrics.balance}:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400" style={{width: `${result.riderFeedback.jointAngles.dynamicBalanceScore}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a2e23]">{t.analysis.horsePerformance}</h3>
              <span className="text-2xl font-bold text-[#c1a062]">{result.horseFeedback.score}%</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-[#1a2e23] block mb-1">{t.analysis.metrics.cadence}:</span>
                <p className="text-gray-600 leading-snug">{result.horseFeedback.rhythm}</p>
              </div>
            </div>
          </section>

          <section className="bg-[#1a2e23] text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-[#c1a062]">{t.analysis.drillsHeader}</h3>
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
