import React, { useState } from 'react';
import { AlertOctagon, X, Check } from 'lucide-react';

interface BlockerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, suggestion: string) => void;
}

const BlockerModal: React.FC<BlockerModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('Dependency delay...');
    const [suggestion, setSuggestion] = useState('Wait for API docs...');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(reason, suggestion);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-obsidian-950 border border-rose-500/30 rounded-lg shadow-[0_0_50px_rgba(244,63,94,0.2)] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-rose-500/10 bg-rose-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
                            <AlertOctagon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                            Report Blocker
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-2">
                            What is the issue?
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-2">
                            Suggested Solution
                        </label>
                        <input
                            type="text"
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-all"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
                        >
                            <Check size={14} /> Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlockerModal;
