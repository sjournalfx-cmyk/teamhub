import React, { useContext } from 'react';
import { AppContext } from '../context';
import { TaskStatus, Priority } from '../types';
import { Activity, Target, CheckCircle2, Clock, AlertCircle, TrendingUp, Users, Zap, Shield, Hash, Info } from 'lucide-react';
import { ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import ContextualHelp from './ContextualHelp';

const DashboardView: React.FC = () => {
  const { state, viewEvidence } = useContext(AppContext);

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === TaskStatus.Done).length;
  const inProgressTasks = state.tasks.filter(t => t.status === TaskStatus.WorkingOnIt).length;
  const blockedTasks = state.tasks.filter(t => t.isBlocked).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeGoals = state.goals.filter(g => g.progress < 100).length;
  const totalGoals = state.goals.length;

  // Section 2: Efficiency & Velocity
  const totalEstimatedHours = state.tasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
  const completedEstimatedHours = state.tasks
    .filter(t => t.status === TaskStatus.Done)
    .reduce((acc, t) => acc + (t.estimateHours || 0), 0);

  const hourProgress = totalEstimatedHours > 0 ? Math.round((completedEstimatedHours / totalEstimatedHours) * 100) : 0;

  // Section 4: Priority & Focus
  const highPriorityPending = state.tasks.filter(t => t.priority === Priority.High && t.status !== TaskStatus.Done).length;
  const mediumPriorityPending = state.tasks.filter(t => t.priority === Priority.Medium && t.status !== TaskStatus.Done).length;
  const lowPriorityPending = state.tasks.filter(t => t.priority === Priority.Low && t.status !== TaskStatus.Done).length;

  const priorityData = [
    { name: 'High', value: state.tasks.filter(t => t.priority === Priority.High).length, color: '#f43f5e' },
    { name: 'Medium', value: state.tasks.filter(t => t.priority === Priority.Medium).length, color: '#f59e0b' },
    { name: 'Low', value: state.tasks.filter(t => t.priority === Priority.Low).length, color: '#10b981' },
  ];

  // Tag Distribution
  const tagCounts: { [key: string]: number } = {};
  state.tasks.forEach(task => {
    task.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));



  return (
    <div className="h-full flex flex-col gap-4 p-4 lg:p-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Dashboard</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Strategic Operations Overview</p>
          </div>
          <ContextualHelp 
            title="Dashboard Overview"
            content="This view provides a high-level summary of mission progress, team velocity, and critical blockers. Use it to maintain strategic situational awareness."
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/20 rounded-full">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto lg:grid-rows-[auto_1fr_1fr] gap-4 min-h-0">

        {/* Metric 1: Total Completion */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Activity size={48} className="text-violet-500 animate-heartbeat" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Completion</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{completionRate}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{completedTasks} of {totalTasks} Tasks Finalized</div>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-white/5 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-neon-cyan" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Hour Velocity */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Zap size={48} className="text-neon-cyan animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hour Velocity</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{hourProgress}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{completedEstimatedHours}h of {totalEstimatedHours}h Estimated</div>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-white/5 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-neon-green" style={{ width: `${hourProgress}%` }}></div>
          </div>
        </div>

        {/* Metric 3: High Priority */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Shield size={48} className="text-rose-500" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">High Priority</div>
            <div className="text-3xl font-black text-rose-500 mb-1">{highPriorityPending}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Critical Tasks Pending Action</div>
          </div>
        </div>

        {/* Metric 4: Blockers */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <AlertCircle size={48} className="text-amber-500 animate-shake" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Blockers</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{blockedTasks}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Tasks Requiring Assistance</div>
          </div>
        </div>

        {/* Inspection List (Spans 2 cols, 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-neon-cyan" /> Inspection Required
            </h3>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {state.tasks.filter(t => t.status === TaskStatus.ReadyForReview).length} Pending
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {state.tasks.filter(t => t.status === TaskStatus.ReadyForReview).length > 0 ? (
              state.tasks
                .filter(t => t.status === TaskStatus.ReadyForReview)
                .map(task => {
                  const assignees = (task.assigneeIds && task.assigneeIds.length > 0)
                    ? state.users.filter(u => task.assigneeIds!.includes(u.id))
                    : state.users.filter(u => u.id === task.assigneeId);

                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-sm border border-black/5 dark:border-white/5 hover:border-neon-cyan/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {assignees.map(assignee => (
                            <div key={assignee.id} className="relative">
                              <img
                                src={assignee.avatar || `https://ui-avatars.com/api/?name=${assignee.name || 'Unassigned'}&background=random`}
                                className="w-8 h-8 rounded-sm grayscale group-hover:grayscale-0 transition-all border border-white/10"
                                alt={assignee.name}
                              />
                              {assignee.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-white dark:border-obsidian-950"></div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {assignees.length === 1 ? assignees[0].name : `${assignees.length} Members`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => viewEvidence(task)}
                        className="px-3 py-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2"
                      >
                        <Shield size={12} />
                        Inspect
                      </button>
                    </div>
                  );
                })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <CheckCircle2 size={24} className="text-slate-400 opacity-50" />
                <div className="text-[10px] font-bold uppercase tracking-widest">All inspections complete</div>
              </div>
            )}
          </div>
        </div>

        {/* Priority Allocation (1 col, 1 row) */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
            <Shield size={14} className="text-rose-500" /> Priority Allocation
          </h3>
          <div className="flex-1 flex items-center min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personnel Status (1 col, 2 rows) */}
        <div className="lg:row-span-2 bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-neon-green" /> Personnel Status
            </h3>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {state.users.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-8 h-8 rounded-sm grayscale hover:grayscale-0 transition-all cursor-pointer border border-black/5 dark:border-white/5" />
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-obsidian-950 ${user.isOnline ? 'bg-neon-green' : 'bg-slate-400'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate uppercase tracking-tighter">
                    {user.name} {user.statusText && <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-1 lowercase">({user.statusEmoji} {user.statusText})</span>}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">{user.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas (1 col, 1 row) */}
        <div className="bg-white dark:bg-obsidian-900/50 border border-black/10 dark:border-white/10 p-6 rounded-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
            <Hash size={14} className="text-neon-cyan" /> Focus Areas (Tags)
          </h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {topTags.length > 0 ? topTags.map((tag) => (
              <div key={tag.name} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span className="text-slate-500">#{tag.name}</span>
                  <span className="text-slate-900 dark:text-white">{tag.value} tasks</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-cyan/50"
                    style={{ width: `${(tag.value / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                No tags detected
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;

