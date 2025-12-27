
import React, { useContext, useState } from 'react';
import { Task, TaskStatus, Priority, Deliverable } from '../types';
import { Play, CheckCircle, Clock, MoreVertical, Edit, Trash2, AlertOctagon, Video, Target, AlarmClock, MapPin, Terminal, Calendar, Eye, ShieldCheck, FileText, Database, PackageSearch, Sparkles, ListTree, Lightbulb, Loader2, Check, Lock, Radio, ShieldAlert, Paperclip, Download, ExternalLink } from 'lucide-react';
import { AppContext } from '../context';
import Tooltip from './Tooltip';
import RichText from './RichText';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  showAI?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, showAI = false }) => {
  const { toggleFocus, state, updateTaskStatus, openTaskModal, deleteTask, toggleTaskBlocker, userRole, viewEvidence, askRubberDuck, toggleBreakdownStep, acceptTask } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isFocusing = state.activeFocusTaskId === task.id;
  const assignee = state.users.find(u => u.id === task.assigneeId);
  const parentGoal = state.goals.find(g => g.id === task.goalId);
  const isPendingReview = task.status === TaskStatus.ReadyForReview;
  const isDone = task.status === TaskStatus.Done;
  const isStuck = task.status === TaskStatus.Stuck;
  const deliverablesCount = task.deliverables?.length || 0;
  const resourcesCount = task.resources?.length || 0;

  const priorityStyles = {
    [Priority.High]: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
    [Priority.Medium]: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    [Priority.Low]: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5',
  };

  const handleStatusClick = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (!task.isAccepted && userRole === 'performer') return;
      
      if (task.status !== TaskStatus.Done) {
          setIsCompleting(true);
          setTimeout(() => {
              updateTaskStatus(task.id, TaskStatus.Done);
              setIsCompleting(false);
          }, 600);
      } else {
          updateTaskStatus(task.id, TaskStatus.NotStarted);
      }
  }

  const handleAIAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnalyzing(true);
    try {
      await askRubberDuck(task.id);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleBlockerToggle = () => {
      setIsMenuOpen(false);
      if (task.isBlocked) {
          toggleTaskBlocker(task.id);
      } else {
          const reason = window.prompt("Tactical Blocker Detected. What is the friction?", "Dependency delay...");
          const suggestion = window.prompt("What is your recommended vector/solution?", "Wait for API docs...");
          if (reason && suggestion) toggleTaskBlocker(task.id, reason, suggestion);
      }
  }

  const downloadFile = (d: Deliverable) => {
    if (d.type === 'link') {
        window.open(d.url, '_blank');
        return;
    }
    if (!d.data) return;
    const link = document.createElement('a');
    link.href = d.data;
    link.download = d.fileName || 'resource';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`
        glass-layer-1 group relative p-6 mb-4 transition-all cursor-grab active:cursor-grabbing hover:glass-layer-2 w-full
        ${task.isDraft ? 'opacity-50 border-dashed border-white/20' : ''}
        ${task.isBlocked ? 'border-rose-500/40 bg-rose-500/5' : ''}
        ${isFocusing ? 'border-neon-green bg-neon-green/5 ring-1 ring-neon-green/20 scale-[1.01]' : ''}
        ${isDone ? 'opacity-50 grayscale-50 border-white/5' : ''}
        ${isPendingReview ? 'border-neon-cyan/50 bg-neon-cyan/5 ring-1 ring-neon-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : ''}
        ${isCompleting ? 'border-neon-green animate-pulse' : ''}
        ${!task.isAccepted && !task.isDraft && userRole === 'performer' ? 'ring-2 ring-amber-500/50' : ''}
      `}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green animate-scan"></div>
      </div>

      {task.isDraft && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-sm">
          <Lock size={10} /> Draft Directive
        </div>
      )}

      {task.isBlocked && (
          <div className="flex flex-col gap-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm">
              <div className="flex items-start gap-2">
                <AlertOctagon size={14} className="text-rose-500 mt-0.5" />
                <div className="text-[10px] font-mono font-black uppercase text-rose-500 tracking-wider">
                    FRICTION: {task.blockerMessage}
                </div>
              </div>
              {task.blockerSuggestion && (
                <div className="pl-6 border-l border-rose-500/20">
                  <div className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mb-1">PROPOSED VECTOR:</div>
                  <div className="text-[10px] text-rose-300 italic">{task.blockerSuggestion}</div>
                </div>
              )}
          </div>
      )}

      {!task.isAccepted && !task.isDraft && userRole === 'performer' && (
          <div className="mb-4 animate-in fade-in duration-500">
              <button 
                onClick={(e) => { e.stopPropagation(); acceptTask(task.id); }}
                className="w-full py-3 bg-amber-500 text-obsidian-950 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                  <Radio size={14} className="animate-pulse" /> Accept Directive
              </button>
          </div>
      )}

      {isPendingReview && userRole === 'admin' && (
          <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm animate-in slide-in-from-top-1 duration-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-neon-cyan" />
                <div className="text-[10px] font-mono font-black uppercase text-neon-cyan tracking-wider">
                    EVIDENCE.SUBMITTED ({deliverablesCount})
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); viewEvidence(task); }}
                className="text-[10px] font-black uppercase tracking-widest text-white hover:text-neon-cyan transition-colors border border-white/10 px-3 py-1 hover:border-neon-cyan/30 bg-black/20"
              >
                Inspect
              </button>
          </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 border rounded-sm text-[9px] font-mono font-black uppercase tracking-[0.2em] ${priorityStyles[task.priority]}`}>
          {task.priority}
        </div>
        
        <div className="flex items-center gap-2">
            {showAI && !isDone && !task.isDraft && (
              <Tooltip content="Analyze Task with AI">
                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className={`p-1.5 rounded-sm transition-all border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-obsidian-950 disabled:opacity-50 ${isAnalyzing ? 'animate-pulse' : ''}`}
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </Tooltip>
            )}
            <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-slate-600 hover:text-white transition-colors p-1">
                    <MoreVertical size={16} />
                </button>
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-1 w-40 glass-layer-3 z-50 py-1 font-mono text-[10px] uppercase tracking-widest">
                            <button onClick={() => { setIsMenuOpen(false); openTaskModal(task); }} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-white/5 flex items-center gap-2">
                                <Edit size={12} /> Edit
                            </button>
                            {!task.isDraft && (
                              <button onClick={handleBlockerToggle} className={`w-full text-left px-4 py-2 flex items-center gap-2 ${task.isBlocked ? 'text-neon-green' : 'text-rose-500'} hover:bg-white/5`}>
                                  <AlertOctagon size={12} /> {task.isBlocked ? 'Resolve' : 'Block'}
                              </button>
                            )}
                            <button onClick={() => { setIsMenuOpen(false); deleteTask(task.id); }} className="w-full text-left px-4 py-2 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 flex items-center gap-2 border-t border-white/5">
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      <h4 className={`text-sm font-black font-mono tracking-tight text-white mb-4 leading-relaxed group-hover:text-neon-green transition-colors ${isDone ? 'line-through text-slate-500' : ''}`}>
          <RichText text={task.title} />
      </h4>

      {(isDone || isPendingReview || isFocusing || task.breakdown || task.aiSuggestions || resourcesCount > 0) && (
        <div className="space-y-4 mb-4">
           {task.description && (
             <div className="p-4 bg-white/5 border-l-2 border-neon-cyan/30 rounded-r-sm animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                   <FileText size={10} /> Mission Briefing
                </div>
                <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                  {task.description}
                </p>
             </div>
           )}

           {resourcesCount > 0 && (
             <div className="p-4 bg-neon-cyan/5 border-l-2 border-neon-cyan/30 rounded-r-sm animate-in slide-in-from-right-2 duration-500">
                <div className="flex items-center gap-2 text-[8px] font-black text-neon-cyan uppercase tracking-widest mb-3">
                   <Paperclip size={10} /> Technical Resources
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                   {task.resources?.map((res) => (
                      <button 
                        key={res.id}
                        onClick={(e) => { e.stopPropagation(); downloadFile(res); }}
                        className="flex items-center justify-between p-2 bg-black/20 hover:bg-neon-cyan/10 border border-white/5 transition-all text-left group/res"
                      >
                         <div className="flex items-center gap-2 overflow-hidden">
                            {res.type === 'link' ? <ExternalLink size={10} className="text-neon-cyan shrink-0" /> : <Download size={10} className="text-neon-cyan shrink-0" />}
                            <span className="text-[9px] font-mono text-slate-300 truncate group-hover/res:text-neon-cyan">
                               {res.url || res.fileName}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>
           )}

           {task.breakdown && task.breakdown.length > 0 && (
             <div className="p-4 bg-obsidian-950/40 border-l-2 border-neon-green/30 rounded-r-sm animate-in slide-in-from-left-2 duration-500">
                <div className="flex items-center gap-2 text-[8px] font-black text-neon-green uppercase tracking-widest mb-3">
                   <ListTree size={10} /> Tactical Sequence
                </div>
                <div className="space-y-2">
                  {task.breakdown.map((step, idx) => {
                    const isStepDone = task.completedSteps?.includes(idx);
                    return (
                      <div key={idx} className="flex items-start gap-2 group/step">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleBreakdownStep(task.id, idx); }}
                          className={`text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border transition-all shrink-0 ${isStepDone ? 'bg-neon-green border-neon-green text-obsidian-950' : 'text-slate-700 bg-white/5 border-white/5 hover:border-neon-green/50'}`}
                        >
                          {isStepDone ? <Check size={8} strokeWidth={4} /> : idx + 1}
                        </button>
                        <p className={`text-[9px] font-mono leading-snug pt-0.5 transition-all ${isStepDone ? 'text-slate-600 line-through italic' : 'text-slate-300 group-hover/step:text-white'}`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
             </div>
           )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-auto">
        <div className="flex items-center gap-3 text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                <Clock size={12} className="text-slate-600" />
                <span>{task.estimateHours}H</span>
            </div>
            {task.scheduledAt && (
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/5 text-neon-green/80">
                  <Calendar size={12} className="text-neon-green/60" />
                  <span>{formatDate(task.scheduledAt)}</span>
              </div>
            )}
            {parentGoal && (
                 <div className="flex items-center gap-1.5 text-neon-cyan bg-neon-cyan/5 px-2 py-1 rounded-sm border border-neon-cyan/20">
                    <Target size={12} />
                    <span>STRAT</span>
                 </div>
            )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
            {deliverablesCount > 0 && (
               <Tooltip content={`View ${deliverablesCount} Tactical Assets`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); viewEvidence(task); }}
                    className="p-2 rounded-sm transition-all border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan hover:bg-neon-cyan hover:text-obsidian-950 shadow-[0_0_10px_rgba(6,182,212,0.1)] relative"
                  >
                    <PackageSearch size={14} />
                    {deliverablesCount > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-cyan text-obsidian-950 text-[8px] font-black rounded-full flex items-center justify-center border border-obsidian-950">
                        {deliverablesCount}
                      </span>
                    )}
                  </button>
               </Tooltip>
            )}
            {!task.isDraft && (
              <button 
                  onClick={handleStatusClick}
                  disabled={!task.isAccepted && userRole === 'performer'}
                  className={`p-2 rounded-sm transition-all border ${isDone ? 'bg-neon-green text-obsidian-950 border-neon-green' : isPendingReview ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-slate-600 hover:text-neon-green hover:border-neon-green/50'} ${!task.isAccepted && userRole === 'performer' ? 'opacity-20 cursor-not-allowed' : ''}`}
              >
                  {isDone ? <CheckCircle size={14} /> : isPendingReview ? <Eye size={14} /> : <div className="w-3.5 h-3.5 border border-current"></div>}
              </button>
            )}
        </div>
      </div>

      {assignee && (
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src={assignee.avatar} className="w-5 h-5 rounded-sm grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100" />
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Node: {assignee.name.toUpperCase()}
                </span>
              </div>
              <div className="text-[8px] font-mono text-slate-700">ID_{task.id.toUpperCase()}</div>
          </div>
      )}
    </div>
  );
};

export default TaskCard;
