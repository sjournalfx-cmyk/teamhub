
import React from 'react';
import { Cpu, Plus, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from '../Tooltip';

export interface SidebarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeColor?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewTask?: () => void;
  onLogout: () => void;
  currentUser: {
    name: string;
    role: string;
    avatar: string;
  };
  isCopilotOpen?: boolean;
  onToggleCopilot?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onNewTask,
  onLogout,
  currentUser,
  isCopilotOpen,
  onToggleCopilot
}) => {
  return (
    <aside
      className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} glass-terminal flex flex-col flex-shrink-0 transition-all duration-300 relative z-20`}
    >
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-9 bg-white dark:bg-obsidian-900 border border-black/10 dark:border-white/10 text-slate-500 hover:text-neon-green rounded-sm p-1 shadow-xl transition-all z-30"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
        <div className="w-8 h-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded flex items-center justify-center flex-shrink-0">
          <Cpu size={18} className="text-neon-green" />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white font-sans">Kinetic</span>
        )}
      </div>

      {onNewTask && (
        <div className="px-4 mb-2">
          <Tooltip content="Create new task" position={isCollapsed ? 'right' : 'top'}>
            <button
              onClick={onNewTask}
              className={`tactical-button w-full dark:text-white font-bold uppercase tracking-wide text-[10px] flex items-center justify-center ${isCollapsed ? 'p-3' : 'px-4 py-2.5 gap-2'}`}
            >
              <Plus size={16} />
              {!isCollapsed && <span className="whitespace-nowrap">New Task</span>}
            </button>
          </Tooltip>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {items.map(tab => (
          <Tooltip key={tab.id} content={tab.label} position={isCollapsed ? 'right' : 'top'}>
            <button
              onClick={() => onTabChange(tab.id as any)}
              className={`w-full relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-black/5 dark:bg-white/5 text-neon-green border border-neon-green/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <tab.icon size={16} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <div className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-4'} flex items-center justify-center`}>
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tab.badgeColor || 'bg-neon-cyan'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 text-[7px] items-center justify-center text-obsidian-950 font-black ${tab.badgeColor || 'bg-neon-cyan'}`}>{tab.badge}</span>
                  </span>
                </div>
              )}
              {!isCollapsed && <span className="whitespace-nowrap">{tab.label}</span>}
            </button>
          </Tooltip>
        ))}

        {onToggleCopilot && (
          <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
            <Tooltip content="AI Assistant" position={isCollapsed ? 'right' : 'top'}>
              <button
                onClick={onToggleCopilot}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-wide transition-all ${isCopilotOpen ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-slate-500 hover:text-neon-green hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Cpu size={16} className={isCopilotOpen ? 'animate-pulse' : ''} />
                {!isCollapsed && <span className="whitespace-nowrap">Assistant</span>}
              </button>
            </Tooltip>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 py-2 rounded-sm group hover:bg-white/5 transition-all text-left ${activeTab === 'settings' ? 'bg-white/5 border border-white/10' : ''}`}
        >
          <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-sm border border-black/10 dark:border-white/10 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in">
              <p className="text-[10px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{currentUser.name}</p>
              <p className="text-[9px] text-neon-green/50 truncate uppercase tracking-widest">{currentUser.role}</p>
            </div>
          )}
        </button>

        <Tooltip content="Log out" position={isCollapsed ? 'right' : 'top'}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors`}
          >
            <LogOut size={14} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;
