'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
const quickReplies = ['Fitment help', 'Stock & price', 'Booking help', 'Track Order'];

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

        /* গ্লোবাল সেটআপ */
        .aw-message-page { 
          min-height: 100vh; 
          color: #111; 
          background: #fafafa; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        /* ফ্লোটিং কন্টেইনার */
        .aw-message-shell { 
          width: min(760px, 100%); 
          min-height: calc(100vh - 40px);
          max-height: 90vh;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.06), 0 4px 20px rgba(0,0,0,0.03); 
          margin: 0 auto; 
          padding: 32px 28px 24px; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden;
          border: 1px solid #f0f0f0;
          animation: shellEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes shellEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* হেডার */
        .aw-message-profile { 
          display: flex; 
          align-items: center; 
          gap: 14px; 
          padding-bottom: 20px; 
          border-bottom: 1px solid #f5f5f5; 
        }
        .aw-message-avatar, .aw-message-row-avatar { 
          display: grid; 
          place-items: center; 
          border-radius: 50%; 
          color: #fff; 
          background: linear-gradient(135deg, #111, #333); 
          font-weight: 700; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .aw-message-avatar { width: 44px; height: 44px; flex: 0 0 44px; font-size: 11px; }
        .aw-message-profile-copy { display: grid; gap: 3px; min-width: 0; }
        .aw-message-profile-copy strong { font-size: 15px; letter-spacing: -.02em; font-weight: 600; color: #111; }
        .aw-message-profile-copy span { color: #888; font-size: 11px; }
        .aw-message-status { display: inline-flex; align-items: center; gap: 6px; }
        .aw-message-status:before { 
          content: ''; 
          width: 7px; 
          height: 7px; 
          border-radius: 50%; 
          background: #111; 
          box-shadow: 0 0 0 3px rgba(0,0,0,0.08); 
          animation: statusPulse 2s infinite;
        }
        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.2); }
          70% { box-shadow: 0 0 0 6px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        
        .aw-message-id { 
          margin-left: auto; 
          padding: 8px 14px; 
          border-radius: 20px;
          border: 1px solid #e5e5e5;
          color: #666; 
          background: #fafafa; 
          font: 10px 'DM Mono', monospace; 
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .aw-message-id:hover { color: #fff; border-color: #111; background: #111; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateY(-1px); }
        
        /* ইন্ট্রো */
        .aw-message-intro { padding: 40px 0 30px; animation: fadeIn 0.8s ease-out 0.2s both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .aw-message-intro h1 { 
          max-width: 650px; 
          margin: 0; 
          color: #111; 
          font-size: clamp(30px, 5vw, 44px); 
          font-weight: 600; 
          line-height: 1.1; 
          letter-spacing: -.04em; 
        }
        .aw-message-intro p { max-width: 500px; margin: 16px 0 0; color: #777; font-size: 13px; line-height: 1.7; }
        
        /* চ্যাট থ্রেড */
        .aw-message-thread { 
          flex: 1; 
          display: flex; 
          flex-direction: column;
          gap: 20px; 
          overflow-y: auto;
          padding: 10px 10px 20px 10px; 
          scrollbar-width: thin;
        }
        .aw-message-thread::-webkit-scrollbar { width: 5px; }
        .aw-message-thread::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }

        .aw-message-row { 
          display: flex; 
          align-items: flex-end; 
          gap: 12px; 
          max-width: 80%; 
          animation: messageSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes messageSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aw-message-row.customer { align-self: flex-end; flex-direction: row-reverse; }
        .aw-message-row.admin { align-self: flex-start; }
        
        .aw-message-row-avatar { width: 28px; height: 28px; flex: 0 0 28px; font-size: 8px; }
        .aw-message-row.customer .aw-message-row-avatar { color: #111; background: #f0f0f0; box-shadow: none; }
        
        /* মেসেজ বাবল */
        .aw-message-bubble { padding: 0; color: #222; background: transparent; font-size: 14px; line-height: 1.6; }
        .aw-message-row.admin .aw-message-bubble {
          padding: 14px 20px; 
          border-radius: 24px 24px 24px 4px; 
          background: #f8f8f8; 
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .aw-message-row.customer .aw-message-bubble { 
          padding: 14px 20px; 
          border-radius: 24px 24px 4px 24px; 
          color: #fff; 
          background: #111; 
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
        
        /* কুইক রিপ্লাই (শর্টকাট) */
        .aw-message-quick { display: flex; gap: 10px; overflow-x: auto; margin: 0 0 12px; padding: 4px 0; scrollbar-width: none; }
        .aw-message-quick::-webkit-scrollbar { display: none; }
        .aw-message-quick button { 
          flex: 0 0 auto; 
          padding: 8px 16px; 
          border-radius: 20px; 
          border: 1px solid #e5e5e5; 
          color: #444; 
          background: #f8f8f8; 
          font-size: 12px; 
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .aw-message-quick button:hover { border-color: #111; color: #fff; background: #111; box-shadow: 0 6px 15px rgba(0,0,0,0.1); transform: translateY(-2px); }
        
        /* ফর্ম সেকশন */
        .aw-message-form { padding-top: 10px; }
        
        /* ডিটেইলস ফিল্ড */
        .aw-message-details { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 16px; 
          margin-bottom: 24px; 
        }
        .aw-message-field { 
          display: flex; 
          flex-direction: column;
          gap: 8px; 
          background: #fafafa;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid #eaeaea;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }
        .aw-message-field::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #111;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: left;
        }
        .aw-message-field:focus-within { 
          background: #fff; 
          border-color: transparent; 
          box-shadow: 0 8px 25px rgba(0,0,0,0.06); 
          transform: translateY(-2px);
        }
        .aw-message-field:focus-within::after {
          transform: scaleX(1);
        }
        .aw-message-field label { color: #777; font: 10px 'DM Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
        .aw-message-field input { width: 100%; border: 0; outline: 0; color: #111; background: transparent; font: inherit; font-size: 14px; font-weight: 500; }
        .aw-message-field input::placeholder { font-weight: 400; color: #bbb; }
        
        /* মেইন কম্পোজ বক্স (কালো এবং উন্নত ডিজাইন) */
        .aw-message-compose-wrapper {
          background: #0a0a0a; /* একদম কালো */
          border-radius: 24px;
          padding: 10px 14px;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid #222;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .aw-message-compose-wrapper:focus-within {
          border-color: #444;
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        }
        
        .aw-message-icon-btn {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: #888; /* ডার্ক বক্সের জন্য হালকা ধূসর আইকন */
          font-size: 20px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
          flex: 0 0 36px;
        }
        .aw-message-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        
        .aw-message-compose textarea { 
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          font-size: 14px;
          color: #fff; /* সাদা টেক্সট */
          min-height: 24px; 
          max-height: 120px; 
          resize: none; 
          line-height: 1.5; 
          padding: 8px 0;
          scrollbar-width: none;
        }
        .aw-message-compose textarea::placeholder { color: #666; } /* গাঢ় ধূসর প্লেসহোল্ডার */
        
        /* সেন্ড বাটন (সাদা) */
        .aw-message-send { 
          display: grid; 
          place-items: center; 
          width: 40px; 
          height: 40px; 
          flex: 0 0 40px; 
          border: 0; 
          border-radius: 50%; 
          color: #111; /* কালো আইকন */
          background: #ffffff; /* সাদা বাটন */
          font-size: 18px; 
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 15px rgba(255,255,255,0.1);
          margin-left: auto;
        }
        .aw-message-send:hover:not(:disabled) { background: #e0e0e0; transform: scale(1.08) translateY(-2px); }
        .aw-message-send:active:not(:disabled) { transform: scale(0.95); }
        .aw-message-send:disabled { cursor: not-allowed; opacity: .4; box-shadow: none; }
        
        /* স্টেটাস টেক্সট */
        .aw-message-note, .aw-message-error, .aw-message-success { margin: 16px 0 0; font-size: 11px; text-align: center; transition: all 0.3s ease; }
        .aw-message-note { color: #999; }
        .aw-message-error { color: #111; font-weight: 600; background: #f0f0f0; padding: 8px; border-radius: 8px; }
        .aw-message-success { color: #555; background: #f8f8f8; padding: 8px; border-radius: 8px; }
        
        @media (max-width: 620px) { 
          .aw-message-page { padding: 0; }
          .aw-message-shell { border-radius: 0; min-height: 100vh; max-height: 100vh; padding: 20px 16px; border: none; box-shadow: none; } 
          .aw-message-id { display: none; } 
          .aw-message-intro { padding: 20px 0; } 
          .aw-message-intro h1 { font-size: 30px; } 
          .aw-message-details { grid-template-columns: 1fr; gap: 12px; } 
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
              <button key={item} type="button" onClick={() => setDraft(item === 'Fitment help' ? 'Please help me find the right part for my car.' : item === 'Stock & price' ? 'Please check stock and price for this part.' : item === 'Booking help' ? 'I need help with a booking.' : 'Can you help me track my order?')}>
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
          
          {/* কালো কম্পোজ বক্স */}
          <div className="aw-message-compose-wrapper">
            <button type="button" className="aw-message-icon-btn" aria-label="Add attachment">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button type="button" className="aw-message-icon-btn" aria-label="Voice message">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </button>
            
            <textarea 
              value={draft} 
              onChange={(event) => setDraft(event.target.value)} 
              required 
              maxLength={4000} 
              rows={1} 
              placeholder={thread ? 'Reply....' : 'Write your message...'} 
            />
            
            <button className="aw-message-send" type="submit" disabled={loading} aria-label="Send message">
              {loading ? '...' : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              )}
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
