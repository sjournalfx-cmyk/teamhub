import React from 'react';
import { ActivityEvent, TaskStatus } from '../types';
import { Clock, Coffee, Zap, CheckCircle2, Play, AlertCircle, Target } from 'lucide-react';

interface TaskTimelineProps {
    taskId: string;
    activityLog: ActivityEvent[];
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ taskId, activityLog }) => {
    // Filter logs for this specific task
    const taskLogs = activityLog
        .filter(log => log.targetId === taskId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (taskLogs.length === 0) return null;

    const getIcon = (action: string) => {
        if (action.includes('accepted')) return <Play size={10} className="text-amber-500" />;
        if (action.includes('submitted')) return <CheckCircle2 size={10} className="text-neon-cyan" />;
        if (action.includes('verified')) return <CheckCircle2 size={10} className="text-neon-green" />;
        if (action.includes('status to Working on it')) return <Zap size={10} className="text-amber-500" />;
        if (action.includes('Coffee Break')) return <Coffee size={10} className="text-slate-400" />;
        if (action.includes('Focus Mode')) return <Target size={10} className="text-neon-cyan" />;
        if (action.includes('friction')) return <AlertCircle size={10} className="text-rose-500" />;
        return <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />;
    };

    const getLabel = (action: string) => {
        if (action.includes('accepted')) return 'Accepted';
        if (action.includes('submitted')) return 'Submitted';
        if (action.includes('verified')) return 'Approved';
        if (action.includes('status to Working on it')) return 'Working';
        if (action.includes('Coffee Break')) return 'Break';
        if (action.includes('Focus Mode')) return 'Focus';
        if (action.includes('reported friction')) return 'Blocked';
        if (action.includes('resolved friction')) return 'Unblocked';
        return action.split(' ')[0];
    };

    return (
        <div className="py-8 px-4">
            <div className="relative">
                {/* Horizontal Line with Gradient */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent -translate-y-1/2" />

                {/* Dots/Events */}
                <div className="relative flex justify-between items-center min-h-[60px]">
                    {taskLogs.map((log, index) => {
                        const isStart = index === 0;
                        const isEnd = index === taskLogs.length - 1;

                        return (
                            <div key={log.id} className="flex flex-col items-center group relative">
                                {/* Vertical Connector for Label */}
                                <div className={`absolute w-px h-3 bg-black/5 dark:bg-white/5 ${index % 2 === 0 ? 'top-full' : 'bottom-full'}`} />

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 translate-y-2 group-hover:translate-y-0">
                                    <div className="bg-slate-900/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-sm shadow-2xl border border-white/10 whitespace-nowrap">
                                        <div className="text-neon-cyan mb-1">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                        <div className="text-[10px]">{log.action}</div>
                                    </div>
                                </div>

                                {/* Dot Container */}
                                <div className={`
                                    relative w-8 h-8 rounded-full border bg-white dark:bg-slate-900 flex items-center justify-center z-[1] transition-all duration-500 group-hover:scale-125 group-hover:z-10
                                    ${isStart || isEnd ? 'border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-black/10 dark:border-white/10'}
                                    ${log.action.includes('friction') ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : ''}
                                `}>
                                    {/* Pulse effect for active/end dot */}
                                    {isEnd && (
                                        <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-ping" />
                                    )}
                                    <div className="relative z-10">
                                        {getIcon(log.action)}
                                    </div>
                                </div>

                                {/* Label - Alternating Top/Bottom */}
                                <div className={`absolute ${index % 2 === 0 ? 'top-full mt-4' : 'bottom-full mb-4'} flex flex-col items-center transition-all duration-300 group-hover:scale-110`}>
                                    <span className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${isStart || isEnd ? 'text-neon-cyan' : 'text-slate-500'}`}>
                                        {getLabel(log.action)}
                                    </span>
                                    <span className="text-[7px] font-bold text-slate-400 mt-0.5 opacity-60">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TaskTimeline;
