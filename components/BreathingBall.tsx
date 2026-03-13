'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

interface BreathingBallProps {
  onXP: (amount: number) => void;
}

const presets: Record<string, { in: number; hold: number; out: number; holdOut?: number; name: string }> = {
  calm: { in: 4, hold: 0, out: 4, name: '4-4 Calm' },
  relax: { in: 4, hold: 7, out: 8, name: '4-7-8 Relax' },
  box: { in: 4, hold: 4, out: 4, holdOut: 4, name: 'Box' },
  deep: { in: 6, hold: 0, out: 6, name: 'Deep' },
};

export default function BreathingBall({ onXP }: BreathingBallProps) {
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState('calm');
  const [label, setLabel] = useState('Tap to Start');
  const [timer, setTimer] = useState('');
  const [cycles, setCycles] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState('0:00');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const runCycle = useCallback((p: typeof presets[string]) => {
    if (!runningRef.current) return;

    // Inhale
    setPhase('inhale');
    setLabel('Breathe In');
    let count = p.in;
    setTimer(String(count));

    const inInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setTimer(String(count));
      } else {
        clearInterval(inInterval);

        if (p.hold > 0 && runningRef.current) {
          // Hold
          setPhase('hold');
          setLabel('Hold');
          let hc = p.hold;
          setTimer(String(hc));
          const holdInterval = setInterval(() => {
            hc--;
            if (hc > 0) {
              setTimer(String(hc));
            } else {
              clearInterval(holdInterval);
              doExhale(p);
            }
          }, 1000);
        } else {
          doExhale(p);
        }
      }
    }, 1000);

    function doExhale(pr: typeof presets[string]) {
      if (!runningRef.current) return;
      setPhase('exhale');
      setLabel('Breathe Out');
      let ec = pr.out;
      setTimer(String(ec));

      const outInterval = setInterval(() => {
        ec--;
        if (ec > 0) {
          setTimer(String(ec));
        } else {
          clearInterval(outInterval);
          setCycles(prev => prev + 1);
          if (runningRef.current) {
            runCycle(pr);
          }
        }
      }, 1000);
    }
  }, []);

  const toggle = useCallback(() => {
    if (running) {
      // Stop
      runningRef.current = false;
      setRunning(false);
      setPhase('idle');
      setLabel('Tap to Start');
      setTimer('');
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cycles > 0) onXP(20);
    } else {
      // Start
      runningRef.current = true;
      setRunning(true);
      setCycles(0);
      setStartTime(Date.now());

      // Elapsed timer
      intervalRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - Date.now()) / 1000); // Will use startTime
        setElapsed(prev => {
          const s = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
          return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        });
      }, 1000);

      runCycle(presets[preset]);
    }
  }, [running, cycles, onXP, preset, runCycle, startTime]);

  return (
    <div>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '14px 0', flexWrap: 'wrap' }}>
        {Object.entries(presets).map(([key, p]) => (
          <button key={key} onClick={() => { setPreset(key); if (running) { runningRef.current = false; setRunning(false); setTimeout(() => { runningRef.current = true; setRunning(true); runCycle(p); }, 100); } }}
            style={{
              padding: '7px 14px', borderRadius: 100,
              border: `1px solid ${preset === key ? 'rgba(139,92,246,.2)' : 'rgba(255,255,255,.08)'}`,
              background: preset === key ? 'rgba(139,92,246,.08)' : 'transparent',
              color: preset === key ? 'var(--accent)' : 'var(--text3)',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Aurora Ball */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div
          className={`aurora-ball ${phase === 'inhale' ? 'inhale' : phase === 'exhale' ? 'exhale' : ''}`}
          onClick={toggle}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.5 }}>
            {label}
          </div>
          {timer && (
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 2 }}>
              {timer}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>
          Session Stats
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)' }}>{cycles}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Cycles</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{elapsed}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
