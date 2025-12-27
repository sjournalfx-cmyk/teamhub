
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Zap, Target } from 'lucide-react';

interface TacticalDatePickerProps {
  value?: number;
  onChange: (timestamp: number) => void;
  label?: string;
}

const TacticalDatePicker: React.FC<TacticalDatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (ts?: number) => {
    if (!ts) return "MM / DD / YYYY";
    const d = new Date(ts);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')} / ${d.getDate().toString().padStart(2, '0')} / ${d.getFullYear()}`;
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected.getTime());
    setIsOpen(false);
  };

  const addDays = (days: number) => {
    const d = new Date(value || Date.now());
    d.setDate(d.getDate() + days);
    onChange(d.getTime());
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];
    
    // Fill empty slots
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value && new Date(value).toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
      const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
      
      days.push(
        <button
          key={d}
          onClick={() => selectDate(d)}
          className={`h-8 w-8 text-[10px] font-black font-mono transition-all border ${
            isSelected 
              ? 'bg-neon-green text-obsidian-950 border-neon-green shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
              : isToday 
                ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                : 'border-white/5 text-slate-500 hover:border-white/30 hover:text-white'
          }`}
        >
          {d.toString().padStart(2, '0')}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-950/50 border border-white/10 rounded-sm hover:border-neon-green/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-slate-600 group-hover:text-neon-green" />
          <span className={`text-[11px] font-mono font-black tracking-widest ${value ? 'text-white' : 'text-slate-700'}`}>
            {formatDate(value)}
          </span>
        </div>
        <div className="text-[8px] font-black text-slate-800 uppercase tracking-widest group-hover:text-neon-green/40">Select_Phase</div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 glass-layer-3 border border-white/10 z-[100] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <button onClick={handlePrevMonth} className="p-1 text-slate-500 hover:text-white"><ChevronLeft size={16} /></button>
            <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">
              {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
            </div>
            <button onClick={handleNextMonth} className="p-1 text-slate-500 hover:text-white"><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="h-8 w-8 flex items-center justify-center text-[8px] font-black text-slate-700">{d}</div>
            ))}
            {renderCalendar()}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Zap size={10} /> Fast Offset
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => addDays(days)}
                  className="py-1.5 border border-white/5 bg-white/5 text-[9px] font-black text-slate-400 hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green/30 transition-all uppercase"
                >
                  +{days}D
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalDatePicker;
