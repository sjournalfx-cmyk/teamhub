import React, { useState } from 'react';
import { ShieldCheck, User, Cpu, Activity, Lock, Mail, Key, Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
    onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Check for approved join request
                const { data: joinRequest, error: jrError } = await supabase
                    .from('join_requests')
                    .select('*')
                    .eq('email', email)
                    .eq('status', 'approved')
                    .single();

                if (jrError || !joinRequest) {
                    throw new Error('No approved join authorization found for this email. Please contact your administrator.');
                }

                const customId = `KNT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split('@')[0],
                            role: joinRequest.role,
                            custom_id: customId
                        }
                    }
                });
                if (signUpError) throw signUpError;

                // Create profile manually to ensure role and custom_id are saved
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            email: email,
                            name: email.split('@')[0],
                            role: joinRequest.role,
                            custom_id: customId
                        });
                    if (profileError) console.error('Error creating profile:', profileError);

                    // Delete the join request after successful signup
                    await supabase.from('join_requests').delete().eq('id', joinRequest.id);
                }

                alert('Check your email for the confirmation link!');
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                            Kine<span className="text-neon-green">tic</span>
                        </h1>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Activity size={16} className="text-neon-green mt-1" />
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    Easily track team tasks and progress. <br />
                                    Stay aligned on company goals.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <Lock size={16} className="text-neon-green mt-1" />
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    Safe and secure access. <br />
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
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                                {isSignUp ? 'Initialize Node' : 'System Access'}
                            </div>
                            <div className="h-[2px] w-12 bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="flex gap-2 mb-8 p-1 bg-obsidian-950 border border-white/5 rounded">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('admin')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 ${selectedRole === 'admin' ? 'bg-neon-green text-obsidian-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'text-slate-500 hover:text-white'}`}
                        >
                            <ShieldCheck size={14} />
                            Manager
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('performer')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 ${selectedRole === 'performer' ? 'bg-neon-cyan text-obsidian-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-500 hover:text-white'}`}
                        >
                            <User size={14} />
                            Team Member
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    placeholder="EMAIL ADDRESS"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-obsidian-950 border border-white/10 rounded p-4 pl-12 text-xs font-bold text-white placeholder:text-slate-600 focus:border-neon-green/50 outline-none transition-all uppercase tracking-widest"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    placeholder="ACCESS KEY"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-obsidian-950 border border-white/10 rounded p-4 pl-12 text-xs font-bold text-white placeholder:text-slate-600 focus:border-neon-green/50 outline-none transition-all uppercase tracking-widest"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse">
                                Error: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !selectedRole}
                            className={`w-full tactical-button group flex items-center justify-center gap-4 p-4 text-left hover:border-neon-green/50 disabled:opacity-50 ${!selectedRole ? 'cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin text-neon-green" size={20} />
                            ) : (
                                <>
                                    <div className="text-xs font-black text-white uppercase tracking-widest">
                                        {isSignUp ? 'Create Account' : 'Authenticate'}
                                    </div>
                                    <ShieldCheck className="text-neon-green" size={20} />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign In' : 'Need access? Create an account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
