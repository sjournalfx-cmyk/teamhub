
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 200 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  const showTooltip = () => {
    updateCoords();
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [isVisible, updateCoords]);

  const getPositionStyles = () => {
    if (!coords) return {};
    
    // Using fixed positioning for the portal content
    // We adjust based on viewport since it's a Portal at body level
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return {};

    const space = 8;
    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top':
        styles.bottom = window.innerHeight - rect.top + space;
        styles.left = rect.left + rect.width / 2;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.top = rect.bottom + space;
        styles.left = rect.left + rect.width / 2;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.top = rect.top + rect.height / 2;
        styles.right = window.innerWidth - rect.left + space;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.top = rect.top + rect.height / 2;
        styles.left = rect.right + space;
        styles.transform = 'translateY(-50%)';
        break;
    }

    return styles;
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top': return 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 dark:border-t-slate-700';
      case 'bottom': return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 dark:border-b-slate-700';
      case 'left': return 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 dark:border-l-slate-700';
      case 'right': return 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 dark:border-r-slate-700';
      default: return '';
    }
  };

  return (
    <div 
      ref={triggerRef}
      className="inline-flex" 
      onMouseEnter={showTooltip} 
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && createPortal(
        <div 
          style={getPositionStyles()}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium text-white
            bg-slate-800/95 dark:bg-slate-700/95 backdrop-blur-md shadow-2xl
            border border-white/10 whitespace-nowrap
            animate-in fade-in zoom-in-95 duration-150
          `}
        >
          {content}
          <div className={`absolute border-4 border-transparent ${getArrowClasses()}`} />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
