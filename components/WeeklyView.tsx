
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../context';
import { DayOfWeek, Task, Priority, Milestone, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Radio,
  Send,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import TacticalDatePicker from './TacticalDatePicker';
import Tooltip from './Tooltip';
import ConfirmModal from './ConfirmModal';
import ContextualHelp from './ContextualHelp';

const DAYS = [DayOfWeek.Mon, DayOfWeek.Tue, DayOfWeek.Wed, DayOfWeek.Thu, DayOfWeek.Fri, DayOfWeek.Sat, DayOfWeek.Sun];

const WeeklyView: React.FC = () => {
  const { state, openTaskModal, updateTask, setDraftMode, dispatchWeek, userRole, batchUpdateTasks, batchDeleteTasks } = useContext(AppContext);
  const [viewMode, setViewMode] = useState<'my' | 'team'>('team');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOverDay, setDraggedOverDay] = useState<DayOfWeek | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1); // 1: Large, 2: Compact
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationFrame = useRef<number | null>(null);

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const currentMonday = useMemo(() => getMonday(currentDate), [currentDate]);

  const weekDates = useMemo(() => {
    return DAYS.reduce((acc, day, idx) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + idx);
      acc[day] = d;
      return acc;
    }, {} as Record<DayOfWeek, Date>);
  }, [currentMonday]);

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
    };
  }, []);

  // Auto-scroll logic for drag and drop
  const handleAutoScroll = (clientX: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { left, right, width } = container.getBoundingClientRect();

    // Dynamic threshold: smaller of 100px or 25% of screen width
    // This ensures it works well on mobile (narrow) and desktop (wide)
    const threshold = Math.min(100, width * 0.25);
    const maxSpeed = 15;

    let speed = 0;

    if (clientX > right - threshold) {
      // Scroll Right
      const intensity = (clientX - (right - threshold)) / threshold;
      speed = intensity * maxSpeed;
    } else if (clientX < left + threshold) {
      // Scroll Left
      const intensity = ((left + threshold) - clientX) / threshold;
      speed = -intensity * maxSpeed;
    }

    if (speed !== 0) {
      container.scrollLeft += speed;
      scrollAnimationFrame.current = requestAnimationFrame(() => handleAutoScroll(clientX));
    } else {
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
        scrollAnimationFrame.current = null;
      }
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
    setIsDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    handleAutoScroll(e.clientX);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (scrollAnimationFrame.current) {
      cancelAnimationFrame(scrollAnimationFrame.current);
      scrollAnimationFrame.current = null;
    }
  };

  const onDrop = (e: React.DragEvent, day: DayOfWeek) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggedOverDay(null);
    if (scrollAnimationFrame.current) {
      cancelAnimationFrame(scrollAnimationFrame.current);
      scrollAnimationFrame.current = null;
    }

    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        const targetDate = weekDates[day] || null;
        updateTask({
          ...task,
          day: day,
          scheduledAt: targetDate ? targetDate.getTime() : undefined,
          isScheduled: day !== DayOfWeek.Backlog,
          lastMovedAt: Date.now()
        });
      }
    }
  };

  const handleWeekChange = (weeks: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + (weeks * 7));
    setCurrentDate(nextDate);
  };

  const handleTaskSelect = (id: string, selected: boolean) => {
    setSelectedTaskIds(prev =>
      selected ? [...prev, id] : prev.filter(taskId => taskId !== id)
    );
  };

  const handleBatchStatusUpdate = async (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    await batchUpdateTasks(selectedTaskIds, { status });
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsConfirmModalOpen(true);
  };

  const confirmBatchDelete = async () => {
    await batchDeleteTasks(selectedTaskIds);
    setSelectedTaskIds([]);
    setIsConfirmModalOpen(false);
  };

  const getTasksForDay = (day: DayOfWeek) => {
    let tasks = state.tasks.filter(t => {
      if (day === DayOfWeek.Backlog) {
        return t.day === DayOfWeek.Backlog && !t.scheduledAt;
      }
      if (t.scheduledAt) {
        const taskDate = new Date(t.scheduledAt);
        const colDate = weekDates[day];
        return taskDate.toDateString() === colDate?.toDateString();
      }
      const isCurrentWeek = getMonday(new Date()).toDateString() === currentMonday.toDateString();
      return isCurrentWeek && t.day === day;
    });

    if (userRole === 'performer') {
      tasks = tasks.filter(t => !t.isDraft);
    }

    if (viewMode === 'my') {
      tasks = tasks.filter(t => 
        t.assigneeId === state.currentUser.id || 
        (t.assigneeIds && t.assigneeIds.includes(state.currentUser.id))
      );
    }
    return tasks;
  };

  const getMilestonesForDay = (day: DayOfWeek) => {
    if (day === DayOfWeek.Backlog) return [];
    const colDate = weekDates[day];
    const milestones: { goalTitle: string, milestone: Milestone }[] = [];

    state.goals.forEach(goal => {
      goal.milestones.forEach(m => {
        if (m.scheduledAt) {
          const mDate = new Date(m.scheduledAt);
          if (mDate.toDateString() === colDate?.toDateString()) {
            milestones.push({ goalTitle: goal.title, milestone: m });
          }
        }
      });
    });
    return milestones;
  };

  const draftTasksCount = state.tasks.filter(t => t.isDraft).length;

  const DayHeader = ({ day, date, tasks }: { day: DayOfWeek, date: Date, tasks: Task[] }) => {
    const hours = tasks.reduce((acc, t) => acc + t.estimateHours, 0);
    const capacity = 8 * (viewMode === 'team' ? state.users.length : 1);
    const load = Math.min((hours / capacity) * 100, 100);
    const isOver = hours > capacity;

    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    const dayMilestones = getMilestonesForDay(day);

    return (
      <div className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-obsidian-950 sticky top-0 z-10 backdrop-blur-md">
        <div className={`${zoomLevel === 1 ? 'p-4' : 'p-2'} space-y-2`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`${zoomLevel === 1 ? 'text-[10px]' : 'text-[8px]'} font-black text-slate-900 dark:text-white uppercase tracking-wider`}>
                {day} <span className="mx-1 opacity-20">/</span> <span className="text-neon-green">{dateStr}</span>
              </h3>
            </div>
            <span className={`${zoomLevel === 1 ? 'text-[10px]' : 'text-[8px]'} font-bold ${isOver ? 'text-rose-500' : 'text-neon-green'}`}>
              {hours.toFixed(1)}h
            </span>
          </div>
          <div className="w-full h-1 bg-black/5 dark:bg-white/5 relative overflow-hidden rounded-full">
            <div
              className={`absolute inset-0 transition-all duration-1000 ${isOver ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-neon-green shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`}
              style={{ width: `${load}%` }}
            ></div>
          </div>
        </div>

        {dayMilestones.length > 0 && (
          <div className={`${zoomLevel === 1 ? 'px-4 pb-3' : 'px-2 pb-2'} space-y-1`}>
            {dayMilestones.map((dm, idx) => (
              <div key={idx} className="bg-neon-cyan/5 border border-neon-cyan/20 p-2 rounded-sm truncate">
                <div className={`text-[8px] font-bold uppercase leading-tight truncate ${dm.milestone.isCompleted ? 'text-neon-green line-through' : 'text-slate-900 dark:text-white'}`}>
                  {dm.milestone.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-obsidian-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 mb-4 md:mb-0">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-black/10 dark:border-white/10">
            <button
              onClick={() => handleWeekChange(-1)}
              aria-label="Previous week"
              className="p-2 hover:text-neon-green transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <TacticalDatePicker
              value={currentDate.getTime()}
              onChange={(ts) => ts && setCurrentDate(new Date(ts))}
              className="w-40"
            />
            <button
              onClick={() => handleWeekChange(1)}
              aria-label="Next week"
              className="p-2 hover:text-neon-green transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-sm md:text-xl font-black text-slate-900 dark:text-white tracking-wide uppercase">
              {currentMonday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </h2>
            <ContextualHelp 
              title="Weekly Deployment"
              content="Schedule tasks by dragging them into daily columns. Monitor team capacity via the load bars at the top of each day."
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-black/10 dark:border-white/10 text-[9px] md:text-[10px] uppercase font-bold tracking-widest shrink-0">
            <button onClick={() => setViewMode('my')} className={`px-4 py-2.5 rounded-sm transition-all ${viewMode === 'my' ? 'bg-neon-green text-obsidian-950' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>My Work</button>
            <button onClick={() => setViewMode('team')} className={`px-4 py-2.5 rounded-sm transition-all ${viewMode === 'team' ? 'bg-neon-green text-obsidian-950' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Team</button>
          </div>

          {userRole === 'admin' && draftTasksCount > 0 && (
            <button
              onClick={dispatchWeek}
              className="bg-neon-green/10 border border-neon-green/30 text-neon-green p-2.5 rounded-sm hover:bg-neon-green hover:text-obsidian-950 transition-all shrink-0"
              title="Send Weekly Tasks"
            >
              <Send size={16} />
            </button>
          )}

          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-black/10 dark:border-white/10 shrink-0">
            <Tooltip content="Zoom In">
              <button
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                className={`p-2 hover:text-neon-green transition-colors ${zoomLevel === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ZoomIn size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Zoom Out">
              <button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 1))}
                className={`p-2 hover:text-neon-green transition-colors ${zoomLevel === 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ZoomOut size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div
        ref={scrollContainerRef}
        onDragOver={onDragOver}
        className={`flex-1 ${zoomLevel === 1 ? 'overflow-x-auto overflow-y-hidden snap-x snap-mandatory' : 'overflow-auto'} custom-scrollbar p-4 md:p-8 ${isDragging ? 'scroll-smooth' : ''}`}
      >
        <div className={`flex ${zoomLevel === 1 ? 'h-full' : 'min-h-full'} min-w-max md:gap-6 ${zoomLevel === 2 ? 'flex-wrap !min-w-0' : ''}`}>
          {/* Backlog Column */}
          <div
            className={`${zoomLevel === 1 ? 'w-[88vw] md:w-[450px]' : 'w-[45vw] md:w-[320px]'} mr-3 md:mr-0 flex flex-col h-full rounded-sm border transition-all duration-300 ${draggedOverDay === DayOfWeek.Backlog ? 'border-neon-green bg-neon-green/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-black/5 dark:border-white/5 border-dashed bg-black/[0.02] dark:bg-white/[0.02]'} snap-center shrink-0`}
            onDrop={(e) => onDrop(e, DayOfWeek.Backlog)}
            onDragEnter={() => setDraggedOverDay(DayOfWeek.Backlog)}
            onDragLeave={() => setDraggedOverDay(null)}
          >
            <div className="p-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unscheduled</h3>
              <span className="text-[9px] font-bold text-neon-green bg-neon-green/5 px-2 py-0.5 rounded-sm border border-neon-green/10">
                {getTasksForDay(DayOfWeek.Backlog).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24 md:pb-4">
              {getTasksForDay(DayOfWeek.Backlog).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showAI={viewMode === 'my'}
                  onDragStart={(e, id) => onDragStart(e, id)}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onSelect={handleTaskSelect}
                  zoomLevel={zoomLevel}
                />
              ))}
              <button
                onClick={() => openTaskModal(undefined, DayOfWeek.Backlog)}
                className={`w-full ${zoomLevel === 1 ? 'py-5' : 'py-3'} border border-dashed border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]`}
              >
                + Add Task
              </button>
            </div>
          </div>

          {DAYS.map((day) => {
            const dayTasks = getTasksForDay(day);
            const dayDate = weekDates[day];
            return (
              <div
                key={day}
                className={`${zoomLevel === 1 ? 'w-[88vw] md:w-[450px]' : 'w-[45vw] md:w-[320px]'} mr-3 md:mr-0 flex flex-col h-full rounded-sm border transition-all duration-300 ${draggedOverDay === day ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-black/5 dark:border-white/5 bg-white/40 dark:bg-obsidian-900/40'} snap-center shrink-0`}
                onDrop={(e) => onDrop(e, day)}
                onDragEnter={() => setDraggedOverDay(day)}
                onDragLeave={() => setDraggedOverDay(null)}
              >
                <DayHeader day={day} date={dayDate} tasks={dayTasks} />
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24 md:pb-4">
                  {dayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showAI={viewMode === 'my'}
                      onDragStart={(e, id) => onDragStart(e, id)}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onSelect={handleTaskSelect}
                      zoomLevel={zoomLevel}
                    />
                  ))}

                  <button
                    onClick={() => openTaskModal(undefined, day, undefined, dayDate.getTime())}
                    className={`w-full ${zoomLevel === 1 ? 'py-8 md:py-12' : 'py-4 md:py-6'} border border-dashed border-black/5 dark:border-white/5 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all group flex flex-col items-center justify-center gap-3`}
                  >
                    <Plus size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-neon-green" />
                    <span className={`${zoomLevel === 1 ? 'text-[9px]' : 'text-[7px]'} font-bold text-slate-400 dark:text-slate-600 group-hover:text-neon-green uppercase tracking-[0.3em]`}>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="glass-layer-3 px-6 py-4 flex items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-neon-green/30">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">
                {selectedTaskIds.length} Tasks Selected
              </span>
              <button
                onClick={() => setSelectedTaskIds([])}
                className="text-[8px] text-slate-500 hover:text-white uppercase tracking-tighter text-left"
              >
                Clear Selection
              </button>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBatchStatusUpdate(TaskStatus.Done)}
                className="px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-black uppercase tracking-widest hover:bg-neon-green hover:text-obsidian-950 transition-all"
              >
                Complete
              </button>
              <button
                onClick={() => handleBatchStatusUpdate(TaskStatus.WorkingOnIt)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                In Progress
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmBatchDelete}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selectedTaskIds.length} tasks? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default WeeklyView;
