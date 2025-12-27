
import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-col-resize select-none overflow-hidden"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Full width) */}
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-[10px_0_15px_rgba(0,0,0,0.5)]" 
        style={{ width: `${sliderPos}%` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / sliderPos}%` }} alt="Before" />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest">Before</div>
      </div>
      
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-neon-green/50 backdrop-blur-md text-[8px] font-black text-obsidian-950 uppercase tracking-widest">After</div>

      {/* Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white flex items-center justify-center"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-xl">
           <div className="flex gap-0.5">
             <div className="w-0.5 h-3 bg-slate-900"></div>
             <div className="w-0.5 h-3 bg-slate-900"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
