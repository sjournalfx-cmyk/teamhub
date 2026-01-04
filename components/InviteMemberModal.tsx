import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context';
import { X, UserPlus, Shield, Mail, Cpu, Zap, Check, Key, User, Lock, Copy } from 'lucide-react';
import { User as UserType } from '../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { createTeamMember, state, triggerCelebration } = useContext(AppContext);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('performer');

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Created User Data (for display)
  const [createdUser, setCreatedUser] = useState<UserType | null>(null);
  const [createdPassword, setCreatedPassword] = useState(''); // Store strictly for display once

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setDesignation('performer');
    setLoading(false);
    setSuccess(false);
    setError('');
    setCreatedUser(null);
    setCreatedPassword('');
  };

  const handleCreate = async () => {
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newUser = await createTeamMember(name, email, password, designation);
      setCreatedUser(newUser);
      setCreatedPassword(password);
      setSuccess(true);
      triggerCelebration('confetti');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (createdUser?.customId) {
      navigator.clipboard.writeText(createdUser.customId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyCredentials = () => {
    if (createdUser) {
      const text = `TeamHub Access Credentials:\nURL: ${window.location.origin}\nEmail: ${createdUser.email}\nPassword: ${createdPassword}\nAccess ID: ${createdUser.customId}`;
      navigator.clipboard.writeText(text);
      setCopiedCreds(true);
      setTimeout(() => setCopiedCreds(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-200/80 dark:bg-obsidian-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-obsidian-900 border border-black/10 dark:border-white/10 rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neon-cyan/10 border border-neon-cyan/20 rounded flex items-center justify-center">
              <UserPlus size={16} className="text-neon-cyan" />
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {success ? 'Member Added' : 'New Member'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success && createdUser ? (
            <div className="py-4 text-center space-y-6 animate-in zoom-in-95 duration-300">

              <div className="w-16 h-16 bg-neon-green/10 border border-neon-green/30 rounded-full flex items-center justify-center mx-auto text-neon-green mb-2">
                <Check size={32} />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Account Created</div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Share these credentials securely with <span className="text-slate-900 dark:text-white">{createdUser.name}</span>.
                </p>
              </div>

              {/* Credentials Card */}
              <div className="bg-slate-100 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-sm p-4 space-y-4 text-left">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Member ID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-neon-cyan">{createdUser.customId}</code>
                      <button onClick={copyCode} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        {copiedCode ? <Check size={10} className="text-neon-green" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Role</label>
                    <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">{createdUser.role}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                    <div className="text-xs font-mono text-slate-900 dark:text-white select-all">{createdUser.email}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                    <div className="text-xs font-mono text-slate-900 dark:text-white select-all bg-black/5 dark:bg-white/5 p-1 rounded inline-block">
                      {createdPassword}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={copyCredentials}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {copiedCreds ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
                {copiedCreds ? 'Credentials Copied' : 'Copy All Credentials'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
              >
                Close & Continue
              </button>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan transition-all font-medium"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@teamhub.com"
                  className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan transition-all font-mono"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} /> Assign Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon-cyan transition-all font-mono"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDesignation('performer')}
                    className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'performer' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignation('admin')}
                    className={`py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${designation === 'admin' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Manager
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-[9px] text-rose-500 font-black uppercase tracking-widest animate-pulse border border-rose-500/20 bg-rose-500/5 p-2 text-center">
                  Error: {error}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="tactical-button w-full py-4 text-white flex items-center justify-center gap-3 active:scale-95 mt-4"
              >
                <div className="tactical-beam-container"><div className="tactical-beam"></div></div>
                {loading ? <Cpu size={16} className="animate-spin" /> : <UserPlus size={16} className="text-neon-cyan" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
