'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
const quickReplies = ['Fitment help', 'Stock & price', 'Booking help'];

type Message = {
  id: string;
  sender_type: 'customer' | 'admin';
  customer_name: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};
type Thread = { thread_id: string; access_token: string };

function readThread(): Thread | null {
  try {
    const value = window.localStorage.getItem(threadStorageKey);
    return value ? (JSON.parse(value) as Thread) : null;
  } catch {
    return null;
  }
}

function saveThread(value: Thread) {
  try { window.localStorage.setItem(threadStorageKey, JSON.stringify(value)); } catch { /* optional storage */ }
}

function clearThread() {
  try { window.localStorage.removeItem(threadStorageKey); } catch { /* optional storage */ }
}

function time(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CustomerMessageBox() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Parts enquiry');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const loadThread = useCallback(async (current: Thread) => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/api/v1/messages/thread?thread_id=${encodeURIComponent(current.thread_id)}&access_token=${encodeURIComponent(current.access_token)}`, { cache: 'no-store' });
      if (response.status === 404) {
        clearThread();
        setThread(null);
        setMessages([]);
        setError('This conversation has expired. Start a new message below.');
        return;
      }
      if (!response.ok) return;
      const payload = await response.json() as { data?: Message[] };
      setMessages(payload.data ?? []);
    } catch {
      // Keep the composer usable if a background refresh fails.
    }
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setError('');
    setSent(false);
    if (!apiUrl) {
      setError('Messaging is temporarily unavailable. Please try again shortly.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      const body = thread
        ? { ...thread, message: draft.trim() }
        : { customer_name: name.trim(), customer_email: email.trim(), customer_phone: phone.trim(), subject: subject.trim(), message: draft.trim() };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { thread_id?: string; access_token?: string; message?: Message }; error?: { message?: string } };
      if (response.status === 404 && thread) {
        clearThread();
        setThread(null);
        setMessages([]);
        setError('This conversation has expired. Please send your message again.');
        return;
      }
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? 'Your message could not be sent.');
      if (!thread && payload.data.thread_id && payload.data.access_token) {
        const next = { thread_id: payload.data.thread_id, access_token: payload.data.access_token };
        saveThread(next);
        setThread(next);
      }
      if (payload.data.message) setMessages((current) => [...current, payload.data!.message!]);
      setDraft('');
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your message could not be sent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="aw-message-page" aria-labelledby="aw-message-title">
      <style>{`
        /* ফন্ট ইমপোর্ট */
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

        .aw-message-page { min-height: calc(100vh - 125px); color: #111; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .aw-message-shell { width: min(760px, 100%); min-height: calc(100vh - 125px); margin: 0 auto; padding: 34px 24px 26px; display: flex; flex-direction: column; }
        .aw-message-profile { display: flex; align-items: center; gap: 12px; padding-bottom: 22px; border-bottom: 1px solid #ededed; }
        .aw-message-avatar, .aw-message-row-avatar { display: grid; place-items: center; border-radius: 50%; color: #fff; background: #111; font-weight: 800; }
        .aw-message-avatar { width: 40px; height: 40px; flex: 0 0 40px; font-size: 10px; letter-spacing: -.04em; }
        .aw-message-profile-copy { display: grid; gap: 4px; min-width: 0; }
        .aw-message-profile-copy strong { font-size: 14px; letter-spacing: -.03em; }
        .aw-message-profile-copy span { color: #888; font-size: 10px; }
        .aw-message-status { display: inline-flex; align-items: center; gap: 6px; }
        .aw-message-status:before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #111; }
        .aw-message-id { margin-left: auto; padding: 0; border: 0; color: #777; background: transparent; font: 9px 'DM Mono', monospace; cursor: pointer; }
        .aw-message-id:hover { color: #111; text-decoration: underline; text-underline-offset: 4px; }
        
        .aw-message-intro { padding: 64px 0 48px; }
        .aw-message-intro h1 { max-width: 650px; margin: 0; color: #111; font-size: clamp(35px, 6vw, 58px); font-weight: 500; line-height: 1.04; letter-spacing: -.075em; }
        .aw-message-intro p { max-width: 500px; margin: 18px 0 0; color: #777; font-size: 12px; line-height: 1.75; }
        
        .aw-message-thread { flex: 1; display: grid; align-content: start; gap: 20px; min-height: 250px; padding: 0 0 30px; }
        .aw-message-row { display: flex; align-items: flex-end; gap: 9px; max-width: 620px; }
        .aw-message-row.customer { justify-self: end; flex-direction: row-reverse; }
        .aw-message-row.admin { justify-self: start; }
        .aw-message-row-avatar { width: 24px; height: 24px; flex: 0 0 24px; font-size: 7px; }
        .aw-message-row.customer .aw-message-row-avatar { color: #111; background: #e8e8e8; }
        .aw-message-bubble { padding: 0; color: #222; background: transparent; font-size: 13px; line-height: 1.7; }
        .aw-message-row.customer .aw-message-bubble { max-width: min(480px, 78vw); padding: 13px 16px; border-radius: 16px 16px 3px 16px; color: #fff; background: #111; }
        .aw-message-bubble p { margin: 0; white-space: pre-wrap; }
        .aw-message-bubble time { display: block; margin-top: 5px; color: #999; font: 8px 'DM Mono', monospace; }
        .aw-message-row.customer .aw-message-bubble time { color: #aaa; }
        
        /* টাইপিং ইন্ডিকেটর অ্যানিমেশন */
        .aw-message-typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; background: #f4f4f4; border-radius: 16px 16px 16px 3px; width: fit-content; margin-top: 5px; }
        .aw-message-typing span { width: 6px; height: 6px; background: #888; border-radius: 50%; animation: typingBounce 1.4s infinite ease-in-out both; }
        .aw-message-typing span:nth-child(1) { animation-delay: -0.32s; }
        .aw-message-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingBounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

        .aw-message-empty { display: flex; align-items: center; gap: 7px; color: #999; font-size: 11px; }
        .aw-message-empty i { width: 7px; height: 7px; border-radius: 50%; background: #111; opacity: .22; }
        .aw-message-empty i:nth-child(2) { opacity: .48; }
        .aw-message-empty i:nth-child(3) { opacity: .75; }
        .aw-message-quick { display: flex; gap: 18px; overflow-x: auto; margin: 0 0 15px; padding-bottom: 3px; }
        .aw-message-quick button { flex: 0 0 auto; padding: 0 0 4px; border: 0; border-bottom: 1px solid transparent; color: #888; background: transparent; font-size: 10px; cursor: pointer; }
        .aw-message-quick button:hover { border-bottom-color: #111; color: #111; }
        
        .aw-message-form { padding-top: 16px; border-top: 1px solid #ededed; }
        .aw-message-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 17px; }
        .aw-message-field { display: grid; gap: 5px; }
        .aw-message-field label { color: #999; font: 8px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
        .aw-message-field input, .aw-message-compose textarea { width: 100%; border: 0; outline: 0; color: #111; background: transparent; font: inherit; font-size: 11px; }
        .aw-message-field input { padding: 7px 0; border-bottom: 1px solid #cfcfcf; }
        .aw-message-field input:focus { border-bottom-color: #111; }
        .aw-message-compose { display: flex; align-items: end; gap: 15px; padding: 10px 0; border-bottom: 1px solid #cfcfcf; }
        .aw-message-compose:focus-within { border-bottom-color: #111; }
        .aw-message-compose textarea { min-height: 42px; max-height: 120px; resize: vertical; line-height: 1.5; }
        .aw-message-send { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 38px; border: 0; border-radius: 50%; color: #fff; background: #111; font-size: 20px; line-height: 1; cursor: pointer; }
        .aw-message-send:hover { background: #333; }
        .aw-message-send:disabled { cursor: wait; opacity: .45; }
        .aw-message-note, .aw-message-error, .aw-message-success { margin: 10px 0 0; font-size: 10px; }
        .aw-message-note { color: #aaa; text-align: center; }
        .aw-message-error { color: #111; }
        .aw-message-success { color: #555; }
        
        @media (max-width: 620px) { 
          .aw-message-shell { padding: 24px 16px 20px; } 
          .aw-message-id { max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } 
          .aw-message-intro { padding: 48px 0 35px; } 
          .aw-message-intro h1 { font-size: 38px; } 
          .aw-message-details { grid-template-columns: 1fr 1fr; gap: 10px 14px; } 
          .aw-message-row { max-width: 94%; } 
          .aw-message-row.customer .aw-message-bubble { max-width: 82vw; } 
        }
      `}</style>

      <div className="aw-message-shell">
        <header className="aw-message-profile">
          <span className="aw-message-avatar">AW</span>
          <div className="aw-message-profile-copy">
            <strong>Al Waha Parts</strong>
            <span className="aw-message-status">Parts desk · usually replies within one business day</span>
          </div>
          {thread && (
            <button className="aw-message-id" type="button" title="Your private conversation ID" onClick={() => navigator.clipboard?.writeText(thread.thread_id)}>
              AW-{thread.thread_id.slice(0, 8).toUpperCase()}
            </button>
          )}
        </header>

        {!thread && (
          <section className="aw-message-intro">
            <h1 id="aw-message-title">How can we help with your car?</h1>
            <p>Tell us the vehicle brand, model and year, then describe the part you need. Our parts desk will reply in this private conversation.</p>
          </section>
        )}

        <section className="aw-message-thread" aria-live="polite">
          {messages.length ? (
            messages.map((item) => (
              <article className={`aw-message-row ${item.sender_type}`} key={item.id}>
                <span className="aw-message-row-avatar">{item.sender_type === 'admin' ? 'AW' : 'YOU'}</span>
                <div className="aw-message-bubble">
                  <p>{item.message}</p>
                  <time>{time(item.created_at)}</time>
                </div>
              </article>
            ))
          ) : (
            !loading && <div className="aw-message-empty"><i /><i /><i /><span>{thread ? 'Your reply will appear here.' : 'Start a conversation with our parts desk below.'}</span></div>
          )}

          {/* টাইপিং ইন্ডিকেটর (লোড হওয়ার সময়) */}
          {loading && (
            <div className="aw-message-row admin">
              <span className="aw-message-row-avatar">AW</span>
              <div className="aw-message-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </section>

        {thread && (
          <div className="aw-message-quick" aria-label="Quick replies">
            {quickReplies.map((item) => (
              <button key={item} type="button" onClick={() => setDraft(item === 'Fitment help' ? 'Please help me find the right part for my car.' : item === 'Stock & price' ? 'Please check stock and price for this part.' : 'I need help with a booking.')}>
                {item}
              </button>
            ))}
          </div>
        )}

        <form className="aw-message-form" onSubmit={submit}>
          {!thread && (
            <div className="aw-message-details">
              <div className="aw-message-field">
                <label htmlFor="aw-name">Name</label>
                <input id="aw-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Your name" />
              </div>
              <div className="aw-message-field">
                <label htmlFor="aw-email">Email</label>
                <input id="aw-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="Optional" />
              </div>
              <div className="aw-message-field">
                <label htmlFor="aw-phone">Phone</label>
                <input id="aw-phone" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} placeholder="Optional" />
              </div>
              <div className="aw-message-field">
                <label htmlFor="aw-subject">Subject</label>
                <input id="aw-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="Parts enquiry" />
              </div>
            </div>
          )}
          
          <div className="aw-message-compose">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} required maxLength={4000} rows={1} placeholder={thread ? 'Write a reply…' : 'Write your message…'} />
            <button className="aw-message-send" type="submit" disabled={loading} aria-label="Send message">
              {loading ? '…' : '↑'}
            </button>
          </div>
          
          {error && <p className="aw-message-error" role="alert">{error}</p>}
          {sent && !error && <p className="aw-message-success" role="status">Message sent. We will reply here.</p>}
          <p className="aw-message-note">Please verify vehicle and part details before ordering.</p>
        </form>
      </div>
    </section>
  );
}
