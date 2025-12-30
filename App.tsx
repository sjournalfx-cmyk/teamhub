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
import { unblockTaskAssistant } from './services/geminiService';
import { AppContext } from './context';
import { useAuth } from './context/AuthContext';
import { db, supabase } from './lib/supabase';

const App: React.FC = () => {
  const { session, profile, loading: authLoading, signOut: supabaseSignOut } = useAuth();
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('syncweek_theme') as Theme;
    return savedTheme || 'dark';
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
      const [tasks, goals, activityLog, profiles, joinRequests] = await Promise.all([
        db.tasks.getAll(),
        db.goals.getAll(),
        db.activityLog.getAll(),
        db.profiles.getAll(),
        db.joinRequests.getAll().catch(() => []) // Fallback if table doesn't exist yet
      ]);

      const mappedUsers: User[] = profiles || [];
      const mappedProfile: User | null = profile ? profiles.find((p: any) => p.id === profile.id) || null : null;

      // Auto-generate customId if missing for current user
      if (mappedProfile && !mappedProfile.customId) {
        const newId = `KNT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        mappedProfile.customId = newId;
        // Update in DB
        db.profiles.update(mappedProfile.id, { customId: newId }).catch(err => console.error('Error auto-generating ID:', err));
      }

      setState(prev => ({
        ...prev,
        tasks: tasks || [],
        goals: goals || [],
        activityLog: activityLog || [],
        users: mappedUsers,
        currentUser: mappedProfile || prev.currentUser,
        joinRequests: joinRequests || []
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivityLog = async (action: string, targetName: string) => {
    if (!session?.user) return;

    const newEvent: ActivityEvent = {
      id: `ev-${Date.now()}`,
      userId: session.user.id,
      userName: profile?.name || session.user.email?.split('@')[0] || 'Unknown',
      action,
      targetName,
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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('syncweek_theme', newTheme);
  };

  const logout = async () => {
    await addActivityLog('terminated session from', profile?.role || 'System');
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
      addActivityLog(`set status to ${status} for`, task.title);
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
      addActivityLog('submitted deliverables for', task.title);
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
      addActivityLog('verified and closed', task.title);
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
      addActivityLog('requested revision for', task.title);
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
    try {
      const newTask = { ...task, user_id: session?.user.id, is_draft: state.isDraftMode };
      const createdTask = await db.tasks.create(newTask);
      addActivityLog('initialized mission', task.title);
      setState(prev => ({ ...prev, tasks: [...prev.tasks, createdTask] }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (t: Task) => {
    try {
      await db.tasks.update(t.id, t);
      setState(prev => ({ ...prev, tasks: prev.tasks.map(task => task.id === t.id ? t : task) }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    const task = state.tasks.find(t => id === t.id);
    if (!task) return;

    try {
      await db.tasks.delete(id);
      addActivityLog('aborted mission', task.title);
      setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const addGoal = async (g: Goal) => {
    try {
      const newGoal = { ...g, user_id: session?.user.id };
      const createdGoal = await db.goals.create(newGoal);
      addActivityLog('defined strategic goal', g.title);
      setState(prev => ({ ...prev, goals: [...prev.goals, createdGoal] }));
    } catch (error) {
      console.error('Error adding goal:', error);
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

  const addUser = (u: User) => {
    // This would typically be handled by Supabase Auth invite
    addActivityLog('authorized new node', u.name);
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
      addActivityLog('updated status to', `${emoji} ${text}`);
    } catch (error) {
      console.error('Error updating status:', error);
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

      addActivityLog('updated profile for', user.name);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const askRubberDuck = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    addActivityLog('requested tactical analysis for', task.title);
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
    addActivityLog(enabled ? 'activated draft mode' : 'deactivated draft mode', 'Workspace');
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
      addActivityLog('dispatched weekly instructions', 'Fleet');
    } catch (error) {
      console.error('Error dispatching week:', error);
    }
  };

  const acceptTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.tasks.update(taskId, { is_accepted: true });
      addActivityLog('accepted directive', task.title);
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
        addActivityLog('reported friction for', task.title);
      } else {
        addActivityLog('resolved friction for', task.title);
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
        if (task) addActivityLog('entered deep focus on', task.title);
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
      const newRequest = await db.joinRequests.create({
        email,
        role,
        status: 'pending',
        invitedBy: session?.user.id,
        createdAt: new Date().toISOString()
      });
      setState(prev => ({
        ...prev,
        joinRequests: [newRequest, ...prev.joinRequests]
      }));
      addActivityLog('sent join authorization to', email);
    } catch (error) {
      console.error('Error sending join request:', error);
    }
  };

  const approveJoinRequest = async (requestId: string) => {
    try {
      await db.joinRequests.update(requestId, { status: 'approved' });
      setState(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
      }));
      const request = state.joinRequests.find(r => r.id === requestId);
      if (request) addActivityLog('approved join request for', request.email);
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
      if (request) addActivityLog('rejected join request for', request.email);
    } catch (error) {
      console.error('Error rejecting join request:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-neon-green uppercase tracking-widest animate-pulse">Initializing System...</div>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || null;

  return (
    <AppContext.Provider value={{
      state, userRole, theme, toggleTheme, logout, moveTask, toggleFocus, updateTaskStatus,
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
          await db.profiles.delete(id);
          setState(p => ({ ...p, users: p.users.filter(u => u.id !== id) }));
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      },
      updateUserStatus,
      sendJoinRequest,
      approveJoinRequest,
      rejectJoinRequest,
      toggleTaskBlocker,
      submitForReview, approveTask, requestRevision,
      addDraftGoal, promoteDraftGoal, removeDraftGoal, askRubberDuck, toggleBreakdownStep,
      openReportModal: () => setIsReportModalOpen(true),
      setDraftMode,
      dispatchWeek,
      acceptTask
    }}>
      {!session ? (
        <LoginPage onLogin={() => { }} />
      ) : (
        <>
          {userRole === 'admin' ? <AdminDashboard /> : <PerformerDashboard />}
          {showBriefing && <MondayMorningModal isOpen={showBriefing} onClose={() => setShowBriefing(false)} />}
        </>
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
    </AppContext.Provider>
  );
};

export default App;
