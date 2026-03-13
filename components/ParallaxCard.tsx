'use client';
import { useRef, useCallback } from 'react';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function ParallaxCard({ children, className = '', intensity = 10 }: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current || !innerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * intensity;
    const ry = (x - 0.5) * -intensity;

    innerRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    innerRef.current.style.setProperty('--shimmer-x', `${x * 100}%`);
    innerRef.current.style.setProperty('--shimmer-y', `${y * 100}%`);
    innerRef.current.style.setProperty('--shimmer-angle', `${(x + y) * 180}deg`);
  }, [intensity]);

  const handleLeave = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`parallax-card ${className}`}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }}
      onMouseLeave={handleLeave}
      onTouchEnd={handleLeave}
    >
      <div ref={innerRef} className="parallax-card-inner glass-card">
        {children}
      </div>
    </div>
  );
}
