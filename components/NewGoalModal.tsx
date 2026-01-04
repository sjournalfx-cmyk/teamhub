import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { Goal, Milestone } from '../types';
import { X, Target, Plus, Trash2, Check, LayoutGrid, Terminal } from 'lucide-react';
import TacticalDatePicker from './TacticalDatePicker';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal;
}

const NewGoalModal: React.FC<NewGoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { addGoal, updateGoal, state, triggerCelebration } = useContext(AppContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [priority, setPriority] = useState<'Primary' | 'Secondary'>('Primary');
  const [status, setStatus] = useState<'Operational' | 'Degraded'>('Operational');

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title);
        setDescription(goalToEdit.description);
        setMilestones([...goalToEdit.milestones]);
        setPriority(goalToEdit.priority || 'Primary');
        setStatus(goalToEdit.status || 'Operational');
      } else {
        resetForm();
      }
    }
  }, [isOpen, goalToEdit]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMilestones([{ id: `m-${Date.now()}`, title: '', isCompleted: false }]);
    setPriority('Primary');
    setStatus('Operational');
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { id: `m-${Date.now()}`, title: '', isCompleted: false }]);
  };

  const handleMilestoneChange = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const validMilestones = milestones.filter(m => m.title.trim() !== '');

    let progress = 0;
    if (validMilestones.length > 0) {
      const completed = validMilestones.filter(m => m.isCompleted).length;
      progress = Math.round((completed / validMilestones.length) * 100);
    } else if (goalToEdit) {
      progress = goalToEdit.progress;
    }

    const goalData: Goal = {
      id: goalToEdit ? goalToEdit.id : `g-${Date.now()}`,
      title,
      description,
      color: 'bg-indigo-100 text-indigo-800',
      milestones: validMilestones,
      progress,
      priority,
      status
    };

    if (goalToEdit) {
      updateGoal(goalData);
    } else {
      addGoal(goalData);
      triggerCelebration('tech');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-200/80 dark:bg-obsidian-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
      <div className="glass-terminal bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-black/10 dark:border-white/10 relative">

        <div className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center text-neon-cyan">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] font-mono leading-none">
                {goalToEdit ? 'Update Goal' : 'New Goal'}
              </h2>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2">Set goal details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Terminal size={14} /> Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 System Update"
              className="w-full text-lg font-black bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 rounded-sm px-5 py-4 focus:border-neon-green transition-all outline-none text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-800"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Goal Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the goal..."
              rows={3}
              className="w-full px-5 py-4 bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 rounded-sm focus:border-neon-cyan outline-none transition-all resize-none text-xs text-slate-600 dark:text-slate-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Priority</label>
              <div className="flex gap-2">
                {['High', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority((p === 'High' ? 'Primary' : 'Secondary') as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${priority === (p === 'High' ? 'Primary' : 'Secondary')
                      ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</label>
              <div className="flex gap-2">
                {['Active', 'Delayed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus((s === 'Active' ? 'Operational' : 'Degraded') as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${status === (s === 'Active' ? 'Operational' : 'Degraded')
                      ? s === 'Active'
                        ? 'bg-neon-green/10 border-neon-green text-neon-green'
                        : 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutGrid size={14} /> Milestones
            </label>
            <div className="space-y-4">
              {milestones.map((m, index) => (
                <div key={m.id} className="grid grid-cols-12 gap-3 items-center animate-in slide-in-from-left-4 fade-in">
                  <div className="col-span-1 text-[10px] font-black text-slate-400 dark:text-slate-700 font-mono">[{(index + 1).toString().padStart(2, '0')}]</div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(m.id, 'title', e.target.value)}
                      placeholder="Milestone title..."
                      className="w-full px-4 py-2 bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 rounded-sm text-xs font-mono focus:border-neon-cyan outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-4">
                    <TacticalDatePicker
                      value={m.scheduledAt}
                      onChange={(ts) => handleMilestoneChange(m.id, 'scheduledAt', ts)}
                      align="right"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeMilestone(m.id)}
                      className="text-slate-400 dark:text-slate-700 hover:text-rose-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddMilestone}
                className="text-[10px] font-black text-neon-cyan hover:text-slate-900 dark:hover:text-white flex items-center gap-2 mt-4 px-4 py-2 bg-neon-cyan/5 border border-neon-cyan/20 hover:border-neon-cyan transition-all uppercase tracking-widest"
              >
                <Plus size={14} /> Add Milestone
              </button>
            </div>
          </div>
          <div className="h-32" /> {/* Spacer for date picker room */}
        </div>

        <div className="p-8 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-end gap-6">
          <button onClick={onClose} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="tactical-button px-10 py-3 text-white flex items-center gap-3 disabled:opacity-20"
          >
            <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{goalToEdit ? 'Save Goal' : 'Create Goal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGoalModal;
