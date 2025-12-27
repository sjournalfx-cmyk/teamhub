
import React, { useContext } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Priority, TaskStatus } from '../types';
import { Calendar, CheckCircle2, ArrowRight, Sun, Cpu, Terminal, Target, Clock } from 'lucide-react';

interface MondayMorningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MondayMorningModal: React.FC<MondayMorningModalProps> = ({ isOpen, onClose }) => {
  const { state } = useContext(AppContext);
  
  if (!isOpen) return null;

  const currentUser = state.currentUser;
  const myTasks = state.tasks.filter(t => t.assigneeId === currentUser.id && t.status !== TaskStatus.Done);
  const topPriorities = myTasks.filter(t => t.priority === Priority.High).slice(0, 3);
  const displayTasks = topPriorities.length > 0 ? topPriorities : myTasks.slice(0, 3);
  const primaryGoal = state.goals.find(g => g.id === displayTasks[0]?.goalId);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'UNCATEGORIZED';
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-xl animate-in fade-in duration-500"></div>

      <div className="relative w-full max-w-2xl glass-terminal rounded-sm overflow-hidden animate-in slide-in-from-bottom-12 duration-700 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Tactical Scanning Beam */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green/30 animate-scan"></div>

        <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/5 border border-neon-green/30 rounded-full flex items-center justify-center text-neon-green mb-8 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Sun size={32} />
            </div>

            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-[0.2em] font-mono">
                Initialize.Morning_{currentUser.name.split(' ')[0].toUpperCase()}
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10 max-w-md leading-relaxed">
                Temporal reset complete. Review active mission parameters before entering deep execution mode.
            </p>

            <div className="w-full bg-black/40 border border-white/5 rounded-sm p-8 mb-10 text-left font-mono">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] flex items-center gap-2">
                        <Terminal size={14} /> Priority.Vectors
                    </h3>
                    <div className="flex items-center gap-2">
                        <Calendar size={10} className="text-slate-700" />
                        <span className="text-[9px] text-slate-700 tracking-widest uppercase">WEEK_STARTING_{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                    </div>
                </div>
                
                {displayTasks.length > 0 ? (
                    <div className="space-y-4">
                        {displayTasks.map((task, idx) => (
                            <div key={task.id} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 hover:border-neon-green/20 transition-all group">
                                <span className="text-[10px] font-black text-slate-700 group-hover:text-neon-green transition-colors">
                                    [0{idx + 1}]
                                </span>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[8px] font-black text-neon-cyan uppercase tracking-widest">{task.day}</span>
                                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">•</span>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{formatDate(task.scheduledAt)}</span>
                                    </div>
                                    <p className="text-xs font-bold text-white uppercase tracking-tight">{task.title}</p>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                          <Clock size={10} /> {task.estimateHours}H
                                        </span>
                                        <span className={`text-[9px] uppercase tracking-widest font-black ${task.priority === Priority.High ? 'text-rose-500' : 'text-neon-cyan'}`}>{task.priority} Priority</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-600 text-[10px] uppercase tracking-widest">
                        Backlog clear. Deploy new objectives.
                    </div>
                )}

                {primaryGoal && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-3 uppercase tracking-widest font-black">
                            <Target size={14} className="text-neon-green" />
                            Alignment: <span className="text-white underline decoration-neon-green/50">{primaryGoal.title}</span>
                        </p>
                    </div>
                )}
            </div>

            <button 
                onClick={onClose}
                className="tactical-button group px-10 py-4 text-white"
            >
                <div className="tactical-beam-container">
                    <div className="tactical-beam"></div>
                </div>
                <span className="relative z-10 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] font-mono">
                    Engage.Workspace <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default MondayMorningModal;
