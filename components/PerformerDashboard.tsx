
import React, { useContext, useState } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { TaskStatus, Deliverable, Task } from '../types';
import { LogOut, Sun, Moon, Cpu, ChevronDown, ChevronUp, Loader2, Sparkles, AlertOctagon, Terminal, ListTree, Radio, Check, Paperclip, Download, ExternalLink, FileText, Smile } from 'lucide-react';
import RichText from './RichText';
import Tooltip from './Tooltip';

const StatusButton: React.FC<{ 
  status: TaskStatus, 
  active: boolean, 
  onClick: () => void,
  disabled?: boolean
}> = ({ status, active, onClick, disabled }) => {
  const styles = {
    [TaskStatus.NotStarted]: 'bg-gray-500/10 border-gray-500/30 text-gray-500',
    [TaskStatus.WorkingOnIt]: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    [TaskStatus.ReadyForReview]: 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan',
    [TaskStatus.Done]: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    [TaskStatus.Stuck]: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
  };

  const activeStyles = {
    [TaskStatus.NotStarted]: 'bg-gray-500 text-white',
    [TaskStatus.WorkingOnIt]: 'bg-amber-500 text-obsidian-950',
    [TaskStatus.ReadyForReview]: 'bg-neon-cyan text-obsidian-950',
    [TaskStatus.Done]: 'bg-emerald-500 text-obsidian-950',
    [TaskStatus.Stuck]: 'bg-rose-500 text-white',
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={`
        flex-1 py-3 px-2 border rounded-sm font-black text-[9px] uppercase tracking-widest transition-all active:scale-95
        ${active ? activeStyles[status] : styles[status]}
        ${disabled ? 'opacity-20 cursor-not-allowed' : ''}
      `}
    >
      {status === TaskStatus.ReadyForReview ? 'SUBMIT' : status}
    </button>
  );
};

