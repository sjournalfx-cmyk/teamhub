import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { Task, Deliverable } from '../types';
import { X, Link, Image as ImageIcon, Check, Upload, Layers, ArrowRight, Zap, FileSpreadsheet, FileText, Trash2, Plus, MessageSquare, Terminal, ShieldCheck, Activity, Cpu } from 'lucide-react';
import FileUpload from './FileUpload';

const CompletionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}> = ({ isOpen, onClose, task }) => {
  const { submitForReview, state, triggerCelebration } = useContext(AppContext);
  const [stagedItems, setStagedItems] = useState<Deliverable[]>([]);
  const [comment, setComment] = useState('');

  // Staging form state
  const [type, setType] = useState<'link' | 'image' | 'comparison' | 'csv' | 'pdf' | 'document'>('link');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [beforeImg, setBeforeImg] = useState<string | null>(null);
  const [afterImg, setAfterImg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStagedItems([]);
      setComment('');
      resetStageForm();
    }
  }, [isOpen]);

  const resetStageForm = () => {
    setUrl('');
    setFileName('');
    setBeforeImg(null);
    setAfterImg(null);
    setType('link');
  };

  if (!isOpen || !task) return null;

  const handleUploadComplete = (url: string, fileName: string) => {
    setUrl(url);
    setFileName(fileName);
  };

  const addToStage = () => {
    const newItem: Deliverable = {
      id: `d-${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      url: (type === 'link' || type === 'image' || type === 'csv' || type === 'pdf' || type === 'document') ? url : undefined,
      fileName: (type === 'csv' || type === 'pdf' || type === 'document') ? fileName : undefined,
      beforeData: type === 'comparison' ? beforeImg || undefined : undefined,
      afterData: type === 'comparison' ? afterImg || undefined : undefined,
    };
    setStagedItems(prev => [...prev, newItem]);
    resetStageForm();
  };

  const removeItem = (id: string) => {
    setStagedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    submitForReview(task.id, stagedItems, comment);
    triggerCelebration('tech');
    onClose();
  };

  const isStageValid = () => {
    if (type === 'link') return !!url;
    if (type === 'comparison') return !!beforeImg && !!afterImg;
    return !!url;
  };

  return (
    <div className="fixed inset-0 bg-slate-200/90 dark:bg-obsidian-950/95 backdrop-blur-md z-[150] flex items-center justify-center p-0 md:p-6">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-4xl border-0 md:border md:border-white/10 shadow-2xl overflow-hidden font-mono flex flex-col h-full md:h-auto md:max-h-[85vh] relative animate-in zoom-in-95 duration-300">
        
        {/* Tactical Scan Line Animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan/20 animate-scan z-10 pointer-events-none" />
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white leading-none">Evidence_Submission</h2>
              <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mt-1.5 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Auth_Channel_Secured
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-2 hover:bg-rose-500/20 hover:text-rose-500 rounded-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Panel: Input & Staging */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="text-[9px] font-black text-neon-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={12} /> Target_Context
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate border-b border-black/10 dark:border-white/10 pb-3">{task.title}</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-black/20 dark:bg-black/40 border border-white/5 p-5 space-y-6 relative group/stage">
                  <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-neon-cyan opacity-50" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                      <Plus size={14} className="text-neon-cyan" /> Add_Payload
                      {task.evidenceRequired === false && <span className="text-[8px] text-slate-500 font-bold tracking-normal ml-2">// OPTIONAL</span>}
                    </div>
                  </div>

                  {/* Icon-based Type Selector */}
                  <div className="flex gap-2">
                    {(['link', 'image', 'comparison', 'document', 'csv', 'pdf'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        title={t.toUpperCase()}
                        className={`w-10 h-10 flex items-center justify-center transition-all border ${type === t ? 'bg-neon-cyan border-neon-cyan text-obsidian-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-white/10 text-slate-500 hover:border-white/30 hover:text-white'}`}
                      >
                        {t === 'link' ? <Link size={16} /> :
                          t === 'image' ? <ImageIcon size={16} /> :
                            t === 'comparison' ? <Layers size={16} /> :
                              t === 'csv' ? <FileSpreadsheet size={16} /> :
                                <FileText size={16} />}
                      </button>
                    ))}
                  </div>

                  {/* Compact Input Area */}
                  <div className="min-h-[140px] flex flex-col justify-center animate-in fade-in duration-300">
                    {type === 'link' && (
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="SOURCE_URL_HTTPS://"
                        className="w-full bg-black/40 border border-white/10 p-4 text-xs text-neon-cyan outline-none focus:border-neon-cyan transition-all font-mono placeholder:text-slate-700"
                      />
                    )}

                    {(type === 'image' || type === 'csv' || type === 'pdf') && (
                      <FileUpload
                        onUploadComplete={handleUploadComplete}
                        accept={type === 'image' ? "image/*" : type === 'csv' ? ".csv,.xls,.xlsx" : type === 'pdf' ? ".pdf" : "*"}
                        label={`UPLOAD_${type.toUpperCase()}`}
                      />
                    )}

                    {type === 'comparison' && (
                      <div className="grid grid-cols-2 gap-4">
                        <FileUpload onUploadComplete={(url) => setBeforeImg(url)} accept="image/*" label="BEFORE" />
                        <FileUpload onUploadComplete={(url) => setAfterImg(url)} accept="image/*" label="AFTER" />
                      </div>
                    )}

                    {url && type !== 'comparison' && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/20">
                        <Check size={14} className="text-neon-green" />
                        <span className="text-[10px] text-neon-green font-black uppercase tracking-widest truncate">{fileName || 'PAYLOAD_READY'}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={addToStage}
                    disabled={!isStageValid()}
                    className="w-full py-4 bg-white dark:bg-slate-800 text-obsidian-950 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neon-cyan hover:text-obsidian-950 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                  >
                    <Cpu size={14} /> Inject_Asset
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} /> Execution_Summary
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="ENTER_REPORT_DATA..."
                    className="w-full bg-black/10 dark:bg-black/30 border border-white/5 p-4 text-xs text-slate-300 outline-none h-24 resize-none focus:border-neon-cyan/50 transition-all font-mono placeholder:text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Manifest List */}
          <div className="w-full md:w-[340px] bg-black/10 dark:bg-black/20 overflow-y-auto flex flex-col custom-scrollbar">
            <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <Terminal size={14} /> Manifest_V1.0
              </div>
              <div className="text-[10px] font-black text-neon-cyan">{stagedItems.length} ITEMS</div>
            </div>

            <div className="flex-1 p-5">
              {stagedItems.length === 0 ? (
                <div className="h-64 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 gap-3">
                  <Layers size={24} />
                  <div className="text-[9px] font-black uppercase tracking-widest text-center">Empty_Manifest</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {stagedItems.map((item, idx) => (
                    <div key={item.id} className="bg-black/40 border border-white/10 p-3 flex items-center justify-between group hover:border-neon-cyan/50 transition-all animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-neon-cyan shrink-0">
                          {item.type === 'link' ? <Link size={14} /> : item.type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black text-white uppercase truncate">{item.fileName || 'Asset_Link'}</div>
                          <div className="text-[7px] text-slate-500 font-mono tracking-tighter uppercase">{item.type} // {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-5 border-t border-white/5 bg-black/40 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Signal_Status</span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${stagedItems.length > 0 ? 'text-neon-green' : 'text-amber-500'}`}>
                  {stagedItems.length > 0 ? 'Ready_To_Sync' : 'Incomplete'}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={stagedItems.length === 0 && !comment.trim()}
                className="w-full py-4 bg-neon-cyan text-obsidian-950 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 group disabled:opacity-20"
              >
                <Zap size={16} className="group-hover:scale-125 transition-transform" />
                Broadcast_Payload
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
