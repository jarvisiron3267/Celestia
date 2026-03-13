'use client';
import { useState, useEffect, useCallback } from 'react';
import { store } from '@/lib/store';
import { sanitize } from '@/lib/sanitize';

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  text: string;
}

interface JournalProps {
  onXP: (amount: number) => void;
  onMoodChange: (mood: 'positive' | 'negative' | 'neutral') => void;
}

const moods = [
  { emoji: '😄', label: 'great' },
  { emoji: '😊', label: 'good' },
  { emoji: '😐', label: 'meh' },
  { emoji: '😔', label: 'sad' },
  { emoji: '😤', label: 'angry' },
  { emoji: '😪', label: 'tired' },
];

const positiveWords = ['grateful', 'happy', 'love', 'joy', 'amazing', 'wonderful', 'blessed', 'excited', 'proud', 'beautiful', 'peace', 'hope', 'inspire', 'thank'];
const negativeWords = ['sad', 'anxious', 'fear', 'lost', 'angry', 'stress', 'worry', 'pain', 'hurt', 'alone', 'depressed', 'scared', 'broken', 'tired', 'hate'];

function analyzeMood(text: string): 'positive' | 'negative' | 'neutral' {
  const low = text.toLowerCase();
  let posCount = 0, negCount = 0;
  positiveWords.forEach(w => { if (low.includes(w)) posCount++; });
  negativeWords.forEach(w => { if (low.includes(w)) negCount++; });
  if (posCount > negCount && posCount > 0) return 'positive';
  if (negCount > posCount && negCount > 0) return 'negative';
  return 'neutral';
}

export default function Journal({ onXP, onMoodChange }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    setEntries(store.get<JournalEntry[]>('journal_v2', []));
  }, []);

  const saveEntry = useCallback(() => {
    if (!text.trim() && !selectedMood) return;
    const sanitized = sanitize(text);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      text: sanitized,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    store.set('journal_v2', updated);
    setText('');
    setSelectedMood('');
    onXP(15);

    // Analyze mood for background
    const moodState = analyzeMood(sanitized);
    onMoodChange(moodState);
  }, [text, selectedMood, entries, onXP, onMoodChange]);

  const handleTextChange = useCallback((val: string) => {
    setText(val);
    // Live mood analysis for background
    if (val.length > 10) {
      onMoodChange(analyzeMood(val));
    }
  }, [onMoodChange]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const y = new Date(now.getTime() - 86400000);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="glass-card">
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text3)', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
          How do you feel today?
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '14px 0', flexWrap: 'wrap' }}>
          {moods.map(m => (
            <button key={m.label} onClick={() => setSelectedMood(m.emoji)}
              style={{
                width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${selectedMood === m.emoji ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.06)'}`,
                background: selectedMood === m.emoji ? 'rgba(139,92,246,.08)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, cursor: 'pointer', transform: selectedMood === m.emoji ? 'scale(1.08)' : 'scale(1)',
                transition: 'all .25s',
              }}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder="Write your thoughts here..."
          style={{
            width: '100%', background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 'var(--radius-sm)', padding: 14, color: 'var(--text)',
            fontFamily: "'Inter',sans-serif", fontSize: 13.5, lineHeight: 1.6,
            minHeight: 100, resize: 'vertical', outline: 'none',
          }}
        />
        <button onClick={saveEntry} style={{
          width: '100%', padding: 14, border: 'none', borderRadius: 'var(--radius-sm)',
          fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10,
          background: 'linear-gradient(135deg,var(--accent2),var(--accent3))', color: '#fff',
        }}>
          Save Entry
        </button>
      </div>

      {/* Entries */}
      <div style={{ marginTop: 16 }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📝</div>
            <p style={{ fontSize: 13 }}>Your journal entries will appear here</p>
          </div>
        ) : entries.slice(0, 10).map(entry => (
          <div key={entry.id} className="glass-card" style={{ padding: 14, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(entry.date)}</span>
              <span style={{ fontSize: 18 }}>{entry.mood}</span>
            </div>
            {entry.text && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{entry.text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
