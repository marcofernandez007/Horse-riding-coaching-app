
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CameraView from './components/CameraView';
import History from './components/History';
import AnalysisDisplay from './components/AnalysisDisplay';
import { AppState, HistoryItem, AnalysisResult } from './types';

// Mock initial data
const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    imageUrl: 'https://picsum.photos/seed/horse1/800/600',
    analysis: {
      summary: "Excellent trot rhythm, but watch the rider's seat stability in transitions.",
      riderFeedback: {
        posture: "Head up and looking through the turn. Shoulders slightly tight.",
        legPosition: "Good heel depth. Leg is quiet and effective.",
        handContact: "Consistent contact, though hands could be slightly more elastic.",
        score: 78
      },
      horseFeedback: {
        rhythm: "Clear 2-beat trot with good suspension.",
        engagement: "Hind leg stepping well under the center of mass.",
        frame: "In a rounded, healthy frame. Nose slightly behind vertical.",
        score: 82
      },
      drills: ["Transitions within the gait", "Shoulder-in at trot", "Leg yielding"],
      timestamp: new Date().toISOString()
    }
  }
];

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [currentAnalysis, setCurrentAnalysis] = useState<{result: AnalysisResult, image: string} | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult, image: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      imageUrl: image,
      analysis: result
    };
    
    setHistory(prev => [newItem, ...prev]);
    setCurrentAnalysis({ result, image });
  };

  const renderContent = () => {
    if (currentAnalysis && activeState === 'analyze') {
      return (
        <AnalysisDisplay 
          result={currentAnalysis.result} 
          image={currentAnalysis.image} 
          onClose={() => setCurrentAnalysis(null)} 
        />
      );
    }

    switch (activeState) {
      case 'dashboard':
        return <Dashboard history={history} />;
      case 'analyze':
        return <CameraView onAnalysisComplete={handleAnalysisComplete} />;
      case 'history':
        return <History history={history} />;
      case 'training-plan':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-[#1a2e23]">Custom Training Plan</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 italic mb-6">Based on your last 5 sessions, we recommend focusing on lateral engagement and rider core stability.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-[#c1a062] border-b pb-2">Weekly Goal</h4>
                  <p className="text-gray-700">Consistency in the contact and engagement of the hindquarter through 10-meter circles.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-[#c1a062] border-b pb-2">Key Drills</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    <li>Spiral-in/Spiral-out circles</li>
                    <li>Serpentines with emphasis on bend</li>
                    <li>Transitions at the letter</li>
                    <li>Seat-only halts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard history={history} />;
    }
  };

  return (
    <Layout activeState={activeState} onNavigate={(state) => {
      setActiveState(state);
      if (state !== 'analyze') setCurrentAnalysis(null);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
