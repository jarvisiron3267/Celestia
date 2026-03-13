'use client';
import { useState, useEffect } from 'react';
import { getMoonPhase, isMercuryRetrograde, type MoonPhaseInfo } from '@/lib/astro';

export default function MoonPhase() {
  const [moon, setMoon] = useState<MoonPhaseInfo | null>(null);
  const [retrograde, setRetrograde] = useState(false);

  useEffect(() => {
    try {
      setMoon(getMoonPhase());
      setRetrograde(isMercuryRetrograde());
    } catch {
      setMoon({ phase: 0, name: 'Full Moon', emoji: '🌕', tip: 'Celebrate achievements.', nextFullMoon: new Date() });
    }
  }, []);

  if (!moon) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 18px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle,rgba(251,191,36,.06),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 38, filter: 'drop-shadow(0 2px 8px rgba(251,191,36,.15))' }}>{moon.emoji}</div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{moon.name}</h4>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{moon.tip}</p>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Next full moon: {moon.nextFullMoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      {retrograde && (
        <div style={{
          background: 'rgba(239,68,68,.08)',
          border: '1px solid rgba(239,68,68,.15)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          fontSize: 12,
          color: '#f87171',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          ⚠️ Mercury is retrograde — double-check communications!
        </div>
      )}
    </div>
  );
}
