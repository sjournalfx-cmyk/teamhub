
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
  type: 'link' | 'image' | 'comparison' | 'csv' | 'pdf' | 'document';
  url?: string;
  data?: string; // base64 or internal ref
  fileName?: string;
  beforeData?: string;
  afterData?: string;
  timestamp: number;
}

export interface User {
  id: string;
  email?: string;
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
  customStatuses?: { emoji: string, text: string }[]; // New: User-defined status options
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
  assigneeIds?: string[];
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
  evidenceRequired?: boolean;
  completionComment?: string;
  reviewComment?: string;
  lastMovedAt?: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetName: string;
  targetId?: string; // Link to specific task/goal
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
  priority?: 'Primary' | 'Secondary';
  status?: 'Operational' | 'Degraded';
}

export interface JoinRequest {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  invitedBy?: string;
  createdAt: string;
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
  joinRequests: JoinRequest[];
}

export type Theme = 'light' | 'dark' | 'midnight' | 'terminal';

export type AppContextType = {
  state: AppState;
  userRole: UserRole | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
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
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  // Member Management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updateUserStatus: (emoji: string, text: string) => void;
  addCustomStatus: (emoji: string, text: string) => void;
  removeCustomStatus: (text: string) => void;
  sendJoinRequest: (email: string, role: string) => Promise<void>;
  createTeamMember: (name: string, email: string, password: string, role: string) => Promise<User>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;

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

  // Batch Actions
  batchUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
  batchDeleteTasks: (taskIds: string[]) => Promise<void>;

  // Celebrations
  triggerCelebration: (type: 'confetti' | 'tech') => void;
};
