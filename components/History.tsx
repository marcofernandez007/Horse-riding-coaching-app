
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No training sessions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1a2e23]">Training Log</h2>
      <div className="grid gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0">
              <img src={item.imageUrl} className="w-full h-full object-cover" alt="Session" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-[#1a2e23]">{new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Summary</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#1a2e23] text-white text-xs font-bold">
                    Avg Score: {Math.round((item.analysis.riderFeedback.score + item.analysis.horseFeedback.score) / 2)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                {item.analysis.summary}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#c1a062] uppercase">Posture</span>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c1a062]" style={{ width: `${item.analysis.riderFeedback.score}%` }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#c1a062] uppercase">Engagement</span>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a2e23]" style={{ width: `${item.analysis.horseFeedback.score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
