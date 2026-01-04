import React, { useContext, useState } from 'react';
import { AppContext } from '../context';
import { TaskStatus, Deliverable, Task } from '../types';
import { LogOut, Sun, Moon, Cpu, ChevronDown, ChevronUp, Loader2, Sparkles, Radio, Check, Paperclip, Download, ExternalLink, Smile, Settings, Mail, AlertCircle, X, Clock, BarChart2, Target, LayoutDashboard, ListTree, Terminal } from 'lucide-react';
import RichText from './RichText';
import Tooltip from './Tooltip';
import SettingsView from './SettingsView';
import GoalTree from './GoalTree';
import BlockerModal from './BlockerModal';
import DashboardShell from './layout/DashboardShell';

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
  const { state, updateTaskStatus, logout, theme, setTheme, askRubberDuck, toggleBreakdownStep, acceptTask, toggleTaskBlocker, updateUserStatus, addCustomStatus, removeCustomStatus, approveJoinRequest, rejectJoinRequest } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'settings'>('tasks');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [isVibePickerOpen, setIsVibePickerOpen] = useState(false);
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerTaskId, setBlockerTaskId] = useState<string | null>(null);
  const [newStatusEmoji, setNewStatusEmoji] = useState('💬');
  const [newStatusText, setNewStatusText] = useState('');
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  const handleThemeToggle = () => {
    const themes: any[] = ['light', 'dark', 'midnight', 'terminal'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.id && !t.isDraft);
  const unacceptedTasks = myTasks.filter(t => !t.isAccepted);
  const activeTasks = myTasks.filter(t => t.isAccepted);

  const myInvitations = state.joinRequests.filter(r =>
    r.email.toLowerCase() === state.currentUser.email?.toLowerCase() &&
    r.status === 'pending'
  );

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
    setBlockerTaskId(taskId);
    setBlockerModalOpen(true);
  };

  const handleBlockerSubmit = (reason: string, suggestion: string) => {
    if (blockerTaskId) {
      toggleTaskBlocker(blockerTaskId, reason, suggestion);
      setBlockerTaskId(null);
    }
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

  const isFutureTask = (task: Task) => {
    if (!task.scheduledAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.scheduledAt);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() > today.getTime();
  };

  const renderTaskDetails = (task: Task) => {
    const resourcesCount = task.resources?.length || 0;
    const isFuture = isFutureTask(task);

    return (
      <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300 space-y-5">
        <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-4">
          {isFuture ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-sm">
              <Clock size={24} className="text-amber-500 animate-pulse" />
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  Waiting for the task date
                </div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  Information will be unlocked on the scheduled day
                </div>
              </div>
            </div>
          ) : (
            <>
              {task.description && (
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Description</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">{task.description}</p>
                </div>
              )}

              {resourcesCount > 0 && (
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-neon-cyan uppercase tracking-widest">Resources</span>
                  <div className="grid grid-cols-1 gap-1">
                    {task.resources?.map(res => (
                      <button
                        key={res.id}
                        onClick={(e) => { e.stopPropagation(); downloadFile(res); }}
                        className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-neon-cyan/5 hover:border-neon-cyan/30 transition-all group/res"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {res.type === 'link' ? <ExternalLink size={12} className="text-neon-cyan shrink-0" /> : <Download size={12} className="text-neon-cyan shrink-0" />}
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate group-hover/res:text-slate-900 dark:group-hover/res:text-white">{res.url || res.fileName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {task.breakdown && (
                <div className="p-3 bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-[9px] font-black text-neon-green uppercase tracking-widest">
                    <ListTree size={12} /> Steps
                  </div>
                  <div className="space-y-3">
                    {task.breakdown.map((step, i) => {
                      const isStepDone = task.completedSteps?.includes(i);
                      return (
                        <div key={i} className="flex items-start gap-3 group/step">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBreakdownStep(task.id, i); }}
                            className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border text-[9px] font-black transition-all ${isStepDone ? 'bg-neon-green border-neon-green text-obsidian-950' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600'}`}
                          >
                            {isStepDone ? <Check size={8} /> : i + 1}
                          </button>
                          <span className={`text-[11px] pt-0.5 leading-snug ${isStepDone ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{step}</span>
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
                    Report Problem
                  </button>
                </div>
              )}
            </>
          )}

          {!task.isAccepted && !isFuture && (
            <div className="pt-2">
              <button
                onClick={(e) => { e.stopPropagation(); acceptTask(task.id); }}
                className="w-full py-4 bg-amber-500 text-obsidian-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Radio size={14} className="animate-pulse" /> Accept Task
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const defaultVibes = [
    { emoji: '💻', text: 'Deep Coding' },
    { emoji: '☕', text: 'Coffee Break' },
    { emoji: '🧘', text: 'Focus Mode' },
    { emoji: '🍱', text: 'Lunching' },
    { emoji: '🎧', text: 'Listening' },
    { emoji: '🏃', text: 'Step Away' },
  ];

  const vibes = state.currentUser.customStatuses && state.currentUser.customStatuses.length > 0
    ? state.currentUser.customStatuses
    : defaultVibes;

  const handleAddStatus = () => {
    if (newStatusText.trim()) {
      addCustomStatus(newStatusEmoji, newStatusText.trim());
      setNewStatusText('');
      setIsAddingStatus(false);
    }
  };

  const handleRemoveStatus = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    removeCustomStatus(text);
  };

  const sidebarItems = [
    { id: 'tasks', icon: LayoutDashboard, label: 'Tasks' },
    { id: 'goals', icon: Target, label: 'Goals' }
  ];

  const renderContent = () => {
    if (activeTab === 'settings') return <SettingsView />;
    if (activeTab === 'goals') return <div className="p-4 md:p-8"><GoalTree readOnly={true} /></div>;

    return (
      <div className="max-w-2xl mx-auto w-full p-4 md:p-8">
        {/* Header Summary */}
        <header className="flex justify-between items-center mb-6 md:mb-10 border-b border-black/5 dark:border-white/5 pb-4 md:pb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={state.currentUser.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded border border-neon-green/30" alt="User" />
              <div className="absolute -top-1 -right-1 text-xs">{state.currentUser.statusEmoji || '👤'}</div>
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">Member: {state.currentUser.name.split(' ')[0]}</h1>
              <p className="text-[8px] md:text-[10px] text-neon-green uppercase tracking-widest font-bold mt-1">Status: {state.currentUser.statusText || 'Online'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVibePickerOpen(!isVibePickerOpen)}
              className={`p-2 border rounded transition-all ${isVibePickerOpen ? 'bg-neon-cyan text-obsidian-950 border-neon-cyan' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-black/10 dark:border-white/10'}`}
            >
              <Smile size={16} />
            </button>
            <button onClick={handleThemeToggle} className="hidden md:block p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-black/10 dark:border-white/10 rounded transition-all">
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Vibe Picker Overlay */}
        {isVibePickerOpen && (
          <div className="mb-8 p-4 glass-layer-2 border-neon-cyan/30 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[8px] font-black text-neon-cyan uppercase tracking-widest">Set Your Status</div>
              <button
                onClick={() => setIsAddingStatus(!isAddingStatus)}
                className="text-[8px] font-black text-neon-green uppercase tracking-widest hover:underline"
              >
                {isAddingStatus ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {isAddingStatus && (
              <div className="mb-4 p-3 bg-black/20 border border-neon-green/30 rounded-sm flex gap-2 items-center">
                <input
                  type="text"
                  value={newStatusEmoji}
                  onChange={(e) => setNewStatusEmoji(e.target.value)}
                  className="w-10 bg-transparent border-b border-white/10 text-center focus:border-neon-green outline-none text-xl"
                  placeholder="Emoji"
                />
                <input
                  type="text"
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/10 focus:border-neon-green outline-none text-[10px] uppercase font-bold text-white"
                  placeholder="Status Text..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                />
                <button
                  onClick={handleAddStatus}
                  className="p-2 bg-neon-green text-obsidian-950 rounded-sm"
                >
                  <Check size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {vibes.map((v, i) => (
                <button
                  key={i}
                  onClick={() => updateVibe(v.emoji, v.text)}
                  className="relative flex flex-col items-center gap-1 p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group/vibe"
                >
                  <span className="text-xl">{v.emoji}</span>
                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate w-full text-center">{v.text}</span>

                  <button
                    onClick={(e) => handleRemoveStatus(e, v.text)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/vibe:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Team Invitations Section */}
        {myInvitations.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} className="text-neon-cyan animate-pulse" />
              <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Team Invites ({myInvitations.length})</h2>
            </div>
            <div className="space-y-3">
              {myInvitations.map(invitation => {
                const inviter = state.users.find(u => u.id === invitation.invitedBy);
                return (
                  <div key={invitation.id} className="glass-terminal border border-neon-cyan/30 bg-neon-cyan/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm flex items-center justify-center shrink-0">
                        <Mail size={20} className="text-neon-cyan" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">New Team Invite</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-slate-900 dark:text-white font-bold">{inviter?.name || 'A Manager'}</span> has authorized you as a <span className="text-neon-cyan font-bold uppercase">{invitation.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => rejectJoinRequest(invitation.id)}
                        className="flex-1 md:flex-none px-4 py-2 border border-rose-500/30 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => approveJoinRequest(invitation.id)}
                        className="flex-1 md:flex-none px-6 py-2 bg-neon-cyan text-obsidian-950 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        Accept & Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Unaccepted Mission Section */}
        {unacceptedTasks.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Radio size={14} className="text-amber-500 animate-pulse" />
              <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">New Tasks ({unacceptedTasks.length})</h2>
            </div>
            <div className="space-y-3">
              {unacceptedTasks.map(task => {
                const isExpanded = expandedTaskId === task.id;
                const resourcesCount = task.resources?.length || 0;
                const isFuture = isFutureTask(task);
                return (
                  <div key={task.id} className={`glass-terminal border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-amber-500/20 bg-amber-500/5'}`}>
                    <div onClick={() => toggleExpand(task.id)} className="p-4 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-sm shrink-0 bg-amber-500 animate-pulse"></div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate">
                            {isFuture ? (
                              <span className="opacity-40 italic flex items-center gap-2">
                                <Clock size={10} /> Upcoming Task
                              </span>
                            ) : task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{task.day}</span>
                            <span className="text-[7px] font-black text-slate-300 dark:text-white/20">|</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">{task.priority} Priority</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resourcesCount > 0 && !isFuture && <Paperclip size={12} className="text-neon-cyan/50" />}
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

        {/* Distribution by Status Section */}
        <section className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-neon-cyan" />
            <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Distribution by Status</h2>
          </div>

          {myTasks.length > 0 ? (
            <div className="glass-terminal border border-black/5 dark:border-white/5 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {Object.values(TaskStatus).map((status) => {
                  const count = myTasks.filter(t => t.status === status).length;
                  const percentage = Math.round((count / myTasks.length) * 100) || 0;
                  const colorClass = getStatusColorClass(status);

                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold">
                        <span className="text-slate-500">{status}</span>
                        <span className="text-slate-900 dark:text-white">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary / Insight */}
              <div className="flex flex-col justify-center items-center text-center p-4 border border-dashed border-black/10 dark:border-white/10 rounded-sm bg-black/5 dark:bg-white/5">
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{myTasks.filter(t => t.status === TaskStatus.Done).length}</div>
                <div className="text-[9px] text-neon-green uppercase tracking-widest font-bold mb-4">Tasks Completed</div>

                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{myTasks.filter(t => t.status === TaskStatus.WorkingOnIt).length}</div>
                <div className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">In Progress</div>
              </div>
            </div>
          ) : (
            <div className="glass-terminal border border-black/5 dark:border-white/5 p-8 flex flex-col items-center justify-center text-center opacity-60">
              <BarChart2 size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">No tasks data available</div>
              <p className="text-[10px] text-slate-400 mt-1">Accept tasks to see your status distribution</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-neon-green"></span>
            Task Log
          </h2>

          {activeTasks.length > 0 ? (
            activeTasks.map((task) => {
              const isThinking = processingTaskId === task.id;
              const isExpanded = expandedTaskId === task.id;
              const resourcesCount = task.resources?.length || 0;
              const isFuture = isFutureTask(task);

              return (
                <div
                  key={task.id}
                  className={`glass-terminal border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-neon-green ring-1 ring-neon-green/20' : 'border-black/5 dark:border-white/5'}`}
                >
                  <div onClick={() => toggleExpand(task.id)} className="p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-sm shrink-0 ${getStatusColorClass(task.status)} shadow-[0_0_5px_rgba(255,255,255,0.1)]`}></div>
                      <div className="min-w-0">
                        <h3 className={`text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate ${task.status === TaskStatus.Done ? 'line-through text-slate-500 dark:text-slate-600' : ''}`}>
                          {isFuture ? (
                            <span className="opacity-40 italic flex items-center gap-2">
                              <Clock size={10} /> Upcoming Task
                            </span>
                          ) : <RichText text={task.title} />}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{task.day}</span>
                          <span className="text-[7px] font-black text-slate-300 dark:text-white/20">|</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${getStatusColorClass(task.status).replace('bg-', 'text-')}`}>{task.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {resourcesCount > 0 && !isFuture && <Paperclip size={12} className="text-neon-cyan/50" />}
                      {task.status !== TaskStatus.Done && !isFuture && (
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
            <div className="py-20 text-center opacity-30 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center gap-3">
              <Terminal size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">No active tasks</span>
            </div>
          )}
        </section>

        <BlockerModal
          isOpen={blockerModalOpen}
          onClose={() => setBlockerModalOpen(false)}
          onSubmit={handleBlockerSubmit}
        />
      </div>
    );
  };

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      currentUser={state.currentUser}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default PerformerDashboard;