
import React from 'react';
import { HistoryItem } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  history: HistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const chartData = [...history].reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rider: h.analysis.riderFeedback.score,
    horse: h.analysis.horseFeedback.score,
  }));

  const lastAnalysis = history[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#1a2e23]">Rider Overview</h2>
          <p className="text-gray-500">Welcome back, Jane. Here's your performance summary.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c1a062]">Current Level</span>
          <p className="text-xl font-bold text-[#1a2e23]">Novice Advanced</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-medium">Session Average</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">72%</p>
            <span className="text-green-500 text-sm font-bold mb-1">+4%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-medium">Monthly Drills</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">24</p>
            <span className="text-gray-500 text-sm mb-1">/ 30 goal</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-medium">Horse Health Index</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">94</p>
            <span className="text-green-500 text-sm font-bold mb-1">Optimal</span>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-[#1a2e23]">Progress History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="rider" stroke="#c1a062" strokeWidth={3} name="Rider Score" />
              <Line type="monotone" dataKey="horse" stroke="#1a2e23" strokeWidth={3} name="Horse Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analysis Peek */}
      {lastAnalysis && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-[#1a2e23]">Latest Feedback</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden">
              <img src={lastAnalysis.imageUrl} className="w-full h-full object-cover" alt="Latest" />
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-gray-600 italic">"{lastAnalysis.analysis.summary}"</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-xs font-bold text-[#c1a062] uppercase">Key Focus</span>
                  <p className="text-sm font-medium">{lastAnalysis.analysis.drills[0]}</p>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-xs font-bold text-[#c1a062] uppercase">Rider Score</span>
                  <p className="text-sm font-medium">{lastAnalysis.analysis.riderFeedback.score}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
