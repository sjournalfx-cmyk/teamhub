import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Zap, Target, X, Clock, ChevronDown, CalendarDays, ArrowRight } from 'lucide-react';

interface TacticalDatePickerProps {
  value?: number;
  onChange: (timestamp: number) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}

const TacticalDatePicker: React.FC<TacticalDatePickerProps> = ({ value, onChange, label, placeholder = "SELECT_DATE", className = "", align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (ts?: number) => {
    if (!ts) return placeholder;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).toUpperCase().replace(',', ' /');
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    selected.setHours(0, 0, 0, 0);
    onChange(selected.getTime());
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(today.getTime());
    setViewDate(today);
    setIsOpen(false);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    onChange(tomorrow.getTime());
    setViewDate(tomorrow);
    setIsOpen(false);
  };

  const setNextMonday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay() + 1) % 7 || 7));
    d.setHours(0, 0, 0, 0);
    onChange(d.getTime());
    setViewDate(d);
    setIsOpen(false);
  };

  const addDays = (days: number) => {
    const d = new Date(value || Date.now());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + days);
    onChange(d.getTime());
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Prev month days
    const prevMonthDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth() - 1);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-[9px] font-black text-slate-300 dark:text-slate-800 opacity-20 font-mono">
          {(prevMonthDays - i).toString().padStart(2, '0')}
        </div>
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const isSelected = value && new Date(value).toDateString() === current.toDateString();
      const isToday = new Date().toDateString() === current.toDateString();

      days.push(
        <button
          key={d}
          onClick={() => selectDate(d)}
          className={`h-9 text-[10px] font-black font-mono transition-all border relative group/day ${isSelected
            ? 'bg-neon-green text-obsidian-950 border-neon-green shadow-[0_0_15px_rgba(34,197,94,0.4)] z-10'
            : isToday
              ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:border-white/10 hover:bg-white/5'
            }`}
        >
          {d.toString().padStart(2, '0')}
          {isToday && !isSelected && (
            <div className="absolute top-1 right-1 w-1 h-1 bg-neon-cyan rounded-full"></div>
          )}
        </button>
      );
    }

    // Next month days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(
        <div key={`next-${i}`} className="h-9 flex items-center justify-center text-[9px] font-black text-slate-300 dark:text-slate-800 opacity-20 font-mono">
          {i.toString().padStart(2, '0')}
        </div>
      );
    }

    return days;
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 5; y++) {
    years.push(y);
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0a0e17] border border-black/10 dark:border-white/5 rounded-sm hover:border-neon-cyan/50 transition-all group relative overflow-hidden ${isOpen ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20' : ''}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          <CalendarDays size={14} className={`transition-colors ${value ? 'text-neon-cyan' : 'text-slate-400'}`} />
          <span className={`text-[11px] font-mono font-black tracking-widest ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-700'}`}>
            {formatDate(value)}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-neon-cyan' : ''}`} />

        {/* Tactical background detail */}
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {isOpen && (
        <div className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-80 bg-white dark:bg-[#0d111a] border border-black/10 dark:border-white/10 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-sm`}>
          {/* Header */}
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowYearSelector(!showYearSelector)}
                className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest hover:text-neon-cyan transition-colors flex items-center gap-2 font-mono"
              >
                {viewDate.toLocaleString('default', { month: 'long' }).toUpperCase()} {viewDate.getFullYear()}
                <ChevronDown size={12} className={showYearSelector ? 'rotate-180' : ''} />
              </button>
            </div>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"><ChevronLeft size={16} /></button>
              <button onClick={handleNextMonth} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>

          {showYearSelector ? (
            <div className="h-[280px] overflow-y-auto p-4 grid grid-cols-3 gap-2 custom-scrollbar bg-white dark:bg-[#0d111a]">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => {
                    setViewDate(new Date(y, viewDate.getMonth(), 1));
                    setShowYearSelector(false);
                  }}
                  className={`py-3 text-[11px] font-black font-mono border transition-all ${y === viewDate.getFullYear() ? 'bg-neon-cyan text-obsidian-950 border-neon-cyan' : 'border-black/5 dark:border-white/5 text-slate-500 hover:border-black/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="p-4 bg-white dark:bg-[#0d111a]">
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d, i) => (
                    <div key={i} className="h-8 flex items-center justify-center text-[8px] font-black text-slate-400 dark:text-slate-600 tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0 border-t border-l border-black/5 dark:border-white/5">
                  {renderCalendar()}
                </div>
              </div>

              {/* Footer / Quick Actions */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <Zap size={12} className="text-amber-500" /> Temporal_Shortcuts
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={setToday}
                    className="py-2 border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 text-[9px] font-black text-slate-500 dark:text-slate-400 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all uppercase tracking-tighter"
                  >
                    Today
                  </button>
                  <button
                    onClick={setTomorrow}
                    className="py-2 border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 text-[9px] font-black text-slate-500 dark:text-slate-400 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all uppercase tracking-tighter"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={setNextMonday}
                    className="py-2 border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 text-[9px] font-black text-slate-500 dark:text-slate-400 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all uppercase tracking-tighter"
                  >
                    Next_Mon
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => { onChange(0); setIsOpen(false); }}
                    className="text-[9px] font-black text-rose-500/60 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    <X size={12} /> Clear_Date
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TacticalDatePicker;

