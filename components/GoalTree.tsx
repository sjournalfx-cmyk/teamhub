import React, { useContext, useState } from 'react';
import { AppContext } from '../context';
import { Goal, TaskStatus } from '../types';
import { ChevronRight, ChevronDown, Target, CheckCircle2, Circle, Plus, Trash2, Edit2, Check } from 'lucide-react';
import NewGoalModal from './NewGoalModal';
import ConfirmModal from './ConfirmModal';

interface GoalTreeProps {
  readOnly?: boolean;
}

const GoalTree: React.FC<GoalTreeProps> = ({ readOnly = false }) => {
  const { state, deleteGoal, toggleMilestone } = useContext(AppContext);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const toggleExpand = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleDelete = (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    setGoalToDelete(goalId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
      setGoalToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setIsNewGoalModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] font-mono leading-none">Goals</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-2">
              Connecting <span className="text-slate-900 dark:text-white">tasks</span> with <span className="text-neon-green">goals</span>.
            </p>
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={() => { setEditingGoal(null); setIsNewGoalModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-black/10 dark:hover:bg-white hover:text-obsidian-950 transition-all rounded-sm"
          >
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Add Goal</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {state.goals.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-sm opacity-50">
            <Target size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">No active objectives</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {state.goals.map(goal => {
              const isExpanded = expandedGoals.has(goal.id);
              const goalTasks = state.tasks.filter(t => t.goalId === goal.id);

              return (
                <div
                  key={goal.id}
                  className="glass-layer-1 group relative overflow-hidden transition-all hover:glass-layer-2 p-8 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-slate-900/40"
                >
                  {/* Status Badge */}
                  <div className="mb-6">
                    <div className={`inline-block px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] ${goal.status === 'Degraded'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                      }`}>
                      {goal.status || 'ACTIVE'}
                    </div>
                  </div>

                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-4 text-slate-900 dark:text-white group-hover:text-neon-green transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                        {goal.description}
                      </p>
                    </div>

                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0 ml-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-black/5 dark:text-white/5"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={goal.status === 'Degraded' ? '#f59e0b' : '#22c55e'}
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - goal.progress / 100)}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-0.5 mb-8 relative z-10 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                    <div className="bg-white/40 dark:bg-slate-950/40 p-4">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{goal.status || 'ACTIVE'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-950/40 p-4 border-x border-black/5 dark:border-white/5">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Tasks</div>
                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{goalTasks.length} TASKS</div>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-950/40 p-4">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Priority</div>
                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{goal.priority || 'HIGH'}</div>
                    </div>
                  </div>

                  {/* Milestones Section */}
                  <div className="space-y-4 relative z-10 mb-8">
                    <div className="text-[9px] font-black text-neon-green uppercase tracking-[0.3em] flex items-center gap-2">
                      <span className="text-xs">◆</span> MILESTONES
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {goal.milestones.map((milestone, idx) => (
                        <div
                          key={milestone.id || idx}
                          onClick={() => !readOnly && toggleMilestone(goal.id, milestone.id)}
                          className={`group/m flex items-center justify-between p-3 border transition-all cursor-pointer rounded-sm ${milestone.isCompleted
                            ? 'bg-neon-green/5 border-neon-green/20'
                            : 'bg-white/40 dark:bg-slate-950/40 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${milestone.isCompleted ? 'text-neon-green' : 'text-slate-500 group-hover/m:text-slate-300'
                              }`}>
                              {milestone.title}
                            </span>
                          </div>
                          {milestone.isCompleted ? (
                            <CheckCircle2 size={14} className="text-neon-green" />
                          ) : (
                            <span className="text-slate-700">◇</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tactical Units Assigned Accordion */}
                  <div className="relative z-10">
                    <button
                      onClick={() => toggleExpand(goal.id)}
                      className="w-full flex items-center justify-between py-3 border-t border-black/5 dark:border-white/5 group/acc"
                    >
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/acc:text-slate-900 dark:group-hover/acc:text-white transition-colors">
                        Tasks Assigned ({goalTasks.length})
                      </div>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {goalTasks.length === 0 ? (
                          <div className="py-4 text-center text-[8px] font-black text-slate-600 uppercase tracking-widest">No tasks assigned</div>
                        ) : (
                          goalTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-slate-950/20 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-slate-950/40 transition-all group/task cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${task.status === TaskStatus.Done ? 'bg-neon-green' :
                                  task.status === TaskStatus.Stuck ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}></div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight group-hover/task:text-slate-900 dark:group-hover/task:text-white transition-colors">
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                {task.scheduledAt && (
                                  <span className="text-[8px] font-black text-slate-600 uppercase">
                                    {new Date(task.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                  </span>
                                )}
                                <ChevronRight size={12} className="text-slate-400 dark:text-slate-700 group-hover/task:text-neon-green transition-colors" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!readOnly && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleEdit(e, goal)} className="p-2 text-slate-500 hover:text-neon-cyan transition-colors bg-black/40 rounded-sm border border-white/5">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={(e) => handleDelete(e, goal.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors bg-black/40 rounded-sm border border-white/5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => { setIsNewGoalModalOpen(false); setEditingGoal(null); }}
        goalToEdit={editingGoal || undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default GoalTree;
