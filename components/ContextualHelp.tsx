
import React from 'react';
import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

interface ContextualHelpProps {
  content: string;
  title?: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ content, title }) => {
  return (
    <Tooltip content={
      <div className="max-w-xs space-y-1">
        {title && <div className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">{title}</div>}
        <div className="text-[10px] leading-relaxed opacity-90">{content}</div>
      </div>
    }>
      <button className="text-slate-400 hover:text-neon-cyan transition-colors p-1">
        <Info size={14} />
      </button>
    </Tooltip>
  );
};

export default ContextualHelp;
