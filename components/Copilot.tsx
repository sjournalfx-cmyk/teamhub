
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
// Corrected import source for AppContext
import { AppContext } from '../context';
import { 
  X, Send, Wand2, Cpu, Terminal, Target, ClipboardList, AlertCircle, Sparkles, Check, User, Flag, Clock, Trash2, HelpCircle, Info, Zap, ChevronRight
} from 'lucide-react';
import { Goal, Task, Priority, DayOfWeek, TaskStatus } from '../types';
import { strategyCopilotResponse } from '../services/geminiService';
import RichText from './RichText';

interface CopilotProps {
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  taskProposal?: Task;
  status?: 'pending' | 'approved' | 'rejected';
}

const Copilot: React.FC<CopilotProps> = ({ onClose }) => {
  const { 
    state, addGoal, addTask, updateTask, deleteTask, deleteGoal, updateGoal, 
    updateTaskStatus, addDraftGoal, promoteDraftGoal, removeDraftGoal 
  } = useContext(AppContext);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "SYSTEM ACTIVE. Proactive monitoring engaged. I've mapped out the tactical grid for you." }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [frictionAlerts, setFrictionAlerts] = useState<any[]>([]);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const suggestions = useMemo(() => {
      if (!showSuggestions) return [];
      const lowerQuery = suggestionQuery.toLowerCase();
      
      const users = state.users.map(u => ({
          id: u.id,
          display: u.name,
          sub: u.role || 'Team Member',
          type: 'user' as const
      }));

      const goals = state.goals.map(g => ({
          id: g.id,
          display: g.title,
          sub: 'Strategic Goal',
          type: 'goal' as const
      }));

      const tasks = state.tasks.map(t => ({
          id: t.id,
          display: t.title,
          sub: 'Tactical Unit',
          type: 'task' as const
      }));

      return [...users, ...goals, ...tasks]
        .filter(item => item.display.toLowerCase().includes(lowerQuery))
        .slice(0, 5);
  }, [showSuggestions, suggestionQuery, state.users, state.goals, state.tasks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    
    const cursor = e.target.selectionStart || 0;
    const textUpToCursor = val.slice(0, cursor);
    const lastAt = textUpToCursor.lastIndexOf('@');

    if (lastAt !== -1) {
        if (lastAt > 0 && textUpToCursor[lastAt - 1] !== ' ' && textUpToCursor[lastAt - 1] !== '\n') {
            setShowSuggestions(false);
            return;
        }

        const query = textUpToCursor.slice(lastAt + 1);
        if (query.length < 20) {
            setSuggestionQuery(query);
            setShowSuggestions(true);
            setActiveIndex(0);
            return;
        }
    }
    
    setShowSuggestions(false);
  };

  const insertMention = (item: { display: string }) => {
      if (!inputRef.current) return;
      
      const cursor = inputRef.current.selectionStart || 0;
      const textUpToCursor = input.slice(0, cursor);
      const lastAt = textUpToCursor.lastIndexOf('@');
      const textAfterCursor = input.slice(cursor);
      
      const newVal = input.slice(0, lastAt) + `@${item.display} ` + textAfterCursor;
      setInput(newVal);
      setShowSuggestions(false);
      
      setTimeout(() => {
          if (inputRef.current) {
              inputRef.current.focus();
              const newCursorPos = lastAt + item.display.length + 2;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
      }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i > 0 ? i - 1 : suggestions.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i < suggestions.length - 1 ? i + 1 : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else {
      if (e.key === 'Enter') {
          handleSend();
      }
    }
  };

  const handleApproveTask = (index: number) => {
    setMessages(prev => prev.map((msg, i) => {
        if (i === index && msg.taskProposal) {
            addTask(msg.taskProposal);
            return { ...msg, status: 'approved' };
        }
        return msg;
    }));
  };

  const handleRejectTask = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, status: 'rejected' } : msg
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    const userText = input;
    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    const result = await strategyCopilotResponse(state, messages, userText);
    setFrictionAlerts(result.frictionAlerts || []);

    const newMessages: ChatMessage[] = [];
    let hasTaskProposal = false;

    if (result.toolCalls && result.toolCalls.length > 0) {
        for (const call of result.toolCalls) {
            const { name, args } = call;
            
            if (name === 'create_directive') {
                const newTask: Task = {
                    id: `t-${Date.now()}`,
                    title: args.title,
                    description: args.description,
                    priority: args.priority as Priority,
                    day: args.day as DayOfWeek,
                    assigneeId: args.assigneeId,
                    goalId: args.goalId,
                    estimateHours: args.estimateHours || 1,
                    status: TaskStatus.NotStarted,
                    tags: ['AI-Assigned']
                };
                
                newMessages.push({
                    role: 'model',
                    text: result.text && result.text !== "Command standby." ? result.text : "Proposed a new tactical directive.",
                    taskProposal: newTask,
                    status: 'pending'
                });
                hasTaskProposal = true;
            } else if (name === 'update_directive') {
                const existingTask = state.tasks.find(t => t.id === args.taskId);
                if (existingTask) {
                    const updatedTask: Task = {
                        ...existingTask,
                        title: args.title || existingTask.title,
                        description: args.description || existingTask.description,
                        priority: (args.priority as Priority) || existingTask.priority,
                        status: (args.status as TaskStatus) || existingTask.status,
                        day: (args.day as DayOfWeek) || existingTask.day,
                        assigneeId: args.assigneeId || existingTask.assigneeId,
                        isBlocked: args.isBlocked !== undefined ? args.isBlocked : existingTask.isBlocked,
                        blockerMessage: args.blockerMessage || existingTask.blockerMessage,
                        estimateHours: args.estimateHours || existingTask.estimateHours
                    };
                    updateTask(updatedTask);
                    newMessages.push({ role: 'model', text: `Directive @${updatedTask.title} updated successfully.` });
                }
            } else if (name === 'delete_directive') {
                const taskToDelete = state.tasks.find(t => t.id === args.taskId);
                deleteTask(args.taskId);
                newMessages.push({ role: 'model', text: `Tactical directive ${taskToDelete ? '@'+taskToDelete.title : args.taskId} has been rescinded.` });
            } else if (name === 'create_strategic_objective') {
                const newDraft: Goal = {
                    id: `draft-${Date.now()}`,
                    title: args.title,
                    description: args.description,
                    progress: 0,
                    milestones: (args.milestones || []).map((m: any) => ({ id: `m-${Math.random()}`, title: m.title, isCompleted: false })),
                    color: 'bg-indigo-100 text-indigo-800'
                };
                addDraftGoal(newDraft);
                newMessages.push({ role: 'model', text: `Strategic objective draft "${args.title}" created in Sandbox.` });
            }
        }
    }
    
    if (!hasTaskProposal && newMessages.length === 0) {
        newMessages.push({ role: 'model', text: result.text });
    } else if (!hasTaskProposal && newMessages.length > 0 && result.text && result.text !== "Command standby.") {
        newMessages.unshift({ role: 'model', text: result.text });
    }

    setMessages(prev => [...prev, ...newMessages]);
    setIsThinking(false);
  };

  const usePromptExample = (text: string) => {
    setInput(text);
    setShowInfo(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:right-6 md:bottom-6 w-full md:max-w-md h-full md:h-[650px] z-[100] animate-in slide-in-from-bottom md:slide-in-from-right-12 fade-in duration-500">
      <div className="glass-layer-3 rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden h-full relative border-0 md:border md:border-white/10">
        
        {/* Header - Improved for Mobile */}
        <div className="bg-slate-950 p-4 md:p-5 border-b border-white/10 z-20 flex-shrink-0">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 glass-layer-2 rounded flex items-center justify-center">
                <Cpu size={16} className="text-neon-green md:size-20" />
              </div>
              <div>
                <h3 className="text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] font-mono">Sync.Copilot_v5</h3>
                <p className="text-neon-green/60 text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <span className="w-1 h-1 bg-neon-green rounded-full animate-pulse"></span>
                   Power Layer Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2 transition-all rounded-sm ${showInfo ? 'text-neon-cyan bg-neon-cyan/10' : 'text-white/30 hover:text-neon-cyan'}`}
                title="Tactical Briefing"
              >
                <HelpCircle size={20} />
              </button>
              <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Info Overlay */}
        {showInfo && (
          <div className="absolute inset-x-0 bottom-0 top-[73px] md:top-[85px] bg-obsidian-950 z-30 animate-in slide-in-from-bottom-4 flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-cyan/40 animate-scan"></div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 pb-20">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.3em] flex items-center gap-2">
                  <Zap size={14} /> Intelligence_Capabilities
                </div>
                <ul className="space-y-3">
                  {[
                    { label: 'Issue Directives', desc: 'Create tasks and assign them to specific personnel nodes.' },
                    { label: 'Update Chronology', desc: 'Shift task dates, priorities, or statuses via command.' },
                    { label: 'Strategic Drafting', desc: 'Propose and refine high-level objectives in the Sandbox.' },
                    { label: 'Friction Analysis', desc: 'Auto-detect dependency chain conflicts and scheduling overlaps.' },
                    { label: 'Entity Mentions', desc: 'Mention @personnel or @directives to focus my analysis.' }
                  ].map((cap, i) => (
                    <li key={i} className="flex gap-4 p-3 bg-white/5 border border-white/5 rounded-sm">
                      <ChevronRight size={12} className="text-neon-cyan mt-1 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-white uppercase tracking-tight">{cap.label}</div>
                        <div className="text-[9px] text-slate-500 font-medium leading-relaxed">{cap.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] flex items-center gap-2">
                  <Terminal size={14} /> Operational_Prompt_Library
                </div>
                <div className="space-y-3">
                  {[
                    "Assign a high priority task to @Mike for system audit on Wednesday",
                    "Reschedule @TechnicalMandate to Thursday and set to High priority",
                    "Create a new strategic goal for Q4 Expansion with 4 milestones",
                    "Abort @CommandCouncilDebrief directive",
                    "Who is currently working on the @MarketDominance objective?"
                  ].map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => usePromptExample(p)}
                      className="w-full text-left p-4 bg-black/40 border border-white/5 hover:border-neon-green/30 transition-all group"
                    >
                      <code className="text-[10px] text-slate-400 font-mono group-hover:text-neon-green break-words">
                        {p}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5 sticky bottom-0">
              <button 
                onClick={() => setShowInfo(false)}
                className="w-full py-4 bg-neon-cyan text-obsidian-950 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg"
              >
                Close Briefing
              </button>
            </div>
          </div>
        )}

        {frictionAlerts.length > 0 && (
          <div className="bg-rose-500/10 p-3 border-b border-rose-500/20 animate-pulse flex-shrink-0">
            <div className="flex items-center gap-2 text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">
               <AlertCircle size={10} /> Sector Friction Detected
            </div>
            {frictionAlerts.map((f, i) => (
                <div key={i} className="text-[10px] text-rose-300/80 font-mono pl-4 border-l border-rose-500/30">
                   <RichText text={f.message} />
                </div>
            ))}
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-obsidian-950/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`
                max-w-[92%] md:max-w-[85%] px-4 py-3 rounded-lg text-[13px] leading-relaxed
                ${m.role === 'user' 
                  ? 'bg-neon-green/10 text-white border border-neon-green/20 rounded-tr-none shadow-[0_4px_20px_rgba(34,197,94,0.05)]' 
                  : 'bg-obsidian-900 text-slate-300 border border-white/5 rounded-tl-none font-mono shadow-xl'}
              `}>
                <RichText text={m.text} />
              </div>

              {m.taskProposal && (
                <div className="mt-3 w-full max-w-[92%] md:max-w-[85%] bg-obsidian-950 border border-white/10 rounded-sm overflow-hidden font-mono shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-start">
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Terminal size={10}/> Proposed Unit</div>
                            <div className="text-sm font-bold text-white leading-tight">{m.taskProposal.title}</div>
                        </div>
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${m.taskProposal.priority === Priority.High ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'}`}>
                            {m.taskProposal.priority}
                        </div>
                    </div>
                    <div className="p-3 space-y-3">
                        <div className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                            {m.taskProposal.description || 'No detailed specifications provided.'}
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-2">
                            <div className="flex items-center gap-3 text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                                <div className="flex items-center gap-1">
                                   <Clock size={10} className="text-neon-green" /> {m.taskProposal.estimateHours}H
                                </div>
                                <div className="flex items-center gap-1">
                                   <User size={10} className="text-neon-cyan" /> {state.users.find(u => u.id === m.taskProposal?.assigneeId)?.name.split(' ')[0] || 'Unassigned'}
                                </div>
                            </div>
                            <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
                                {m.taskProposal.day}
                            </div>
                        </div>
                    </div>
                    
                    {m.status === 'pending' && (
                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                            <button onClick={() => handleRejectTask(i)} className="p-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2 group active:bg-rose-500/20">
                                <X size={14} /> Reject
                            </button>
                            <button onClick={() => handleApproveTask(i)} className="p-4 text-[10px] font-black uppercase tracking-widest text-neon-green hover:bg-neon-green/10 transition-colors flex items-center justify-center gap-2 group active:bg-neon-green/20">
                                <Check size={14} /> Approve
                            </button>
                        </div>
                    )}
                    {m.status === 'approved' && (
                         <div className="p-3 bg-neon-green/10 border-t border-neon-green/20 text-center text-[10px] font-black text-neon-green uppercase tracking-widest flex items-center justify-center gap-2">
                             <Check size={14} /> Unit Deployed
                         </div>
                    )}
                    {m.status === 'rejected' && (
                         <div className="p-3 bg-white/5 border-t border-white/10 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                             <X size={14} /> Action Discarded
                         </div>
                    )}
                </div>
              )}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
               <div className="bg-obsidian-900 px-4 py-3 rounded-lg border border-white/5 flex items-center gap-2">
                 <Terminal size={12} className="text-neon-green animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Syncing Workspace...</span>
               </div>
            </div>
          )}

          {state.draftGoals.length > 0 && (
             <div className="space-y-3">
               <div className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles size={12} /> Sandbox: Draft Objectives
               </div>
               {state.draftGoals.map(g => (
                 <div key={g.id} className="draft-overlay p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-sm">
                    <h4 className="text-white font-bold text-xs uppercase mb-1">{g.title}</h4>
                    <p className="text-[10px] text-slate-400 mb-3">{g.description}</p>
                    <div className="flex gap-2">
                       <button onClick={() => promoteDraftGoal(g.id)} className="flex-1 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-sm text-[9px] font-bold uppercase hover:bg-neon-cyan hover:text-obsidian-950 transition-all active:scale-95">Promote</button>
                       <button onClick={() => removeDraftGoal(g.id)} className="px-4 py-2 bg-white/5 text-slate-500 border border-white/5 rounded-sm text-[9px] font-bold uppercase hover:text-white transition-all active:scale-95">Discard</button>
                    </div>
                 </div>
               ))}
             </div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input Area - Improved for Mobile */}
        <div className="p-4 md:p-5 bg-slate-950 border-t border-white/5 relative flex-shrink-0 pb-safe md:pb-5">
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 md:left-4 md:right-auto md:w-64 bg-obsidian-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden z-20 mb-3 animate-in slide-in-from-bottom-2">
              <div className="p-2 border-b border-white/10 text-[9px] font-black uppercase text-slate-500 tracking-widest bg-black/40">Suggestions</div>
              {suggestions.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => insertMention(item)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${idx === activeIndex ? 'bg-white/10' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center border ${item.type === 'user' ? 'border-neon-green/30 text-neon-green' : item.type === 'goal' ? 'border-neon-cyan/30 text-neon-cyan' : 'border-rose-500/30 text-rose-500'}`}>
                    {item.type === 'user' ? <User size={14} /> : item.type === 'goal' ? <Flag size={14} /> : <Terminal size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{item.display}</div>
                    <div className="text-[9px] text-slate-500 truncate uppercase tracking-tighter">{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 focus-within:border-neon-green/50 transition-all shadow-inner">
            <input 
              ref={inputRef} 
              type="text" 
              value={input} 
              onChange={handleInputChange} 
              onKeyDown={handleKeyDown} 
              placeholder="Deploy commands..." 
              className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-3 text-white font-mono placeholder:text-slate-600" 
              autoComplete="off" 
            />
            <button 
              onClick={handleSend} 
              disabled={isThinking || !input.trim()} 
              className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 rounded-md hover:bg-neon-green hover:text-slate-950 disabled:opacity-20 transition-all active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
