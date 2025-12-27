
import React from 'react';
import { ShieldCheck, User, Cpu, Activity, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center p-6 transition-colors font-sans relative overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute inset-0 tactical-grid opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px] animate-pulse-glow"></div>
      
      {/* Main Terminal UI */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-obsidian-900/80 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden backdrop-blur-md rounded-lg my-8">
        
        {/* Branding Sector */}
        <div className="w-full md:w-1/2 bg-obsidian-950 p-12 flex flex-col justify-between text-white relative border-b md:border-b-0 md:border-r border-white/10">
            <div className="relative z-10">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded flex items-center justify-center mb-12 group transition-all">
                    <Cpu className="text-neon-green group-hover:scale-110 transition-transform" size={28} />
                </div>
                <h1 className="text-4xl font-black mb-8 uppercase tracking-wider leading-none">
                    Team<span className="text-neon-green">Hub</span>
                </h1>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <Activity size={16} className="text-neon-green mt-1" />
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                            Easily track team tasks and progress. <br/>
                            Stay aligned on company goals.
                        </p>
                    </div>
                    <div className="flex items-start gap-4">
                        <Lock size={16} className="text-neon-green mt-1" />
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                            Safe and secure access. <br/>
                            Please sign in to continue.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 flex items-center gap-2 text-[10px] text-neon-green font-black tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                System Online
            </div>
        </div>

        {/* Access Sector */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-transparent">
            <div className="mb-12">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Choose Your Role</div>
                <div className="h-[2px] w-12 bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>

            <div className="space-y-6">
                <button 
                    onClick={() => onLogin('admin')}
                    className="w-full tactical-button group flex items-center gap-6 p-6 text-left hover:border-neon-green/50"
                >
                    <div className="tactical-beam-container">
                        <div className="tactical-beam"></div>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center text-slate-500 group-hover:text-neon-green transition-all shadow-inner">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Manager</h3>
                        <p className="text-[10px] text-slate-500 font-bold">Manage Team & Goals</p>
                    </div>
                </button>

                <button 
                    onClick={() => onLogin('performer')}
                    className="w-full tactical-button group flex items-center gap-6 p-6 text-left hover:border-neon-cyan/50"
                >
                    <div className="tactical-beam-container">
                        <div className="tactical-beam" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center text-slate-500 group-hover:text-neon-cyan transition-all shadow-inner">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Team Member</h3>
                        <p className="text-[10px] text-slate-500 font-bold">Track My Work</p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
