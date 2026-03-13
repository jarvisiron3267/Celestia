'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { signs } from '@/lib/data';
import { store } from '@/lib/store';
import { sanitizeForDisplay } from '@/lib/sanitize';

interface ChatMessage {
  role: 'user' | 'bot' | 'error';
  content: string;
  id: string;
  retryPayload?: string;
}

interface AstroChatProps {
  signIdx: number;
  onXP: (amount: number) => void;
}

export default function AstroChat({ signIdx, onXP }: AstroChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sign = signs[signIdx];

  useEffect(() => {
    const saved = store.get<ChatMessage[]>('chatHistory_v2', []);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const welcome: ChatMessage = {
        role: 'bot',
        content: `✨ Greetings, dear ${sign.name}... I am Luna, your cosmic guide. The ${sign.element} energy flows through you tonight. Ask me anything about love, destiny, your stars, or whatever weighs on your heart. I'm here. 🌙`,
        id: 'welcome',
      };
      setMessages([welcome]);
    }
  }, [sign.name, sign.element]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveMessages = useCallback((msgs: ChatMessage[]) => {
    store.set('chatHistory_v2', msgs.slice(-50));
  }, []);

  const sendToLuna = useCallback(async (text: string, retryMsgId?: string) => {
    const sanitized = sanitizeForDisplay(text);
    if (!sanitized.trim()) return;

    // Remove error message if retrying
    let current = [...messages];
    if (retryMsgId) {
      current = current.filter(m => m.id !== retryMsgId);
    }

    const userMsg: ChatMessage = {
      role: 'user', content: sanitized,
      id: Date.now().toString(),
    };

    if (!retryMsgId) {
      current = [...current, userMsg];
    }
    setMessages(current);
    setLoading(true);
    onXP(5);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const apiMessages = current
        .filter(m => m.role !== 'error')
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

      const res = await fetch('/api/astro-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiMessages,
          birthData: { sign: sign.name, element: sign.element, quality: sign.quality },
        }),
      });

      clearTimeout(timeout);
      const data = await res.json();

      if (data.content) {
        const botMsg: ChatMessage = {
          role: 'bot', content: data.content,
          id: (Date.now() + 1).toString(),
        };
        const updated = [...current, botMsg];
        setMessages(updated);
        saveMessages(updated);
      } else {
        throw new Error(data.error || 'No response');
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      const errMsg = err instanceof Error && err.name === 'AbortError'
        ? 'Luna is consulting the stars... the cosmic connection timed out. Please try again. 🌌'
        : 'Luna is consulting the stars... please try again in a moment. ✨';

      const errorChat: ChatMessage = {
        role: 'error', content: errMsg,
        id: 'err_' + Date.now(),
        retryPayload: sanitized,
      };
      const updated = [...current, errorChat];
      setMessages(updated);
      saveMessages(updated);
    } finally {
      setLoading(false);
    }
  }, [messages, sign, onXP, saveMessages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    sendToLuna(text);
  };

  const handleRetry = (msg: ChatMessage) => {
    if (msg.retryPayload) {
      sendToLuna(msg.retryPayload, msg.id);
    }
  };

  const quickPrompts = ['How is my day?', 'Love advice', 'My strengths', 'Lucky numbers', 'Career guidance'];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--nav-h) - 100px)', minHeight: 400 }}>
      <div style={{ padding: '0 0 12px' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,5.5vw,30px)', fontWeight: 600 }}>
          Luna ✨
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Your mystical AI astrologer</p>
      </div>

      {/* Quick prompts */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {quickPrompts.map(q => (
          <button key={q} onClick={() => { setInput(''); sendToLuna(q); }}
            style={{
              padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(255,255,255,.08)',
              background: 'transparent', color: 'var(--text2)', fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {messages.map(msg => (
          <div key={msg.id}>
            <div className={`chat-msg ${msg.role}`}>
              {msg.content}
            </div>
            {msg.role === 'error' && msg.retryPayload && (
              <button onClick={() => handleRetry(msg)} style={{
                marginTop: 6, padding: '6px 14px', borderRadius: 100,
                border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.08)',
                color: '#f87171', fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>
                ↻ Try again
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-skeleton">
            <div className="skeleton-line" style={{ width: '80%' }} />
            <div className="skeleton-line" style={{ width: '60%' }} />
            <div className="skeleton-line" style={{ width: '40%' }} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask the cosmos..."
            style={{
              flex: 1, background: 'rgba(14,14,40,.5)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 100, padding: '11px 18px', color: 'var(--text)',
              fontFamily: "'Inter',sans-serif", fontSize: 13.5, outline: 'none',
            }}
          />
          <button onClick={handleSend} disabled={loading} style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,var(--accent2),var(--accent3))',
            border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.5 : 1,
          }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
