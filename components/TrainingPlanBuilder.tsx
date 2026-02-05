
import React, { useState } from 'react';
import { UserProfile, HistoryItem } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { translations } from '../services/i18n';

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
  const t = translations[profile.language] || translations.English;
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

  if (generatedPlan) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#1a2e23]">{t.plan.daily}</h2>
          <button onClick={() => {setGeneratedPlan(null); setSelectedDrills([]);}} className="text-sm font-bold text-[#c1a062] uppercase">{t.plan.new}</button>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 whitespace-pre-wrap text-gray-700 leading-relaxed">
          <h3 className="text-xl font-bold text-[#1a2e23] mb-4">{t.plan.session} {profile.horseName}</h3>
          {generatedPlan}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#1a2e23]">{t.plan.title}</h2>
        <p className="text-gray-500">{t.plan.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_DRILLS.map((drill) => {
            const isSelected = selectedDrills.includes(drill.id);
            return (
              <button key={drill.id} onClick={() => toggleDrill(drill.id)} className={`text-left p-5 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#c1a062] bg-[#c1a062]/5' : 'border-transparent bg-white'}`}>
                <h4 className="font-bold text-[#1a2e23] text-lg">{drill.name}</h4>
                <p className="text-sm text-gray-500">{drill.description}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8 h-fit">
          <h3 className="font-bold text-lg text-[#1a2e23] mb-4">{t.plan.focus}</h3>
          <div className="space-y-3 mb-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.plan.selected} ({selectedDrills.length}/5)</span>
            {selectedDrills.map(id => (
              <div key={id} className="flex justify-between text-sm py-1 border-b">
                <span>{AVAILABLE_DRILLS.find(d => d.id === id)?.name}</span>
                <button onClick={() => toggleDrill(id)} className="text-gray-300">&times;</button>
              </div>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={selectedDrills.length === 0 || isGenerating} className="w-full bg-[#1a2e23] text-white font-bold py-4 rounded-2xl disabled:opacity-30">
            {isGenerating ? t.plan.generating : t.plan.build}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanBuilder;
