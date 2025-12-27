
import React, { useContext, useEffect, useState } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Square } from 'lucide-react';

const FocusMode: React.FC = () => {
  const { state, toggleFocus } = useContext(AppContext);
  const [elapsed, setElapsed] = useState(0);

  const activeTask = state.tasks.find(t => t.id === state.activeFocusTaskId);

  useEffect(() => {
    let interval: any;
    if (activeTask && state.focusStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        setElapsed(Math.floor((now - state.focusStartTime!) / 1000));
      }, 1000);
    } else {
        setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTask, state.focusStartTime]);

  if (!activeTask) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
        <div className="bg-white text-gray-800 p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center pl-6 pr-2 gap-6 border border-indigo-50 ring-1 ring-gray-100">
            <div className="flex flex-col">
                <span className="text-[10px] text-indigo-500 font-bold tracking-wider uppercase flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Focusing
                </span>
                <span className="text-sm font-bold text-gray-900 max-w-[200px] truncate mt-0.5">{activeTask.title}</span>
            </div>
            
            <div className="text-2xl font-mono font-medium text-gray-700 tabular-nums tracking-tight">
                {formatTime(elapsed)}
            </div>

            <button 
                onClick={() => toggleFocus(activeTask.id)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 p-3 rounded-full transition-all group"
                title="Stop Focus"
            >
                <Square size={18} fill="currentColor" className="group-hover:scale-105 transition-transform"/>
            </button>
        </div>
    </div>
  );
};

export default FocusMode;
