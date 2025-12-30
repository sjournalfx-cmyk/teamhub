
import React, { useContext } from 'react';
import { AppContext } from '../context';
import { Check, X, Mail, Shield, Clock, AlertCircle } from 'lucide-react';

const JoinRequestsView: React.FC = () => {
    const { state, approveJoinRequest, rejectJoinRequest } = useContext(AppContext);

    const pendingRequests = state.joinRequests.filter(r => r.status === 'pending');

    if (pendingRequests.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/5 rounded-sm opacity-40">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">No pending join authorizations</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Pending Authorizations</h3>
            </div>

            <div className="grid gap-3">
                {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-white/5 border border-white/10 p-4 rounded-sm flex items-center justify-between group hover:border-neon-cyan/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm flex items-center justify-center">
                                <Mail size={18} className="text-neon-cyan" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white uppercase tracking-tight">{request.email}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${request.role === 'admin' ? 'bg-rose-500/20 text-rose-500' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                                        {request.role}
                                    </span>
                                    <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1">
                                        <Clock size={8} /> {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => rejectJoinRequest(request.id)}
                                className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-sm transition-all"
                                title="Reject"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={() => approveJoinRequest(request.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-obsidian-950 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all"
                            >
                                <Check size={14} /> Authorize
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JoinRequestsView;
