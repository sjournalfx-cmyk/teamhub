
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

const STORAGE_KEY = 'syncweek_app_state_v8'; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tasks)) {
            // Merge with initial state to ensure new fields are present
            return {
                ...INITIAL_STATE,
                ...parsed,
                // Ensure certain fields are always arrays if missing in old storage
                tasks: parsed.tasks || INITIAL_STATE.tasks,
                goals: parsed.goals || INITIAL_STATE.goals,
                draftGoals: parsed.draftGoals || [],
                draftTasks: parsed.draftTasks || [],
                activityLog: parsed.activityLog || []
            };
        }
      } catch (e) {
          console.error("Failed to restore state:", e);
      }
    }
    return { ...INITIAL_STATE, draftGoals: [], draftTasks: [], activityLog: [], isDraftMode: false };
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addActivityLog = (action: string, targetName: string) => {
    const newEvent: ActivityEvent = {
      id: `ev-${Date.now()}`,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      action,
      targetName,
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      activityLog: [...(prev.activityLog || []), newEvent].slice(-50)
    }));
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const login = (role: UserRole) => {
    setUserRole(role);
    setShowBriefing(role === 'performer');
    addActivityLog('established connection to', role === 'admin' ? 'Command.Center' : 'Performer.Node');
  };
  
  const logout = () => {
    addActivityLog('terminated session from', userRole || 'System');
    setUserRole(null);
    setShowBriefing(false);
  };

  const moveTask = (taskId: string, targetDay: DayOfWeek) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, day: targetDay } : t)
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (status === TaskStatus.Done && userRole === 'performer') {
          setActiveReviewTask(task);
          setIsCompletionModalOpen(true);
          return;
      }

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      }));
      addActivityLog(`set status to ${status} for`, task.title);
  };

  const toggleBreakdownStep = (taskId: string, stepIndex: number) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const current = t.completedSteps || [];
          const updated = current.includes(stepIndex) 
            ? current.filter(i => i !== stepIndex) 
            : [...current, stepIndex];
          return { ...t, completedSteps: updated };
        }
        return t;
      })
    }));
  };

  const submitForReview = (taskId: string, deliverables: Deliverable[], comment?: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) addActivityLog('submitted deliverables for', task.title);
    setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { 
            ...t, 
            status: TaskStatus.ReadyForReview, 
            deliverables,
            completionComment: comment 
        } : t)
    }));
  };

  const approveTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) addActivityLog('verified and closed', task.title);
    setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.Done } : t)
    }));
    setIsReviewModalOpen(false);
  };

  const requestRevision = (taskId: string, comment: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) addActivityLog('requested revision for', task.title);
    setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { 
            ...t, 
            status: TaskStatus.WorkingOnIt, 
            reviewComment: comment 
        } : t)
    }));
    setIsReviewModalOpen(false);
  };

  const addTask = (task: Task) => {
    addActivityLog('initialized mission', task.title);
    const isDraft = state.isDraftMode;
    setState(prev => ({ ...prev, tasks: [...prev.tasks, { ...task, isDraft }] }));
  };

  const updateTask = (t: Task) => setState(prev => ({ ...prev, tasks: prev.tasks.map(task => task.id === t.id ? t : task) }));
  
  const deleteTask = (id: string) => {
    const task = state.tasks.find(t => id === t.id);
    if (task) addActivityLog('aborted mission', task.title);
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }
  
  const addGoal = (g: Goal) => {
    addActivityLog('defined strategic goal', g.title);
    setState(prev => ({ ...prev, goals: [...prev.goals, g] }));
  };

  const updateGoal = (g: Goal) => setState(prev => ({ ...prev, goals: prev.goals.map(goal => goal.id === g.id ? g : goal) }));
  const deleteGoal = (id: string) => setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));

  const addUser = (u: User) => {
    addActivityLog('authorized new node', u.name);
    setState(prev => ({ ...prev, users: [...prev.users, u] }));
  };

  const updateUserStatus = (emoji: string, text: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUser.id ? { ...u, statusEmoji: emoji, statusText: text } : u),
      currentUser: { ...prev.currentUser, statusEmoji: emoji, statusText: text }
    }));
    addActivityLog('updated status to', `${emoji} ${text}`);
  };

  const askRubberDuck = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    addActivityLog('requested tactical analysis for', task.title);
    const analysis = await unblockTaskAssistant(task);
    setState(prev => ({ 
      ...prev, 
      tasks: prev.tasks.map(t => t.id === taskId ? { 
        ...t, 
        breakdown: analysis.steps, 
        aiSuggestions: analysis.suggestions,
        completedSteps: [] 
      } : t) 
    }));
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

  const dispatchWeek = () => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.isDraft ? { ...t, isDraft: false, isAccepted: false } : t)
    }));
    addActivityLog('dispatched weekly instructions', 'Fleet');
  };

  const acceptTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) addActivityLog('accepted directive', task.title);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isAccepted: true } : t)
    }));
  };

  const toggleTaskBlocker = (taskId: string, message?: string, suggestion?: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.isBlocked) {
      addActivityLog('reported friction for', task.title);
    } else {
      addActivityLog('resolved friction for', task.title);
    }

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { 
        ...t, 
        isBlocked: !t.isBlocked, 
        blockerMessage: message, 
        blockerSuggestion: suggestion,
        status: !t.isBlocked ? TaskStatus.Stuck : TaskStatus.WorkingOnIt
      } : t)
    }));
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
        updateUser: (u) => setState(p => ({ ...p, users: p.users.map(user => user.id === u.id ? u : user) })),
        deleteUser: (id) => setState(p => ({ ...p, users: p.users.filter(u => u.id !== id) })),
        updateUserStatus,
        toggleTaskBlocker,
        submitForReview, approveTask, requestRevision,
        addDraftGoal, promoteDraftGoal, removeDraftGoal, askRubberDuck, toggleBreakdownStep,
        openReportModal: () => setIsReportModalOpen(true),
        setDraftMode,
        dispatchWeek,
        acceptTask
    }}>
      {!userRole ? (
        <LoginPage onLogin={login} />
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
