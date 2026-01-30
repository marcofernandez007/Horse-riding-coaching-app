
import React, { useState } from 'react';
import { UserProfile, HistoryItem, AnalysisResult } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

interface TrainingPlanBuilderProps {
  profile: UserProfile;
  history: HistoryItem[];
}

interface Drill {
  id: string;
  name: string;
  category: 'Dressage' | 'Jumping' | 'Biomechanics' | 'Groundwork';
  description: string;
}

const AVAILABLE_DRILLS: Drill[] = [
  { id: '1', name: 'Shoulder-In', category: 'Dressage', description: 'Lateral movement to improve engagement and suppleness.' },
  { id: '2', name: 'Leg Yield', category: 'Dressage', description: 'Moves horse sideways and forward to improve responsiveness.' },
  { id: '3', name: 'Spiral-In Circles', category: 'Dressage', description: 'Developing collection and inside leg to outside rein.' },
  { id: '4', name: 'Gridwork Basics', category: 'Jumping', description: 'Bounce and one-stride fences to improve horse agility.' },
  { id: '5', name: 'Bending Lines', category: 'Jumping', description: 'Mastering the line between two fences.' },
  { id: '6', name: 'Striding Variations', category: 'Jumping', description: 'Changing stride count in a related distance.' },
  { id: '7', name: 'Neutral Spine Focus', category: 'Biomechanics', description: 'Rider core stability and alignment exercises.' },
  { id: '8', name: 'Hand Elasticity', category: 'Biomechanics', description: 'Developing a soft, follow-through contact.' },
  { id: '9', name: 'Quiet Leg', category: 'Biomechanics', description: 'Stabilizing the lower leg at all gaits.' },
  { id: '10', name: 'In-Hand Transitions', category: 'Groundwork', description: 'Focusing on responsiveness from the ground.' },
];

const TrainingPlanBuilder: React.FC<TrainingPlanBuilderProps> = ({ profile, history }) => {
  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const lastAnalysis = history.length > 0 ? history[0].analysis : null;

  const toggleDrill = (id: string) => {
    setSelectedDrills(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleGenerate = async () => {
    if (selectedDrills.length === 0) return;
    setIsGenerating(true);
    try {
      const drills = AVAILABLE_DRILLS.filter(d => selectedDrills.includes(d.id)).map(d => d.name);
      const plan = await generateWorkoutPlan(profile, lastAnalysis, drills);
      setGeneratedPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetBuilder = () => {
    setGeneratedPlan(null);
    setSelectedDrills([]);
  };

  if (generatedPlan) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#1a2e23]">Daily Training Routine</h2>
          <button 
            onClick={resetBuilder}
            className="text-sm font-bold text-[#c1a062] uppercase tracking-wider hover:opacity-70 transition-all"
          >
            Create New Plan
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 prose prose-slate max-w-none">
          <div className="flex items-center space-x-4 mb-8 not-prose">
            <div className="bg-[#1a2e23] text-[#c1a062] p-3 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a2e23]">Session for {profile.horseName}</h3>
              <p className="text-gray-500 text-sm">Personalized AI Routine • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-normal">
            {generatedPlan}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#1a2e23]">Routine Builder</h2>
        <p className="text-gray-500">Pick up to 5 drills to generate a personalized workout for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_DRILLS.map((drill) => {
              const isSelected = selectedDrills.includes(drill.id);
              return (
                <button
                  key={drill.id}
                  onClick={() => toggleDrill(drill.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between group ${
                    isSelected 
                    ? 'border-[#c1a062] bg-[#c1a062]/5 shadow-sm' 
                    : 'border-transparent bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      drill.category === 'Dressage' ? 'bg-blue-50 text-blue-600' :
                      drill.category === 'Jumping' ? 'bg-orange-50 text-orange-600' :
                      drill.category === 'Biomechanics' ? 'bg-purple-50 text-purple-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {drill.category}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#c1a062] flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-[#1a2e23] text-lg">{drill.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{drill.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="font-bold text-lg text-[#1a2e23] mb-4">Today's Focus</h3>
            
            {lastAnalysis && (
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-[#c1a062] uppercase tracking-widest">From Last Session</span>
                <p className="text-xs text-gray-600 mt-1 italic">"{lastAnalysis.summary}"</p>
              </div>
            )}

            <div className="space-y-3 mb-8 min-h-[100px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Items ({selectedDrills.length}/5)</span>
              {selectedDrills.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No drills selected yet.</p>
              ) : (
                selectedDrills.map(id => {
                  const drill = AVAILABLE_DRILLS.find(d => d.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="font-medium text-[#1a2e23]">{drill?.name}</span>
                      <button onClick={() => toggleDrill(id)} className="text-gray-300 hover:text-red-400">&times;</button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedDrills.length === 0 || isGenerating}
              className="w-full bg-[#1a2e23] hover:bg-[#253f31] text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-[#c1a062]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span>Build Routine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanBuilder;
