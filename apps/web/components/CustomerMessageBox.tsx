'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
type Message = { id: string; sender_type: 'customer' | 'admin'; customer_name: string; subject: string; message: string; status: string; created_at: string };
type ThreadState = { thread_id: string; access_token: string };

function readThread(): ThreadState | null {
  try { const raw = window.localStorage.getItem(threadStorageKey); return raw ? JSON.parse(raw) as ThreadState : null; } catch { return null; }
}
function saveThread(thread: ThreadState) { try { window.localStorage.setItem(threadStorageKey, JSON.stringify(thread)); } catch { /* storage is optional */ } }
function clearThread() { try { window.localStorage.removeItem(threadStorageKey); } catch { /* storage is optional */ } }
function shortThreadId(value: string) { return `AW-${value.slice(0, 8).toUpperCase()}`; }

export function CustomerMessageBox() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const [thread, setThread] = useState<ThreadState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Parts enquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadThread = useCallback(async (current: ThreadState) => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/api/v1/messages/thread?thread_id=${encodeURIComponent(current.thread_id)}&access_token=${encodeURIComponent(current.access_token)}`, { cache: 'no-store' });
      if (response.status === 404) {
        clearThread();
        setThread(null);
        setMessages([]);
        setError('This conversation has expired. You can start a new message below.');
        return;
      }
      if (!response.ok) return;
      const payload = await response.json() as { data?: Message[] };
      setMessages(payload.data ?? []);
    } catch { /* do not interrupt message writing when polling fails */ }
  }, [apiUrl]);

  useEffect(() => {
    const current = readThread();
    if (!current) return;
    setThread(current);
    void loadThread(current);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadThread(current);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadThread]);

  async function copyThreadId() {
    if (!thread) return;
    try {
      await navigator.clipboard.writeText(thread.thread_id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setError('Copy failed. Please select the conversation ID manually.'); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSent(false);
    if (!apiUrl) { setError('Messaging is temporarily unavailable. Please try again shortly.'); return; }
    setLoading(true);
    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      const body = thread ? { ...thread, message } : { customer_name: name, customer_email: email, customer_phone: phone, subject, message };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { thread_id?: string; access_token?: string; message?: Message }; error?: { message?: string } };
      if (response.status === 404 && thread) {
        clearThread();
        setThread(null);
        setMessages([]);
        setError('This conversation has expired. Please send your message again to start a new thread.');
        return;
      }
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? 'Your message could not be sent.');
      if (!thread && payload.data.thread_id && payload.data.access_token) {
        const nextThread = { thread_id: payload.data.thread_id, access_token: payload.data.access_token };
        saveThread(nextThread);
        setThread(nextThread);
      }
      if (payload.data.message) setMessages((current) => [...current, payload.data!.message!]);
      setMessage('');
      setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your message could not be sent.'); }
    finally { setLoading(false); }
  }

  return (
    <section className="aw-messenger-container" aria-labelledby="customer-message-title">
      
      {/* Minimal Header */}
      <header className="aw-messenger-header">
        <div className="aw-avatar">🤖</div>
        <div className="aw-header-info">
          <strong>Al Waha Parts</strong>
          <span>Usually replies within one business day</span>
        </div>
        {thread ? (
          <button className="aw-thread-id" type="button" onClick={() => void copyThreadId()} title="Copy private thread ID">
            <small>{copied ? 'Copied' : 'Chat ID'}</small>
            <b>{shortThreadId(thread.thread_id)}</b>
          </button>
        ) : (
          <span className="aw-secure-badge">Private chat</span>
        )}
      </header>

      {/* Main Chat Area */}
      <div className="aw-messenger-body">
        {!thread && (
          <div className="aw-welcome">
            <div className="aw-welcome-icon">👋</div>
            <h2 id="customer-message-title">Hey, I'm Al Waha AI.<br/>What do you want me to help you with?</h2>
            <p>Tell our parts desk who you are and what you need. Your private conversation ID will be created automatically.</p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="aw-chat-thread" aria-live="polite">
            {messages.map((item) => (
              <article className={`aw-message-row ${item.sender_type}`} key={item.id}>
                {item.sender_type === 'admin' && <div className="aw-msg-avatar">AW</div>}
                <div className="aw-msg-content">
                  <p>{item.message}</p>
                  <time>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Quick Replies */}
        {thread && (
          <div className="aw-quick-replies">
            <button type="button" onClick={() => setMessage('Please help me find the right part for my car.')}>Fitment help</button>
            <button type="button" onClick={() => setMessage('Please check stock and price for this part.')}>Stock & price</button>
            <button type="button" onClick={() => setMessage('I need help with a booking.')}>Booking help</button>
          </div>
        )}

        {/* Input Form */}
        <form className="aw-input-form" onSubmit={submit}>
          
          {/* Initial Details Form (Only shows if thread is null) */}
          {!thread && (
            <div className="aw-initial-fields">
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} placeholder="Your name" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} placeholder="Email (optional)" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="Phone number (optional)" />
              <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} placeholder="Subject" />
            </div>
          )}

          <div className="aw-input-wrapper">
            <textarea 
              value={message} 
              onChange={(event) => setMessage(event.target.value)} 
              required 
              maxLength={4000} 
              rows={1} 
              placeholder="Reply...." 
              className="aw-textarea"
            />
            <div className="aw-input-actions">
              <div className="aw-icons-left">
                <button type="button" className="aw-icon-btn">+</button>
                <button type="button" className="aw-icon-btn">🎤</button>
              </div>
              <button className="aw-send-btn" type="submit" disabled={loading}>
                {loading ? '...' : '↑'}
              </button>
            </div>
          </div>

          {error && <p className="aw-error-text" role="alert">{error}</p>}
          {sent && !error && <p className="aw-success-text" role="status">Message sent.</p>}
          
          <div className="aw-footer-info">
            <small>Derez may make mistakes. Verify info.</small>
          </div>
        </form>
      </div>
    </section>
  );
}
//
