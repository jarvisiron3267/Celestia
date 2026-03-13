'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { tarotDeck } from '@/lib/data';
import { store } from '@/lib/store';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function playMysticalTone() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.value = 440;
    osc2.type = 'sine'; osc2.frequency.value = 554;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
    osc1.start(); osc2.start();
    osc1.stop(ctx.currentTime + 1.5); osc2.stop(ctx.currentTime + 1.5);
    setTimeout(() => ctx.close(), 2000);
  } catch { /* no audio */ }
}

function spawnParticles(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'tarot-particle animate';
    const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
    const dist = 60 + Math.random() * 80;
    p.style.cssText = `left:${cx}px;top:${cy}px;--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;background:${Math.random() > 0.5 ? 'var(--gold)' : 'var(--accent)'};width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px;animation-delay:${Math.random() * 0.15}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function triggerShockwave(el: HTMLElement) {
  const wave = document.createElement('div');
  wave.className = 'tarot-shockwave active';
  wave.style.cssText = `position:fixed;left:${el.getBoundingClientRect().left + el.offsetWidth / 2}px;top:${el.getBoundingClientRect().top + el.offsetHeight / 2}px;transform:translate(-50%,-50%)`;
  document.body.appendChild(wave);
  setTimeout(() => wave.remove(), 900);
}

function triggerGoldenFlash() {
  const flash = document.createElement('div');
  flash.className = 'golden-flash active';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

interface TarotCardProps {
  onXP: (amount: number) => void;
}

type SpreadType = 'ppf' | 'love' | 'career' | 'yes';

const spreadLabels: Record<SpreadType, string> = {
  ppf: 'Past • Present • Future',
  love: 'Heart • Desire • Outcome',
  career: 'Challenge • Action • Result',
  yes: 'Energy • Answer • Advice',
};

const posLabels: Record<SpreadType, string[]> = {
  ppf: ['Past', 'Present', 'Future'],
  love: ['Heart', 'Desire', 'Outcome'],
  career: ['Challenge', 'Action', 'Result'],
  yes: ['Energy', 'Answer', 'Advice'],
};

export default function TarotCard({ onXP }: TarotCardProps) {
  const [deck, setDeck] = useState(() => shuffle(tarotDeck));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [spread, setSpread] = useState<SpreadType>('ppf');
  const [revealedCard, setRevealedCard] = useState<typeof tarotDeck[0] | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const flipCard = useCallback((idx: number) => {
    if (flipped.includes(idx)) return;
    const el = cardRefs.current[idx];
    if (!el) return;

    // Play sound
    playMysticalTone();

    // Levitate
    el.classList.add('levitating');

    setTimeout(() => {
      // Particles + shockwave + flash
      spawnParticles(el);
      triggerShockwave(el);
      triggerGoldenFlash();

      // Flip
      el.classList.add('flipped');
      el.classList.remove('levitating');

      setFlipped(prev => [...prev, idx]);
      setRevealedCard(deck[idx]);
      onXP(10);

      // Save reading when all 3 flipped
      if (flipped.length === 2) {
        const allCards = [...flipped, idx].map(i => deck[i]);
        const history = store.get<unknown[]>('readings', []);
        history.push({
          date: new Date().toISOString(),
          spread: spread.toUpperCase(),
          cards: allCards.map(c => ({ name: c.name, emoji: c.emoji, meaning: c.meaning })),
        });
        store.set('readings', history);
        onXP(15);
      }
    }, 500);
  }, [flipped, deck, onXP, spread]);

  const resetTarot = () => {
    setDeck(shuffle(tarotDeck));
    setFlipped([]);
    setRevealedCard(null);
    cardRefs.current.forEach(el => {
      if (el) { el.classList.remove('flipped', 'levitating'); }
    });
  };

  const changeSpread = (s: SpreadType) => {
    setSpread(s);
    resetTarot();
  };

  return (
    <div className="page-enter">
      <div style={{ padding: '0 0 20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,5.5vw,30px)', fontWeight: 600 }}>
          Tarot Cards
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Tap a card to see your message</p>
      </div>

      {/* Spread chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {(Object.keys(spreadLabels) as SpreadType[]).map(s => (
          <button key={s} onClick={() => changeSpread(s)}
            style={{
              padding: '8px 16px', borderRadius: 100, border: `1px solid ${spread === s ? 'rgba(139,92,246,.2)' : 'rgba(255,255,255,.08)'}`,
              background: spread === s ? 'rgba(139,92,246,.1)' : 'transparent',
              color: spread === s ? 'var(--accent)' : 'var(--text2)',
              fontSize: 12.5, cursor: 'pointer', fontWeight: 500,
            }}
          >
            {s === 'ppf' ? 'Past-Present-Future' : s === 'love' ? 'Love' : s === 'career' ? 'Career' : 'Yes / No'}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '12px 14px 18px' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>
          {spreadLabels[spread]}
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', padding: '24px 0', perspective: 1000 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="tarot-card-container" onClick={() => flipCard(i)}>
              <div ref={el => { cardRefs.current[i] = el; }} className="tarot-card">
                <div className="front">
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'var(--accent)', fill: 'none', strokeWidth: 1.8, opacity: 0.35 }}>
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, fontWeight: 500 }}>
                    {posLabels[spread][i]}
                  </div>
                </div>
                <div className="back">
                  <div style={{ fontSize: 'clamp(30px,7.5vw,38px)' }}>{deck[i].emoji}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(10px,2.5vw,13px)', fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>
                    {deck[i].name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revealed meaning */}
      {revealedCard && (
        <div className="glass-card" style={{ marginTop: 12, animation: 'pageIn .4s ease' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
            {revealedCard.name}
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13.5, lineHeight: 1.7 }}>{revealedCard.meaning}</p>
        </div>
      )}

      <button onClick={resetTarot} style={{
        width: '100%', padding: 14, border: 'none', borderRadius: 'var(--radius-sm)',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 12,
        background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
        boxShadow: '0 4px 16px rgba(139,92,246,.2)',
      }}>
        New Reading
      </button>
    </div>
  );
}
