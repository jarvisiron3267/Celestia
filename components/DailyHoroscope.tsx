'use client';
import { useMemo } from 'react';
import { horoscopes, signs } from '@/lib/data';
import ParallaxCard from './ParallaxCard';

interface DailyHoroscopeProps {
  signIdx: number;
}

export default function DailyHoroscope({ signIdx }: DailyHoroscopeProps) {
  const horo = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let h = 0;
    for (let i = 0; i < today.length; i++) { h = ((h << 5) - h) + today.charCodeAt(i); h |= 0; }
    const idx = Math.abs(h + signIdx) % horoscopes.length;
    return horoscopes[idx];
  }, [signIdx]);

  const sign = signs[signIdx];

  // Energy values seeded by date
  const energies = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    let s = 0;
    for (let i = 0; i < d.length; i++) { s = ((s << 5) - s) + d.charCodeAt(i); s |= 0; }
    return {
      love: 55 + Math.abs((s * 3) % 45),
      career: 55 + Math.abs((s * 7) % 45),
      energy: 45 + Math.abs((s * 11) % 50),
    };
  }, []);

  const circ = 2 * Math.PI * 20;

  return (
    <div>
      <ParallaxCard>
        <div style={{ borderColor: 'rgba(139,92,246,.12)', background: 'linear-gradient(145deg,rgba(16,16,44,.45),rgba(24,16,52,.35))' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
            Today&apos;s Horoscope — {sign.symbol} {sign.name}
          </div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(17px,4vw,20px)', marginBottom: 8, lineHeight: 1.3 }}>
            {horo.title}
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 13.5, lineHeight: 1.7 }}>
            {horo.text}
          </p>
        </div>
      </ParallaxCard>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, marginBottom: 16 }}>
        {[
          { label: 'Love', value: energies.love, color: 'var(--pink)' },
          { label: 'Career', value: energies.career, color: 'var(--accent)' },
          { label: 'Energy', value: energies.energy, color: 'var(--gold)' },
        ].map(e => (
          <div key={e.label} className="glass-card" style={{ flex: 1, padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, margin: '0 auto 8px', position: 'relative' }}>
              <svg viewBox="0 0 48 48" className="energy-ring" style={{ width: '100%', height: '100%' }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(167,139,250,.06)" strokeWidth="3.5" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none" stroke={e.color} strokeWidth="3.5" strokeLinecap="round"
                  className="fill"
                  style={{
                    strokeDasharray: circ,
                    strokeDashoffset: circ - (circ * e.value / 100),
                  }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: e.color,
              }}>
                {e.value}%
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>
              {e.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
