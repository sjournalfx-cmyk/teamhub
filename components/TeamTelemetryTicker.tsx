
import React, { useContext } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { Activity } from 'lucide-react';

const TeamTelemetryTicker: React.FC = () => {
  const { state } = useContext(AppContext);
  const events = state.activityLog || [];

  if (events.length === 0) return null;

  // Duplicate events to ensure smooth scrolling
  const displayEvents = [...events, ...events, ...events].slice(-20);

  return (
    <div className="fixed bottom-0 left-0 w-full h-8 bg-black/90 backdrop-blur-md border-t border-neon-green/20 z-[100] flex items-center overflow-hidden font-mono text-[9px] uppercase tracking-widest text-neon-green/80">
      <div className="bg-black px-4 h-full flex items-center border-r border-neon-green/20 relative z-10 shadow-[8px_0_12px_rgba(0,0,0,0.5)]">
        <Activity size={12} className="mr-2 animate-pulse" />
        <span>Live.Telemetry</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="marquee-content gap-12 py-2">
          {displayEvents.map((event, i) => (
            <div key={`${event.id}-${i}`} className="flex items-center gap-2">
              <span className="text-white/40">[{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className="text-neon-cyan font-black">{event.userName}</span>
              <span className="text-slate-500">{event.action}</span>
              <span className="text-white">@{event.targetName.replace(/\s+/g, '').toLowerCase()}</span>
              <span className="text-neon-green/20">///</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamTelemetryTicker;
