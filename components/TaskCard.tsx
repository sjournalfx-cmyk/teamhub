
import React, { useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Deliverable } from '../types';
import { Play, CheckCircle, Clock, MoreVertical, Edit, Trash2, AlertOctagon, Video, Target, AlarmClock, MapPin, Terminal, Calendar, Eye, ShieldCheck, FileText, Database, PackageSearch, Sparkles, ListTree, Lightbulb, Loader2, Check, Lock, Radio, ShieldAlert, Paperclip, Download, ExternalLink } from 'lucide-react';
import { AppContext } from '../context';
import Tooltip from './Tooltip';
import RichText from './RichText';
import FilePreviewModal from './FilePreviewModal';
import BlockerModal from './BlockerModal';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  showAI?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  zoomLevel?: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, showAI = false, isSelected = false, onSelect, zoomLevel = 1 }) => {
  const { toggleFocus, state, updateTaskStatus, openTaskModal, deleteTask, toggleTaskBlocker, userRole, viewEvidence, askRubberDuck, toggleBreakdownStep, acceptTask, triggerCelebration } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJustMoved, setIsJustMoved] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Deliverable[]>([]);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);

  const isFocusing = state.activeFocusTaskId === task.id;
  
  const assignees = (task.assigneeIds && task.assigneeIds.length > 0)
    ? state.users.filter(u => task.assigneeIds!.includes(u.id))
    : state.users.filter(u => u.id === task.assigneeId);

  const parentGoal = state.goals.find(g => g.id === task.goalId);
  const isPendingReview = task.status === TaskStatus.ReadyForReview;
  const isDone = task.status === TaskStatus.Done;
  const isStuck = task.status === TaskStatus.Stuck;
  const deliverablesCount = task.deliverables?.length || 0;
  const resourcesCount = task.resources?.length || 0;

  useEffect(() => {
    if (task.lastMovedAt && Date.now() - task.lastMovedAt < 1000) {
      setIsJustMoved(true);
      const timer = setTimeout(() => setIsJustMoved(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [task.lastMovedAt]);

  const priorityStyles = {
    [Priority.High]: 'text-white border-rose-500 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
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
        if (userRole === 'admin') {
          triggerCelebration('confetti');
        }
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
      setIsBlockerModalOpen(true);
    }
  }

  const handleBlockerSubmit = (reason: string, suggestion: string) => {
    toggleTaskBlocker(task.id, reason, suggestion);
  };

  const openPreview = (files: Deliverable[], index: number) => {
    setPreviewFiles(files);
    setPreviewInitialIndex(index);
    setIsPreviewOpen(true);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const onDragStartInternal = (e: React.DragEvent, id: string) => {
    setIsDraggingLocal(true);
    onDragStart(e, id);

    // Create a custom drag image that looks "tactical"
    const dragImg = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImg.style.width = `${e.currentTarget.clientWidth}px`;
    dragImg.style.opacity = '0.8';
    dragImg.style.position = 'absolute';
    dragImg.style.top = '-1000px';
    dragImg.style.left = '-1000px';
    dragImg.style.transform = 'scale(0.95)';
    dragImg.style.zIndex = '1000';
    dragImg.style.pointerEvents = 'none';
    dragImg.classList.add('glass-layer-3', 'border-neon-cyan');

    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 20, 20);

    // Remove the clone after a short delay
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStartInternal(e, task.id)}
      onDragEnd={() => setIsDraggingLocal(false)}
      onClick={() => openTaskModal(task)}
      role="button"
      aria-label={`Task: ${task.title}`}
      className={`
        glass-layer-1 group relative ${zoomLevel === 1 ? 'p-6' : 'p-3'} mb-4 transition-all cursor-grab active:cursor-grabbing hover:glass-layer-2 w-full
        ${task.isDraft ? 'opacity-50 border-dashed border-black/20 dark:border-white/20' : ''}
        ${task.isBlocked ? 'border-rose-500/40 bg-rose-500/5' : ''}
        ${task.priority === Priority.High && !isDone && !task.isBlocked ? 'border-rose-500/20 bg-rose-500/[0.03]' : ''}
        ${isFocusing ? 'border-neon-green bg-neon-green/5 ring-1 ring-neon-green/20 scale-[1.01]' : ''}
        ${isDone ? 'opacity-50 grayscale-50 border-black/5 dark:border-white/5' : ''}
        ${isPendingReview ? 'border-neon-cyan/50 bg-neon-cyan/5 ring-1 ring-neon-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : ''}
        ${isCompleting ? 'border-neon-green animate-pulse' : ''}
        ${!task.isAccepted && !task.isDraft && userRole === 'performer' ? 'ring-2 ring-amber-500/50' : ''}
        ${isDraggingLocal ? 'opacity-20 scale-95 border-dashed border-neon-cyan shadow-inner' : ''}
        ${isJustMoved ? 'ring-2 ring-neon-cyan border-neon-cyan animate-in zoom-in-95 duration-500' : ''}
      `}
    >
      <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity ${isJustMoved ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green animate-scan"></div>
      </div>

      {onSelect && (
        <div className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(task.id, !isSelected); }}
            aria-label={isSelected ? "Deselect task" : "Select task"}
            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${isSelected ? 'bg-neon-green border-neon-green text-obsidian-950' : 'bg-black/20 border-white/10 text-white/40 hover:border-neon-green'}`}
          >
            {isSelected && <Check size={14} strokeWidth={4} />}
          </button>
        </div>
      )}

      {task.isDraft && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-sm">
          <Lock size={10} /> Draft Task
        </div>
      )}

      {task.isBlocked && (
        <div className="flex flex-col gap-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm">
          <div className="flex items-start gap-2">
            <AlertOctagon size={14} className="text-rose-500 mt-0.5" />
            <div className="text-[10px] font-mono font-black uppercase text-rose-500 tracking-wider">
              PROBLEM: {task.blockerMessage}
            </div>
          </div>
          {task.blockerSuggestion && (
            <div className="pl-6 border-l border-rose-500/20">
              <div className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mb-1">PROPOSED SOLUTION:</div>
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
            <Radio size={14} className="animate-pulse" /> Accept Task
          </button>
        </div>
      )}

      {isPendingReview && userRole === 'admin' && (
        <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm animate-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-neon-cyan" />
            <div className="text-[10px] font-mono font-black uppercase text-neon-cyan tracking-wider">
              WORK.SUBMITTED ({deliverablesCount})
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); viewEvidence(task); }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-neon-cyan transition-colors border border-black/10 dark:border-white/10 px-3 py-1 hover:border-neon-cyan/30 bg-white/20 dark:bg-black/20"
          >
            Inspect
          </button>
        </div>
      )}

      <div className={`flex justify-between items-start ${zoomLevel === 1 ? 'mb-4' : 'mb-2'}`}>
        <div className={`px-3 py-1 border rounded-sm ${zoomLevel === 1 ? 'text-[9px]' : 'text-[7px]'} font-mono font-black uppercase tracking-[0.2em] ${priorityStyles[task.priority]}`}>
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
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
              <MoreVertical size={16} />
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-1 w-40 glass-layer-3 z-50 py-1 font-mono text-[10px] uppercase tracking-widest">
                  <button onClick={() => { setIsMenuOpen(false); openTaskModal(task); }} className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                    <Edit size={12} /> Edit
                  </button>
                  {!task.isDraft && (
                    <button onClick={handleBlockerToggle} className={`w-full text-left px-4 py-2 flex items-center gap-2 ${task.isBlocked ? 'text-neon-green' : 'text-rose-500'} hover:bg-black/5 dark:hover:bg-white/5`}>
                      <AlertOctagon size={12} /> {task.isBlocked ? 'Resolve' : 'Block'}
                    </button>
                  )}
                  <button onClick={() => { setIsMenuOpen(false); deleteTask(task.id); }} className="w-full text-left px-4 py-2 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 flex items-center gap-2 border-t border-black/5 dark:border-white/5">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <h4 className={`${zoomLevel === 1 ? 'text-sm' : 'text-[11px]'} font-black font-mono tracking-tight text-slate-900 dark:text-white ${zoomLevel === 1 ? 'mb-4' : 'mb-2'} leading-relaxed group-hover:text-neon-green transition-colors ${isDone ? 'line-through text-slate-500' : ''}`}>
        <RichText text={task.title} />
      </h4>

      {zoomLevel === 1 && (isDone || isPendingReview || isFocusing || task.breakdown || task.aiSuggestions || resourcesCount > 0) && (
        <div className="space-y-4 mb-4">
          {task.description && (
            <div className="p-4 bg-black/5 dark:bg-white/5 border-l-2 border-neon-cyan/30 rounded-r-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                <FileText size={10} /> Task Description
              </div>
              <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {resourcesCount > 0 && (
            <div className="p-4 bg-neon-cyan/5 border-l-2 border-neon-cyan/30 rounded-r-sm animate-in slide-in-from-right-2 duration-500">
              <div className="flex items-center gap-2 text-[8px] font-black text-neon-cyan uppercase tracking-widest mb-3">
                <Paperclip size={10} /> Resources
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {task.resources?.map((res) => (
                  <button
                    key={res.id}
                    onClick={(e) => { e.stopPropagation(); openPreview(task.resources || [], task.resources?.indexOf(res) || 0); }}
                    className="flex items-center justify-between p-2 bg-white/20 dark:bg-black/20 hover:bg-neon-cyan/10 border border-black/5 dark:border-white/5 transition-all text-left group/res"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {res.type === 'image' ? <Eye size={10} className="text-neon-cyan shrink-0" /> : res.type === 'link' ? <ExternalLink size={10} className="text-neon-cyan shrink-0" /> : <Download size={10} className="text-neon-cyan shrink-0" />}
                      <span className="text-[9px] font-mono text-slate-700 dark:text-slate-300 truncate group-hover/res:text-neon-cyan">
                        {res.fileName || res.url}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.breakdown && task.breakdown.length > 0 && (
            <div className="p-4 bg-white/40 dark:bg-obsidian-950/40 border-l-2 border-neon-green/30 rounded-r-sm animate-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-2 text-[8px] font-black text-neon-green uppercase tracking-widest mb-3">
                <ListTree size={10} /> Steps
              </div>
              <div className="space-y-2">
                {task.breakdown.map((step, idx) => {
                  const isStepDone = task.completedSteps?.includes(idx);
                  return (
                    <div key={idx} className="flex items-start gap-2 group/step">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBreakdownStep(task.id, idx); }}
                        className={`text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border transition-all shrink-0 ${isStepDone ? 'bg-neon-green border-neon-green text-obsidian-950' : 'text-slate-700 bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-neon-green/50'}`}
                      >
                        {isStepDone ? <Check size={8} strokeWidth={4} /> : idx + 1}
                      </button>
                      <p className={`text-[9px] font-mono leading-snug pt-0.5 transition-all ${isStepDone ? 'text-slate-600 line-through italic' : 'text-slate-600 dark:text-slate-300 group-hover/step:text-slate-900 dark:group-hover/step:text-white'}`}>
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
        <div className={`flex items-center gap-3 ${zoomLevel === 1 ? 'text-[9px]' : 'text-[7px]'} font-mono font-black uppercase tracking-widest text-slate-500`}>
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-sm border border-black/5 dark:border-white/5">
            <Clock size={zoomLevel === 1 ? 12 : 10} className="text-slate-600" />
            <span>{task.estimateHours}H</span>
          </div>
          {task.scheduledAt && (
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-sm border border-black/5 dark:border-white/5 text-neon-green/80">
              <Calendar size={12} className="text-neon-green/60" />
              <span>{formatDate(task.scheduledAt)}</span>
            </div>
          )}
          {parentGoal && (
            <div className="flex items-center gap-1.5 text-neon-cyan bg-neon-cyan/5 px-2 py-1 rounded-sm border border-neon-cyan/20">
              <Target size={12} />
              <span>GOAL</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {deliverablesCount > 0 && (
            <Tooltip content={`View ${deliverablesCount} Files`}>
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
              className={`p-2 rounded-sm transition-all border ${isDone ? 'bg-neon-green text-obsidian-950 border-neon-green' : isPendingReview ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-600 hover:text-neon-green hover:border-neon-green/50'} ${!task.isAccepted && userRole === 'performer' ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              {isDone ? <CheckCircle size={14} /> : isPendingReview ? <Eye size={14} /> : <div className="w-3.5 h-3.5 border border-current"></div>}
            </button>
          )}
        </div>
      </div>

      {zoomLevel === 1 && assignees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {assignees.map(a => (
                <img 
                  key={a.id} 
                  src={a.avatar} 
                  className="inline-block w-5 h-5 rounded-sm grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100 ring-1 ring-white dark:ring-obsidian-950" 
                  title={a.name}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
              {assignees.length === 1 ? `Member: ${assignees[0].name.toUpperCase()}` : `${assignees.length} Members Assigned`}
            </span>
          </div>
          <div className="text-[8px] font-mono text-slate-400 dark:text-slate-600 shrink-0">ID_{task.id.split('-')[0].toUpperCase()}</div>
        </div>
      )}

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        files={previewFiles}
        initialIndex={previewInitialIndex}
      />

      <BlockerModal
        isOpen={isBlockerModalOpen}
        onClose={() => setIsBlockerModalOpen(false)}
        onSubmit={handleBlockerSubmit}
      />
    </div>
  );
};

export default TaskCard;
