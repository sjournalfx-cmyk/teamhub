
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { User, X, Cpu, Terminal, Shield, Save, Fingerprint } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { state, updateUser } = useContext(AppContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (isOpen && state.currentUser) {
      setName(state.currentUser.name);
      setRole(state.currentUser.role || '');
      setBio(state.currentUser.bio || '');
      setAvatar(state.currentUser.avatar || '');
    }
  }, [isOpen, state.currentUser]);

  const handleSave = () => {
    updateUser({
      ...state.currentUser,
      name,
      role,
      bio,
      avatar
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-obsidian-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-terminal rounded-sm max-w-md w-full border border-white/10 font-mono overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <Fingerprint size={18} className="text-neon-cyan" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Identity.Registry</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img 
                src={avatar} 
                className="w-20 h-20 rounded-sm border border-neon-cyan/30 grayscale hover:grayscale-0 transition-all object-cover" 
                alt="Profile"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={10} /> Node.Callsign
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-950/50 border border-white/10 p-3 text-xs text-white outline-none focus:border-neon-cyan transition-all" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Shield size={10} /> Role.Designation
              </label>
              <input 
                type="text" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full bg-slate-950/50 border border-white/10 p-3 text-xs text-white outline-none focus:border-neon-cyan transition-all" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avatar.Link</label>
              <input 
                type="text" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)} 
                className="w-full bg-slate-950/50 border border-white/10 p-3 text-xs text-slate-400 outline-none focus:border-neon-cyan transition-all" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Node.Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
                className="w-full bg-slate-950/50 border border-white/10 p-3 text-xs text-slate-400 outline-none focus:border-neon-cyan resize-none transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Abort
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-neon-cyan text-obsidian-950 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center gap-2"
          >
            <Save size={12} /> Sync.Identity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
