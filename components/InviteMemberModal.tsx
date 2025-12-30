
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { X, UserPlus, Shield, Mail, Cpu, Fingerprint, Zap, Check, Search, Send } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { sendJoinRequest } = useContext(AppContext);
  const [designation, setDesignation] = useState('performer');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError(null);
      setIsSuccess(false);
      setDesignation('performer');
    }
  }, [isOpen]);

  const handleSendRequest = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    setError(null);

    try {
      await sendJoinRequest(email.trim(), designation);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to send join request.');
    } finally {
      setSending(false);
    }
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

        <div className="p-8 space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-neon-green/10 border border-neon-green/30 rounded-full flex items-center justify-center mx-auto text-neon-green">
                <Check size={32} />
              </div>
              <div className="text-sm font-black text-white uppercase tracking-widest">Request.Sent</div>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                Join authorization has been dispatched to <span className="text-white">{email}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="personnel@kinetic.com"
                    className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} /> Assign Access Clearance
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDesignation('performer')}
                      className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'performer' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-white/5 text-slate-600 hover:text-white'}`}
                    >
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignation('admin')}
                      className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'admin' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/5 border-white/5 text-slate-600 hover:text-white'}`}
                    >
                      Manager
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-[9px] text-rose-500 font-black uppercase tracking-widest animate-pulse">
                    Error: {error}
                  </div>
                )}

                <button
                  onClick={handleSendRequest}
                  disabled={sending || !email.trim()}
                  className="tactical-button w-full py-4 text-white flex items-center justify-center gap-3 active:scale-95"
                >
                  <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
                  {sending ? <Cpu size={16} className="animate-spin" /> : <Send size={16} className="text-neon-cyan" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dispatch Authorization</span>
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors py-2 text-center"
                >
                  Abort Protocol
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
