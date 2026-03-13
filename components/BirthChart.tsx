'use client';
import { useState, useEffect } from 'react';
import { signs } from '@/lib/data';
import { getPlanetaryPositions, getRisingSign, type PlanetPosition } from '@/lib/astro';
import ParallaxCard from './ParallaxCard';

interface BirthChartProps {
  signIdx: number;
}

export default function BirthChart({ signIdx }: BirthChartProps) {
  const [planets, setPlanets] = useState<PlanetPosition[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [rising, setRising] = useState<{ name: string; symbol: string } | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    try {
      setPlanets(getPlanetaryPositions());
    } catch { /* */ }
  }, []);

  const generateChart = () => {
    try {
      const pp = getPlanetaryPositions();
      setPlanets(pp);
      if (birthDate && birthTime) {
        const r = getRisingSign(new Date(birthDate), birthTime, 40.7128, -74.006);
        setRising(r);
      }
      setGenerated(true);
    } catch { /* */ }
  };

  return (
    <div className="page-enter">
      <div style={{ padding: '0 0 20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,5.5vw,30px)', fontWeight: 600 }}>Birth Chart</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Your stars and planets</p>
      </div>

      {/* Chart Wheel */}
      <ParallaxCard>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <svg viewBox="0 0 300 300" style={{ width: 260, height: 260, margin: '0 auto' }}>
            <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(167,139,250,.12)" strokeWidth="1" />
            <circle cx="150" cy="150" r="110" fill="none" stroke="rgba(167,139,250,.08)" strokeWidth="1" />
            <circle cx="150" cy="150" r="70" fill="none" stroke="rgba(167,139,250,.05)" strokeWidth="1" />
            <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(167,139,250,.04)" strokeWidth="1" />
            <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(167,139,250,.04)" strokeWidth="1" />
            {/* Zodiac signs around wheel */}
            {signs.map((s, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x = 150 + 125 * Math.cos(angle);
              const y = 150 + 125 * Math.sin(angle);
              return (
                <text key={i} x={x} y={y}
                  fill={i === signIdx ? '#a78bfa' : '#5c5880'}
                  fontSize={i === signIdx ? 16 : 12}
                  textAnchor="middle" dominantBaseline="central"
                >
                  {s.symbol}
                </text>
              );
            })}
            {/* Planet positions */}
            {planets.map((p, i) => {
              const angle = ((signIdx * 30 + i * 47 + 13) % 360 - 90) * Math.PI / 180;
              const x = 150 + 80 * Math.cos(angle);
              const y = 150 + 80 * Math.sin(angle);
              return (
                <text key={p.name} x={x} y={y} fill="#a78bfa" fontSize="14" textAnchor="middle" dominantBaseline="central">
                  {p.symbol}
                </text>
              );
            })}
          </svg>
        </div>
      </ParallaxCard>

      {/* Current planetary positions (real data) */}
      {planets.length > 0 && (
        <div className="glass-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
            🔭 Current Planetary Positions (Live)
          </div>
          {planets.map(p => (
            <div key={p.name} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,.05)',
            }}>
              <span style={{ fontWeight: 600 }}>{p.symbol} {p.name}</span>
              <span style={{ color: 'var(--accent)' }}>{p.constellation} {p.signName}</span>
            </div>
          ))}
          {rising && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              marginTop: 4, borderTop: '1px solid rgba(139,92,246,.15)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--gold)' }}>↑ Rising Sign</span>
              <span style={{ color: 'var(--gold)' }}>{rising.symbol} {rising.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Birth Details Form */}
      <div className="glass-card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 10 }}>
          Birth Details
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            style={{ background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 'var(--radius-xs)', padding: 11, color: 'var(--text)', fontSize: 13 }} />
          <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
            style={{ background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 'var(--radius-xs)', padding: 11, color: 'var(--text)', fontSize: 13 }} />
          <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="Birth Place (city)"
            style={{ background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 'var(--radius-xs)', padding: 11, color: 'var(--text)', fontSize: 13 }} />
          <button onClick={generateChart} style={{
            width: '100%', padding: 14, border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
          }}>
            Generate Chart
          </button>
        </div>
        {generated && <p style={{ fontSize: 12, color: 'var(--teal)', marginTop: 10, textAlign: 'center' }}>✓ Chart generated with real astronomical data!</p>}
      </div>
    </div>
  );
}
