'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { signs, getCompatibilityScore } from '@/lib/data';
import { store, isPremium } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

interface CosmicSoulmateProps {
  signIdx: number;
  onShowPaywall: () => void;
}

export default function CosmicSoulmate({ signIdx, onShowPaywall }: CosmicSoulmateProps) {
  const [showModal, setShowModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [result, setResult] = useState<ReturnType<typeof getCompatibilityScore> | null>(null);
  const [partnerSign, setPartnerSign] = useState<number | null>(null);
  const [lunaReading, setLunaReading] = useState('');
  const [loadingReading, setLoadingReading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [scoreAnimate, setScoreAnimate] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sign = signs[signIdx];
  const freeCheckUsed = store.get<boolean>('soulmate_free_used', false);

  // Get partner's sign from birth date
  const getSignFromDate = (dateStr: string): number => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const ranges = [
      [1, 20, 9], [1, 31, 9], [2, 19, 10], [2, 29, 10], [3, 20, 11], [3, 31, 0],
      [4, 20, 0], [4, 30, 1], [5, 21, 1], [5, 31, 2], [6, 21, 2], [6, 30, 3],
      [7, 23, 3], [7, 31, 4], [8, 23, 4], [8, 31, 5], [9, 23, 5], [9, 30, 6],
      [10, 23, 6], [10, 31, 7], [11, 22, 7], [11, 30, 8], [12, 22, 8], [12, 31, 9],
    ];
    // Simple zodiac calculation
    const zodiacDates = [
      { end: [1, 19], sign: 9 }, // Cap
      { end: [2, 18], sign: 10 }, // Aqua
      { end: [3, 20], sign: 11 }, // Pisces
      { end: [4, 19], sign: 0 }, // Aries
      { end: [5, 20], sign: 1 }, // Taurus
      { end: [6, 20], sign: 2 }, // Gemini
      { end: [7, 22], sign: 3 }, // Cancer
      { end: [8, 22], sign: 4 }, // Leo
      { end: [9, 22], sign: 5 }, // Virgo
      { end: [10, 22], sign: 6 }, // Libra
      { end: [11, 21], sign: 7 }, // Scorpio
      { end: [12, 21], sign: 8 }, // Sag
      { end: [12, 31], sign: 9 }, // Cap
    ];
    for (const z of zodiacDates) {
      if (month < z.end[0] || (month === z.end[0] && day <= z.end[1])) {
        return z.sign;
      }
    }
    return 9;
  };

  const checkCompatibility = useCallback(async () => {
    if (!partnerDate) return;

    // Premium gate after first free check
    if (freeCheckUsed && !isPremium()) {
      onShowPaywall();
      return;
    }

    const pSign = getSignFromDate(partnerDate);
    setPartnerSign(pSign);
    const compat = getCompatibilityScore(signIdx, pSign);
    setResult(compat);
    setRevealed(true);
    setShowModal(false);

    // Mark free check used
    store.set('soulmate_free_used', true);

    // Save result
    store.set('soulmate_result', {
      partnerName: sanitize(partnerName),
      partnerSign: pSign,
      result: compat,
      date: new Date().toISOString(),
    });

    // Animate score counting up
    let count = 0;
    const target = compat.overall;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      setScoreAnimate(count);
    }, 30);

    // Get Luna's reading
    setLoadingReading(true);
    try {
      const res = await fetch('/api/astro-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Give a detailed 3-paragraph cosmic compatibility reading for a ${signs[signIdx].name} and a ${signs[pSign].name}. Their compatibility score is ${compat.overall}%. Love: ${compat.love}%, Mental: ${compat.mental}%, Passion: ${compat.passion}%, Long-term: ${compat.longTerm}%, Soul: ${compat.soul}%. The partner's name is ${sanitize(partnerName) || 'their partner'}. Be poetic and specific.` }],
          birthData: { sign: signs[signIdx].name, element: signs[signIdx].element },
        }),
      });
      const data = await res.json();
      setLunaReading(data.content || compat.text);
    } catch {
      setLunaReading(compat.text);
    }
    setLoadingReading(false);
  }, [partnerDate, partnerName, signIdx, freeCheckUsed, onShowPaywall]);

  // Generate share image
  const generateShareImage = useCallback(() => {
    if (!canvasRef.current || !result || partnerSign === null) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#0a0015');
    grad.addColorStop(0.5, '#1a0a30');
    grad.addColorStop(1, '#0a0015');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Stars
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 600, Math.random() * 400, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${0.2 + Math.random() * 0.4})`;
      ctx.fill();
    }

    // Signs
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText(signs[signIdx].symbol, 180, 160);
    ctx.fillText(signs[partnerSign].symbol, 420, 160);

    // Heart between
    ctx.font = '32px serif';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('💕', 300, 150);

    // Score
    ctx.font = 'bold 72px serif';
    const scoreGrad = ctx.createLinearGradient(200, 200, 400, 260);
    scoreGrad.addColorStop(0, '#a78bfa');
    scoreGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = scoreGrad;
    ctx.fillText(`${result.overall}%`, 300, 260);

    // Title
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#f0eaff';
    ctx.fillText(`We are ${result.overall}% cosmic soulmates ✨`, 300, 310);

    // Watermark
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(167,139,250,0.5)';
    ctx.fillText('celestia-two.vercel.app', 300, 370);
  }, [result, partnerSign, signIdx]);

  useEffect(() => {
    if (revealed && result) {
      setTimeout(generateShareImage, 500);
    }
  }, [revealed, result, generateShareImage]);

  const shareResult = async () => {
    generateShareImage();
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>(resolve =>
        canvasRef.current!.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], 'cosmic-match.png', { type: 'image/png' });
        await navigator.share({
          title: 'Cosmic Soulmate Match',
          text: `We are ${result?.overall}% cosmic soulmates! ✨ Check yours at celestia-two.vercel.app`,
          files: [file],
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `We are ${result?.overall}% cosmic soulmates! ✨ Check yours at https://celestia-two.vercel.app`
        );
        alert('Link copied!');
      }
    } catch { /* user cancelled share */ }
  };

  // Radar chart
  const RadarChart = () => {
    if (!result) return null;
    const dims = [
      { label: '💕', value: result.love },
      { label: '🧠', value: result.mental },
      { label: '🔥', value: result.passion },
      { label: '🌱', value: result.longTerm },
      { label: '☯️', value: result.soul },
    ];
    const cx = 100, cy = 100, r = 70;
    const getPoint = (i: number, val: number) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      return { x: cx + (r * val / 100) * Math.cos(angle), y: cy + (r * val / 100) * Math.sin(angle) };
    };
    const dataPoints = dims.map((d, i) => getPoint(i, d.value));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
    const gridPaths = [25, 50, 75, 100].map(pct => {
      const pts = dims.map((_, i) => getPoint(i, pct));
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
    });

    return (
      <svg viewBox="0 0 200 200" style={{ width: 180, height: 180, margin: '12px auto', display: 'block' }}>
        {gridPaths.map((p, i) => <path key={i} d={p} className="radar-axis" />)}
        <path d={dataPath} className="radar-fill" />
        {dims.map((d, i) => {
          const lp = getPoint(i, 125);
          return <text key={d.label} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontSize="14">{d.label}</text>;
        })}
      </svg>
    );
  };

  return (
    <>
      {/* Soulmate Card on Home Screen */}
      <div className="soulmate-card" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setShowModal(true)}>
        <div className="mini-stars">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="star" style={{
              left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
              width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
              '--d': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
            } as React.CSSProperties} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,4.5vw,22px)', fontWeight: 600, marginBottom: 6 }}>
              ✨ Find Your Cosmic Soulmate
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: 12.5, lineHeight: 1.5 }}>
              Discover who&apos;s written in the stars for you
            </p>
          </div>

          {/* Two profile slots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, margin: '20px 0' }}>
            {/* User's sign */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(145deg,var(--accent2),var(--accent3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, boxShadow: '0 4px 20px rgba(139,92,246,.3)',
              }}>
                {sign.symbol}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6, fontWeight: 500 }}>{sign.name}</div>
            </div>

            <div style={{ fontSize: 24, color: 'var(--pink)' }}>💕</div>

            {/* Partner slot */}
            <div style={{ textAlign: 'center' }}>
              <div className="pulse-glow" style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(251,191,36,.08)',
                border: '2px dashed rgba(251,191,36,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: 'var(--gold)',
              }}>
                {partnerSign !== null ? signs[partnerSign].symbol : '?'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 6, fontWeight: 500 }}>
                {partnerSign !== null ? signs[partnerSign].name : 'Add partner'}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button style={{
            width: '100%', padding: '14px 24px', border: 'none',
            borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', color: '#000',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            boxShadow: '0 4px 20px rgba(251,191,36,.3)',
            fontFamily: "'Inter',sans-serif",
          }}>
            💫 Check Compatibility
          </button>

          {freeCheckUsed && !isPremium() && (
            <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
              🔓 Unlock unlimited matches with Premium
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            maxWidth: 'var(--max-w)', width: '100%', background: 'var(--bg)',
            borderRadius: 'var(--radius) var(--radius) 0 0', padding: '20px 20px 40px',
            border: '1px solid rgba(255,255,255,.05)', borderBottom: 'none',
            animation: 'fadeUp .35s ease',
          }}>
            <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '0 auto 18px' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 14, textAlign: 'center' }}>
              Enter Partner Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text" placeholder="Partner's name (optional)"
                value={partnerName} onChange={e => setPartnerName(e.target.value)}
                style={{
                  background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: 'var(--radius-xs)', padding: 12, color: 'var(--text)',
                  fontSize: 14, outline: 'none',
                }}
              />
              <input
                type="date" value={partnerDate} onChange={e => setPartnerDate(e.target.value)}
                style={{
                  background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: 'var(--radius-xs)', padding: 12, color: 'var(--text)',
                  fontSize: 14, outline: 'none',
                }}
              />
              <button onClick={checkCompatibility} disabled={!partnerDate} style={{
                width: '100%', padding: 15, border: 'none',
                borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', color: '#000',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                opacity: partnerDate ? 1 : 0.4,
                fontFamily: "'Inter',sans-serif",
              }}>
                💫 Reveal Cosmic Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {revealed && result && partnerSign !== null && (
        <div className="glass-card" style={{ marginBottom: 16, textAlign: 'center', animation: 'fadeUp .5s ease' }}>
          <div style={{ fontSize: 32, letterSpacing: 6, marginBottom: 8 }}>
            {sign.symbol} 💕 {signs[partnerSign].symbol}
          </div>
          {partnerName && (
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 4 }}>
              {sign.name} & {sanitize(partnerName)}
            </p>
          )}
          <div style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(48px,12vw,64px)', fontWeight: 700,
            background: 'linear-gradient(135deg,var(--accent),var(--pink))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '8px 0',
          }}>
            {scoreAnimate}%
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{result.title}</div>

          <RadarChart />

          {/* Dimension bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '16px 0', textAlign: 'left' }}>
            {[
              { emoji: '💕', label: 'Love', val: result.love },
              { emoji: '🧠', label: 'Mental', val: result.mental },
              { emoji: '🔥', label: 'Passion', val: result.passion },
              { emoji: '🌱', label: 'Long-term', val: result.longTerm },
              { emoji: '☯️', label: 'Soul', val: result.soul },
            ].map(d => (
              <div key={d.label} style={{
                padding: '10px 12px', background: 'rgba(14,14,40,.4)',
                borderRadius: 'var(--radius-xs)', border: '1px solid var(--glass-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{d.emoji} {d.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{d.val}%</div>
                <div style={{ height: 3, background: 'rgba(167,139,250,.08)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.val}%`, background: 'linear-gradient(90deg,var(--accent),var(--pink))', borderRadius: 2, transition: 'width 1.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Luna's reading */}
          <div style={{ textAlign: 'left', marginTop: 16 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
              🌙 Luna&apos;s Reading
            </div>
            {loadingReading ? (
              <div>
                <div className="skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton-line" style={{ width: '75%' }} />
                <div className="skeleton-line" style={{ width: '60%' }} />
              </div>
            ) : (
              <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>{lunaReading}</p>
            )}
          </div>

          {/* Share button */}
          <button onClick={shareResult} style={{
            width: '100%', padding: 14, border: 'none',
            borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', marginTop: 16,
            background: 'linear-gradient(135deg,var(--accent2),var(--pink))', color: '#fff',
            fontFamily: "'Inter',sans-serif",
          }}>
            📤 Share Your Cosmic Match
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </>
  );
}
