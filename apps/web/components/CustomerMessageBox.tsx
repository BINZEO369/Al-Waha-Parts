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

        /* গ্লোবাল সেটআপ এবং লিকুইড ক্যানভাস */
        .aw-message-page { 
          min-height: 100vh; 
          color: #111; 
          background: #f7f7f7; /* হালকা ধূসর ব্যাকগ্রাউন্ড */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        /* মেইন কন্টেইনার - একটি ফ্লোটিং কার্ডের মতো */
        .aw-message-shell { 
          width: min(760px, 100%); 
          min-height: calc(100vh - 40px);
          max-height: 90vh;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0,0,0,0.03); /* সফট লিকুইড শ্যাডো */
          margin: 0 auto; 
          padding: 34px 28px 26px; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }

        /* হেডার */
        .aw-message-profile { 
          display: flex; 
          align-items: center; 
          gap: 14px; 
          padding-bottom: 24px; 
          border-bottom: 1px solid #f5f5f5; 
        }
        .aw-message-avatar, .aw-message-row-avatar { 
          display: grid; 
          place-items: center; 
          border-radius: 50%; 
          color: #fff; 
          background: linear-gradient(135deg, #111, #333); /* স্মুথ কালো গ্রেডিয়েন্ট */
          font-weight: 700; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .aw-message-avatar { width: 44px; height: 44px; flex: 0 0 44px; font-size: 11px; }
        .aw-message-profile-copy { display: grid; gap: 3px; min-width: 0; }
        .aw-message-profile-copy strong { font-size: 15px; letter-spacing: -.02em; font-weight: 600; }
        .aw-message-profile-copy span { color: #888; font-size: 11px; }
        .aw-message-status { display: inline-flex; align-items: center; gap: 6px; }
        .aw-message-status:before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.1); }
        
        .aw-message-id { 
          margin-left: auto; 
          padding: 6px 12px; 
          border-radius: 20px;
          border: 1px solid #eee;
          color: #666; 
          background: #fafafa; 
          font: 10px 'DM Mono', monospace; 
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .aw-message-id:hover { color: #111; border-color: #ccc; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        
        /* ইন্ট্রো সেকশন */
        .aw-message-intro { padding: 50px 0 40px; }
        .aw-message-intro h1 { 
          max-width: 650px; 
          margin: 0; 
          color: #111; 
          font-size: clamp(32px, 5vw, 48px); 
          font-weight: 500; 
          line-height: 1.1; 
          letter-spacing: -.04em; 
        }
        .aw-message-intro p { max-width: 500px; margin: 16px 0 0; color: #777; font-size: 13px; line-height: 1.7; }
        
        /* চ্যাট থ্রেড */
        .aw-message-thread { 
          flex: 1; 
          display: flex; 
          flex-direction: column;
          gap: 24px; 
          overflow-y: auto;
          padding: 10px 10px 30px 10px; 
          scrollbar-width: thin;
        }
        .aw-message-thread::-webkit-scrollbar { width: 4px; }
        .aw-message-thread::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

        .aw-message-row { display: flex; align-items: flex-end; gap: 12px; max-width: 80%; }
        .aw-message-row.customer { align-self: flex-end; flex-direction: row-reverse; }
        .aw-message-row.admin { align-self: flex-start; }
        
        .aw-message-row-avatar { width: 28px; height: 28px; flex: 0 0 28px; font-size: 8px; }
        .aw-message-row.customer .aw-message-row-avatar { color: #111; background: #f0f0f0; box-shadow: none; }
        
        /* মেসেজ বাবল - লিকুইড এবং স্মুথ */
        .aw-message-bubble { 
          padding: 0; 
          color: #222; 
          background: transparent; 
          font-size: 14px; 
          line-height: 1.6; 
        }
        .aw-message-row.admin .aw-message-bubble {
          padding: 14px 20px; 
          border-radius: 24px 24px 24px 4px; 
          background: #f8f8f8; /* সাদার উপর হালকা ধূসর */
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .aw-message-row.customer .aw-message-bubble { 
          padding: 14px 20px; 
          border-radius: 24px 24px 4px 24px; 
          color: #fff; 
          background: #111; /* সলিড ব্ল্যাক */
          box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
        }
        .aw-message-bubble p { margin: 0; white-space: pre-wrap; }
        .aw-message-bubble time { display: block; margin-top: 6px; color: #999; font: 9px 'DM Mono', monospace; }
        .aw-message-row.customer .aw-message-bubble time { color: rgba(255,255,255,0.6); text-align: right; }
        
        /* টাইপিং ইন্ডিকেটর */
        .aw-message-typing { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 16px 22px; 
          background: #f8f8f8; 
          border: 1px solid #f0f0f0;
          border-radius: 24px 24px 24px 4px; 
          width: fit-content; 
        }
        .aw-message-typing span { width: 7px; height: 7px; background: #111; border-radius: 50%; animation: typingBounce 1.4s infinite ease-in-out both; opacity: 0.3; }
        .aw-message-typing span:nth-child(1) { animation-delay: -0.32s; }
        .aw-message-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingBounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }

        .aw-message-empty { display: flex; align-items: center; gap: 8px; color: #999; font-size: 12px; margin: auto; }
        
        /* কুইক রিপ্লাই বাটন */
        .aw-message-quick { display: flex; gap: 10px; overflow-x: auto; margin: 0 0 16px; padding: 4px 0; }
        .aw-message-quick button { 
          flex: 0 0 auto; 
          padding: 8px 16px; 
          border-radius: 20px; 
          border: 1px solid #e5e5e5; 
          color: #555; 
          background: #fff; 
          font-size: 11px; 
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .aw-message-quick button:hover { border-color: #111; color: #fff; background: #111; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transform: translateY(-1px); }
        
        /* ফর্ম সেকশন */
        .aw-message-form { padding-top: 10px; }
        
        /* ডিটেইলস ফিল্ড (নেম, ইমেইল ইত্যাদি) */
        .aw-message-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .aw-message-field { 
          display: grid; 
          gap: 6px; 
          background: #fafafa;
          padding: 10px 14px;
          border-radius: 16px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .aw-message-field:focus-within { background: #fff; border-color: #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .aw-message-field label { color: #888; font: 9px 'DM Mono', monospace; letter-spacing: .05em; text-transform: uppercase; }
        .aw-message-field input { width: 100%; border: 0; outline: 0; color: #111; background: transparent; font: inherit; font-size: 13px; font-weight: 500; }
        .aw-message-field input::placeholder { font-weight: 400; color: #aaa; }
        
        /* কম্পোজ বক্স (ছবির মতো স্মুথ ইনপুট) */
        .aw-message-compose { 
          display: flex; 
          align-items: flex-end; 
          gap: 12px; 
          padding: 14px 16px; 
          background: #f4f4f4; /* ছবির মতো হালকা ধূসর */
          border-radius: 24px; 
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid transparent;
        }
        .aw-message-compose:focus-within { 
          background: #fff; 
          border-color: #ddd; 
          box-shadow: 0 8px 25px rgba(0,0,0,0.06); 
        }
        .aw-message-compose textarea { 
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          font-size: 14px;
          color: #111;
          min-height: 24px; 
          max-height: 120px; 
          resize: none; 
          line-height: 1.5; 
          padding: 6px 0;
          scrollbar-width: none;
        }
        .aw-message-compose textarea::placeholder { color: #999; }
        
        /* সেন্ড বাটন */
        .aw-message-send { 
          display: grid; 
          place-items: center; 
          width: 40px; 
          height: 40px; 
          flex: 0 0 40px; 
          border: 0; 
          border-radius: 50%; 
          color: #fff; 
          background: #111; 
          font-size: 18px; 
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .aw-message-send:hover:not(:disabled) { background: #333; transform: scale(1.05); }
        .aw-message-send:disabled { cursor: not-allowed; opacity: .4; box-shadow: none; }
        
        /* টেক্সট মেসেজ */
        .aw-message-note, .aw-message-error, .aw-message-success { margin: 14px 0 0; font-size: 11px; text-align: center; }
        .aw-message-note { color: #aaa; }
        .aw-message-error { color: #111; font-weight: 600; }
        .aw-message-success { color: #555; }
        
        @media (max-width: 620px) { 
          .aw-message-page { padding: 0; }
          .aw-message-shell { border-radius: 0; min-height: 100vh; max-height: 100vh; padding: 20px 16px; border: none; box-shadow: none; } 
          .aw-message-id { display: none; } /* মোবাইলে জায়গা বাঁচাতে */
          .aw-message-intro { padding: 30px 0; } 
          .aw-message-intro h1 { font-size: 32px; } 
          .aw-message-details { grid-template-columns: 1fr 1fr; } 
          .aw-message-row { max-width: 90%; } 
          .aw-message-row.customer .aw-message-bubble { max-width: 85vw; } 
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
              ID: AW-{thread.thread_id.slice(0, 8).toUpperCase()}
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
            !loading && <div className="aw-message-empty"><span>{thread ? 'Your reply will appear here.' : 'Start a conversation below.'}</span></div>
          )}

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
            <textarea 
              value={draft} 
              onChange={(event) => setDraft(event.target.value)} 
              required 
              maxLength={4000} 
              rows={1} 
              placeholder={thread ? 'Reply....' : 'Write your message...'} 
            />
            <button className="aw-message-send" type="submit" disabled={loading} aria-label="Send message">
              {loading ? '…' : '↑'}
            </button>
          </div>
          
          {error && <p className="aw-message-error" role="alert">{error}</p>}
          {sent && !error && <p className="aw-message-success" role="status">Message sent. We will reply here.</p>}
          <p className="aw-message-note">Al Waha Parts may make mistakes. Verify info</p>
        </form>
      </div>
    </section>
  );
}
