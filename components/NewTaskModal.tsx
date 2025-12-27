
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Priority, TaskStatus, DayOfWeek, Task, Deliverable } from '../types';
import { X, Check, ChevronRight, ChevronLeft, Terminal, Cpu, Calendar, User, Target, Zap, Link, Image as ImageIcon, FileText, FileSpreadsheet, Upload, Trash2, Plus, Paperclip } from 'lucide-react';

const NewTaskModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  taskToEdit?: Task; 
  initialDay?: DayOfWeek; 
  initialAssigneeId?: string;
  initialScheduledAt?: number;
}> = ({ isOpen, onClose, taskToEdit, initialDay, initialAssigneeId, initialScheduledAt }) => {
  const { state, addTask, updateTask } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [estimateHours, setEstimateHours] = useState(1);
  const [assigneeId, setAssigneeId] = useState(state.currentUser.id);
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.Backlog);
  const [scheduledAt, setScheduledAt] = useState<number | undefined>(undefined);
  
  // Resource attachments
  const [resources, setResources] = useState<Deliverable[]>([]);
  const [resourceType, setResourceType] = useState<'link' | 'image' | 'csv' | 'pdf'>('link');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceFileName, setResourceFileName] = useState('');
  const [resourceFileData, setResourceFileData] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority);
        setEstimateHours(taskToEdit.estimateHours);
        setAssigneeId(taskToEdit.assigneeId);
        setGoalId(taskToEdit.goalId);
        setDay(taskToEdit.day);
        setScheduledAt(taskToEdit.scheduledAt);
        setResources(taskToEdit.resources || []);
    } else if (isOpen) {
        setTitle(''); 
        setDescription(''); 
        setStep(1); 
        setDay(initialDay || DayOfWeek.Backlog); 
        setAssigneeId(initialAssigneeId || state.currentUser.id);
        setGoalId(undefined);
        setScheduledAt(initialScheduledAt);
        setEstimateHours(1);
        setPriority(Priority.Medium);
        setResources([]);
    }
  }, [isOpen, taskToEdit, initialDay, initialAssigneeId, initialScheduledAt]);

  const resetResourceForm = () => {
    setResourceUrl('');
    setResourceFileName('');
    setResourceFileData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setResourceFileData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addResource = () => {
    const newResource: Deliverable = {
      id: `r-${Date.now()}-${Math.random()}`,
      type: resourceType === 'comparison' ? 'image' : (resourceType as any),
      timestamp: Date.now(),
      url: resourceType === 'link' ? resourceUrl : undefined,
      fileName: (resourceType === 'csv' || resourceType === 'pdf') ? resourceFileName : undefined,
      data: (resourceType === 'image' || resourceType === 'csv' || resourceType === 'pdf') ? resourceFileData || undefined : undefined,
    };
    setResources(prev => [...prev, newResource]);
    resetResourceForm();
  };

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = () => {
    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : `t${Date.now()}`,
      title, 
      description, 
      priority, 
      status: taskToEdit ? taskToEdit.status : TaskStatus.NotStarted,
      day, 
      estimateHours, 
      assigneeId, 
      goalId,
      tags: ['General'],
      scheduledAt: day === DayOfWeek.Backlog ? undefined : scheduledAt,
      isScheduled: day !== DayOfWeek.Backlog,
      resources
    };
    taskToEdit ? updateTask(taskData) : addTask(taskData);
    onClose();
  };

  if (!isOpen) return null;

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-terminal rounded-lg w-full max-w-lg overflow-hidden flex flex-col border border-white/10 shadow-2xl font-sans">
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Cpu size={16} className="text-neon-green" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">
                {taskToEdit ? 'Edit Directive' : 'New Directive'} <span className="text-slate-600 mx-2">/</span> Step {step}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 min-h-[360px] flex flex-col justify-start overflow-y-auto">
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                           Directive Call Sign
                        </label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Objective title..." 
                            className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green transition-all rounded-sm font-mono" 
                            autoFocus 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mission Briefing</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={4} 
                            className="w-full bg-slate-950/50 border border-white/10 p-3 text-xs text-slate-400 outline-none focus:border-neon-green transition-all resize-none rounded-sm font-mono" 
                            placeholder="Detail parameters here..." 
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            Designated Node
                        </label>
                        <select 
                            value={assigneeId} 
                            onChange={(e) => setAssigneeId(e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green rounded-sm font-mono"
                        >
                            {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            Strategic Alignment
                        </label>
                        <select 
                            value={goalId || ''} 
                            onChange={(e) => setGoalId(e.target.value || undefined)} 
                            className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green rounded-sm font-mono"
                        >
                            <option value="">No higher objective</option>
                            {state.goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Paperclip size={14} className="text-neon-cyan" /> Attach Technical Resources
                        </label>
                        
                        <div className="flex gap-1 p-1 bg-black/40 rounded-sm border border-white/5">
                            {(['link', 'image', 'csv', 'pdf'] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => { setResourceType(t); resetResourceForm(); }}
                                    className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${resourceType === t ? 'bg-neon-cyan text-obsidian-950 shadow-lg shadow-neon-cyan/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {resourceType === 'link' ? (
                                <input 
                                    type="url" 
                                    placeholder="Resource URL (https://...)" 
                                    value={resourceUrl}
                                    onChange={(e) => setResourceUrl(e.target.value)}
                                    className="flex-1 bg-slate-950/50 border border-white/10 p-2 text-[11px] text-white outline-none focus:border-neon-cyan rounded-sm font-mono"
                                />
                            ) : (
                                <div className="flex-1 relative h-10 border border-dashed border-white/20 bg-white/5 rounded-sm flex items-center justify-center overflow-hidden">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{resourceFileName || `Select ${resourceType.toUpperCase()}`}</span>
                                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept={resourceType === 'image' ? "image/*" : resourceType === 'csv' ? ".csv" : ".pdf"} />
                                </div>
                            )}
                            <button 
                                onClick={addResource}
                                disabled={resourceType === 'link' ? !resourceUrl : !resourceFileData}
                                className="px-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-obsidian-950 transition-all rounded-sm disabled:opacity-20"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {resources.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-white/5 opacity-20">
                                    <span className="text-[9px] font-black uppercase tracking-widest">No resources attached</span>
                                </div>
                            ) : (
                                resources.map(res => (
                                    <div key={res.id} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            {res.type === 'link' ? <Link size={12} className="text-neon-cyan" /> : 
                                             res.type === 'image' ? <ImageIcon size={12} className="text-neon-cyan" /> :
                                             res.type === 'csv' ? <FileSpreadsheet size={12} className="text-neon-cyan" /> :
                                             <FileText size={12} className="text-neon-cyan" />}
                                            <span className="text-[10px] font-mono text-slate-300 truncate max-w-[150px]">{res.url || res.fileName}</span>
                                        </div>
                                        <button onClick={() => removeResource(res.id)} className="p-1 text-slate-600 hover:text-rose-500 transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                Chrono Load (H)
                            </label>
                            <input type="number" step="0.5" value={estimateHours} onChange={(e) => setEstimateHours(Number(e.target.value))} className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green rounded-sm font-mono" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Friction Level</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green rounded-sm font-mono">
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            Sector Scheduling
                        </label>
                        <select 
                          value={day} 
                          onChange={(e) => setDay(e.target.value as DayOfWeek)} 
                          className="w-full bg-slate-950/50 border border-white/10 p-3 text-sm text-white outline-none focus:border-neon-green rounded-sm font-mono"
                        >
                            {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d === 'Backlog' ? 'Unscheduled' : d}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 w-4 rounded-full transition-all ${step >= i ? 'bg-neon-green' : 'bg-white/10'}`}></div>
                ))}
            </div>
            <div className="flex gap-4">
                <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                    {step > 1 ? 'Back' : 'Cancel'}
                </button>
                <button 
                    onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()} 
                    disabled={step === 1 && !title.trim()}
                    className="px-6 py-2 bg-neon-green text-obsidian-950 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all disabled:opacity-30 rounded-sm"
                >
                    {step < totalSteps ? 'Next' : (taskToEdit ? 'Sync Directive' : 'Deploy Directive')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
