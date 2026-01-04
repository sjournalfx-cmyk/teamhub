import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
    avatar?: string;
    color?: string;
}

interface TacticalSelectProps {
    options: Option[];
    value?: string | string[];
    onChange: (value: any) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    accentColor?: 'cyan' | 'green' | 'amber' | 'rose';
    showSearch?: boolean;
    isMulti?: boolean;
}

const TacticalSelect: React.FC<TacticalSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select Option",
    label,
    className = "",
    accentColor = 'cyan',
    showSearch = false,
    isMulti = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const isSelected = (id: string) => {
        if (isMulti && Array.isArray(value)) {
            return value.includes(id);
        }
        return value === id;
    };

    const selectedOptions = isMulti && Array.isArray(value)
        ? options.filter(o => value.includes(o.id))
        : options.find(o => o.id === value) ? [options.find(o => o.id === value)!] : [];

    const handleSelect = (id: string) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? [...value] : [];
            const newValue = currentValues.includes(id)
                ? currentValues.filter(v => v !== id)
                : [...currentValues, id];
            onChange(newValue);
        } else {
            onChange(id);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const filteredOptions = options.filter(o =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const colorClasses = {
        cyan: 'text-neon-cyan border-neon-cyan/30 focus:border-neon-cyan',
        green: 'text-neon-green border-neon-green/30 focus:border-neon-green',
        amber: 'text-amber-500 border-amber-500/30 focus:border-amber-500',
        rose: 'text-rose-500 border-rose-500/30 focus:border-rose-500',
    };

    const bgClasses = {
        cyan: 'bg-neon-cyan/10',
        green: 'bg-neon-green/10',
        amber: 'bg-amber-500/10',
        rose: 'bg-rose-500/10',
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full flex items-center justify-between p-4 bg-white dark:bg-slate-950/50 
          border border-black/10 dark:border-white/10 rounded-sm font-mono text-sm
          transition-all hover:border-white/20 text-left
          ${isOpen ? `ring-1 ring-neon-${accentColor}/30 border-neon-${accentColor}/50` : ''}
        `}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-wrap">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <div key={opt.id} className={`flex items-center gap-2 ${isMulti ? `bg-neon-${accentColor}/10 border border-neon-${accentColor}/20 px-2 py-1 rounded-sm` : ''}`}>
                                {opt.avatar ? (
                                    <img src={opt.avatar} className="w-4 h-4 rounded-sm border border-white/10" alt="" />
                                ) : opt.icon ? (
                                    <div className={`text-neon-${accentColor}`}>{opt.icon}</div>
                                ) : null}
                                <span className="text-slate-900 dark:text-white truncate max-w-[120px]">
                                    {opt.label}
                                </span>
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-500">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-scan"></div>

                    {showSearch && (
                        <div className="p-2 border-b border-white/5">
                            <div className="relative">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter nodes..."
                                    className="w-full bg-black/40 border border-white/5 p-2 pl-8 text-[10px] text-white outline-none focus:border-neon-cyan/50 font-mono uppercase tracking-widest"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                                No matches found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option.id)}
                                    className={`
                    w-full flex items-center justify-between p-3 hover:bg-white/5 transition-all text-left group
                    ${isSelected(option.id) ? 'bg-white/10' : ''}
                  `}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {option.avatar ? (
                                            <img src={option.avatar} className="w-6 h-6 rounded-sm border border-white/10 group-hover:border-neon-cyan/50 transition-all" alt="" />
                                        ) : option.icon ? (
                                            <div className={`text-neon-${accentColor} opacity-50 group-hover:opacity-100 transition-all`}>{option.icon}</div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-sm bg-white/5 border border-white/5" />
                                        )}

                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold uppercase tracking-tight ${isSelected(option.id) ? `text-neon-${accentColor}` : 'text-slate-300 group-hover:text-white'}`}>
                                                {option.label}
                                            </span>
                                            {option.subLabel && (
                                                <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em]">
                                                    {option.subLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected(option.id) && <Check size={14} className={`text-neon-${accentColor}`} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TacticalSelect;
