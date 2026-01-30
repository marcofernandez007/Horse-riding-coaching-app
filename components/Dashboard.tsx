
import React from 'react';
import { HistoryItem, UserProfile } from '../types';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface DashboardProps {
  history: HistoryItem[];
  profile: UserProfile;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 outline-none animate-fadeIn">
        <p className="text-[10px] font-bold text-[#c1a062] uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs font-medium text-gray-600">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-[#1a2e23]">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ history, profile }) => {
  // Get last 5 sessions for detailed visualization
  const lastFive = [...history].slice(0, 5).reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rider: h.analysis.riderFeedback.score,
    horse: h.analysis.horseFeedback.score,
    posture: h.analysis.riderFeedback.postureScore || 0,
    leg: h.analysis.riderFeedback.legScore || 0,
    contact: h.analysis.riderFeedback.contactScore || 0,
    rhythm: h.analysis.horseFeedback.rhythmScore || 0,
    engagement: h.analysis.horseFeedback.engagementScore || 0,
  }));

  const lastAnalysis = history[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1a2e23]">Rider Overview</h2>
          <p className="text-gray-500">Welcome back, {profile.name.split(' ')[0]}. Here's your performance summary.</p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c1a062]">Current Status</span>
          <p className="text-xl font-bold text-[#1a2e23]">{profile.level} • {profile.discipline}</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">Session Average</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">
              {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + (curr.analysis.riderFeedback.score + curr.analysis.horseFeedback.score)/2, 0) / history.length) : 0}%
            </p>
            <span className="text-green-500 text-sm font-bold mb-1">+4%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">Active Horse</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">{profile.horseName}</p>
            <span className="text-gray-500 text-sm mb-1">Primary</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">Progress Index</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">Elite</p>
            <span className="text-green-500 text-sm font-bold mb-1">On Track</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Progress Chart: Last 5 Sessions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1a2e23]">Last 5 Sessions</h3>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Performance Comparison</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lastFive}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Bar dataKey="rider" fill="#c1a062" name="Rider Total Score" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="horse" fill="#1a2e23" name="Horse Total Score" radius={[4, 4, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="rider" stroke="#c1a062" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="horse" stroke="#1a2e23" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: Biomechanical Trends (Technique Focus) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1a2e23]">Technique Trends</h3>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Rider Interface Metrics</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lastFive}>
                <defs>
                  <linearGradient id="colorLeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1a062" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#c1a062" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorContact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ca493" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8ca493" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Area type="monotone" dataKey="leg" stroke="#c1a062" fillOpacity={1} fill="url(#colorLeg)" name="Leg Position Score" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="contact" stroke="#8ca493" fillOpacity={1} fill="url(#colorContact)" name="Hand Contact Score" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="posture" stroke="#1a2e23" strokeWidth={1.5} dot={{ r: 3, fill: '#1a2e23', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} name="Rider Posture Score" />
                <Line type="monotone" dataKey="rhythm" stroke="#5a7a66" strokeWidth={1.5} dot={{ r: 3, fill: '#5a7a66', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} name="Horse Rhythm Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-[#c1a062] uppercase">Posture</span>
                  <p className="text-sm font-bold">{lastAnalysis.analysis.riderFeedback.postureScore}%</p>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-[#c1a062] uppercase">Leg Pos</span>
                  <p className="text-sm font-bold">{lastAnalysis.analysis.riderFeedback.legScore}%</p>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-[#1a2e23] uppercase">Rhythm</span>
                  <p className="text-sm font-bold">{lastAnalysis.analysis.horseFeedback.rhythmScore}%</p>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-[#1a2e23] uppercase">Engage</span>
                  <p className="text-sm font-bold">{lastAnalysis.analysis.horseFeedback.engagementScore}%</p>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recommended Drill</span>
                <p className="text-sm font-medium text-[#1a2e23]">{lastAnalysis.analysis.drills[0]}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
