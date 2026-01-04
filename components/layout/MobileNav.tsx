
import React from 'react';
import { Plus } from 'lucide-react';
import { SidebarItem } from './Sidebar';

interface MobileNavProps {
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  onNewTask?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  items,
  activeTab,
  onTabChange,
  onNewTask
}) => {
  const MobileNavItem = ({ item }: { item: SidebarItem }) => (
    <button
      onClick={() => onTabChange(item.id as any)}
      className={`relative flex flex-col items-center gap-1 transition-all flex-1 py-1.5 ${activeTab === item.id ? 'text-neon-green' : 'text-slate-500'}`}
    >
      <div className={`p-2 rounded-lg transition-all ${activeTab === item.id ? 'bg-neon-green/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] scale-110' : 'scale-100'}`}>
        <item.icon size={20} />
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.15em]">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <div className="absolute top-1 translate-x-3.5">
          <span className={`flex h-2 w-2 rounded-full animate-pulse ring-1 ring-obsidian-950 ${item.badgeColor || 'bg-neon-cyan'}`}></span>
        </div>
      )}
    </button>
  );

  // Split items into two halves for the center FAB
  const leftItems = items.slice(0, Math.ceil(items.length / 2));
  const rightItems = items.slice(Math.ceil(items.length / 2));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40">
      <div className="glass-layer-3 border-t border-white/10 flex items-center justify-between px-2 h-16 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        {/* Left Half */}
        <div className="flex flex-1 items-center justify-around h-full">
          {leftItems.map(item => <MobileNavItem key={item.id} item={item} />)}
        </div>

        {/* Central Float Action Button */}
        {onNewTask && (
          <div className="relative w-16 flex justify-center">
            <button
              onClick={onNewTask}
              className="w-14 h-14 -mt-12 bg-neon-green rounded-2xl flex items-center justify-center text-obsidian-950 shadow-[0_0_30px_rgba(34,197,94,0.5)] border-4 border-slate-50 dark:border-obsidian-950 active:scale-90 transition-all z-50 transform hover:rotate-90"
            >
              <Plus size={28} strokeWidth={4} />
            </button>
          </div>
        )}

        {/* Right Half */}
        <div className="flex flex-1 items-center justify-around h-full">
          {rightItems.map(item => <MobileNavItem key={item.id} item={item} />)}
        </div>
      </div>

      {/* Safe Area Spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-obsidian-950/90 backdrop-blur-xl"></div>
    </nav>
  );
};

export default MobileNav;
