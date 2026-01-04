import React, { useContext, useRef, useState } from 'react';
import { AppContext } from '../context';
import { DayOfWeek, Task, Priority } from '../types';
import { ChevronLeft, ChevronRight, Plus, Target, Info, GitMerge, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';

const DAYS = [DayOfWeek.Mon, DayOfWeek.Tue, DayOfWeek.Wed, DayOfWeek.Thu, DayOfWeek.Fri, DayOfWeek.Sat, DayOfWeek.Sun];

const GanttView: React.FC = () => {
    const { state, moveTask, openTaskModal } = useContext(AppContext);
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const getDayIndex = (day: DayOfWeek) => DAYS.indexOf(day);

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("taskId", id);
        setDraggedTaskId(id);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, day: DayOfWeek) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            moveTask(taskId, day);
        }
        setDraggedTaskId(null);
    };

    const goalGroups = state.goals.map(goal => ({
        goal,
        tasks: state.tasks.filter(t => t.goalId === goal.id && t.day !== DayOfWeek.Backlog)
    }));

    const adHocTasks = state.tasks.filter(t => !t.goalId && t.day !== DayOfWeek.Backlog);
    if (adHocTasks.length > 0) {
        goalGroups.push({
            goal: {
                id: 'adhoc',
                title: 'Other Tasks',
                description: 'Tasks not linked to goals.',
                progress: 0,
                milestones: [],
                color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            },
            tasks: adHocTasks
        });
    }

    const priorityStyles = {
        [Priority.High]: 'bg-rose-500 border-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.2)] dark:shadow-none',
        [Priority.Medium]: 'bg-amber-500 border-amber-600 opacity-90',
        [Priority.Low]: 'bg-emerald-500 border-emerald-600',
    };

    const Connector = ({ fromTask, toTask, rowIndex }: { fromTask: Task, toTask: Task, rowIndex: number }) => {
        const fromIdx = getDayIndex(fromTask.day);
        const toIdx = getDayIndex(toTask.day);

        if (fromIdx === -1 || toIdx === -1) return null;

        const startX = (fromIdx + 1) * 12.5;
        const endX = toIdx * 12.5;

        const fromStackIdx = state.tasks.filter(t => t.day === fromTask.day && t.goalId === fromTask.goalId).indexOf(fromTask);
        const toStackIdx = state.tasks.filter(t => t.day === toTask.day && t.goalId === toTask.goalId).indexOf(toTask);

        const startY = 40 + (fromStackIdx * 45);
        const endY = 40 + (toStackIdx * 45);

        return (
            <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible" style={{ width: '100%', height: '100%' }}>
                <path
                    d={`M ${startX}% ${startY} C ${startX + 1}% ${startY}, ${endX - 1}% ${endY}, ${endX}% ${endY}`}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    className="text-slate-300 dark:text-slate-700 opacity-60"
                    strokeLinejoin="round"
                />
                <circle cx={`${endX}%`} cy={`${endY}`} r="3" className="fill-slate-300 dark:fill-slate-700" />
            </svg>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
                        <Tooltip content="Previous Period">
                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all hover:text-neon-green dark:hover:text-white"><ChevronLeft size={18} /></button>
                        </Tooltip>
                        <Tooltip content="Next Period">
                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all hover:text-neon-green dark:hover:text-white"><ChevronRight size={18} /></button>
                        </Tooltip>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Timeline</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                            <span className="text-neon-green">Timeline view</span>
                            <span className="opacity-30">•</span>
                            <span>September 2024</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 shadow-sm">
                        <span className="px-4 py-2 hover:text-slate-600 cursor-pointer">Days</span>
                        <span className="px-4 py-2 bg-neon-green text-obsidian-950 rounded-lg shadow-sm">Week</span>
                        <span className="px-4 py-2 hover:text-slate-600 cursor-pointer">Month</span>
                    </div>
                    <Tooltip content="Add New Task">
                        <button onClick={() => openTaskModal()} className="bg-neon-green hover:bg-neon-green/80 text-obsidian-950 p-2.5 rounded-xl transition-all shadow-lg shadow-neon-green/20 dark:shadow-none transform active:scale-95">
                            <Plus size={24} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
                <div className="min-w-[1200px] h-full flex flex-col">
                    <div className="flex border-b border-black/5 dark:border-white/5 sticky top-0 bg-slate-50 dark:bg-slate-950 z-20">
                        <div className="w-80 p-4 border-r border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/50">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Goal Focus</span>
                            <Tooltip content="View goal info">
                                <Info size={14} className="text-slate-400 cursor-help" />
                            </Tooltip>
                        </div>
                        {DAYS.map(day => (
                            <div key={day} className="flex-1 p-4 text-center border-r border-black/5 dark:border-white/5">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{day}</span>
                                <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono mt-1">SEP {DAYS.indexOf(day) + 16}</div>
                            </div>
                        ))}
                    </div>

                    {goalGroups.map((group, groupIdx) => (
                        <div key={group.goal.id} className="flex border-b border-black/5 dark:border-white/5 group/row hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors relative min-h-[140px]">
                            <div className="w-80 p-6 border-r border-black/5 dark:border-white/5 flex flex-col justify-center bg-slate-100/30 dark:bg-slate-900/20 z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target size={16} className="text-neon-green dark:text-neon-green" />
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{group.goal.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-green" style={{ width: `${group.goal.progress}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{group.goal.progress}%</span>
                                </div>
                            </div>

                            <div className="flex-1 relative flex">
                                {DAYS.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 border-r border-black/5 dark:border-white/5 transition-colors ${draggedTaskId ? 'hover:bg-neon-green/5' : ''}`}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => onDrop(e, day)}
                                    ></div>
                                ))}

                                {group.tasks.map((task) => {
                                    const dayIdx = getDayIndex(task.day);
                                    const leftPos = (dayIdx * 14.28);

                                    const tasksOnSameDayInGroup = group.tasks.filter(t => t.day === task.day);
                                    const stackIdx = tasksOnSameDayInGroup.indexOf(task);
                                    const topOffset = 25 + (stackIdx * 45);

                                    const dependency = task.dependencyId ? state.tasks.find(t => t.id === task.dependencyId) : null;

                                    return (
                                        <React.Fragment key={task.id}>
                                            {dependency && dependency.goalId === task.goalId && dependency.day !== DayOfWeek.Backlog && (
                                                <Connector fromTask={dependency} toTask={task} rowIndex={groupIdx} />
                                            )}
                                            <Tooltip content={`${task.title} (${task.estimateHours}h)`}>
                                                <div
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, task.id)}
                                                    onClick={() => openTaskModal(task)}
                                                    onMouseEnter={() => setHoveredTaskId(task.id)}
                                                    onMouseLeave={() => setHoveredTaskId(null)}
                                                    className={`absolute h-10 rounded-xl border-2 flex items-center px-4 transition-all cursor-grab active:cursor-grabbing z-10
                                      ${priorityStyles[task.priority]}
                                      ${hoveredTaskId === task.id ? 'scale-105 z-20 shadow-xl' : 'scale-100'}
                                      ${task.status === 'Done' ? 'opacity-40 grayscale-[0.5]' : ''}
                                      ${task.isBlocked ? 'border-rose-400 bg-rose-500' : ''}
                                  `}
                                                    style={{
                                                        left: `${leftPos + 0.5}%`,
                                                        width: '13%',
                                                        top: `${topOffset}px`
                                                    }}
                                                >
                                                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                                        <span className="text-[10px] font-black text-white truncate uppercase tracking-wider">{task.title}</span>
                                                        <div className="flex items-center gap-1.5 opacity-80">
                                                            {task.isBlocked ? <AlertCircle size={10} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                            <span className="text-[8px] font-bold text-white">{task.estimateHours}h</span>
                                                            {task.dependencyId && <GitMerge size={10} className="ml-1 text-white" />}
                                                        </div>
                                                    </div>
                                                    {task.status === 'Done' && (
                                                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tooltip>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="flex-1 bg-slate-50 dark:bg-slate-950"></div>
                </div>
            </div>

            <div className="px-8 py-4 bg-slate-100 dark:bg-slate-900 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-6 flex-wrap justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-400 opacity-90"></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-400"></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Low Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-rose-500"></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Blocked</span>
                    </div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Reschedule by <span className="text-neon-green dark:text-neon-green font-bold">dragging tasks</span> between columns.
                </div>
            </div>
        </div>
    );
};

export default GanttView;
