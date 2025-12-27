
import React, { useContext, useState } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { 
  Target, 
  CheckCircle2, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar,
  Clock
} from 'lucide-react';
import { Goal, TaskStatus } from '../types';

const GoalTreeVisualization: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
       <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-neon-green/10 animate-pulse-glow"></div>
       <div className="absolute top-3/4 right-1/4 w-48 h-48 rounded-full border border-white/5 animate-pulse-glow delay-1000"></div>
       
       <svg className="w-full h-full">
         <defs>
           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/5" />
           </pattern>
         </defs>
         <rect width="100%" height="100%" fill="url(#grid)" />
       </svg>
    </div>
  );
};

const GoalTree: React.FC = () => {
  const { state, openGoalModal, deleteGoal, updateGoal } = useContext(AppContext);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const toggleMilestone = (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    
    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const progress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100) 
      : goal.progress;

    updateGoal({
      ...goal,
      milestones: updatedMilestones,
      progress
    });
  };

  const getGoalHealth = (goal: Goal) => {
    if (goal.progress >= 75) return { label: 'Optimal', color: 'text-emerald-400', border: 'border-emerald-500/20' };
    if (goal.progress >= 25) return { label: 'Degraded', color: 'text-amber-400', border: 'border-amber-500/20' };
    return { label: 'Critical', color: 'text-rose-400', border: 'border-rose-500/20' };
  };

  const handleDeleteGoal = (goal: Goal) => {
    if (window.confirm(`CONFIRM DELETION: Goal objective "${goal.title}" will be terminated. All linked tactical units will lose alignment.`)) {
      deleteGoal(goal.id);
      setOpenMenuId(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    openGoalModal(goal);
    setOpenMenuId(null);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getTMinus = (timestamp?: number) => {
      if (!timestamp) return null;
      const diff = timestamp - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return { text: `OVERDUE ${Math.abs(days)}D`, color: 'text-rose-500' };
      if (days === 0) return { text: 'D-DAY', color: 'text-amber-500 animate-pulse' };
      return { text: `T-MINUS ${days}D`, color: 'text-neon-cyan/60' };
  };

  if (state.goals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 relative bg-slate-950">
        <GoalTreeVisualization />
        <div className="relative z-10 w-24 h-24 bg-white/5 rounded border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <Target size={40} className="text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3 font-mono uppercase tracking-widest">No Goal Data</h2>
        <p className="text-slate-500 max-w-sm mb-10 text-sm font-medium">
          The goal tree is offline. Initialize a new mission objective to begin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => openGoalModal()}
            className="px-8 py-3 bg-white text-slate-950 rounded font-black uppercase tracking-[0.2em] text-xs hover:bg-neon-green transition-all"
          >
            New Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 md:p-10 overflow-y-auto custom-scrollbar bg-slate-950 transition-colors relative">
      <GoalTreeVisualization />
      
      <div className="relative z-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-[0.1em] font-mono uppercase">Goal.Tree</h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Cross-referencing <span className="text-white">tactical execution</span> with <span className="text-neon-green">high-level goals</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => openGoalModal()}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Goal
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
        {state.goals.map((goal, idx) => {
          const linkedTasks = state.tasks.filter(t => t.goalId === goal.id);
          const health = getGoalHealth(goal);
          const isExpanded = expandedGoalId === goal.id;

          return (
            <div 
              key={goal.id} 
              className={`group relative bg-slate-900/40 rounded border border-white/5 p-8 transition-all duration-700 overflow-hidden animate-in fade-in slide-in-from-bottom-8 hover:border-white/20 hover:bg-slate-900`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity">
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green animate-scan"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-4 flex-1 pr-8">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded border ${health.border} text-[9px] font-black uppercase tracking-widest ${health.color}`}>
                        {health.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight uppercase font-mono group-hover:text-neon-green transition-colors">
                      {goal.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium">
                      {goal.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <path 
                          className={`${health.color.replace('text-', 'stroke-')} transition-all duration-1000 ease-out`} 
                          strokeDasharray={`${goal.progress}, 100`} 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="butt" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white font-mono">{goal.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                        className={`p-1.5 transition-colors ${openMenuId === goal.id ? 'text-neon-green' : 'text-white/20 hover:text-white'}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openMenuId === goal.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-0 top-full mt-2 w-40 bg-obsidian-900 border border-white/10 z-50 py-1 font-mono text-[9px] uppercase tracking-widest shadow-2xl rounded-sm overflow-hidden">
                            <button 
                              onClick={() => handleEditGoal(goal)} 
                              className="w-full text-left px-4 py-3 text-slate-300 hover:bg-white/5 flex items-center gap-3 border-b border-white/5"
                            >
                              <Edit size={10} className="text-neon-cyan" /> Edit mission
                            </button>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(goal.id); setOpenMenuId(null); }} 
                              className="w-full text-left px-4 py-3 text-slate-300 hover:bg-white/5 flex items-center gap-3 border-b border-white/5"
                            >
                              <Copy size={10} className="text-slate-500" /> Copy Logic ID
                            </button>
                            <button 
                              onClick={() => handleDeleteGoal(goal)} 
                              className="w-full text-left px-4 py-3 text-rose-500 hover:bg-rose-500/10 flex items-center gap-3"
                            >
                              <Trash2 size={10} /> Delete mission
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-8">
                  <div className="bg-white/5 rounded-sm p-3 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Status</div>
                    <div className="text-[10px] font-bold text-white uppercase">Operational</div>
                  </div>
                  <div className="bg-white/5 rounded-sm p-3 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Vectors</div>
                    <div className="text-[10px] font-bold text-white uppercase">{linkedTasks.length} Units</div>
                  </div>
                  <div className="bg-white/5 rounded-sm p-3 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Priority</div>
                    <div className="text-[10px] font-bold text-white uppercase">Primary</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 font-mono">
                      <span className="w-1.5 h-1.5 bg-neon-green rotate-45"></span>
                      Milestone.Chain
                    </h4>
                    <div className="space-y-2">
                      {goal.milestones.map((m) => {
                        const countdown = getTMinus(m.scheduledAt);
                        return (
                          <div 
                            key={m.id}
                            onClick={() => toggleMilestone(goal, m.id)}
                            className={`
                              p-3 rounded border transition-all cursor-pointer flex items-center justify-between group/m
                              ${m.isCompleted ? 'bg-neon-green/10 border-neon-green/20' : 'bg-transparent border-white/5 hover:border-white/20'}
                            `}
                          >
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-bold tracking-tight uppercase ${m.isCompleted ? 'text-neon-green' : 'text-slate-400'}`}>
                                  {m.title}
                              </span>
                              {m.scheduledAt && !m.isCompleted && countdown && (
                                  <div className="flex items-center gap-3 mt-1.5">
                                      <span className="text-[8px] font-black text-slate-600 flex items-center gap-1">
                                          <Calendar size={10} /> {formatDate(m.scheduledAt)}
                                      </span>
                                      <span className={`text-[8px] font-black uppercase tracking-widest ${countdown.color} flex items-center gap-1`}>
                                          <Clock size={10} /> {countdown.text}
                                      </span>
                                  </div>
                              )}
                            </div>
                            {m.isCompleted ? <CheckCircle2 size={12} className="text-neon-green" /> : <div className="w-2 h-2 border border-white/20 rotate-45 group-hover/m:bg-white/20 transition-all"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <button 
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="w-full flex items-center justify-between text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors font-mono"
                    >
                      Tactical Units Assigned ({linkedTasks.length})
                      {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 grid grid-cols-1 gap-1 animate-in slide-in-from-top-2 duration-300">
                        {linkedTasks.map(t => (
                          <div 
                            key={t.id} 
                            className="bg-white/5 p-3 rounded border border-transparent flex items-center justify-between group/task transition-all hover:border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.status === TaskStatus.Done ? 'bg-neon-green' : 'bg-amber-400 animate-pulse'}`}></div>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight truncate max-w-[150px]">{t.title}</span>
                              {t.scheduledAt && (
                                <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                  <Calendar size={10} className="text-slate-600" />
                                  {formatDate(t.scheduledAt)}
                                </div>
                              )}
                            </div>
                            <ArrowRight size={12} className="text-white/20 group-hover/task:text-neon-green transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTree;
