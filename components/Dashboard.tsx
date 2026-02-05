
import React from 'react';
import { HistoryItem, UserProfile } from '../types';
import { translations } from '../services/i18n';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Area,
  LineChart,
  BarChart
} from 'recharts';

interface DashboardProps {
  history: HistoryItem[];
  profile: UserProfile;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 outline-none animate-fadeIn z-50">
        <p className="text-[10px] font-bold text-[#c1a062] uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
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
  const t = translations[profile.language] || translations.English;
  
  const lastFive = [...history].slice(0, 5).reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    rider: h.analysis.riderFeedback.score,
    horse: h.analysis.horseFeedback.score,
    posture: h.analysis.riderFeedback.jointAngles.backCurvatureScore || 0,
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
          <h2 className="text-3xl font-bold text-[#1a2e23]">{t.dashboard.title}</h2>
          <p className="text-gray-500">{t.dashboard.welcome}, {profile.name.split(' ')[0]}. {t.dashboard.summary}</p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c1a062]">{t.dashboard.status}</span>
          <p className="text-xl font-bold text-[#1a2e23]">{profile.level} • {profile.discipline}</p>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">{t.dashboard.avg}</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">
              {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + (curr.analysis.riderFeedback.score + curr.analysis.horseFeedback.score)/2, 0) / history.length) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">{t.dashboard.horse}</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">{profile.horseName}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-tight">{t.dashboard.progress}</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-3xl font-bold text-[#1a2e23]">Elite</p>
          </div>
        </div>
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Combined Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1a2e23]">{t.dashboard.last5}</h3>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">{t.dashboard.comparison}</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lastFive}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="rider" name={t.analysis.technique} stroke="#c1a062" strokeWidth={3} fillOpacity={1} fill="url(#colorRider)" />
                <Area type="monotone" dataKey="horse" name={t.analysis.horsePerformance} stroke="#1a2e23" strokeWidth={3} fillOpacity={1} fill="url(#colorHorse)" />
                <defs>
                  <linearGradient id="colorRider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1a062" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#c1a062" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHorse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a2e23" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1a2e23" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Feedback Quick View */}
        <div className="space-y-6">
           {lastAnalysis && (
             <div className="bg-[#1a2e23] text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group h-full flex flex-col justify-center">
               <div className="relative z-10">
                 <h3 className="text-xs font-bold text-[#c1a062] uppercase tracking-widest mb-4">{t.dashboard.feedback}</h3>
                 <p className="text-xl serif italic mb-8 leading-relaxed">"{lastAnalysis.analysis.summary}"</p>
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-full bg-[#c1a062]/20 flex items-center justify-center border border-[#c1a062]/30">
                     <svg className="w-6 h-6 text-[#c1a062]" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path></svg>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-[#c1a062] uppercase tracking-widest">{t.dashboard.drill}</p>
                     <p className="font-bold text-sm md:text-base">{lastAnalysis.analysis.drills[0]}</p>
                   </div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#c1a062]/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-[#c1a062]/10 transition-colors"></div>
             </div>
           )}
        </div>
      </div>

      {/* Secondary Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Granular Rider & Horse Metrics Evolution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-[#1a2e23]">{t.dashboard.trends}</h3>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Biomechanical Evolution</span>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={lastFive}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                 <YAxis domain={[0, 100]} hide />
                 <Tooltip content={<CustomTooltip />} />
                 <Legend iconType="plainline" iconSize={12} wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                 <Line type="monotone" dataKey="posture" name={t.analysis.metrics.spine} stroke="#c1a062" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                 <Line type="monotone" dataKey="leg" name={t.analysis.metrics.knee} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}} />
                 <Line type="monotone" dataKey="rhythm" name={t.analysis.metrics.cadence} stroke="#1a2e23" strokeWidth={2} dot={{r: 3}} />
                 <Line type="monotone" dataKey="engagement" name={t.analysis.biomechanics} stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{r: 3}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Technique Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1a2e23]">Attribute Distribution</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Technique Audit</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lastFive}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
                <Legend iconType="rect" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                <Bar dataKey="contact" name={t.analysis.metrics.balance} fill="#c1a062" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engagement" name={t.analysis.metrics.engagement || t.analysis.biomechanics} fill="#1a2e23" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
