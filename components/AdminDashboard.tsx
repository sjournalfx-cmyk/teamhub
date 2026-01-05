import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context';
import WeeklyView from './WeeklyView';
import GoalTree from './GoalTree';
import DashboardView from './DashboardView';
import MembersView from './MembersView';
import JoinRequestsView from './JoinRequestsView';
import SettingsView from './SettingsView';
import DashboardShell from './layout/DashboardShell';
import { TaskStatus } from '../types';
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Users,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { state, openTaskModal, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'week' | 'goals' | 'dashboard' | 'members' | 'settings' | 'requests'>('dashboard');

  const pendingReviews = useMemo(() =>
    state.tasks.filter(t => t.status === TaskStatus.ReadyForReview).length
    , [state.tasks]);

  const pendingJoinRequests = useMemo(() =>
    state.joinRequests.filter(r => r.status === 'pending').length
    , [state.joinRequests]);

  const renderContent = () => {
    switch (activeTab) {
      case 'week': return <WeeklyView />;
      case 'goals': return <GoalTree />;
      case 'dashboard': return <DashboardView />;
      case 'members': return <MembersView />;
      case 'requests': return <JoinRequestsView />;
      case 'settings': return <SettingsView />;
      default: return <WeeklyView />;
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Stats', badge: pendingReviews },
    { id: 'week', icon: LayoutDashboard, label: 'Tasks' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'members', icon: Users, label: 'Team' },
    { id: 'requests', icon: ShieldCheck, label: 'Invites', badge: pendingJoinRequests, badgeColor: 'bg-amber-500' }
  ];

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNewTask={() => openTaskModal()}
      onLogout={logout}
      currentUser={state.currentUser}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default AdminDashboard;