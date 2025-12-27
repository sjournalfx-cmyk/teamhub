
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { User, X, UserPlus, Shield, Terminal, Cpu, Fingerprint, Zap, Check, Lock, Hash } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useContext(AppContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [designation, setDesignation] = useState('performer');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setRole('');
      setUserId('');
      setAccessCode('');
      setDesignation('performer');
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser: User = {
      id: `u-${Date.now()}`,
      customId: userId,
      accessCode: accessCode,
      name: name,
      avatar: `https://picsum.photos/seed/${name.toLowerCase().replace(/\s/g, '')}/100/100`,
      timezone: 'UTC',
      role: role || 'Team Member',
      bio: 'Initialized node. Awaiting tactical assignments.',
      metrics: {
        uptime: 100,
        dailyActivity: [0, 0, 0, 0, 0, 0, 0]
      }
    };

    addUser(newUser);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-obsidian-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-terminal rounded-sm max-w-md w-full border border-white/10 font-mono overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-cyan/40 animate-scan"></div>

        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <UserPlus size={18} className="text-neon-cyan" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Personnel.Authorization</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-neon-green/10 border border-neon-green/30 rounded-full flex items-center justify-center mx-auto text-neon-green">
                <Check size={32} />
             </div>
             <div className="text-sm font-black text-white uppercase tracking-widest">Node.Authorized</div>
             <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Synchronizing team grid...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={12} /> Full Name / Alias
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="e.g. Project Node A"
                  className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Strategic Role
                </label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="e.g. Design Consultant"
                  className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} /> User ID (Callsign)
                  </label>
                  <input 
                    type="text" 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    placeholder="e.g. ALPHA-9"
                    className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={12} /> Access Code
                  </label>
                  <input 
                    type="password" 
                    value={accessCode} 
                    onChange={(e) => setAccessCode(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Access Clearance
                </label>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     type="button"
                     onClick={() => setDesignation('performer')}
                     className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'performer' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-white/5 text-slate-600 hover:text-white'}`}
                   >
                     Performer
                   </button>
                   <button 
                     type="button"
                     onClick={() => setDesignation('admin')}
                     className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'admin' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/5 border-white/5 text-slate-600 hover:text-white'}`}
                   >
                     Admin
                   </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              <button 
                type="submit"
                className="tactical-button w-full py-4 text-white flex items-center justify-center gap-3 active:scale-95"
              >
                <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
                <Zap size={16} className="text-neon-cyan" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authorize Access</span>
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors py-2 text-center"
              >
                Abort Protocol
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteMemberModal;
