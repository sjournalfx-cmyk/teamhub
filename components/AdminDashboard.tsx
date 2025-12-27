
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context';
import WeeklyView from './WeeklyView';
import GoalTree from './GoalTree';
import FocusMode from './FocusMode';
import DashboardView from './DashboardView';
import MembersView from './MembersView';
import SettingsView from './SettingsView';
import Copilot from './Copilot';
import Tooltip from './Tooltip';
import { TaskStatus } from '../types';
import { 
  LayoutDashboard, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  BarChart3, 
  Users, 
  Plus,
  Cpu,
  Settings
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { state, openTaskModal, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'week' | 'goals' | 'dashboard' | 'members' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const pendingReviews = useMemo(() => 
    state.tasks.filter(t => t.status === TaskStatus.ReadyForReview).length
  , [state.tasks]);

  const renderContent = () => {
      switch(activeTab) {
          case 'week': return <WeeklyView />;
          case 'goals': return <GoalTree />;
          case 'dashboard': return <DashboardView />;
          case 'members': return <MembersView />;
          case 'settings': return <SettingsView />;
          default: return <WeeklyView />;
      }
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Stats' },
    { id: 'week', icon: LayoutDashboard, label: 'Tasks' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'members', icon: Users, label: 'Team' }
  ];

  const MobileNavItem = ({ item }: { item: typeof menuItems[0] }) => (
    <button 
      onClick={() => setActiveTab(item.id as any)}
      className={`relative flex flex-col items-center gap-1 transition-all flex-1 py-1.5 ${activeTab === item.id ? 'text-neon-green' : 'text-slate-500'}`}
    >
      <div className={`p-2 rounded-lg transition-all ${activeTab === item.id ? 'bg-neon-green/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] scale-110' : 'scale-100'}`}>
        <item.icon size={20} />
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.15em]">{item.label}</span>
      {item.id === 'dashboard' && pendingReviews > 0 && (
        <div className="absolute top-1 translate-x-3.5">
           <span className="flex h-2 w-2 rounded-full bg-neon-cyan animate-pulse ring-1 ring-obsidian-950"></span>
        </div>
      )}
    </button>
  );

  return (
      <div className="flex h-screen bg-transparent font-sans text-slate-500 dark:text-slate-300 overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside 
            className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} glass-terminal flex flex-col flex-shrink-0 transition-all duration-300 relative z-20`}
        >
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-9 bg-white dark:bg-obsidian-900 border border-black/10 dark:border-white/10 text-slate-500 hover:text-neon-green rounded-sm p-1 shadow-xl transition-all z-30"
          >
             {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
            <div className="w-8 h-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded flex items-center justify-center flex-shrink-0">
                <Cpu size={18} className="text-neon-green" />
            </div>
            {!isSidebarCollapsed && (
                <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white font-sans">TeamHub</span>
            )}
          </div>

          <div className="px-4 mb-2">
            <Tooltip content="Create new task" position={isSidebarCollapsed ? 'right' : 'top'}>
              <button 
                  onClick={() => openTaskModal()}
                  className={`tactical-button w-full dark:text-white font-bold uppercase tracking-wide text-[10px] flex items-center justify-center ${isSidebarCollapsed ? 'p-3' : 'px-4 py-2.5 gap-2'}`}
              >
                  <Plus size={16} />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">New Task</span>}
              </button>
            </Tooltip>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            {menuItems.map(tab => (
              <Tooltip key={tab.id} content={tab.label} position={isSidebarCollapsed ? 'right' : 'top'}>
                <button 
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-black/5 dark:bg-white/5 text-neon-green border border-neon-green/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <tab.icon size={16} />
                  {tab.id === 'dashboard' && pendingReviews > 0 && (
                    <div className={`absolute ${isSidebarCollapsed ? 'top-1 right-1' : 'right-4'} flex items-center justify-center`}>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan text-[7px] items-center justify-center text-obsidian-950 font-black">{pendingReviews}</span>
                      </span>
                    </div>
                  )}
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">{tab.label}</span>}
                </button>
              </Tooltip>
            ))}

            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                <Tooltip content="AI Assistant" position={isSidebarCollapsed ? 'right' : 'top'}>
                    <button 
                        onClick={() => setIsCopilotOpen(!isCopilotOpen)}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-wide transition-all ${isCopilotOpen ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-slate-500 hover:text-neon-green hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <Cpu size={16} className={isCopilotOpen ? 'animate-pulse' : ''} />
                        {!isSidebarCollapsed && <span className="whitespace-nowrap">Assistant</span>}
                    </button>
                </Tooltip>
            </div>
          </nav>

          <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-2 py-2 rounded-sm group hover:bg-white/5 transition-all text-left ${activeTab === 'settings' ? 'bg-white/5 border border-white/10' : ''}`}
            >
              <img src={state.currentUser.avatar} alt="User" className="w-8 h-8 rounded-sm border border-black/10 dark:border-white/10 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all" />
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{state.currentUser.name}</p>
                    <p className="text-[9px] text-neon-green/50 truncate uppercase tracking-widest">{state.currentUser.role}</p>
                </div>
              )}
            </button>
            
            <Tooltip content="Log out" position={isSidebarCollapsed ? 'right' : 'top'}>
              <button 
                  onClick={logout}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-2 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors`}
              >
                  <LogOut size={14} />
                  {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </Tooltip>
          </div>
        </aside>

        {/* Mobile Top Header */}
        <header className="md:hidden fixed top-0 left-0 w-full h-14 bg-obsidian-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-40 pt-safe">
           <div className="flex items-center gap-2">
              <Cpu size={18} className="text-neon-green" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">TeamHub</span>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsCopilotOpen(!isCopilotOpen)} className={`p-2 rounded-sm transition-all ${isCopilotOpen ? 'text-neon-green bg-neon-green/10' : 'text-slate-500'}`}>
                 <Cpu size={18} />
              </button>
              <img 
                src={state.currentUser.avatar} 
                className={`w-7 h-7 rounded-sm border transition-all ${activeTab === 'settings' ? 'border-neon-cyan ring-1 ring-neon-cyan/30' : 'border-white/10 opacity-60'}`} 
                onClick={() => setActiveTab('settings')}
              />
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden overflow-y-auto relative pt-14 md:pt-0 pb-20 md:pb-0">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-18 bg-obsidian-950/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-2 z-40 pb-safe">
           {/* Left Half */}
           <div className="flex flex-1 items-center justify-around h-full">
              <MobileNavItem item={menuItems[0]} />
              <MobileNavItem item={menuItems[1]} />
           </div>

           {/* Central Float Action Button */}
           <div className="relative w-16 flex justify-center">
              <button 
                onClick={() => openTaskModal()}
                className="w-12 h-12 -mt-10 bg-neon-green rounded-full flex items-center justify-center text-obsidian-950 shadow-[0_0_20px_rgba(34,197,94,0.4)] border-4 border-obsidian-950 active:scale-90 transition-all z-50 transform hover:rotate-90"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
           </div>

           {/* Right Half */}
           <div className="flex flex-1 items-center justify-around h-full">
              <MobileNavItem item={menuItems[2]} />
              <MobileNavItem item={menuItems[3]} />
           </div>
        </nav>
        
        {isCopilotOpen && <Copilot onClose={() => setIsCopilotOpen(false)} />}
        <FocusMode />
      </div>
  );
};

export default AdminDashboard;