const PerformerDashboard: React.FC = () => {
  const { state, updateTaskStatus, logout, theme, toggleTheme, askRubberDuck, toggleBreakdownStep, acceptTask, toggleTaskBlocker, updateUserStatus } = useContext(AppContext);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [isVibePickerOpen, setIsVibePickerOpen] = useState(false);

  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.id && !t.isDraft);
  const unacceptedTasks = myTasks.filter(t => !t.isAccepted);
  const activeTasks = myTasks.filter(t => t.isAccepted);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleAIAnalysis = async (taskId: string) => {
    setProcessingTaskId(taskId);
    try {
      await askRubberDuck(taskId);
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleBlockerHotline = (taskId: string) => {
    const reason = window.prompt("Tactical Blocker Detected. What is the friction?", "Dependency delay...");
    const suggestion = window.prompt("What is your recommended vector/solution?", "Wait for API docs...");
    if (reason && suggestion) toggleTaskBlocker(taskId, reason, suggestion);
  };

  const updateVibe = (emoji: string, text: string) => {
    updateUserStatus(emoji, text);
    setIsVibePickerOpen(false);
  };

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

  const getStatusColorClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NotStarted: return 'bg-gray-400';
      case TaskStatus.WorkingOnIt: return 'bg-amber-500';
      case TaskStatus.ReadyForReview: return 'bg-neon-cyan';
      case TaskStatus.Done: return 'bg-emerald-500';
      case TaskStatus.Stuck: return 'bg-rose-500';
      default: return 'bg-gray-400';
    }
  };

  const renderTaskDetails = (task: Task) => {
    const isThinking = processingTaskId === task.id;
    const resourcesCount = task.resources?.length || 0;

    return (
      <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300 space-y-5">
        <div className="pt-3 border-t border-white/5 space-y-4">
          {task.description && (
            <div className="space-y-2">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Description</span>
               <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{task.description}</p>
            </div>
          )}

          {resourcesCount > 0 && (
            <div className="space-y-2">
               <span className="text-[8px] font-black text-neon-cyan uppercase tracking-widest">Technical Documentation</span>
               <div className="grid grid-cols-1 gap-1">
                  {task.resources?.map(res => (
                     <button 
                       key={res.id}
                       onClick={(e) => { e.stopPropagation(); downloadFile(res); }}
                       className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:bg-neon-cyan/5 hover:border-neon-cyan/30 transition-all group/res"
                     >
                        <div className="flex items-center gap-2 overflow-hidden">
                           {res.type === 'link' ? <ExternalLink size={12} className="text-neon-cyan shrink-0" /> : <Download size={12} className="text-neon-cyan shrink-0" />}
                           <span className="text-[10px] font-mono text-slate-300 truncate group-hover/res:text-white">{res.url || res.fileName}</span>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
          )}

          {task.breakdown && (
            <div className="p-3 bg-black/40 border border-white/5 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-black text-neon-green uppercase tracking-widest">
                  <ListTree size={12} /> Tactical Sequence
                </div>
                <div className="space-y-3">
                  {task.breakdown.map((step, i) => {
                    const isStepDone = task.completedSteps?.includes(i);
                    return (
                      <div key={i} className="flex items-start gap-3 group/step">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleBreakdownStep(task.id, i); }}
                          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border text-[9px] font-black transition-all ${isStepDone ? 'bg-neon-green border-neon-green text-obsidian-950' : 'bg-white/5 border-white/10 text-slate-600'}`}
                        >
                          {isStepDone ? <Check size={8} /> : i+1}
                        </button>
                        <span className={`text-[11px] pt-0.5 leading-snug ${isStepDone ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
            </div>
          )}

          {task.isAccepted && (
            <div className="space-y-2">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Update Progress</span>
               <div className="flex gap-1">
                  <StatusButton status={TaskStatus.WorkingOnIt} active={task.status === TaskStatus.WorkingOnIt} onClick={() => updateTaskStatus(task.id, TaskStatus.WorkingOnIt)} />
                  <StatusButton status={TaskStatus.ReadyForReview} active={task.status === TaskStatus.ReadyForReview} onClick={() => updateTaskStatus(task.id, TaskStatus.ReadyForReview)} />
                  <StatusButton status={TaskStatus.Done} active={task.status === TaskStatus.Done} onClick={() => updateTaskStatus(task.id, TaskStatus.Done)} />
               </div>
               <button 
                 onClick={(e) => { e.stopPropagation(); handleBlockerHotline(task.id); }}
                 className={`w-full py-3 mt-1 border text-[9px] font-black uppercase tracking-widest rounded-sm ${task.isBlocked ? 'bg-rose-600 text-white' : 'text-rose-500 border-rose-500/30'}`}
               >
                 Report Blocker
               </button>
            </div>
          )}

          {!task.isAccepted && (
             <div className="pt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); acceptTask(task.id); }}
                  className="w-full py-4 bg-amber-500 text-obsidian-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Radio size={14} className="animate-pulse" /> Acknowledge Directive
                </button>
             </div>
          )}
        </div>
      </div>
    );
  };

  const vibes = [
    { emoji: '💻', text: 'Deep Coding' },
    { emoji: '☕', text: 'Coffee Break' },
    { emoji: '🧘', text: 'Focus Mode' },
    { emoji: '🍱', text: 'Lunching' },
    { emoji: '🎧', text: 'Listening' },
    { emoji: '🏃', text: 'Step Away' },
  ];

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-obsidian-950 text-slate-300 flex flex-col font-sans p-4 md:p-8 pb-32">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 md:mb-10 border-b border-white/5 pb-4 md:pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={state.currentUser.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded border border-neon-green/30" />
            <div className="absolute -top-1 -right-1 text-xs">{state.currentUser.statusEmoji || '👤'}</div>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black text-white uppercase tracking-wider leading-none">Node_{state.currentUser.name.split(' ')[0]}</h1>
            <p className="text-[8px] md:text-[10px] text-neon-green uppercase tracking-widest font-bold mt-1">Status: {state.currentUser.statusText || 'Online'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsVibePickerOpen(!isVibePickerOpen)}
            className={`p-2 border rounded transition-all ${isVibePickerOpen ? 'bg-neon-cyan text-obsidian-950 border-neon-cyan' : 'text-slate-500 hover:text-white border-white/10'}`}
          >
            <Smile size={16} />
          </button>
          <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-white border border-white/10 rounded transition-all">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={logout} className="p-2 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Vibe Picker Overlay */}
      {isVibePickerOpen && (
        <div className="mb-8 p-4 glass-layer-2 border-neon-cyan/30 animate-in slide-in-from-top-4 duration-300">
           <div className="text-[8px] font-black text-neon-cyan uppercase tracking-widest mb-3">Broadcast Your Vibe</div>
           <div className="grid grid-cols-3 gap-2">
              {vibes.map((v, i) => (
                <button 
                  key={i} 
                  onClick={() => updateVibe(v.emoji, v.text)}
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/5 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all"
                >
                  <span className="text-xl">{v.emoji}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase truncate w-full text-center">{v.text}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full">
        {/* Unaccepted Mission Section */}
        {unacceptedTasks.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4">
               <Radio size={14} className="text-amber-500 animate-pulse" />
               <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New_Directives ({unacceptedTasks.length})</h2>
            </div>
            <div className="space-y-3">
               {unacceptedTasks.map(task => {
                 const isExpanded = expandedTaskId === task.id;
                 const resourcesCount = task.resources?.length || 0;
                 return (
                    <div key={task.id} className={`glass-terminal border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-amber-500/20 bg-amber-500/5'}`}>
                        <div onClick={() => toggleExpand(task.id)} className="p-4 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-2 h-2 rounded-sm shrink-0 bg-amber-500 animate-pulse"></div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold uppercase tracking-tight text-white truncate">{task.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{task.day}</span>
                                        <span className="text-[7px] font-black text-white/20">|</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">{task.priority} Priority</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {resourcesCount > 0 && <Paperclip size={12} className="text-neon-cyan/50" />}
                                {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                            </div>
                        </div>
                        {isExpanded && renderTaskDetails(task)}
                    </div>
                 );
               })}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-neon-green"></span>
              Operational_Log
          </h2>

          {activeTasks.length > 0 ? (
            activeTasks.map((task) => {
              const isThinking = processingTaskId === task.id;
              const isExpanded = expandedTaskId === task.id;
              const resourcesCount = task.resources?.length || 0;

              return (
                <div 
                  key={task.id} 
                  className={`glass-terminal border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-neon-green ring-1 ring-neon-green/20' : 'border-white/5'}`}
                >
                  <div onClick={() => toggleExpand(task.id)} className="p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-sm shrink-0 ${getStatusColorClass(task.status)} shadow-[0_0_5px_rgba(255,255,255,0.1)]`}></div>
                      <div className="min-w-0">
                        <h3 className={`text-xs font-bold uppercase tracking-tight text-white truncate ${task.status === TaskStatus.Done ? 'line-through text-slate-600' : ''}`}>
                          <RichText text={task.title} />
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{task.day}</span>
                           <span className="text-[7px] font-black text-white/20">|</span>
                           <span className={`text-[8px] font-black uppercase tracking-widest ${getStatusColorClass(task.status).replace('bg-', 'text-')}`}>{task.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {resourcesCount > 0 && <Paperclip size={12} className="text-neon-cyan/50" />}
                      {task.status !== TaskStatus.Done && (
                        <Tooltip content="Analyze with AI">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAIAnalysis(task.id); }}
                            disabled={isThinking}
                            className={`p-1.5 rounded-sm border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-obsidian-950 transition-all ${isThinking ? 'animate-pulse' : ''}`}
                          >
                            {isThinking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          </button>
                        </Tooltip>
                      )}
                      {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </div>

                  {isExpanded && renderTaskDetails(task)}
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center opacity-30 border border-dashed border-white/10 flex flex-col items-center gap-3">
                <Terminal size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">No active units</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PerformerDashboard;
