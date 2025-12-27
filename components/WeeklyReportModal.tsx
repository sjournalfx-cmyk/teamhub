
import React, { useContext, useState, useEffect, useRef } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { TaskStatus, Goal, Task } from '../types';
import { X, Download, FileText, Target, Clock, AlertCircle, CheckCircle2, Cpu, Printer, Share2, Loader2, Sparkles, Building2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { generateReportSummary } from '../services/geminiService';

const WeeklyReportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state } = useContext(AppContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const completedTasks = state.tasks.filter(t => t.status === TaskStatus.Done);
  const burnedHours = completedTasks.reduce((acc, t) => acc + t.estimateHours, 0);
  const activeGoals = state.goals;
  const blockers = state.tasks.filter(t => t.isBlocked);

  useEffect(() => {
    if (isOpen) {
      loadAiSummary();
    }
  }, [isOpen]);

  const loadAiSummary = async () => {
    setIsGenerating(true);
    const summary = await generateReportSummary(state);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  const handleExport = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
        backgroundColor: isPrintMode ? '#ffffff' : '#020617',
        scale: 2
    });
    const link = document.createElement('a');
    link.download = `Weekly_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-obsidian-950/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center text-neon-cyan">
             <FileText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] font-mono leading-none">Weekly.Strategic_Review</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2">White-labeled stakeholder report</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPrintMode(!isPrintMode)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${isPrintMode ? 'bg-white text-obsidian-950 border-white' : 'text-slate-500 border-white/10 hover:text-white hover:border-white/30'}`}
          >
            <Printer size={14} /> {isPrintMode ? 'Digital Mode' : 'Print Layout'}
          </button>
          <button 
            onClick={handleExport}
            className="tactical-button px-6 py-2 text-white flex items-center gap-2"
          >
            <Download size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Export Image</span>
          </button>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl overflow-y-auto custom-scrollbar rounded-sm shadow-2xl bg-obsidian-950 border border-white/5">
        <div 
          ref={reportRef} 
          className={`p-16 transition-colors duration-500 ${isPrintMode ? 'bg-white text-slate-900' : 'bg-[#020617] text-white'}`}
        >
          {/* Document Header */}
          <div className="flex justify-between items-start mb-16 border-b pb-12 border-slate-200 dark:border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <Building2 size={24} className={isPrintMode ? 'text-slate-900' : 'text-neon-cyan'} />
                 <span className={`text-xl font-black uppercase tracking-[0.4em] ${isPrintMode ? 'text-slate-900' : 'text-white'}`}>TeamHub.ClientReport</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-4">Operations Summary</h1>
              <div className="flex items-center gap-6">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Period: Week Ending {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-neon-green">Status: Healthy</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Report Serial</div>
              <div className="text-sm font-mono font-bold tracking-tighter">SW-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className={`p-8 border ${isPrintMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
               <div className="flex items-center gap-3 mb-4 opacity-60">
                  <Clock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Capacity Burned</span>
               </div>
               <div className="text-4xl font-black mb-1">{burnedHours} <span className="text-lg opacity-40">HOURS</span></div>
               <p className="text-[10px] opacity-60 uppercase font-bold">Invested in production this week</p>
            </div>
            <div className={`p-8 border ${isPrintMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
               <div className="flex items-center gap-3 mb-4 opacity-60">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Items Shipped</span>
               </div>
               <div className="text-4xl font-black mb-1">{completedTasks.length} <span className="text-lg opacity-40">TASKS</span></div>
               <p className="text-[10px] opacity-60 uppercase font-bold">Successfully deployed to production</p>
            </div>
            <div className={`p-8 border ${isPrintMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
               <div className="flex items-center gap-3 mb-4 opacity-60">
                  <Target size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Strategic Wins</span>
               </div>
               <div className="text-4xl font-black mb-1">{activeGoals.filter(g => g.progress > 0).length} <span className="text-lg opacity-40">VECTORS</span></div>
               <p className="text-[10px] opacity-60 uppercase font-bold">Goals actively progressing</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="mb-16">
             <div className="flex items-center gap-3 mb-6">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Executive Summary</h3>
             </div>
             <div className={`p-10 text-xl font-medium leading-relaxed italic border-l-4 ${isPrintMode ? 'bg-slate-50 border-slate-300' : 'bg-white/5 border-neon-cyan/40'}`}>
                {isGenerating ? (
                    <div className="flex items-center gap-4">
                        <Loader2 size={24} className="animate-spin text-neon-cyan" />
                        <span className="text-sm font-black uppercase tracking-widest opacity-40">Compiling mission metadata...</span>
                    </div>
                ) : (
                    aiSummary || "The team maintained high operational velocity this week, completing key tactical units. Focus remains on strategic objectives for the upcoming sprint."
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Goal Progress Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-3 mb-4">
                    <Target size={18} className="text-neon-cyan" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Strategic Goal Status</h3>
                </div>
                <div className="space-y-8">
                    {activeGoals.map(goal => (
                        <div key={goal.id} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black uppercase tracking-tight">{goal.title}</span>
                                <span className="text-xs font-black">{goal.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-neon-cyan transition-all duration-1000" 
                                    style={{ width: `${goal.progress}%` }}
                                ></div>
                            </div>
                            <div className="flex gap-4 opacity-40">
                                {goal.milestones.slice(0, 3).map((m, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
                                        {m.isCompleted ? <CheckCircle2 size={10} className="text-neon-green" /> : <div className="w-2 h-2 rounded-full border border-current" />}
                                        {m.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blockers & Friction */}
            <div className="space-y-10">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={18} className="text-rose-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Operational Friction</h3>
                </div>
                <div className="space-y-6">
                    {blockers.length > 0 ? (
                        blockers.map(t => (
                            <div key={t.id} className={`p-6 border-l-4 border-rose-500 ${isPrintMode ? 'bg-rose-50' : 'bg-rose-500/5'}`}>
                                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Issue: {t.title}</div>
                                <div className="text-sm font-bold">{t.blockerMessage}</div>
                                <div className="mt-3 text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    Status: Requires Immediate Stakeholder Input
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 opacity-30 gap-3 border border-dashed border-current">
                            <CheckCircle2 size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">No Active Friction Detected</span>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-24 pt-12 border-t border-slate-200 dark:border-white/5 flex justify-between items-center opacity-40">
            <div className="text-[9px] font-black uppercase tracking-widest">Generated by TeamHub Tactical Advisor</div>
            <div className="flex gap-6">
                <div className="text-[9px] font-black uppercase tracking-widest">Confidential</div>
                <div className="text-[9px] font-black uppercase tracking-widest">Internal Use Only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportModal;
