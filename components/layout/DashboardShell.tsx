
import React, { useState } from 'react';
import Sidebar, { SidebarItem } from './Sidebar';
import MobileNav from './MobileNav';
import { Cpu } from 'lucide-react';
import Copilot from '../Copilot';
import FocusMode from '../FocusMode';
import OnboardingTour from '../OnboardingTour';

interface DashboardShellProps {
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  onNewTask?: () => void;
  onLogout: () => void;
  currentUser: any;
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  sidebarItems,
  activeTab,
  onTabChange,
  onNewTask,
  onLogout,
  currentUser,
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('kinetic_onboarding_seen'));

  return (
    <div className="flex h-screen bg-transparent font-sans text-slate-500 dark:text-slate-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNewTask={onNewTask}
        onLogout={onLogout}
        currentUser={currentUser}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 w-full h-14 bg-white/80 dark:bg-obsidian-950/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 z-40 pt-safe">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-neon-green" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Kinetic</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCopilotOpen(!isCopilotOpen)} className={`p-2 rounded-sm transition-all ${isCopilotOpen ? 'text-neon-green bg-neon-green/10' : 'text-slate-500'}`}>
            <Cpu size={18} />
          </button>
          <img
            src={currentUser.avatar}
            className={`w-7 h-7 rounded-sm border transition-all ${activeTab === 'settings' ? 'border-neon-cyan ring-1 ring-neon-cyan/30' : 'border-black/10 dark:border-white/10 opacity-60'}`}
            onClick={() => onTabChange('settings')}
            alt="User"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pt-14 md:pt-0 pb-20 md:pb-0 custom-scrollbar">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewTask={onNewTask}
      />

      {isCopilotOpen && <Copilot onClose={() => setIsCopilotOpen(false)} />}
      <FocusMode />
      {showTour && (
        <OnboardingTour onClose={() => setShowTour(false)} />
      )}
    </div>
  );
};


export default DashboardShell;
