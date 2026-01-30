
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CameraView from './components/CameraView';
import History from './components/History';
import AnalysisDisplay from './components/AnalysisDisplay';
import Settings from './components/Settings';
import TrainingPlanBuilder from './components/TrainingPlanBuilder';
import { AppState, HistoryItem, AnalysisResult, UserProfile } from './types';

const INITIAL_PROFILE: UserProfile = {
  name: 'Jane Doe',
  level: 'Advanced',
  horseName: 'Apollo',
  discipline: 'Dressage',
  goals: 'Mastering the collected trot and maintaining better seat stability during lateral work.'
};

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: '1',
    date: new Date(Date.now()).toISOString(),
    imageUrl: 'https://picsum.photos/seed/horse1/800/600',
    analysis: {
      summary: "Excellent trot rhythm, but watch the rider's seat stability in transitions.",
      riderFeedback: {
        posture: "Head up and looking through the turn. Shoulders slightly tight. Spinal alignment is generally good.",
        postureScore: 82,
        legPosition: "Good heel depth. Leg is quiet and effective.",
        legScore: 85,
        handContact: "Consistent contact, though hands could be slightly more elastic.",
        contactScore: 75,
        score: 81,
        jointAngles: {
          elbowAngleDeg: 105,
          hipAngleDeg: 165,
          kneeAngleDeg: 110,
          verticalAlignmentScore: 88,
          backCurvatureScore: 92,
          // Added missing kinematic scores for initial history item to satisfy AnalysisResult type
          dynamicBalanceScore: 85,
          spinalMobilityScore: 80
        }
      },
      horseFeedback: {
        rhythm: "Clear 2-beat trot with good suspension.",
        rhythmScore: 88,
        engagement: "Hind leg stepping well under the center of mass.",
        engagementScore: 78,
        frame: "In a rounded, healthy frame. Nose slightly behind vertical.",
        frameScore: 74,
        score: 80,
        gaitMetrics: {
          cadenceBpm: 76,
          strideLength: 'working',
          suspensionQualityScore: 85
        }
      },
      drills: ["Transitions within the gait", "Shoulder-in at trot", "Leg yielding"],
      timestamp: new Date().toISOString()
    }
  }
];

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('equiai_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('equiai_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<{result: AnalysisResult, image: string} | null>(null);

  useEffect(() => {
    localStorage.setItem('equiai_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('equiai_profile', JSON.stringify(userProfile));
  }, [userProfile]);

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

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
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
        return <Dashboard history={history} profile={userProfile} />;
      case 'analyze':
        return <CameraView onAnalysisComplete={handleAnalysisComplete} />;
      case 'history':
        return <History history={history} />;
      case 'settings':
        return <Settings profile={userProfile} onUpdate={handleProfileUpdate} />;
      case 'training-plan':
        return <TrainingPlanBuilder profile={userProfile} history={history} />;
      default:
        return <Dashboard history={history} profile={userProfile} />;
    }
  };

  return (
    <Layout activeState={activeState} onNavigate={(state) => {
      setActiveState(state);
      if (state !== 'analyze') setCurrentAnalysis(null);
    }} profile={userProfile}>
      {renderContent()}
    </Layout>
  );
};

export default App;
