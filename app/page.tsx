'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { signs, tarotDeck, affirmations, levels } from '@/lib/data';
import { store, startTrial } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import MoonPhase from '@/components/MoonPhase';
import DailyHoroscope from '@/components/DailyHoroscope';
import TarotCard from '@/components/TarotCard';
import BirthChart from '@/components/BirthChart';
import AstroChat from '@/components/AstroChat';
import Compatibility from '@/components/Compatibility';
import Journal from '@/components/Journal';
import BreathingBall from '@/components/BreathingBall';
import CosmicSoulmate from '@/components/CosmicSoulmate';
import ParallaxCard from '@/components/ParallaxCard';
import TrialBanner from '@/components/TrialBanner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [signIdx, setSignIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [onboarded, setOnboarded] = useState(true); // check in useEffect
  const [obStep, setObStep] = useState(0);
  const [moodState, setMoodState] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [exploreTab, setExploreTab] = useState('compat');
  const [toastMsg, setToastMsg] = useState('');
  const ambientRef = useRef<HTMLDivElement>(null);

  // Init from localStorage
  useEffect(() => {
    const done = store.get<boolean>('onboarded', false);
    setOnboarded(done);
    setSignIdx(store.get<number>('signIdx', 0));
    setXp(store.get<number>('xp', 0));
  }, []);

  // Create background stars
  useEffect(() => {
    const container = document.getElementById('stars-bg');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = 1 + Math.random() * 1.5;
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz}px;--d:${2 + Math.random() * 5}s;--delay:${Math.random() * 4}s`;
      container.appendChild(s);
    }
  }, []);

  // Mood reactive background
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.className = `ambient mood-${moodState}`;
    }
  }, [moodState]);

  const addXP = useCallback((amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      store.set('xp', newXp);
      return newXp;
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const handleShowPaywall = useCallback(() => {
    setShowPaywall(true);
  }, []);

  // Onboarding completion
  const completeOnboarding = useCallback(() => {
    store.set('onboarded', true);
    store.set('signIdx', signIdx);
    startTrial();
    setOnboarded(true);
  }, [signIdx]);

  // XP level info
  const getLevel = () => {
    let lvl = levels[0], next = levels[1] || { min: 9999 }, idx = 0;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].min) { lvl = levels[i]; next = levels[i + 1] || { min: lvl.min + 500 }; idx = i; break; }
    }
    const prog = Math.min(100, ((xp - lvl.min) / (next.min - lvl.min)) * 100);
    return { lvl, next, idx, prog };
  };

  const level = getLevel();
  const sign = signs[signIdx];

  // Daily lucky numbers
  const luckyNums = (() => {
    const d = new Date().toISOString().slice(0, 10);
    let s = 0;
    for (let i = 0; i < d.length; i++) { s = ((s << 5) - s) + d.charCodeAt(i); s |= 0; }
    const nums = new Set<number>();
    while (nums.size < 5) nums.add(1 + Math.abs((s * (nums.size + 3) * 17) % 49));
    return [...nums];
  })();

  // Greeting
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  // Daily affirmation
  const dailyAffirmation = (() => {
    const d = new Date().toISOString().slice(0, 10);
    let s = 0;
    for (let i = 0; i < d.length; i++) { s = ((s << 5) - s) + d.charCodeAt(i); s |= 0; }
    return affirmations[Math.abs(s) % affirmations.length];
  })();

  // ============ ONBOARDING ============
  if (!onboarded) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div ref={ambientRef} className="ambient">
          <div className="orb orb1" /><div className="orb orb2" />
        </div>
        <div id="stars-bg" className="stars-container" />
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp .5s ease' }}>
          {obStep === 0 && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16, animation: 'aurora 4s linear infinite' }}>✨</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 600, marginBottom: 12, lineHeight: 1.2 }}>
                The universe has been<br /><span style={{ background: 'linear-gradient(135deg,var(--accent),var(--pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>waiting for you</span>
              </h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: '0 auto 32px' }}>
                Your daily guide to the stars, tarot, and cosmic wisdom.
              </p>
              <button onClick={() => setObStep(1)} style={{
                width: '100%', padding: 16, border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--accent2),var(--pink))', color: '#fff',
              }}>
                I&apos;m ready ✨
              </button>
            </>
          )}

          {obStep === 1 && (
            <>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: 20 }}>
                What&apos;s your Zodiac Sign?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
                {signs.map((s, i) => (
                  <button key={i} onClick={() => setSignIdx(i)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '12px 4px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: `1px solid ${signIdx === i ? 'var(--accent)' : 'rgba(255,255,255,.06)'}`,
                    background: signIdx === i ? 'rgba(139,92,246,.1)' : 'rgba(14,14,40,.4)',
                    color: signIdx === i ? 'var(--text)' : 'var(--text2)', fontSize: 11, fontWeight: 500,
                  }}>
                    <span style={{ fontSize: 24 }}>{s.symbol}</span>
                    {s.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setObStep(2)} style={{
                width: '100%', padding: 16, border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
              }}>
                Continue
              </button>
            </>
          )}

          {obStep === 2 && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: 8 }}>
                You&apos;re All Set!
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Welcome, {signs[signIdx].name}. Your cosmic journey begins now.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { emoji: '🔮', title: 'Daily Tarot', sub: 'Daily cards' },
                  { emoji: '💬', title: 'Luna AI', sub: 'Chat 24/7' },
                  { emoji: '⭐', title: 'Birth Chart', sub: 'Real data' },
                  { emoji: '💕', title: 'Soulmate', sub: 'Find yours' },
                ].map(f => (
                  <div key={f.title} style={{
                    background: 'rgba(14,14,40,.4)', border: '1px solid rgba(255,255,255,.05)',
                    borderRadius: 14, padding: 18, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{f.emoji}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{f.sub}</div>
                  </div>
                ))}
              </div>
              <button onClick={completeOnboarding} style={{
                width: '100%', padding: 16, border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
              }}>
                Start Now →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============ PAYWALL ============
  if (showPaywall) {
    return (
      <div className="paywall-overlay">
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 20px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--gold)', fontWeight: 700, marginBottom: 16 }}>
            ✨ Celestia Premium
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,6vw,32px)', fontWeight: 700, marginBottom: 10 }}>
            Unlock Your<br /><span style={{ background: 'linear-gradient(135deg,var(--accent),var(--pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Full Reading</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Access unlimited readings, Luna AI, and your complete star map.
          </p>
          {[
            { emoji: '🔮', text: 'Unlimited Tarot Readings' },
            { emoji: '💬', text: 'Unlimited Luna AI Chat' },
            { emoji: '💕', text: 'Unlimited Soulmate Matches' },
            { emoji: '⭐', text: 'Complete Birth Chart' },
            { emoji: '🌙', text: 'Daily Personalized Horoscope' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontSize: 20 }}>{f.emoji}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{f.text}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--teal)', fontWeight: 700 }}>✓</span>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <div style={{
              border: '1.5px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16,
              background: 'rgba(139,92,246,.07)', marginBottom: 10, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Yearly</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>$3.33/mo • Best Value</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>$39.99<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>/yr</span></div>
              </div>
            </div>
          </div>

          <button onClick={() => {
            store.set('subscription', { plan: 'yearly', startedAt: Date.now() });
            startTrial();
            setShowPaywall(false);
            showToast('Premium activated! ✨');
          }} style={{
            width: '100%', padding: 17, border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16,
            background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
            boxShadow: '0 6px 24px rgba(139,92,246,.3)',
          }}>
            Start 7-Day Free Trial
          </button>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>7 days free, then $39.99/yr. Cancel anytime.</p>
          <button onClick={() => setShowPaywall(false)} style={{
            background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12,
            cursor: 'pointer', marginTop: 14, opacity: 0.6, padding: 4,
          }}>
            Skip for now →
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN APP ============
  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={ambientRef} className="ambient">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>
      <div id="stars-bg" className="stars-container" />

      {/* Toast */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

      {/* Content */}
      <div className="hide-scrollbar" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '20px 20px calc(var(--nav-h) + var(--safe-b) + 28px)',
        position: 'relative', zIndex: 1,
      }}>

        {/* ===== HOME ===== */}
        {activeTab === 'home' && (
          <div className="page-enter">
            <div style={{ padding: '0 0 20px' }}>
              <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{greeting}</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,5.5vw,30px)', fontWeight: 600 }}>
                Your Cosmic Day
              </h1>
            </div>

            <TrialBanner onShowPaywall={handleShowPaywall} />

            {/* XP Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.5 }}>
                  Lv{level.idx + 1} {level.lvl.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{xp} / {level.next.min} CP</span>
              </div>
              <div style={{ height: 4, background: 'rgba(167,139,250,.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'linear-gradient(90deg,var(--accent2),var(--accent))',
                  borderRadius: 2, width: `${level.prog}%`, transition: 'width .8s ease',
                }} />
              </div>
            </div>

            {/* Sign pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.12)',
              borderRadius: 100, padding: '7px 16px', fontSize: 13, color: 'var(--accent)',
              fontWeight: 600, marginBottom: 16,
            }}>
              {sign.symbol} {sign.name}
            </div>

            {/* 🌟 COSMIC SOULMATE — the viral centerpiece */}
            <CosmicSoulmate signIdx={signIdx} onShowPaywall={handleShowPaywall} />

            {/* Moon Phase */}
            <div style={{ marginBottom: 16 }}>
              <MoonPhase />
            </div>

            {/* Daily Horoscope */}
            <DailyHoroscope signIdx={signIdx} />

            {/* Quick actions bento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { emoji: '🃏', label: 'Tarot', tab: 'tarot', color: 'var(--accent)' },
                { emoji: '💬', label: 'Luna AI', tab: 'chat', color: 'var(--pink)' },
                { emoji: '⭐', label: 'Birth Chart', tab: 'chart', color: 'var(--gold)' },
                { emoji: '🧘', label: 'Breathe', tab: 'explore', color: 'var(--teal)' },
              ].map(item => (
                <div key={item.label} className="glass-card" onClick={() => { setActiveTab(item.tab); if (item.label === 'Breathe') setExploreTab('breathe'); }}
                  style={{ padding: '18px 12px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6, color: item.color }}>Open</div>
                </div>
              ))}
            </div>

            {/* Lucky Numbers */}
            <div className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 10 }}>
                Lucky Numbers
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {luckyNums.map((n, i) => (
                  <div key={i} style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, color: 'var(--accent)',
                  }}>
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Affirmation */}
            <div style={{
              background: 'linear-gradient(145deg,rgba(236,72,153,.04),rgba(139,92,246,.05))',
              border: '1px solid rgba(236,72,153,.08)', borderRadius: 'var(--radius)',
              padding: '28px 20px', textAlign: 'center', marginTop: 16, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--pink)', fontWeight: 600, marginBottom: 14 }}>
                Daily Affirmation
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(17px,4.2vw,21px)', lineHeight: 1.6, fontWeight: 500 }}>
                {dailyAffirmation}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAROT ===== */}
        {activeTab === 'tarot' && <TarotCard onXP={addXP} />}

        {/* ===== CHART ===== */}
        {activeTab === 'chart' && <BirthChart signIdx={signIdx} />}

        {/* ===== CHAT ===== */}
        {activeTab === 'chat' && <AstroChat signIdx={signIdx} onXP={addXP} />}

        {/* ===== EXPLORE ===== */}
        {activeTab === 'explore' && (
          <div className="page-enter">
            <div style={{ padding: '0 0 20px' }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,5.5vw,30px)', fontWeight: 600 }}>Explore</h1>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Learn, reflect & grow</p>
            </div>

            {/* Sub-tabs */}
            <div style={{
              display: 'flex', gap: 4, background: 'rgba(14,14,40,.4)',
              border: '1px solid rgba(255,255,255,.05)', borderRadius: 12,
              padding: 3, marginBottom: 16, overflowX: 'auto',
            }}>
              {[
                { id: 'compat', label: 'Match' },
                { id: 'journal', label: 'Journal' },
                { id: 'breathe', label: 'Breathe' },
              ].map(t => (
                <button key={t.id} onClick={() => setExploreTab(t.id)}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: 10, textAlign: 'center',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    border: 'none',
                    background: exploreTab === t.id ? 'rgba(139,92,246,.1)' : 'transparent',
                    color: exploreTab === t.id ? 'var(--accent)' : 'var(--text3)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {exploreTab === 'compat' && <Compatibility signIdx={signIdx} />}
            {exploreTab === 'journal' && <Journal onXP={addXP} onMoodChange={setMoodState} />}
            {exploreTab === 'breathe' && (
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
                  Breathing Exercise
                </div>
                <BreathingBall onXP={addXP} />
              </div>
            )}
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === 'profile' && (
          <div className="page-enter">
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(145deg,var(--accent2),var(--pink))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, margin: '0 auto 14px',
                boxShadow: '0 8px 32px rgba(139,92,246,.25)',
              }}>
                {sign.symbol}
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600 }}>
                Cosmic Explorer
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
                {sign.name} • {sign.element} Sign • {sign.quality}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '18px 0' }}>
              {[
                { val: store.get<unknown[]>('readings', []).length, label: 'Readings' },
                { val: store.get<{ count: number }>('streak', { count: 0 }).count || 0, label: 'Streak' },
                { val: xp, label: 'XP' },
              ].map(s => (
                <div key={s.label} className="glass-card" style={{ padding: '14px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="glass-card" onClick={() => setShowPaywall(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', marginBottom: 8, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(251,191,36,.06)' }}>
                    ⭐
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 600 }}>Premium</h4>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                      {store.get('subscription', null) ? 'Active' : 'Upgrade'}
                    </p>
                  </div>
                </div>
                <div style={{ color: 'var(--text3)', fontSize: 18 }}>›</div>
              </div>
            </div>

            <p style={{ textAlign: 'center', padding: '24px 0 8px', color: 'var(--text3)', fontSize: 10 }}>
              Celestia v2.0 • Next.js • Real Astronomical Data
            </p>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
