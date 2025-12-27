
import React, { useContext, useState, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Task, TaskStatus } from '../types';
import { Check, X, ExternalLink, MessageSquare, Clock, ArrowRight, Eye, Square, FileSpreadsheet, FileText, Layers, Image as ImageIcon } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

const ReviewGallery: React.FC = () => {
  const { state, approveTask, requestRevision, viewEvidence } = useContext(AppContext);
  const reviewTasks = state.tasks.filter(t => t.status === TaskStatus.ReadyForReview);
  const [revisionComment, setRevisionComment] = useState<string>('');
  const [activeRevisionId, setActiveRevisionId] = useState<string | null>(null);

  if (reviewTasks.length === 0) return null;

  const handleApprove = (id: string) => {
    approveTask(id);
    setActiveRevisionId(null);
  };

  const handleRevision = (id: string) => {
    if (!revisionComment) return;
    requestRevision(id, revisionComment);
    setActiveRevisionId(null);
    setRevisionComment('');
  };

  const formatReviewAge = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8 md:mb-12 animate-in slide-in-from-top-4 duration-500 font-mono">
      {/* Tactical Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8 px-0">
        <div className="w-8 h-8 md:w-10 md:h-10 border border-neon-green/30 bg-neon-green/5 flex items-center justify-center text-neon-green shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <Eye size={18} />
        </div>
        <div>
          <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-white leading-none">Review.Queue</h2>
          <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1.5">Awaiting commander approval</p>
        </div>
      </div>

      <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-8 custom-scrollbar scroll-smooth snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
        {reviewTasks.map((task) => {
          const assignee = state.users.find(u => u.id === task.assigneeId);
          const deliverables = task.deliverables || [];
          const mainD = deliverables[0];
          const hasComment = !!task.completionComment;
          
          return (
            <div key={task.id} className="w-[85vw] md:w-[440px] shrink-0 bg-[#020617] border border-white/5 flex flex-col group overflow-hidden shadow-2xl snap-center first:ml-0">
              
              {/* Media Section (Shows first item) */}
              <div className="h-[200px] md:h-[260px] bg-black relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => viewEvidence(task)}>
                {mainD?.type === 'image' && <img src={mainD.data} className="w-full h-full object-cover" />}
                {mainD?.type === 'comparison' && <BeforeAfterSlider before={mainD.beforeData!} after={mainD.afterData!} />}
                {(mainD?.type === 'csv' || mainD?.type === 'pdf') && (
                  <div className="flex flex-col items-center gap-3 text-center p-6 bg-obsidian-900 w-full h-full justify-center">
                    {mainD.type === 'csv' ? <FileSpreadsheet size={40} className="text-neon-green/20" /> : <FileText size={40} className="text-neon-cyan/20" />}
                    <div className="px-4 truncate w-full text-[10px] md:text-xs font-black text-white uppercase tracking-widest">{mainD.fileName}</div>
                  </div>
                )}
                {mainD?.type === 'link' && (
                  <div className="flex flex-col items-center gap-3 text-center p-6 bg-obsidian-900 w-full h-full justify-center">
                    <ExternalLink size={40} className="text-neon-cyan/20" />
                    <a href={mainD.url} target="_blank" rel="noopener" className="text-[10px] md:text-xs font-black text-neon-cyan underline decoration-neon-cyan/30 break-all px-4">
                      {mainD.url}
                    </a>
                  </div>
                )}
                
                {/* Overlay for multiple items */}
                {deliverables.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Layers size={10} /> +{deliverables.length - 1}
                  </div>
                )}
                
                <div className="absolute inset-0 pointer-events-none border border-white/5"></div>
              </div>

              {/* Info Section */}
              <div className="p-4 md:p-6 bg-[#020617]">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs md:text-md font-black text-white uppercase tracking-tight truncate">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                        {assignee?.name}
                      </div>
                      {hasComment && <MessageSquare size={10} className="text-neon-green" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 shrink-0">
                    <Clock size={12} />
                    <span className="text-[10px] md:text-xs font-bold tabular-nums">
                      {deliverables[0]?.timestamp ? formatReviewAge(deliverables[0].timestamp) : '00:00'}
                    </span>
                  </div>
                </div>

                {/* Revision UI Transition */}
                {activeRevisionId === task.id ? (
                  <div className="space-y-3 md:space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative">
                      <div className="absolute top-2 left-2 text-[7px] md:text-[8px] font-black text-rose-500/50 uppercase tracking-widest">Feedback_Input</div>
                      <textarea
                        value={revisionComment}
                        onChange={(e) => setRevisionComment(e.target.value)}
                        placeholder="Specify required corrections..."
                        autoFocus
                        className="w-full bg-black border border-rose-500/30 p-3 pt-7 text-[10px] md:text-[11px] text-slate-300 outline-none h-20 md:h-24 resize-none focus:border-rose-500 transition-all"
                      />
                    </div>
                    <div className="flex gap-2 md:gap-4">
                      <button 
                        onClick={() => setActiveRevisionId(null)} 
                        className="flex-1 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleRevision(task.id)} 
                        disabled={!revisionComment.trim()}
                        className="flex-1 py-2 md:py-3 bg-rose-600 text-white rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all disabled:opacity-30"
                      >
                        Revision
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setActiveRevisionId(task.id)}
                      className="group flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 border border-rose-500/40 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <div className="w-4 h-4 md:w-5 md:h-5 border border-rose-500/40 flex items-center justify-center">
                        <Square size={8} className="fill-current" />
                      </div>
                      <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">Revision</span>
                    </button>
                    <button 
                      onClick={() => handleApprove(task.id)}
                      className="group flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-600 text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    >
                      <Check size={14} className="text-emerald-400 group-hover:text-white" />
                      <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewGallery;
