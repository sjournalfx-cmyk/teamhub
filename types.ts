
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum TaskStatus {
  NotStarted = 'Not Started',
  WorkingOnIt = 'Working on it',
  ReadyForReview = 'Ready for Review',
  Done = 'Done',
  Stuck = 'Stuck',
}

export enum DayOfWeek {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
  Backlog = 'Backlog',
}

export type UserRole = 'admin' | 'performer';

export interface Deliverable {
  id: string;
  type: 'link' | 'image' | 'comparison' | 'csv' | 'pdf';
  url?: string;
  data?: string; // base64 or internal ref
  fileName?: string;
  beforeData?: string;
  afterData?: string;
  timestamp: number;
}

export interface User {
  id: string;
  customId?: string;
  accessCode?: string;
  name: string;
  avatar: string;
  timezone: string;
  role?: string;
  bio?: string;
  statusEmoji?: string; // New: Emoji for presence
  statusText?: string;  // New: Short status text
  isOnline?: boolean;   // New: Real-time presence flag
  metrics?: {
    uptime: number;
    dailyActivity: number[];
  };
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  day: DayOfWeek;
  estimateHours: number;
  assigneeId: string;
  goalId?: string; 
  milestoneId?: string; 
  tags: string[];
  isBlocked?: boolean;
  blockerMessage?: string;
  blockerSuggestion?: string;
  isDraft?: boolean;
  isAccepted?: boolean;
  videoUrl?: string; 
  dependencyId?: string; 
  scheduledAt?: number; 
  isScheduled?: boolean;
  unblockHistory?: AIChatMessage[];
  breakdown?: string[];
  completedSteps?: number[];
  aiSuggestions?: string[];
  resources?: Deliverable[];
  deliverables?: Deliverable[];
  completionComment?: string;
  reviewComment?: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetName: string;
  timestamp: number;
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  scheduledAt?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  milestones: Milestone[];
  color: string;
}

export interface AppState {
  tasks: Task[];
  goals: Goal[];
  draftGoals: Goal[];
  draftTasks: Task[];
  users: User[];
  currentUser: User;
  activeFocusTaskId: string | null;
  focusStartTime: number | null;
  activityLog: ActivityEvent[];
  isDraftMode: boolean;
}

export type Theme = 'light' | 'dark';

export type AppContextType = {
  state: AppState;
  userRole: UserRole | null;
  theme: Theme;
  toggleTheme: () => void;
  logout: () => void;
  moveTask: (taskId: string, targetDay: DayOfWeek) => void;
  toggleFocus: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  openTaskModal: (task?: Task, initialDay?: DayOfWeek, initialAssigneeId?: string, scheduledAt?: number) => void;
  viewEvidence: (task: Task) => void;
  
  // Goal Management
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  openGoalModal: (goal?: Goal) => void;

  // Member Management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updateUserStatus: (emoji: string, text: string) => void; // New

  // Blocker feature
  toggleTaskBlocker: (taskId: string, message?: string, suggestion?: string) => void;

  // Review System
  submitForReview: (taskId: string, deliverables: Deliverable[], comment?: string) => void;
  approveTask: (taskId: string) => void;
  requestRevision: (taskId: string, comment: string) => void;

  // Draft & Pipeline Features
  addDraftGoal: (goal: Goal) => void;
  promoteDraftGoal: (goalId: string) => void;
  removeDraftGoal: (goalId: string) => void;
  setDraftMode: (enabled: boolean) => void;
  dispatchWeek: () => void;
  acceptTask: (taskId: string) => void;

  // AI Unblocking / Analysis
  askRubberDuck: (taskId: string) => Promise<void>;
  toggleBreakdownStep: (taskId: string, stepIndex: number) => void;

  // Reporting
  openReportModal: () => void;
};
