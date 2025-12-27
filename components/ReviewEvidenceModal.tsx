
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Task, TaskStatus, Deliverable } from '../types';
import { X, Check, ShieldAlert, MessageSquare, ExternalLink, Clock, User, Eye, ArrowRight, Zap, FileText, FileSpreadsheet, Download, Maximize2, Layers, Image as ImageIcon } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

const ReviewEvidenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}> = ({ isOpen, onClose, task }) => {
  const { state, approveTask, requestRevision } = useContext(AppContext);
  const [isDeclining, setIsDeclining] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsDeclining(false);
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !task || (!task.deliverables && !task.completionComment)) return null;

  const performer = state.users.find(u => u.id === task.assigneeId);
  const deliverables = task.deliverables || [];

  const handleApprove = () => {
    approveTask(task.id);
    onClose();
  };

  const handleDeclineSubmit = () => {
    if (!reason.trim()) return;
    requestRevision(task.id, reason);
    onClose();
  };

  const downloadFile = (d: Deliverable) => {
    if (!d.data) return;
    const link = document.createElement('a');
    link.href = d.data;
    link.download = d.fileName || 'deliverable';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-0 md:p-4">
      <div className="glass-terminal rounded-none md:rounded-sm w-full md:max-w-5xl border-0 md:border md:border-white/10 shadow-2xl overflow-hidden font-mono flex flex-col h-full md:h-auto md:max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Eye size={18} className="text-neon-cyan animate-pulse md:size-5" />
            <h2 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white">Tactical.Review.Interface</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
            {/* Left Sector: Metadata & Briefing */}
            <div className="lg:col-span-5 space-y-8 md:space-y-12">
              <div>
                <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target_Objective</div>
                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight leading-none mb-4">{task.title}</h3>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="px-2 md:px-3 py-1 border border-neon-cyan/30 text-neon-cyan text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-neon-cyan/5">
                    {task.priority} Priority
                  </div>
                  <div className="px-2 md:px-3 py-1 border border-white/10 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-white/5">
                    ID_{task.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 md:p-5 bg-white/5 border border-white/5 rounded-sm">
                <img src={performer?.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-sm grayscale border border-white/10 shadow-lg" />
                <div>
                  <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Node_Assignee</div>
                  <div className="text-xs md:text-sm font-bold text-white uppercase">{performer?.name}</div>
                  <div className="text-[7px] md:text-[8px] text-neon-green/60 uppercase font-black tracking-widest mt-1">{performer?.role}</div>
                </div>
              </div>

              {task.completionComment && (
                <div className="space-y-3 md:space-y-4">
                  <div className="text-[9px] md:text-[10px] font-black text-neon-green uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={12} /> Deployment_Closing_Statement
                  </div>
                  <div className="text-xs md:text-[13px] text-white font-bold leading-relaxed bg-neon-green/5 p-4 md:p-6 border border-neon-green/20 rounded-sm italic">
                    "{task.completionComment}"
                  </div>
                </div>
              )}

              <div className="space-y-3 md:space-y-4">
                <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Original_Technical_Briefing
                </div>
                <div className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed bg-black/40 p-4 md:p-6 border border-white/5 rounded-sm h-32 md:h-40 overflow-y-auto custom-scrollbar">
                  {task.description || "No parameters provided."}
                </div>
              </div>
            </div>

            {/* Right Sector: Evidence Feed */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
                <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                   <span>Evidence_Payload ({deliverables.length} Assets)</span>
                   <Clock size={12} />
                </div>

                <div className="space-y-6 md:space-y-8 pb-10">
                   {deliverables.length === 0 ? (
                     <div className="h-full border border-dashed border-white/5 flex flex-col items-center justify-center py-16 md:py-20 opacity-20 gap-4">
                        <Layers size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">No visual assets</span>
                     </div>
                   ) : (
                     deliverables.map((d, idx) => (
                       <div key={d.id} className="space-y-3 md:space-y-4 border-b border-white/5 pb-6 last:border-0">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                <div className="p-1.5 md:p-2 bg-white/5 border border-white/10 text-neon-cyan shrink-0">
                                   {d.type === 'link' && <ExternalLink size={12} />}
                                   {d.type === 'image' && <ImageIcon size={12} />}
                                   {d.type === 'comparison' && <Layers size={12} />}
                                   {d.type === 'csv' && <FileSpreadsheet size={12} />}
                                   {d.type === 'pdf' && <FileText size={12} />}
                                </div>
                                <div className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest truncate">
                                   Asset_0{idx + 1} / {d.type.toUpperCase()}
                                </div>
                             </div>
                             <div className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest shrink-0">
                                {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>

                          <div className="bg-black/60 border border-white/5 rounded-sm overflow-hidden min-h-[220px] md:min-h-[300px] flex items-center justify-center relative">
                             {d.type === 'image' && <img src={d.data} className="w-full h-full object-contain p-2 md:p-4" />}
                             {d.type === 'comparison' && <BeforeAfterSlider before={d.beforeData!} after={d.afterData!} />}
                             {(d.type === 'csv' || d.type === 'pdf') && (
                                <div className="text-center p-8 md:p-12 space-y-4">
                                   <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                                      {d.type === 'csv' ? <FileSpreadsheet size={20} className="text-neon-green" /> : <FileText size={20} className="text-neon-cyan" />}
                                   </div>
                                   <div className="text-[10px] font-bold text-white truncate max-w-[200px] md:max-w-xs mx-auto">{d.fileName}</div>
                                   <button onClick={() => downloadFile(d)} className="flex items-center gap-2 px-4 md:px-6 py-2 bg-white/5 border border-white/10 text-[8px] font-black text-white uppercase tracking-widest hover:bg-white/10 mx-auto">
                                      <Download size={10} /> Extract
                                   </button>
                                </div>
                             )}
                             {d.type === 'link' && (
                                <div className="text-center p-8 md:p-12 space-y-3">
                                   <ExternalLink size={24} className="text-neon-cyan/30 mx-auto mb-3" />
                                   <a href={d.url} target="_blank" rel="noopener" className="block text-[10px] font-bold text-neon-cyan underline truncate max-w-[180px] md:max-w-sm mx-auto">
                                      {d.url}
                                   </a>
                                </div>
                             )}
                          </div>
                       </div>
                     ))
                   )}
                </div>
            </div>
          </div>

          {isDeclining && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 mt-8 md:mt-12">
              <div className="p-4 md:p-8 bg-rose-500/5 border border-rose-500/20 space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 text-[10px] md:text-[12px] font-black text-rose-500 uppercase tracking-widest">
                  <ShieldAlert size={16} /> Rejection Parameters
                </div>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify required corrections..."
                  autoFocus
                  className="w-full bg-slate-950 border border-rose-500/20 p-4 md:p-6 text-xs md:text-sm text-slate-300 outline-none focus:border-rose-500 h-28 md:h-32 resize-none font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6 shrink-0 pb-safe md:pb-8">
          {!isDeclining ? (
            <>
              <button onClick={() => setIsDeclining(true)} className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 text-rose-500 hover:bg-rose-500/10 transition-all text-[9px] md:text-[11px] font-black uppercase tracking-widest border border-rose-500/20">
                Reject
              </button>
              <div className="hidden md:block flex-1"></div>
              <button onClick={handleApprove} className="tactical-button flex-1 md:flex-none px-10 md:px-14 py-3 md:py-4 text-white flex items-center justify-center gap-3 md:gap-4 group">
                <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
                <Zap size={16} className="text-neon-green" />
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest">Approve Deployment</span>
                <ArrowRight size={16} className="hidden md:block" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsDeclining(false)} className="px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500">Back</button>
              <button onClick={handleDeclineSubmit} disabled={!reason.trim()} className="px-6 md:px-10 py-3 md:py-4 bg-rose-500 text-white text-[9px] md:text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-30">
                Commit & Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewEvidenceModal;
