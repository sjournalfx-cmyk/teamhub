
import React, { useContext, useState, useMemo, useRef } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { TaskStatus } from '../types';
import { 
  Activity, Zap, TrendingUp, PieChart as PieChartIcon, CheckCircle2, AlertTriangle, Target, RefreshCcw, Cpu, FileText, User as UserIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import ReviewGallery from './ReviewGallery';

const DashboardView: React.FC = () => {
  const { state, openReportModal } = useContext(AppContext);
  const { tasks, users } = state;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const analytics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === TaskStatus.Done).length;
    const stuck = tasks.filter(t => t.status === TaskStatus.Stuck).length;
    const working = tasks.filter(t => t.status === TaskStatus.WorkingOnIt).length;
    const inReview = tasks.filter(t => t.status === TaskStatus.ReadyForReview).length;
    const alignmentRatio = total > 0 ? tasks.filter(t => !!t.goalId).length / total : 0;
    
    const frictionPenalty = total > 0 ? (stuck / total) * 50 : 0;
    const alignmentBonus = alignmentRatio * 50;
    const healthScore = Math.max(0, Math.min(100, (done / Math.max(1, total)) * 20 + alignmentBonus - frictionPenalty + 30));

    const velocityData = [
      { day: 'MON', completed: Math.floor(done * 0.1) + 1 },
      { day: 'TUE', completed: Math.floor(done * 0.2) + 2 },
      { day: 'WED', completed: Math.floor(done * 0.3) + 1 },
      { day: 'THU', completed: Math.floor(done * 0.2) + 4 },
      { day: 'FRI', completed: Math.floor(done * 0.2) + 2 },
    ];

    return { 
      total, done, stuck, working, inReview, healthScore, velocityData,
      alignmentPct: Math.round(alignmentRatio * 100)
    };
  }, [tasks]);

  const statusData = [
    { name: 'DONE', value: analytics.done, color: '#22c55e' },
    { name: 'BLOCKED', value: analytics.stuck, color: '#f43f5e' },
    { name: 'REVIEW', value: analytics.inReview, color: '#06b6d4' },
    { name: 'WORKING', value: analytics.working, color: '#f59e0b' },
  ];

  return (
    <div ref={dashboardRef} className="flex-1 h-full flex flex-col bg-transparent overflow-y-auto custom-scrollbar p-5 md:p-10 relative">
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-20"></div>

      {/* Main Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 glass-layer-2 rounded border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] shrink-0">
            <Cpu size={20} className="text-neon-green" />
          </div>
          <div>
            <h1 className="text-lg md:text-3xl font-black text-white tracking-wide uppercase leading-none">Management Center</h1>
            <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neon-green animate-pulse rounded-full"></span>
              Workspace Stable
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={openReportModal}
            className="tactical-button flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 text-white flex items-center justify-center gap-2 group"
          >
            <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
            <FileText size={16} className="text-neon-cyan" />
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">Generate Report</span>
          </button>
          <button 
            onClick={handleRefresh}
            className={`p-2.5 md:p-4 glass-layer-2 text-slate-500 hover:text-neon-green rounded-sm transition-all shrink-0 ${isRefreshing ? 'animate-spin text-neon-green' : ''}`}
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Live Team Pulse Presence Bar */}
      <div className="relative z-10 mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-4 min-w-max">
          {users.map(user => {
            const activeTask = tasks.find(t => t.assigneeId === user.id && t.status === TaskStatus.WorkingOnIt);
            return (
              <div key={user.id} className="glass-layer-1 p-3 flex items-center gap-3 min-w-[200px] border-l-4 border-l-neon-green/30">
                <div className="relative">
                  <img src={user.avatar} className="w-10 h-10 rounded-sm grayscale group-hover:grayscale-0 border border-white/10" />
                  <div className="absolute -top-1 -right-1 text-xs">{user.statusEmoji || '👤'}</div>
                  {activeTask && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-obsidian-950 animate-pulse"></div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-white uppercase tracking-tight truncate">{user.name.split(' ')[0]}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase truncate">{user.statusText || 'Syncing...'}</div>
                  {activeTask && (
                    <div className="text-[7px] text-neon-cyan font-black uppercase tracking-tighter truncate mt-1 animate-in slide-in-from-left-1">
                      → {activeTask.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReviewGallery />

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
        {[
          { label: 'COMPLETED', val: analytics.done, color: 'text-neon-green', icon: CheckCircle2 },
          { label: 'STUCK', val: analytics.stuck, color: 'text-rose-500', icon: AlertTriangle },
          { label: 'ALIGNED', val: `${analytics.alignmentPct}%`, color: 'text-neon-cyan', icon: Target },
          { label: 'HEALTH', val: `${Math.round(analytics.healthScore)}%`, color: 'text-white', icon: Zap }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-layer-1 p-4 md:p-6 group relative overflow-hidden flex flex-col justify-between aspect-square md:aspect-auto">
             <div className={`p-1.5 md:p-2 rounded bg-white/5 border border-white/10 ${kpi.color} w-fit`}>
                <kpi.icon size={12} className="md:size-14" />
             </div>
             <div>
                <div className={`text-xl md:text-4xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</div>
                <div className="text-[7px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 mb-12">
        <div className="xl:col-span-8 glass-layer-2 p-6 md:p-8 min-h-[300px] md:min-h-[450px]">
           <div className="flex items-center gap-3 mb-6 md:mb-10">
              <TrendingUp size={14} className="text-neon-green md:size-16" />
              <h3 className="text-[9px] md:text-xs font-black uppercase tracking-widest text-white">Velocity Trend</h3>
           </div>
           
           <div className="h-[200px] md:h-[280px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={analytics.velocityData}>
                 <defs>
                   <linearGradient id="neonGreenGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#475569', fontWeight: 800}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 7, fill: '#475569'}} />
                 <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#neonGreenGrad)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-4 glass-layer-2 p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <PieChartIcon size={14} className="text-neon-cyan md:size-16" />
                <h3 className="text-[9px] md:text-xs font-black uppercase tracking-widest text-white">Resource Load</h3>
              </div>
              
              <div className="h-40 md:h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={40} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-lg md:text-xl font-black text-white">{analytics.total}</div>
                        <div className="text-[7px] md:text-[8px] text-slate-500 uppercase font-black">UNITS</div>
                    </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                  {statusData.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] md:text-[10px]">
                          <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                              <span className="font-bold text-slate-400 uppercase">{s.name}</span>
                          </div>
                          <span className="font-black text-white">{s.value}</span>
                      </div>
                  ))}
              </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
