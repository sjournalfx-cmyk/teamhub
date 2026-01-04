import React, { createContext, useState, useEffect } from 'react';
import { AppContextType, AppState, DayOfWeek, TaskStatus, Task, Goal, User, UserRole, Theme, ActivityEvent, AIChatMessage, Deliverable } from './types';
import { INITIAL_STATE } from './constants';
import AdminDashboard from './components/AdminDashboard';
import PerformerDashboard from './components/PerformerDashboard';
import LoginPage from './components/LoginPage';
import NewTaskModal from './components/NewTaskModal';
import NewGoalModal from './components/NewGoalModal';
import CompletionModal from './components/CompletionModal';
import ReviewEvidenceModal from './components/ReviewEvidenceModal';
import MondayMorningModal from './components/MondayMorningModal';
import WeeklyReportModal from './components/WeeklyReportModal';
import InviteMemberModal from './components/InviteMemberModal';
import Skeleton from './components/Skeleton';
import Celebration from './components/Celebration';
import { useToast } from './components/Toast';
import { unblockTaskAssistant } from './services/geminiService';
import { AppContext } from './context';
import { useAuth } from './context/AuthContext';
import { db, supabase } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
  const { session, profile, loading: authLoading, signOut: supabaseSignOut } = useAuth();
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('syncweek_theme') as Theme;
    return savedTheme || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'midnight', 'terminal');

    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      if (theme !== 'dark') {
        root.classList.add(theme);
      }
    }
    localStorage.setItem('syncweek_theme', theme);
  }, [theme]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ active: boolean; type: 'confetti' | 'tech' }>({ active: false, type: 'confetti' });

  const triggerCelebration = (type: 'confetti' | 'tech') => {
    setCelebration({ active: true, type });
  };

  const [activeReviewTask, setActiveReviewTask] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [initialTaskDay, setInitialTaskDay] = useState<DayOfWeek | undefined>(undefined);
  const [initialScheduledAt, setInitialScheduledAt] = useState<number | undefined>(undefined);
  const [goalToEdit, setGoalToEdit] = useState<Goal | undefined>(undefined);
  const [showBriefing, setShowBriefing] = useState(false);

  // Fetch data from Supabase when session is available
  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session, profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      // First, get the current user's profile to determine their role
      let currentProfile;
      try {
        currentProfile = await db.profiles.get(userId);
      } catch (e) {
        console.log('Profile not found, user might be new');
        currentProfile = null;
      }

      const isManager = currentProfile?.role === 'admin';

      // Fetch data based on user role
      // Managers see their own tasks/goals and their team
      // Team members see tasks assigned to them and goals they're linked to

      let tasks, goals, teamMembers, joinRequests, activityLog;

      if (isManager) {
        // Manager: Get tasks they created or assigned to their team
        [tasks, goals, activityLog, joinRequests] = await Promise.all([
          db.getTasksByUser(userId),
          db.getGoalsByUser(userId),
          db.activityLog.getAll(),
          db.getPendingRequestsByManager(userId)
        ]);
        teamMembers = await db.getTeamMembers(userId);
      } else {
        // Team member: Get tasks assigned to them and all goals
        [tasks, goals, activityLog] = await Promise.all([
          db.getTasksByUser(userId),
          db.goals.getAll(), // Team members can see all goals for context
          db.activityLog.getAll()
        ]);
        // For team members, just show themselves
        teamMembers = currentProfile ? [currentProfile] : [];
        joinRequests = currentProfile?.email
          ? await db.getJoinRequestsByEmail(currentProfile.email)
          : [];
      }

      // Map pending join requests to "shadow users" (only for managers)
      const pendingUsers = isManager ? (joinRequests || [])
        .filter((req: any) => req.status === 'pending')
        .map((req: any) => ({
          id: `pending:${req.email}`,
          name: `Pending: ${req.email.split('@')[0]}`,
          email: req.email,
          role: req.role,
          avatar: 'https://ui-avatars.com/api/?name=?',
          timezone: 'UTC',
          customId: `REQ-${req.id?.substring(0, 4).toUpperCase() || 'XXXX'}`,
          statusEmoji: '⏳',
          statusText: 'Invite Sent'
        })) : [];

      const allUsers = [...(teamMembers || []), ...pendingUsers];

      // Post-process tasks to handle pending assignments via tags
      const processedTasks = (tasks || []).map((t: any) => {
        const pendingTags = t.tags?.filter((tag: string) => tag.startsWith('pending_assignee:')) || [];
        if (pendingTags.length > 0) {
          const emails = pendingTags.map((tag: string) => tag.split(':')[1]);
          const pendingIds = emails.map((email: string) => `pending:${email}`);
          return {
            ...t,
            assigneeIds: [...(t.assigneeIds || []), ...pendingIds],
            assigneeId: t.assigneeId || pendingIds[0]
          };
        }
        return t;
      });

      // Auto-generate customId if missing for current user
      if (currentProfile && !currentProfile.customId) {
        const newId = `KNT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        currentProfile.customId = newId;
        db.profiles.update(currentProfile.id, { customId: newId }).catch(err => console.error('Error auto-generating ID:', err));
      }

      setState(prev => ({
        ...prev,
        tasks: processedTasks || [],
        goals: goals || [],
        activityLog: activityLog || [],
        users: allUsers,
        currentUser: currentProfile || prev.currentUser,
        joinRequests: joinRequests || []
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const addActivityLog = async (action: string, targetName: string, targetId?: string) => {
    if (!session?.user) return;

    const newEvent: ActivityEvent = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      userName: profile?.name || session.user.email?.split('@')[0] || 'Unknown',
      action,
      targetName,
      targetId,
      timestamp: Date.now()
    };

    try {
      await db.activityLog.create(newEvent);
      setState(prev => ({
        ...prev,
        activityLog: [newEvent, ...(prev.activityLog || [])].slice(0, 50)
      }));
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
  };

  const logout = async () => {
    await addActivityLog('logged out from', profile?.role || 'System');
    await supabaseSignOut();
    setShowBriefing(false);
  };

  const moveTask = async (taskId: string, targetDay: DayOfWeek) => {
    try {
      await db.tasks.update(taskId, { day: targetDay });
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, day: targetDay } : t)
      }));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (status === TaskStatus.Done && profile?.role === 'performer') {
      setActiveReviewTask(task);
      setIsCompletionModalOpen(true);
      return;
    }

    try {
      await db.tasks.update(taskId, { status });
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      }));
      addActivityLog(`set status to ${status} for`, task.title, task.id);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const toggleBreakdownStep = async (taskId: string, stepIndex: number) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const current = task.completedSteps || [];
    const updated = current.includes(stepIndex)
      ? current.filter(i => i !== stepIndex)
      : [...current, stepIndex];

    try {
      await db.tasks.update(taskId, { completed_steps: updated });
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completedSteps: updated } : t)
      }));
    } catch (error) {
      console.error('Error toggling breakdown step:', error);
    }
  };

  const submitForReview = async (taskId: string, deliverables: Deliverable[], comment?: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.tasks.update(taskId, {
        status: TaskStatus.ReadyForReview,
        deliverables,
        completion_comment: comment
      });
      addActivityLog('submitted deliverables for', task.title, task.id);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? {
          ...t,
          status: TaskStatus.ReadyForReview,
          deliverables,
          completionComment: comment
        } : t)
      }));
    } catch (error) {
      console.error('Error submitting for review:', error);
    }
  };

  const approveTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.tasks.update(taskId, { status: TaskStatus.Done });
      addActivityLog('verified and closed', task.title, task.id);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.Done } : t)
      }));
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const requestRevision = async (taskId: string, comment: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.tasks.update(taskId, {
        status: TaskStatus.WorkingOnIt,
        review_comment: comment
      });
      addActivityLog('requested revision for', task.title, task.id);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? {
          ...t,
          status: TaskStatus.WorkingOnIt,
          reviewComment: comment
        } : t)
      }));
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error('Error requesting revision:', error);
    }
  };

  const addTask = async (task: Task) => {
    console.log('DEBUG: addTask called with:', task);
    try {
      // Generate a proper UUID for the task if not provided or if it's not a valid UUID
      const taskId = task.id && task.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        ? task.id
        : crypto.randomUUID();
      let finalTask = { ...task, id: taskId, user_id: session?.user.id, is_draft: state.isDraftMode };

      // Handle pending assignments
      const pendingAssignees = (finalTask.assigneeIds || [finalTask.assigneeId]).filter(id => id?.startsWith('pending:'));
      if (pendingAssignees.length > 0) {
        const emails = pendingAssignees.map(id => id.split(':')[1]);
        const pendingTags = emails.map(email => `pending_assignee:${email}`);
        finalTask.tags = [...(finalTask.tags || []), ...pendingTags];

        // Remove pending IDs from the UUID array for DB compatibility
        if (finalTask.assigneeIds) {
          finalTask.assigneeIds = finalTask.assigneeIds.filter(id => !id.startsWith('pending:'));
        }
        if (finalTask.assigneeId?.startsWith('pending:')) {
          finalTask.assigneeId = null as any;
        }
      }

      console.log('DEBUG: Sending finalTask to db.tasks.create:', finalTask);
      const createdTask = await db.tasks.create(finalTask);
      console.log('DEBUG: Task created in DB:', createdTask);

      // If it was a pending task, fix the local state to show it assigned
      if (task.assigneeId?.startsWith('pending:')) {
        createdTask.assigneeId = task.assigneeId;
      }

      addActivityLog('created task', task.title, createdTask.id);
      setState(prev => ({ ...prev, tasks: [...prev.tasks, createdTask] }));
    } catch (error) {
      console.error('CRITICAL: Error adding task:', error);
    }
  };

  const updateTask = async (t: Task) => {
    try {
      let updates = { ...t };

      // Handle pending assignments
      const pendingAssignees = (updates.assigneeIds || [updates.assigneeId]).filter(id => id?.startsWith('pending:'));
      if (pendingAssignees.length > 0) {
        const emails = pendingAssignees.map(id => id.split(':')[1]);
        // Ensure we don't duplicate tags
        const existingTags = updates.tags?.filter(tag => !tag.startsWith('pending_assignee:')) || [];
        const pendingTags = emails.map(email => `pending_assignee:${email}`);
        updates.tags = [...existingTags, ...pendingTags];

        if (updates.assigneeIds) {
          updates.assigneeIds = updates.assigneeIds.filter(id => !id.startsWith('pending:'));
        }
        if (updates.assigneeId?.startsWith('pending:')) {
          updates.assigneeId = null as any;
        }
      } else {
        // Clear pending tags if all assigned to real users
        if (updates.tags) {
          updates.tags = updates.tags.filter(tag => !tag.startsWith('pending_assignee:'));
        }
      }

      await db.tasks.update(t.id, updates);

      // Update local state with the original "pending" IDs so UI stays consistent
      const localTask = { ...t };
      setState(prev => ({ ...prev, tasks: prev.tasks.map(task => task.id === t.id ? localTask : task) }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    const task = state.tasks.find(t => id === t.id);
    if (!task) return;

    try {
      await db.tasks.delete(id);
      addActivityLog('deleted task', task.title, task.id);
      setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const addGoal = async (g: Goal) => {
    console.log('DEBUG: addGoal called with:', g);
    try {
      // Generate a proper UUID for the goal if not provided or if it's not a valid UUID
      const goalId = g.id && g.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        ? g.id
        : crypto.randomUUID();
      const newGoal = { ...g, id: goalId, user_id: session?.user.id };
      console.log('DEBUG: Sending newGoal to db.goals.create:', newGoal);
      const createdGoal = await db.goals.create(newGoal);

      if (!createdGoal) {
        throw new Error('db.goals.create returned null or undefined');
      }

      console.log('DEBUG: Goal successfully created in DB:', createdGoal);
      addActivityLog('created goal', g.title, createdGoal.id);
      setState(prev => {
        const newState = { ...prev, goals: [...prev.goals, createdGoal] };
        console.log('DEBUG: Updated state with new goals:', newState.goals);
        return newState;
      });
    } catch (error: any) {
      console.error('CRITICAL: Error adding goal:', error);
      showError(`Failed to create goal: ${error.message || 'Unknown error'}`);
    }
  };

  const updateGoal = async (g: Goal) => {
    try {
      await db.goals.update(g.id, g);
      setState(prev => ({ ...prev, goals: prev.goals.map(goal => goal.id === g.id ? g : goal) }));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await db.goals.delete(id);
      setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );

    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedGoal = { ...goal, milestones: updatedMilestones, progress };

    try {
      await db.goals.update(goalId, updatedGoal);
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === goalId ? updatedGoal : g)
      }));
      addActivityLog(`updated milestone in`, goal.title, goal.id);
    } catch (error) {
      console.error('Error toggling milestone:', error);
    }
  };

  const addUser = (u: User) => {
    // This would typically be handled by Supabase Auth invite
    addActivityLog('added new member', u.name, u.id);
    setState(prev => ({ ...prev, users: [...prev.users, u] }));
  };

  const updateUserStatus = async (emoji: string, text: string) => {
    if (!session?.user) return;

    try {
      await db.profiles.update(session.user.id, { statusEmoji: emoji, statusText: text });
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === session.user.id ? { ...u, statusEmoji: emoji, statusText: text } : u),
        currentUser: { ...prev.currentUser, statusEmoji: emoji, statusText: text }
      }));
      addActivityLog('updated status to', `${emoji} ${text}`, state.activeFocusTaskId || undefined);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addCustomStatus = async (emoji: string, text: string) => {
    if (!session?.user) return;
    const currentStatuses = state.currentUser.customStatuses || [];
    const updatedStatuses = [...currentStatuses, { emoji, text }];

    try {
      await db.profiles.update(session.user.id, { customStatuses: updatedStatuses });
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === session.user.id ? { ...u, customStatuses: updatedStatuses } : u),
        currentUser: { ...prev.currentUser, customStatuses: updatedStatuses }
      }));
    } catch (error) {
      console.error('Error adding custom status:', error);
    }
  };

  const removeCustomStatus = async (text: string) => {
    if (!session?.user) return;

    let updatedStatuses;
    if (!state.currentUser.customStatuses || state.currentUser.customStatuses.length === 0) {
      const defaultVibes = [
        { emoji: '💻', text: 'Deep Coding' },
        { emoji: '☕', text: 'Coffee Break' },
        { emoji: '🧘', text: 'Focus Mode' },
        { emoji: '🍱', text: 'Lunching' },
        { emoji: '🎧', text: 'Listening' },
        { emoji: '🏃', text: 'Step Away' },
      ];
      updatedStatuses = defaultVibes.filter(s => s.text !== text);
    } else {
      updatedStatuses = state.currentUser.customStatuses.filter(s => s.text !== text);
    }

    try {
      await db.profiles.update(session.user.id, { customStatuses: updatedStatuses });
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === session.user.id ? { ...u, customStatuses: updatedStatuses } : u),
        currentUser: { ...prev.currentUser, customStatuses: updatedStatuses }
      }));
    } catch (error) {
      console.error('Error removing custom status:', error);
    }
  };

  const updateUser = async (user: User) => {
    try {
      await db.profiles.update(user.id, user);

      // Update local state
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === user.id ? user : u),
        currentUser: prev.currentUser.id === user.id ? user : prev.currentUser
      }));

      addActivityLog('updated profile for', user.name, user.id);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const askRubberDuck = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    addActivityLog('asked for help with', task.title, task.id);
    const analysis = await unblockTaskAssistant(task);

    try {
      await db.tasks.update(taskId, {
        breakdown: analysis.steps,
        ai_suggestions: analysis.suggestions,
        completed_steps: []
      });
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? {
          ...t,
          breakdown: analysis.steps,
          aiSuggestions: analysis.suggestions,
          completedSteps: []
        } : t)
      }));
    } catch (error) {
      console.error('Error asking rubber duck:', error);
    }
  };

  const openReviewModal = (task: Task) => {
    setActiveReviewTask(task);
    setIsReviewModalOpen(true);
  };

  const addDraftGoal = (g: Goal) => setState(prev => ({ ...prev, draftGoals: [...prev.draftGoals, g] }));
  const promoteDraftGoal = (id: string) => {
    const goal = state.draftGoals.find(g => g.id === id);
    if (goal) {
      addGoal(goal);
      removeDraftGoal(id);
    }
  };
  const removeDraftGoal = (id: string) => setState(prev => ({ ...prev, draftGoals: prev.draftGoals.filter(g => g.id !== id) }));

  const setDraftMode = (enabled: boolean) => {
    setState(prev => ({ ...prev, isDraftMode: enabled }));
    addActivityLog(enabled ? 'turned on draft mode' : 'turned off draft mode', 'App');
  };

  const dispatchWeek = async () => {
    try {
      // Update all draft tasks in Supabase
      const draftTasks = state.tasks.filter(t => t.isDraft);
      await Promise.all(draftTasks.map(t => db.tasks.update(t.id, { is_draft: false, is_accepted: false })));

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.isDraft ? { ...t, isDraft: false, isAccepted: false } : t)
      }));
      addActivityLog('sent weekly tasks', 'Team');
    } catch (error) {
      console.error('Error dispatching week:', error);
    }
  };

  const acceptTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.tasks.update(taskId, { is_accepted: true });
      addActivityLog('accepted task', task.title, task.id);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isAccepted: true } : t)
      }));
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const toggleTaskBlocker = async (taskId: string, message?: string, suggestion?: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const isBlocked = !task.isBlocked;
    const status = isBlocked ? TaskStatus.Stuck : TaskStatus.WorkingOnIt;

    try {
      await db.tasks.update(taskId, {
        is_blocked: isBlocked,
        blocker_message: message,
        blocker_suggestion: suggestion,
        status
      });

      if (isBlocked) {
        addActivityLog('reported problem with', task.title, task.id);
      } else {
        addActivityLog('fixed problem with', task.title, task.id);
      }

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? {
          ...t,
          isBlocked: isBlocked,
          blockerMessage: message,
          blockerSuggestion: suggestion,
          status
        } : t)
      }));
    } catch (error) {
      console.error('Error toggling task blocker:', error);
    }
  };

  const toggleFocus = (taskId: string) => {
    setState(prev => {
      const isStarting = prev.activeFocusTaskId !== taskId;
      if (isStarting) {
        const task = prev.tasks.find(t => t.id === taskId);
        if (task) addActivityLog('started focus mode on', task.title, task.id);
      }
      return {
        ...prev,
        activeFocusTaskId: isStarting ? taskId : null,
        focusStartTime: isStarting ? Date.now() : null
      };
    });
  };

  const sendJoinRequest = async (email: string, role: string) => {
    try {
      // Generate 6-char code (uppercase alphanumeric)
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newRequest = await db.joinRequests.create({
        id: crypto.randomUUID(),
        email,
        role,
        status: 'pending',
        invitedBy: session?.user.id,
        accessCode,
        createdAt: new Date().toISOString()
      });

      const newPendingUser: User = {
        id: `pending:${email}`,
        name: `Pending: ${email.split('@')[0]}`,
        email: email,
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${accessCode}&background=random`,
        timezone: 'UTC',
        customId: `CODE-${accessCode}`,
        statusEmoji: '🔑',
        statusText: `Code: ${accessCode}`
      };

      setState(prev => ({
        ...prev,
        joinRequests: [newRequest, ...prev.joinRequests],
        users: [...prev.users, newPendingUser]
      }));
    } catch (error) {
      console.error('Error sending join request:', error);
      throw error;
    }
  };

  const createTeamMember = async (name: string, email: string, password: string, role: string) => {
    try {
      // Create a temporary client to avoid logging out the admin
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
              getItem: () => null,
              setItem: () => { },
              removeItem: () => { }
            }
          }
        }
      );

      const customId = `KNT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Sign up the new user
      const { data, error: signUpError } = await tempSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            custom_id: customId
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('User creation failed');

      // Create the profile entry manually using the temp client (which has "Insert own profile" RLS)
      const newProfile = {
        id: data.user.id,
        email,
        name,
        role,
        custom_id: customId,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        timezone: 'UTC'
      };

      const { error: profileError } = await tempSupabase
        .from('profiles')
        .insert(newProfile);

      if (profileError) throw profileError;

      const userObject: User = {
        ...newProfile,
        avatar: newProfile.avatar,
        statusEmoji: '🌱',
        statusText: 'New Member'
      };

      // Update local state
      setState(prev => ({
        ...prev,
        users: [...prev.users, userObject]
      }));

      // Create an approved join request so the manager can see this user in their team
      await db.joinRequests.upsert({
        id: crypto.randomUUID(),
        email,
        role,
        status: 'approved',
        invitedBy: session?.user.id,
        accessCode: 'DIRECT',
        createdAt: new Date().toISOString()
      }).catch(err => console.error('Error creating join request for new member:', err));

      addActivityLog('added new member', name);
      return userObject;

    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  };

  const approveJoinRequest = async (requestId: string) => {
    try {
      await db.joinRequests.update(requestId, { status: 'approved' });

      const request = state.joinRequests.find(r => r.id === requestId);
      if (request) {
        // If the user already exists, update their role
        const user = state.users.find(u => u.email === request.email);
        if (user) {
          await db.profiles.update(user.id, { role: request.role });
          setState(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === user.id ? { ...u, role: request.role } : u),
            currentUser: prev.currentUser.id === user.id ? { ...prev.currentUser, role: request.role } : prev.currentUser,
            joinRequests: prev.joinRequests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
          }));
        } else {
          setState(prev => ({
            ...prev,
            joinRequests: prev.joinRequests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
          }));
        }
        addActivityLog('approved join request for', request.email, request.id);
      }
    } catch (error) {
      console.error('Error approving join request:', error);
    }
  };

  const rejectJoinRequest = async (requestId: string) => {
    try {
      await db.joinRequests.update(requestId, { status: 'rejected' });
      setState(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
      }));
      const request = state.joinRequests.find(r => r.id === requestId);
      if (request) addActivityLog('rejected join request for', request.email, request.id);
    } catch (error) {
      console.error('Error rejecting join request:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-neon-green uppercase tracking-widest animate-pulse">Initializing System...</div>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || session?.user?.user_metadata?.role || null;

  return (
    <AppContext.Provider value={{
      state, userRole, theme, setTheme, logout, moveTask, toggleFocus, updateTaskStatus,
      addTask, updateTask, deleteTask,
      openTaskModal: (t, day, assignee, scheduledAt) => {
        if (t && t.status === TaskStatus.ReadyForReview && userRole === 'admin') {
          openReviewModal(t);
        } else {
          setTaskToEdit(t);
          setInitialTaskDay(day);
          setInitialScheduledAt(scheduledAt);
          setIsTaskModalOpen(true);
        }
      },
      viewEvidence: (t) => openReviewModal(t),
      addGoal, updateGoal, deleteGoal,
      openGoalModal: (g) => { setGoalToEdit(g); setIsGoalModalOpen(true); },
      addUser,
      updateUser,
      deleteUser: async (id) => {
        try {
          if (id.startsWith('pending:')) {
            const email = id.split(':')[1];
            const request = state.joinRequests.find(r => r.email === email && r.status === 'pending');
            if (request) {
              await db.joinRequests.delete(request.id);
              setState(p => ({
                ...p,
                users: p.users.filter(u => u.id !== id),
                joinRequests: p.joinRequests.filter(r => r.id !== request.id)
              }));
              addActivityLog('revoked invitation for', email, request.id);
            }
          } else {
            // 1. Clear assignments in tasks first to avoid FK errors
            const userTasks = state.tasks.filter(t =>
              t.assigneeId === id || (t.assigneeIds && t.assigneeIds.includes(id))
            );

            if (userTasks.length > 0) {
              await Promise.all(userTasks.map(t => {
                const updates: any = {};
                if (t.assigneeId === id) updates.assignee_id = null;
                if (t.assigneeIds) updates.assignee_ids = t.assigneeIds.filter(aid => aid !== id);
                return db.tasks.update(t.id, updates);
              }));
            }

            // 2. Find and delete matching join requests by email
            const userProfile = state.users.find(u => u.id === id);
            if (userProfile?.email) {
              const requests = state.joinRequests.filter(r => r.email === userProfile.email);
              if (requests.length > 0) {
                await Promise.all(requests.map(r => db.joinRequests.delete(r.id)));
              }
            }

            // 3. Delete the profile
            await db.profiles.delete(id);

            setState(p => ({
              ...p,
              users: p.users.filter(u => u.id !== id),
              joinRequests: p.joinRequests.filter(r => r.email !== userProfile?.email)
            }));
            addActivityLog('removed user', userProfile?.name || id, id);
          }
        } catch (error: any) {
          console.error('Error deleting user:', error);
          showError(`Failed to remove member: ${error.message || 'Unknown error'}`);
        }
      },
      updateUserStatus,
      addCustomStatus,
      removeCustomStatus,
      sendJoinRequest,
      createTeamMember,
      approveJoinRequest,
      rejectJoinRequest,
      toggleTaskBlocker,
      submitForReview, approveTask, requestRevision,
      addDraftGoal, promoteDraftGoal, removeDraftGoal, askRubberDuck, toggleBreakdownStep, toggleMilestone,
      openReportModal: () => setIsReportModalOpen(true),
      setDraftMode,
      dispatchWeek,
      acceptTask,
      batchUpdateTasks: async (taskIds, updates) => {
        try {
          await Promise.all(taskIds.map(id => db.tasks.update(id, updates)));
          setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => taskIds.includes(t.id) ? { ...t, ...updates } : t)
          }));
          addActivityLog(`batch updated ${taskIds.length} tasks`, 'Fleet');
        } catch (error) {
          console.error('Error batch updating tasks:', error);
        }
      },
      batchDeleteTasks: async (taskIds) => {
        try {
          await Promise.all(taskIds.map(id => db.tasks.delete(id)));
          setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => !taskIds.includes(t.id))
          }));
          addActivityLog(`batch deleted ${taskIds.length} tasks`, 'Fleet');
        } catch (error) {
          console.error('Error batch deleting tasks:', error);
        }
      },
      triggerCelebration
    }}>
      {loading || authLoading ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-obsidian-950 p-8 space-y-8">
          <div className="w-full max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton variant="circle" className="w-12 h-12" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-32 h-4" />
                  <Skeleton variant="text" className="w-24 h-3" />
                </div>
              </div>
              <Skeleton variant="rect" className="w-32 h-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton variant="rect" className="h-64" />
              <Skeleton variant="rect" className="h-64" />
              <Skeleton variant="rect" className="h-64" />
            </div>
          </div>
          <div className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] animate-pulse">
            Synchronizing Tactical Data...
          </div>
        </div>
      ) : !session ? (
        <LoginPage onLogin={() => { }} />
      ) : (
        <main role="main" className="flex-1 relative overflow-hidden">
          {userRole === 'admin' ? <AdminDashboard /> : <PerformerDashboard />}
          {showBriefing && <MondayMorningModal isOpen={showBriefing} onClose={() => setShowBriefing(false)} />}
        </main>
      )}

      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        initialDay={initialTaskDay}
        initialScheduledAt={initialScheduledAt}
      />
      <NewGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} goalToEdit={goalToEdit} />
      <CompletionModal isOpen={isCompletionModalOpen} onClose={() => setIsCompletionModalOpen(false)} task={activeReviewTask} />
      <ReviewEvidenceModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        task={activeReviewTask}
      />
      <WeeklyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {celebration.active && (
        <Celebration
          type={celebration.type}
          onComplete={() => setCelebration({ ...celebration, active: false })}
        />
      )}
    </AppContext.Provider>
  );
};

export default App;
