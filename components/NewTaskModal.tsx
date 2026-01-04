import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { Priority, TaskStatus, DayOfWeek, Task, Deliverable } from '../types';
import { X, Check, ChevronRight, ChevronLeft, Terminal, Cpu, Calendar, User, Target, Zap, Link, Image as ImageIcon, FileText, FileSpreadsheet, Upload, Trash2, Plus, Paperclip, Clock } from 'lucide-react';
import FileUpload from './FileUpload';
import TacticalDatePicker from './TacticalDatePicker';
import TacticalSelect from './TacticalSelect';

const NewTaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task;
    initialDay?: DayOfWeek;
    initialAssigneeId?: string;
    initialScheduledAt?: number;
}> = ({ isOpen, onClose, taskToEdit, initialDay, initialAssigneeId, initialScheduledAt }) => {
    const { state, addTask, updateTask, sendJoinRequest, triggerCelebration } = useContext(AppContext);
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.Medium);
    const [estimateHours, setEstimateHours] = useState(1);
    const [assigneeIds, setAssigneeIds] = useState<string[]>([state.currentUser.id]);
    const [goalId, setGoalId] = useState<string | undefined>(undefined);
    const [day, setDay] = useState<DayOfWeek>(DayOfWeek.Backlog);
    const [scheduledAt, setScheduledAt] = useState<number | undefined>(undefined);
    const [evidenceRequired, setEvidenceRequired] = useState(true);

    // Invite Logic
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('performer');

    // Resource attachments
    const [resources, setResources] = useState<Deliverable[]>([]);
    const [resourceType, setResourceType] = useState<'link' | 'image' | 'comparison' | 'csv' | 'pdf' | 'document'>('link');
    const [resourceUrl, setResourceUrl] = useState('');
    const [resourceFileName, setResourceFileName] = useState('');

    useEffect(() => {
        if (isOpen && taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setPriority(taskToEdit.priority);
            setEstimateHours(taskToEdit.estimateHours);
            setAssigneeIds(taskToEdit.assigneeIds || [taskToEdit.assigneeId]);
            setGoalId(taskToEdit.goalId);
            setDay(taskToEdit.day);
            setScheduledAt(taskToEdit.scheduledAt);
            setResources(taskToEdit.resources || []);
            setEvidenceRequired(taskToEdit.evidenceRequired !== false);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setStep(1);
            setDay(initialDay || DayOfWeek.Backlog);
            setAssigneeIds(initialAssigneeId ? [initialAssigneeId] : [state.currentUser.id]);
            setGoalId(undefined);
            setScheduledAt(initialScheduledAt);
            setEstimateHours(1);
            setPriority(Priority.Medium);
            setResources([]);
            setIsInviting(false);
            setInviteEmail('');
            setEvidenceRequired(true);
        }
    }, [isOpen, taskToEdit, initialDay, initialAssigneeId, initialScheduledAt]);

    const handleInvite = async () => {
        if (!inviteEmail.includes('@')) return;
        await sendJoinRequest(inviteEmail, inviteRole);
        // The new user is added to state.users with ID `pending:<email>`
        setAssigneeIds(prev => [...prev, `pending:${inviteEmail}`]);
        setIsInviting(false);
    };

    const resetResourceForm = () => {
        setResourceUrl('');
        setResourceFileName('');
    };

    const handleUploadComplete = (url: string, fileName: string) => {
        setResourceUrl(url);
        setResourceFileName(fileName);
    };

    const addResource = () => {
        const newResource: Deliverable = {
            id: `r-${Date.now()}-${Math.random()}`,
            type: resourceType === 'comparison' ? 'image' : (resourceType as any),
            timestamp: Date.now(),
            url: resourceUrl,
            fileName: (resourceType === 'csv' || resourceType === 'pdf' || resourceType === 'document') ? resourceFileName : undefined,
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
            assigneeId: assigneeIds[0] || '',
            assigneeIds,
            goalId,
            tags: ['General'],
            scheduledAt: day === DayOfWeek.Backlog ? undefined : scheduledAt,
            isScheduled: day !== DayOfWeek.Backlog,
            resources,
            evidenceRequired
        };
        if (taskToEdit) {
            updateTask(taskData);
        }
        else {
            addTask(taskData);
            triggerCelebration('confetti');
        }
        onClose();
    };

    if (!isOpen) return null;

    const totalSteps = 4;

    return (
        <div className="fixed inset-0 bg-slate-200/80 dark:bg-obsidian-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-terminal bg-white dark:bg-slate-900 rounded-lg w-full max-w-lg flex flex-col border border-black/10 dark:border-white/10 shadow-2xl font-sans relative">
                <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Cpu size={16} className="text-neon-green" />
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            {taskToEdit ? 'Edit Task' : 'New Task'} <span className="text-slate-400 dark:text-slate-600 mx-2">/</span> Step {step}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 min-h-[420px] flex flex-col justify-start custom-scrollbar overflow-y-auto">
                    {step > 1 && (
                        <div className="mb-6 p-3 bg-neon-green/5 border-l-2 border-neon-green animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="text-[8px] font-black text-neon-green uppercase tracking-[0.2em] mb-1">Current Task</div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{title || 'Untitled Task'}</div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Terminal size={12} className="text-neon-green" /> Task Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Task title..."
                                    className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-neon-green transition-all rounded-sm font-mono shadow-inner"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <FileText size={12} /> Task Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-4 text-xs text-slate-600 dark:text-slate-400 outline-none focus:border-neon-green transition-all resize-none rounded-sm font-mono"
                                    placeholder="Write task details here..."
                                />
                            </div>

                            <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm flex items-center justify-between group cursor-pointer" onClick={() => setEvidenceRequired(!evidenceRequired)}>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Require Work Evidence</div>
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Performers must upload proof of completion</div>
                                </div>
                                <div className={`w-10 h-5 rounded-full border transition-all flex items-center px-1 ${evidenceRequired ? 'bg-neon-green/20 border-neon-green' : 'bg-black/10 dark:bg-white/10 border-transparent'}`}>
                                    <div className={`w-3 h-3 rounded-full transition-all ${evidenceRequired ? 'bg-neon-green translate-x-5' : 'bg-slate-400'}`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <User size={12} className="text-neon-cyan" /> Assigned Members
                                </label>
                                {!isInviting ? (
                                    <TacticalSelect
                                        value={assigneeIds}
                                        isMulti={true}
                                        onChange={(val) => {
                                            if (Array.isArray(val) && val.includes('INVITE_NEW')) {
                                                setIsInviting(true);
                                            } else {
                                                setAssigneeIds(val);
                                            }
                                        }}
                                        options={[
                                            ...state.users.map(u => ({
                                                id: u.id,
                                                label: u.name,
                                                subLabel: u.role,
                                                avatar: u.avatar
                                            })),
                                            {
                                                id: 'INVITE_NEW',
                                                label: 'Add New Member',
                                                subLabel: 'Invite via Email',
                                                icon: <Plus size={14} />,
                                                color: 'cyan'
                                            }
                                        ]}
                                        accentColor="cyan"
                                        placeholder="Select Members"
                                        showSearch={true}
                                    />
                                ) : (
                                    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase text-neon-cyan">New Member</span>
                                            <button onClick={() => setIsInviting(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={14} /></button>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Member Email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setInviteRole('performer')}
                                                className={`flex-1 py-2 text-[9px] font-bold uppercase border ${inviteRole === 'performer' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'border-black/10 dark:border-white/10 text-slate-500'}`}
                                            >
                                                Member
                                            </button>
                                            <button
                                                onClick={() => setInviteRole('admin')}
                                                className={`flex-1 py-2 text-[9px] font-bold uppercase border ${inviteRole === 'admin' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'border-black/10 dark:border-white/10 text-slate-500'}`}
                                            >
                                                Manager
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleInvite}
                                            disabled={!inviteEmail.includes('@')}
                                            className="w-full py-2 bg-neon-cyan text-obsidian-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                                        >
                                            Add & Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Target size={12} className="text-neon-green" /> Goal
                                </label>
                                <TacticalSelect
                                    value={goalId || 'NONE'}
                                    onChange={(val) => setGoalId(val === 'NONE' ? undefined : val)}
                                    options={[
                                        { id: 'NONE', label: 'No goal', subLabel: 'Standalone Task' },
                                        ...state.goals.map(g => ({
                                            id: g.id,
                                            label: g.title,
                                            subLabel: 'Goal'
                                        }))
                                    ]}
                                    accentColor="green"
                                    placeholder="Select Goal"
                                    showSearch={true}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Paperclip size={14} className="text-neon-cyan" /> Resources
                                </label>

                                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-black/40 rounded-sm border border-black/5 dark:border-white/5">
                                    {(['link', 'image', 'document', 'csv', 'pdf'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => { setResourceType(t); resetResourceForm(); }}
                                            className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-sm transition-all ${resourceType === t ? 'bg-neon-cyan text-obsidian-950 shadow-lg shadow-neon-cyan/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
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
                                            className="flex-1 bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-[11px] text-slate-900 dark:text-white outline-none focus:border-neon-cyan rounded-sm font-mono"
                                        />
                                    ) : (
                                        <FileUpload
                                            onUploadComplete={handleUploadComplete}
                                            accept={
                                                resourceType === 'image' ? "image/*" :
                                                    resourceType === 'csv' ? ".csv,.xls,.xlsx" :
                                                        resourceType === 'pdf' ? ".pdf" :
                                                            ".doc,.docx,.ppt,.pptx,.txt,.zip"
                                            }
                                            label={`Select ${resourceType.toUpperCase()}`}
                                            className="flex-1"
                                        />
                                    )}
                                    <button
                                        onClick={addResource}
                                        disabled={!resourceUrl}
                                        className="px-4 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-obsidian-950 transition-all rounded-sm disabled:opacity-20"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                    {resources.length === 0 ? (
                                        <div className="py-8 text-center border border-dashed border-black/10 dark:border-white/10 opacity-40 rounded-sm">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">No resources added</span>
                                        </div>
                                    ) : (
                                        resources.map(res => (
                                            <div key={res.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 group rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    {res.type === 'link' ? <Link size={12} className="text-neon-cyan" /> :
                                                        res.type === 'image' ? <ImageIcon size={12} className="text-neon-cyan" /> :
                                                            res.type === 'csv' ? <FileSpreadsheet size={12} className="text-neon-cyan" /> :
                                                                <FileText size={12} className="text-neon-cyan" />}
                                                    <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{res.url || res.fileName}</span>
                                                </div>
                                                <button onClick={() => removeResource(res.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 relative z-30">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Clock size={12} className="text-amber-500" /> Estimated Hours
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 4, 8].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setEstimateHours(h)}
                                            className={`flex-1 py-3 text-[10px] font-black border transition-all rounded-sm ${estimateHours === h ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                            {h}H
                                        </button>
                                    ))}
                                    <div className="flex-[1.5] relative">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={estimateHours}
                                            onChange={(e) => setEstimateHours(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 rounded-sm font-mono"
                                            placeholder="Custom..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Zap size={12} className="text-neon-green" /> Priority
                                </label>
                                <div className="flex gap-2">
                                    {Object.values(Priority).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest border transition-all rounded-sm ${priority === p
                                                ? p === Priority.High ? 'bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' :
                                                    p === Priority.Medium ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                                                        'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        Schedule
                                    </label>
                                    <select
                                        value={day}
                                        onChange={(e) => {
                                            const newDay = e.target.value as DayOfWeek;
                                            setDay(newDay);
                                            if (newDay === DayOfWeek.Backlog) {
                                                setScheduledAt(undefined);
                                            } else {
                                                const baseDate = scheduledAt ? new Date(scheduledAt) : new Date();
                                                const d = baseDate.getDay();
                                                const diffToMon = baseDate.getDate() - d + (d === 0 ? -6 : 1);
                                                const monday = new Date(baseDate);
                                                monday.setDate(diffToMon);
                                                monday.setHours(0, 0, 0, 0);

                                                const offsets: Record<string, number> = {
                                                    'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
                                                };
                                                
                                                const offset = offsets[newDay] || 0;
                                                const newDate = new Date(monday);
                                                newDate.setDate(monday.getDate() + offset);
                                                setScheduledAt(newDate.getTime());
                                            }
                                        }}
                                        className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-neon-green rounded-sm font-mono cursor-pointer"
                                    >
                                        {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d === 'Backlog' ? 'Unscheduled' : d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        Scheduled Date
                                    </label>
                                    <TacticalDatePicker
                                        value={scheduledAt}
                                        onChange={(timestamp) => {
                                            setScheduledAt(timestamp || undefined);
                                            if (timestamp) {
                                                const date = new Date(timestamp);
                                                const days = [DayOfWeek.Sun, DayOfWeek.Mon, DayOfWeek.Tue, DayOfWeek.Wed, DayOfWeek.Thu, DayOfWeek.Fri, DayOfWeek.Sat];
                                                setDay(days[date.getDay()]);
                                            }
                                        }}
                                        align="right"
                                        placeholder="Select Date"
                                    />
                                </div>
                            </div>
                            <div className="h-48" /> {/* Spacer for date picker room */}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 w-4 rounded-full transition-all ${step >= i ? 'bg-neon-green' : 'bg-black/10 dark:bg-white/10'}`}></div>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            {step > 1 ? 'Back' : 'Cancel'}
                        </button>
                        <button
                            onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
                            disabled={step === 1 && !title.trim()}
                            className="px-6 py-2 bg-neon-green text-obsidian-950 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all disabled:opacity-30 rounded-sm"
                        >
                            {step < totalSteps ? 'Next' : (taskToEdit ? 'Save Task' : 'Create Task')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewTaskModal;
