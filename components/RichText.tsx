
import React from 'react';

interface RichTextProps {
  text: string;
  className?: string;
}

const RichText: React.FC<RichTextProps> = ({ text, className }) => {
  if (!text) return null;

  const parts = text.split(/(@\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="mention-highlight">
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default RichText;
