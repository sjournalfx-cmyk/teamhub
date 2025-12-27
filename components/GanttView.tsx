
import React, { useContext, useRef, useState } from 'react';
// Corrected import source for AppContext
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
        title: 'Ad-hoc Tasks', 
        description: 'Tasks not linked to strategic goals.', 
        progress: 0, 
        milestones: [], 
        color: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400' 
      },
      tasks: adHocTasks
    });
  }

  const priorityStyles = {
    [Priority.High]: 'bg-emerald-500 border-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.2)] dark:shadow-none',
    [Priority.Medium]: 'bg-emerald-400 border-emerald-500 opacity-90',
    [Priority.Low]: 'bg-amber-400 border-amber-500',
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
          className="text-gray-300 dark:text-slate-700 opacity-60"
          strokeLinejoin="round"
        />
        <circle cx={`${endX}%`} cy={`${endY}`} r="3" className="fill-gray-300 dark:fill-slate-700" />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 sticky top-0 z-20">
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <Tooltip content="Previous Period">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 transition-all hover:text-indigo-600 dark:hover:text-white"><ChevronLeft size={18}/></button>
                </Tooltip>
                <Tooltip content="Next Period">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 transition-all hover:text-indigo-600 dark:hover:text-white"><ChevronRight size={18}/></button>
                </Tooltip>
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Timeline</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                     <span className="text-indigo-500">Gantt visualization</span>
                     <span className="opacity-30">•</span>
                     <span>September 2024</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-gray-400 shadow-sm">
                <span className="px-4 py-2 hover:text-gray-600 cursor-pointer">Days</span>
                <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm">Week</span>
                <span className="px-4 py-2 hover:text-gray-600 cursor-pointer">Month</span>
             </div>
             <Tooltip content="Add New Task">
               <button onClick={() => openTaskModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none transform active:scale-95">
                   <Plus size={24} />
               </button>
             </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-[#0B0F1A]">
        <div className="min-w-[1200px] h-full flex flex-col">
          <div className="flex border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0B0F1A] z-20">
            <div className="w-80 p-4 border-r border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Strategic Focus</span>
                <Tooltip content="View strategic goal alignment info">
                  <Info size={14} className="text-gray-400 cursor-help" />
                </Tooltip>
            </div>
            {DAYS.map(day => (
              <div key={day} className="flex-1 p-4 text-center border-r border-gray-100 dark:border-slate-800">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{day}</span>
                <div className="text-[10px] text-gray-400 dark:text-slate-600 font-mono mt-1">SEP {DAYS.indexOf(day) + 16}</div>
              </div>
            ))}
          </div>

          {goalGroups.map((group, groupIdx) => (
            <div key={group.goal.id} className="flex border-b border-gray-100 dark:border-slate-800/50 group/row hover:bg-indigo-50/10 dark:hover:bg-white/[0.02] transition-colors relative min-h-[140px]">
              <div className="w-80 p-6 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-center bg-gray-50/30 dark:bg-slate-900/20 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-indigo-500 dark:text-indigo-400" />
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm truncate">{group.goal.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${group.goal.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{group.goal.progress}%</span>
                </div>
              </div>

              <div className="flex-1 relative flex">
                {DAYS.map((day, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 border-r border-gray-100 dark:border-slate-800/30 transition-colors ${draggedTaskId ? 'hover:bg-indigo-500/5' : ''}`}
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

          <div className="flex-1 bg-white dark:bg-[#0B0F1A]"></div>
        </div>
      </div>

      <div className="px-8 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-400 opacity-90"></div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-400"></div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Blocked</span>
                </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                Reschedule by <span className="text-indigo-600 dark:text-indigo-400 font-bold">dragging tasks</span> between columns.
            </div>
      </div>
    </div>
  );
};

export default GanttView;
