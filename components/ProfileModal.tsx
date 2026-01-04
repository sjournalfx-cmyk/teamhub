import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { User, X, Cpu, Terminal, Shield, Save, Fingerprint, Upload, Sun, Moon, Sparkles } from 'lucide-react';
import FileUpload from './FileUpload';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { state, updateUser, theme, setTheme } = useContext(AppContext);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-200/90 dark:bg-obsidian-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-terminal bg-white dark:bg-slate-900 rounded-sm max-w-md w-full border border-black/10 dark:border-white/10 font-mono overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <Fingerprint size={18} className="text-neon-cyan" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Profile</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
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
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <FileUpload
                  onUploadComplete={(url) => setAvatar(url)}
                  bucket="avatars"
                  accept="image/*"
                  label="Change"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             {/* Theme Selector */}
             <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={10} /> Interface Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'midnight', icon: Sparkles, label: 'Midnight' },
                  { id: 'terminal', icon: Terminal, label: 'Terminal' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center justify-center p-2 rounded-sm border transition-all ${
                      theme === t.id
                        ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                        : 'bg-white dark:bg-slate-950/50 border-black/10 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <t.icon size={16} className="mb-1" />
                    <span className="text-[8px] uppercase font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={10} /> Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Shield size={10} /> Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan transition-all"
              />
            </div>


            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Member Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-600 dark:text-slate-400 outline-none focus:border-neon-cyan resize-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-neon-cyan text-white dark:text-obsidian-950 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center gap-2"
          >
            <Save size={12} /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
