
import { AppState, DayOfWeek, Priority, TaskStatus, Task } from './types';

// Helper to get a timestamp for the current week's days
const getTimestampForDay = (targetDay: DayOfWeek) => {
  const now = new Date();
  const currentDayIdx = now.getDay(); // 0 is Sunday, 1 is Monday...
  const targetDayIdx = [
    DayOfWeek.Sun, DayOfWeek.Mon, DayOfWeek.Tue, DayOfWeek.Wed, 
    DayOfWeek.Thu, DayOfWeek.Fri, DayOfWeek.Sat
  ].indexOf(targetDay);
  
  if (targetDayIdx === -1) return undefined;
  
  const diff = targetDayIdx - currentDayIdx;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate.getTime();
};

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    timezone: 'EST',
    role: 'Lead Architect',
    bio: 'Overseeing structural integrity and design standards.'
  },
  {
    id: 'u2',
    name: 'Mike Ross',
    avatar: 'https://picsum.photos/seed/mike/100/100',
    timezone: 'PST',
    role: 'Execution Lead',
    bio: 'Dedicated to high-velocity project deployment.'
  },
  {
    id: 'u3',
    name: 'Elena Rodriguez',
    avatar: 'https://picsum.photos/seed/elena/100/100',
    timezone: 'CET',
    role: 'Audit Director',
    bio: 'Ensuring all directives meet quality benchmarks.'
  },
];

export const MOCK_GOALS = [
  {
    id: 'g1',
    title: 'Objective: System Overhaul',
    description: 'Complete audit and modernization of core infrastructure.',
    progress: 65,
    color: 'bg-indigo-100 text-indigo-800',
    milestones: [
      { id: 'm1', title: 'Validate Core Schematics', isCompleted: true },
      { id: 'm2', title: 'Approve Resource Allocation', isCompleted: true },
      { id: 'm3', title: 'Final System Audit', isCompleted: false },
    ],
  },
  {
    id: 'g2',
    title: 'Objective: Market Dominance',
    description: 'Strategic expansion into high-growth sectors.',
    progress: 30,
    color: 'bg-emerald-100 text-emerald-800',
    milestones: [
      { id: 'm4', title: 'Establish Recon Units', isCompleted: true },
      { id: 'm5', title: 'Deploy Outreach Directives', isCompleted: false },
    ],
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Draft Strategic Briefing',
    priority: Priority.High,
    status: TaskStatus.NotStarted,
    day: DayOfWeek.Mon,
    estimateHours: 2,
    assigneeId: 'u1',
    goalId: 'g1',
    tags: ['Planning', 'High-Command'],
    scheduledAt: getTimestampForDay(DayOfWeek.Mon),
    isScheduled: true,
    isAccepted: true,
    isDraft: false
  },
  {
    id: 't2',
    title: 'Verify Tactical Alignment',
    priority: Priority.Medium,
    status: TaskStatus.WorkingOnIt,
    day: DayOfWeek.Tue,
    estimateHours: 1.5,
    assigneeId: 'u1',
    goalId: 'g1',
    tags: ['Review'],
    scheduledAt: getTimestampForDay(DayOfWeek.Tue),
    isScheduled: true,
    dependencyId: 't1',
    isAccepted: true,
    isDraft: false
  },
  {
    id: 't3',
    title: 'Command Council Debrief',
    priority: Priority.High,
    status: TaskStatus.Done,
    day: DayOfWeek.Tue,
    estimateHours: 1,
    assigneeId: 'u1',
    goalId: undefined, 
    tags: ['Meeting'],
    scheduledAt: getTimestampForDay(DayOfWeek.Tue),
    isScheduled: true,
    isAccepted: true,
    isDraft: false
  },
  {
    id: 't4',
    title: 'Deploy Technical Mandate',
    priority: Priority.Medium,
    status: TaskStatus.NotStarted,
    day: DayOfWeek.Wed,
    estimateHours: 3,
    assigneeId: 'u2',
    goalId: 'g1',
    tags: ['Dev', 'Mandate'],
    scheduledAt: getTimestampForDay(DayOfWeek.Wed),
    isScheduled: true,
    dependencyId: 't2',
    isAccepted: true,
    isDraft: false
  },
];

export const INITIAL_STATE: AppState = {
  tasks: MOCK_TASKS,
  goals: MOCK_GOALS,
  draftGoals: [],
  draftTasks: [],
  users: MOCK_USERS,
  currentUser: MOCK_USERS[0],
  activeFocusTaskId: null,
  focusStartTime: null,
  activityLog: [],
  isDraftMode: false
};
