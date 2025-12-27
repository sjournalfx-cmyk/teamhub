
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Task, Deliverable } from '../types';
import { X, Link, Image as ImageIcon, Check, Upload, Layers, ArrowRight, Zap, FileSpreadsheet, FileText, Trash2, Plus, MessageSquare, Terminal } from 'lucide-react';

const CompletionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  task: Task | null;
}> = ({ isOpen, onClose, task }) => {
  const { submitForReview } = useContext(AppContext);
  const [stagedItems, setStagedItems] = useState<Deliverable[]>([]);
  const [comment, setComment] = useState('');
  
  // Staging form state
  const [type, setType] = useState<'link' | 'image' | 'comparison' | 'csv' | 'pdf'>('link');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
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
    setFileData(null);
    setBeforeImg(null);
    setAfterImg(null);
    setType('link');
  };

  if (!isOpen || !task) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void, nameSetter?: (n: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (nameSetter) nameSetter(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addToStage = () => {
    const newItem: Deliverable = {
      id: `d-${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      url: type === 'link' ? url : undefined,
      fileName: (type === 'csv' || type === 'pdf') ? fileName : undefined,
      data: (type === 'image' || type === 'csv' || type === 'pdf') ? fileData || undefined : undefined,
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
    onClose();
  };

  const isStageValid = () => {
    if (type === 'link') return !!url;
    if (type === 'comparison') return !!beforeImg && !!afterImg;
    return !!fileData;
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="glass-terminal rounded-sm w-full max-w-4xl border border-white/10 shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-neon-green" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">The.Closing.Ritual</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Objective: {task.title}</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Construct your tactical summary. Add multiple items of evidence below.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Adding Evidence */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/5 space-y-6">
                <div className="text-[10px] font-black uppercase text-neon-cyan tracking-widest flex items-center gap-2">
                  <Plus size={14} /> Stage New Evidence
                </div>
                
                <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-sm border border-white/5">
                  {(['link', 'image', 'comparison', 'csv', 'pdf'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 ${type === t ? 'bg-neon-green/20 text-neon-green' : 'text-slate-500 hover:text-white'}`}
                    >
                      {t === 'link' ? <Link size={12}/> : 
                       t === 'image' ? <ImageIcon size={12}/> : 
                       t === 'comparison' ? <Layers size={12}/> :
                       t === 'csv' ? <FileSpreadsheet size={12}/> :
                       <FileText size={12}/>}
                      {t}
                    </button>
                  ))}
                </div>

                <div className="min-h-[160px] flex flex-col justify-center">
                  {type === 'link' && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Resource URL</label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-white/10 p-4 text-xs text-neon-cyan outline-none focus:border-neon-cyan transition-all"
                      />
                    </div>
                  )}

                  {(type === 'image' || type === 'csv' || type === 'pdf') && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{type.toUpperCase()} Payload</label>
                      <div className="relative group h-32 border-2 border-dashed border-white/10 bg-black/40 hover:bg-white/[0.05] flex flex-col items-center justify-center gap-2">
                        {fileData ? (
                          <div className="text-center p-4">
                             <div className="text-[10px] text-white truncate max-w-[200px]">{fileName}</div>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-600" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Drop {type}</span>
                          </>
                        )}
                        <input type="file" onChange={(e) => handleFile(e, setFileData, setFileName)} className="absolute inset-0 opacity-0 cursor-pointer" accept={type === 'image' ? "image/*" : type === 'csv' ? ".csv" : ".pdf"} />
                      </div>
                    </div>
                  )}

                  {type === 'comparison' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Before</label>
                        <div className="relative h-24 border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center">
                          {beforeImg ? <img src={beforeImg} className="h-full w-full object-cover" /> : <Upload size={14} className="text-slate-600" />}
                          <input type="file" onChange={(e) => handleFile(e, setBeforeImg)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-neon-green tracking-widest">After</label>
                        <div className="relative h-24 border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center">
                          {afterImg ? <img src={afterImg} className="h-full w-full object-cover" /> : <Upload size={14} className="text-neon-green/40" />}
                          <input type="file" onChange={(e) => handleFile(e, setAfterImg)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={addToStage}
                  disabled={!isStageValid()}
                  className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-neon-green hover:text-obsidian-950 transition-all disabled:opacity-20"
                >
                  Stage Item
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} /> Deployment Log (Final Comment)
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Summary of deployment results..."
                  className="w-full bg-slate-950 border border-white/10 p-4 text-xs text-slate-300 outline-none h-32 resize-none focus:border-neon-cyan transition-all font-mono"
                />
              </div>
            </div>

            {/* Right: Staged Evidence List */}
            <div className="space-y-6">
               <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Terminal size={14} /> Staged Evidence ({stagedItems.length})
               </div>

               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {stagedItems.length === 0 ? (
                    <div className="h-40 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-30 gap-3">
                       <Layers size={24} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">No items staged</span>
                    </div>
                  ) : (
                    stagedItems.map(item => (
                      <div key={item.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="text-neon-cyan bg-neon-cyan/10 p-2 border border-neon-cyan/20">
                               {item.type === 'link' && <Link size={14}/>}
                               {item.type === 'image' && <ImageIcon size={14}/>}
                               {item.type === 'comparison' && <Layers size={14}/>}
                               {item.type === 'csv' && <FileSpreadsheet size={14}/>}
                               {item.type === 'pdf' && <FileText size={14}/>}
                            </div>
                            <div>
                               <div className="text-[10px] font-black text-white uppercase tracking-widest">
                                  {item.type.toUpperCase()}
                               </div>
                               <div className="text-[9px] text-slate-500 truncate max-w-[200px]">
                                  {item.url || item.fileName || 'Asset Payload'}
                               </div>
                            </div>
                         </div>
                         <button onClick={() => removeItem(item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-6 shrink-0">
          <button onClick={onClose} className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500">Abort</button>
          <button 
            onClick={handleSubmit}
            className="tactical-button px-14 py-4 text-white flex items-center gap-4 disabled:opacity-30"
            disabled={stagedItems.length === 0 && !comment.trim()}
          >
            <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
            <Zap size={18} className="text-neon-green" />
            <span className="text-[12px] font-black uppercase tracking-widest">Submit Deployment</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
