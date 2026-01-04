
import React, { useEffect, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ['#22c55e', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

const Celebration: React.FC<{
  type?: 'confetti' | 'pulse' | 'tech';
  onComplete?: () => void;
}> = ({ type = 'confetti', onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(true);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const count = 100;
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: 50, // center
        y: 50, // center
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.7) * 15,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (active) {
      createParticles();
      const timer = setTimeout(() => {
        setActive(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [active, createParticles, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      {type === 'confetti' && (
        <div className="relative w-full h-full">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}44`,
                borderRadius: p.id % 3 === 0 ? '50%' : '2px',
                transform: `rotate(${p.rotation}deg)`,
                animation: `particle-${p.id} 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              }}
            />
          ))}
          <style>{`
            ${particles.map((p) => `
              @keyframes particle-${p.id} {
                0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
                100% { transform: translate(calc(-50% + ${p.speedX * 20}vw), calc(-50% + ${p.speedY * 20}vh)) rotate(${p.rotation + 720}deg); opacity: 0; }
              }
            `).join('')}
          `}</style>
        </div>
      )}

      {type === 'tech' && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-neon-green rounded-full animate-ping scale-[100] opacity-0" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-64 border border-neon-green/30 rounded-full animate-ping scale-[2] opacity-0" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
                 <div className="w-96 h-96 border border-neon-cyan/30 rounded-full animate-ping scale-[2] opacity-0" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />
            </div>
            <div className="glass-terminal p-8 border border-neon-green/50 bg-neon-green/5 animate-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-neon-green/20 border border-neon-green flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-neon-green animate-in slide-in-from-bottom-2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div className="text-neon-green font-black uppercase tracking-[0.4em] text-sm animate-pulse">Operation Success</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Celebration;
