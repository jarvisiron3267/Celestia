'use client';
import { useState } from 'react';
import { signs, getCompatibilityScore } from '@/lib/data';
import ParallaxCard from './ParallaxCard';

interface CompatibilityProps {
  signIdx: number;
}

export default function Compatibility({ signIdx }: CompatibilityProps) {
  const [sel1, setSel1] = useState<number>(signIdx);
  const [sel2, setSel2] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<typeof getCompatibilityScore> | null>(null);

  const checkCompat = () => {
    if (sel2 === null) return;
    setResult(getCompatibilityScore(sel1, sel2));
  };

  const SignGrid = ({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, margin: '10px 0' }}>
      {signs.map((s, i) => (
        <button key={i} onClick={() => { onSelect(i); }}
          style={{
            background: 'transparent',
            border: `1.5px solid ${selected === i ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.06)'}`,
            borderRadius: 'var(--radius-xs)', padding: '12px 4px 8px', textAlign: 'center',
            cursor: 'pointer', transition: 'all .25s',
            ...(selected === i ? { background: 'rgba(139,92,246,.06)' } : {}),
          }}
        >
          <span style={{ fontSize: 20, display: 'block', marginBottom: 3 }}>{s.symbol}</span>
          <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500 }}>{s.name}</span>
        </button>
      ))}
    </div>
  );

  // Radar chart SVG
  const RadarChart = ({ data }: { data: { love: number; mental: number; passion: number; longTerm: number; soul: number } }) => {
    const dims = [
      { key: 'love', label: '💕', value: data.love },
      { key: 'mental', label: '🧠', value: data.mental },
      { key: 'passion', label: '🔥', value: data.passion },
      { key: 'longTerm', label: '🌱', value: data.longTerm },
      { key: 'soul', label: '☯️', value: data.soul },
    ];
    const cx = 100, cy = 100, r = 70;
    const getPoint = (i: number, val: number) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      return {
        x: cx + (r * val / 100) * Math.cos(angle),
        y: cy + (r * val / 100) * Math.sin(angle),
      };
    };

    const axes = dims.map((_, i) => {
      const end = getPoint(i, 100);
      return `M${cx},${cy} L${end.x},${end.y}`;
    }).join(' ');

    const dataPoints = dims.map((d, i) => getPoint(i, d.value));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    const gridPaths = [25, 50, 75, 100].map(pct => {
      const pts = dims.map((_, i) => getPoint(i, pct));
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
    });

    return (
      <div style={{ width: 200, height: 200, margin: '16px auto' }}>
        <svg viewBox="0 0 200 200">
          {/* Grid lines */}
          {gridPaths.map((p, i) => (
            <path key={i} d={p} className="radar-axis" />
          ))}
          <path d={axes} stroke="rgba(167,139,250,.1)" strokeWidth="1" fill="none" />
          {/* Data polygon */}
          <path d={dataPath} className="radar-fill" />
          {/* Labels */}
          {dims.map((d, i) => {
            const labelPt = getPoint(i, 120);
            return (
              <text key={d.key} x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="central" fontSize="14">
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div className="glass-card">
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>
          Your Sign
        </div>
        <SignGrid selected={sel1} onSelect={setSel1} />
      </div>

      <div className="glass-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>
          Their Sign
        </div>
        <SignGrid selected={sel2} onSelect={(i) => { setSel2(i); }} />
      </div>

      {sel2 !== null && (
        <button onClick={checkCompat} style={{
          width: '100%', padding: 14, border: 'none', borderRadius: 'var(--radius-sm)',
          fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 12,
          background: 'linear-gradient(135deg,var(--accent2),var(--pink))', color: '#fff',
        }}>
          💫 Check Compatibility
        </button>
      )}

      {result && (
        <ParallaxCard className="mt-4">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, letterSpacing: 6 }}>
              {signs[sel1].symbol} ✕ {sel2 !== null ? signs[sel2].symbol : ''}
            </div>
            <div style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 'clamp(44px,11vw,56px)', fontWeight: 700,
              background: 'linear-gradient(135deg,var(--accent),var(--pink))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: '10px 0 4px', animation: 'countUp .5s ease-out',
            }}>
              {result.overall}%
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{result.title}</div>

            {/* Compatibility bar */}
            <div style={{ height: 4, background: 'rgba(167,139,250,.06)', borderRadius: 2, margin: '14px 0', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg,var(--accent),var(--pink))',
                width: `${result.overall}%`, transition: 'width 1.2s cubic-bezier(.4,.2,.2,1)',
              }} />
            </div>

            {/* Radar chart */}
            <RadarChart data={result} />

            {/* Dimension scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, textAlign: 'left' }}>
              {[
                { label: '💕 Love', val: result.love },
                { label: '🧠 Mental', val: result.mental },
                { label: '🔥 Passion', val: result.passion },
                { label: '🌱 Long-term', val: result.longTerm },
                { label: '☯️ Soul', val: result.soul },
              ].map(d => (
                <div key={d.label} style={{ padding: '8px 10px', background: 'rgba(14,14,40,.4)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{d.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{d.val}%</div>
                </div>
              ))}
            </div>

            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, textAlign: 'left', marginTop: 14 }}>
              {result.text}
            </p>
          </div>
        </ParallaxCard>
      )}
    </div>
  );
}
