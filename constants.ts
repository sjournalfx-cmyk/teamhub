
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

export const INITIAL_STATE: AppState = {
  tasks: [],
  goals: [],
  draftGoals: [],
  draftTasks: [],
  users: [],
  currentUser: {
    id: 'loading',
    name: 'Loading...',
    avatar: 'https://ui-avatars.com/api/?name=?',
    timezone: 'UTC'
  },
  activeFocusTaskId: null,
  focusStartTime: null,
  activityLog: [],
  isDraftMode: false,
  joinRequests: []
};
