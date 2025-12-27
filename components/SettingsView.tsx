
import React, { useState, useContext, useEffect } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { 
  User, 
  Settings, 
  Shield, 
  Terminal, 
  Save, 
  Cpu, 
  Sun, 
  Moon, 
  LogOut, 
  Fingerprint, 
  Bell, 
  Monitor, 
  Lock,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { state, updateUser, theme, toggleTheme, logout } = useContext(AppContext);
  const [name, setName] = useState(state.currentUser.name);
  const [role, setRole] = useState(state.currentUser.role || '');
  const [bio, setBio] = useState(state.currentUser.bio || '');
  const [avatar, setAvatar] = useState(state.currentUser.avatar || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateUser({
      ...state.currentUser,
      name,
      role,
      bio,
      avatar
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-20"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-layer-2 rounded border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Settings size={24} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-[0.1em] font-mono uppercase leading-none">Node.Settings</h1>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neon-cyan animate-pulse rounded-full"></span>
              Configuration Interface <span className="text-white/20">|</span> ID: {state.currentUser.id.toUpperCase()}
            </p>
          </div>
        </div>
        
        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={14} /> Identity Synchronized
          </div>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Identity Management */}
        <div className="xl:col-span-8 space-y-8">
          <div className="glass-layer-2 p-8 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-cyan/20 animate-scan"></div>
             
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Fingerprint size={18} className="text-neon-cyan" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">Profile.Registry</h3>
             </div>

             <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-sm border-2 border-white/10 overflow-hidden relative group">
                    <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <RefreshCcw size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-neon-green flex items-center justify-center text-obsidian-950 font-black text-[10px] shadow-lg">
                    ACT
                  </div>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={10} /> Callsign
                      </label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={10} /> Designation
                      </label>
                      <input 
                        type="text" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-neon-cyan transition-all font-mono" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avatar Source URL</label>
                    <input 
                      type="text" 
                      value={avatar} 
                      onChange={(e) => setAvatar(e.target.value)} 
                      className="w-full bg-slate-950/50 border border-white/10 p-4 text-[10px] text-slate-500 outline-none focus:border-neon-cyan transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Node Bio</label>
                    <textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      rows={4} 
                      className="w-full bg-slate-950/50 border border-white/10 p-4 text-xs text-slate-400 outline-none focus:border-neon-cyan transition-all font-mono resize-none" 
                      placeholder="Input operational manifesto..."
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleSave}
                      className="px-10 py-3 bg-neon-cyan text-obsidian-950 font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
                    >
                      <Save size={16} /> Sync.Identity
                    </button>
                  </div>
                </div>
             </div>
          </div>

          <div className="glass-layer-2 p-8 space-y-8">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Bell size={18} className="text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">Notification.Protocol</h3>
             </div>
             <div className="space-y-4">
                {[
                  { label: 'Strategic Alerts', desc: 'Notify on goal priority shifts', active: true },
                  { label: 'Tactical Mentions', desc: 'Direct calls in the workspace', active: true },
                  { label: 'Capacity Warnings', desc: 'Alert when daily workload exceeds 100%', active: false }
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm">
                    <div>
                      <div className="text-[10px] font-black text-white uppercase tracking-widest">{pref.label}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{pref.desc}</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pref.active ? 'bg-neon-green' : 'bg-slate-800'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pref.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: System & Environment */}
        <div className="xl:col-span-4 space-y-8">
          <div className="glass-layer-2 p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Monitor size={18} className="text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">Interface.Env</h3>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-sm hover:border-neon-cyan/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-obsidian-950 rounded text-neon-cyan">
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Theme.Mode</div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest">{theme} mode active</div>
                  </div>
                </div>
                <div className="text-[8px] font-black text-neon-cyan uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Switch</div>
              </button>

              <div className="p-5 bg-white/5 border border-white/10 rounded-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-obsidian-950 rounded text-white">
                    <Cpu size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">System.Status</div>
                    <div className="text-[8px] text-neon-green uppercase tracking-widest">Operational.Stable</div>
                  </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Mem_Load</span>
                      <span>24%</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-[24%] h-full bg-neon-green"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-layer-2 p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Lock size={18} className="text-rose-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">Session.Security</h3>
            </div>
            <div className="space-y-4">
               <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-5 bg-rose-500/5 border border-rose-500/20 rounded-sm hover:bg-rose-500/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-obsidian-950 rounded text-rose-500">
                    <LogOut size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Terminate.Session</div>
                    <div className="text-[8px] text-rose-500/60 uppercase tracking-widest">Logout from core</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-8 border border-dashed border-white/5 opacity-40 text-center">
             <div className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-slate-500">SYNC_CORE_V.7.2.1</div>
             <div className="text-[7px] font-mono text-slate-700 uppercase tracking-widest mt-2">Built for high-velocity teams</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
