
import React, { useContext, useState } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { User, TaskStatus } from '../types';
import { Search, UserPlus, Mail, Globe, Clock, Zap, Target, MoreHorizontal, Filter, MessageCircle, Plus, Edit, Trash2, X, Check, ClipboardList, Cpu, Terminal, Eye, ShieldCheck, Users } from 'lucide-react';
import Tooltip from './Tooltip';
import InviteMemberModal from './InviteMemberModal';

const MembersView: React.FC = () => {
  const { state, updateUser, deleteUser, openTaskModal } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const filteredUsers = state.users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActiveTask = (userId: string) => {
    return state.tasks.find(t => t.assigneeId === userId && t.status === TaskStatus.WorkingOnIt);
  };

  const getPendingReviews = (userId: string) => {
    return state.tasks.filter(t => t.assigneeId === userId && t.status === TaskStatus.ReadyForReview);
  };

  const getTaskStats = (userId: string) => {
    const userTasks = state.tasks.filter(t => t.assigneeId === userId);
    const total = userTasks.length;
    const done = userTasks.filter(t => t.status === TaskStatus.Done).length;
    const pending = total - done;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, progress };
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role || '');
    setEditBio(user.bio || '');
    setOpenMenuId(null);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      updateUser({ ...editingUser, name: editName, role: editRole, bio: editBio });
      setEditingUser(null);
    }
  };

  const handleDeleteClick = (userId: string) => {
    if (window.confirm("Remove this person from the team?")) {
      deleteUser(userId);
      setOpenMenuId(null);
    }
  };

  const handleInspect = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      openTaskModal(task);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-20"></div>

      {/* Tactical Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">Team Members</h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            List of people and their <span className="text-white">current tasks</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-xs font-medium uppercase tracking-widest text-white outline-none focus:border-neon-green transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="tactical-button px-6 py-2.5 text-white flex items-center gap-2 group"
          >
            <UserPlus size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Invite Member</span>
          </button>
        </div>
      </div>

      {/* Stats Readout */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Team Size', val: state.users.length, color: 'text-white' },
          { label: 'Online', val: state.users.length, color: 'text-neon-green' },
          { label: 'Busy Now', val: state.activeFocusTaskId ? 1 : 0, color: 'text-neon-cyan' },
          { label: 'Availability', val: '100%', color: 'text-slate-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-sm">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Member Table */}
      <div className="relative z-10 tactical-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name & Role</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest hidden md:table-cell">
                <div className="flex items-center">
                    <span className="text-slate-500 w-20">total.</span>
                    <span className="text-neon-green/80 w-20">done.</span>
                    <span className="text-amber-500/80 w-20">queue.</span>
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Progress</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => {
              const activeTask = getActiveTask(user.id);
              const pendingReviews = getPendingReviews(user.id);
              const stats = getTaskStats(user.id);
              const isCurrentUser = user.id === state.currentUser.id;
              const isFocusing = isCurrentUser && state.activeFocusTaskId;

              return (
                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.avatar} className={`w-10 h-10 rounded-sm grayscale group-hover:grayscale-0 transition-all border border-white/10 ${isFocusing ? 'border-neon-green shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}`} />
                        <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-obsidian-950 ${isFocusing ? 'bg-neon-green animate-pulse' : 'bg-slate-700'}`}></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <div className="text-xs font-bold text-white uppercase tracking-tight">{user.name}</div>
                           {pendingReviews.length > 0 && (
                             <span className="animate-pulse bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-widest">
                               TASK PENDING
                             </span>
                           )}
                        </div>
                        <div className="text-[10px] text-neon-green/60 uppercase font-bold">{user.role || 'Member'}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center text-[16px]">
                        <span className="text-white font-black w-20">{stats.total}</span>
                        <span className="text-neon-green font-black w-20">{stats.done}</span>
                        <span className="text-amber-500 font-black w-20">{stats.pending}</span>
                    </div>
                  </td>

                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full bg-neon-green" style={{ width: `${stats.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-white">{stats.progress}%</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {pendingReviews.length > 0 ? (
                        <Tooltip content="Check task evidence">
                          <button 
                            onClick={() => handleInspect(pendingReviews[0].id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan text-obsidian-950 text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                          >
                            <Eye size={12} /> Review
                          </button>
                        </Tooltip>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(user)} className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteClick(user.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
};

export default MembersView;
