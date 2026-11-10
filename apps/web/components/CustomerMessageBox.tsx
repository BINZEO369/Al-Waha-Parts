'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

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

  // অটো-রিসাইজিং এবং স্ক্রল করার জন্য রেফ
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // লেখা পরিবর্তন হলে টেক্সটএরিয়ার উচ্চতা অটোমেটিক বাড়বে
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  // নতুন মেসেজ আসলে অটোমেটিক নিচে স্ক্রল হবে
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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
          height: 100vh; 
          width: 100%;
          background: #ffffff; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          display: flex;
          justify-content: center;
        }
        
        /* মেইন চ্যাট কন্টেইনার */
        .aw-message-shell { 
          width: 100%; 
          max-width: 800px; 
          height: 100%;
          display: flex; 
          flex-direction: column; 
          background: #ffffff;
          border-left: 1px solid #f0f0f0;
          border-right: 1px solid #f0f0f0;
        }

        /* -----------------------------
           হেডার (উপরে ফিক্সড)
           ----------------------------- */
        .aw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          background: #ffffff;
          flex-shrink: 0; /* হেডার স্ক্রল হবে না */
          z-index: 10;
        }

        .aw-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aw-avatar {
          width: 40px;
          height: 40px;
          background: #0a0a0a;
          color: #fff;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 13px;
        }

        .aw-header-info h2 {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 2px 0;
          color: #111;
        }

        .aw-header-info p {
          font-size: 12px;
          color: #666;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .aw-status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
        }

        .aw-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aw-btn-copy {
          background: #f4f4f5;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          color: #3f3f46;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          transition: all 0.2s;
        }
        .aw-btn-copy:hover { background: #e4e4e7; color: #111; }

        .aw-close-btn {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 20px;
          display: grid;
          place-items: center;
          padding: 4px;
        }
        .aw-close-btn:hover { color: #111; }

        /* -----------------------------
           মেসেজ এরিয়া (স্ক্রল হবে)
           ----------------------------- */
        .aw-chat-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #fafafa;
        }

        /* ইনিশিয়াল ফর্ম (যখন কোনো চ্যাট থাকে না) */
        .aw-initial-form-container {
          max-width: 480px;
          margin: 40px auto;
          width: 100%;
          background: #fff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f0f0f0;
          animation: fadeIn 0.4s ease;
        }

        .aw-intro-text {
          text-align: center;
          margin-bottom: 24px;
        }
        .aw-intro-text h3 { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #111; }
        .aw-intro-text p { font-size: 13px; color: #666; margin: 0; line-height: 1.5; }

        .aw-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }

        .aw-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .aw-form-group.full-width {
          grid-column: 1 / -1;
        }

        .aw-form-group label {
          font-size: 12px;
          font-weight: 500;
          color: #3f3f46;
        }

        .aw-form-group input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 14px;
          color: #111;
          background: #fafafa;
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }

        .aw-form-group input:focus {
          background: #fff;
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        /* চ্যাট বাবলস */
        .aw-chat-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 80%;
          animation: messageSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes messageSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aw-chat-row.customer { align-self: flex-end; flex-direction: row-reverse; }
        .aw-chat-row.admin { align-self: flex-start; }

        .aw-chat-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 9px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .aw-chat-row.admin .aw-chat-avatar { background: #e4e4e7; color: #111; }
        .aw-chat-row.customer .aw-chat-avatar { background: #0a0a0a; color: #fff; }

        .aw-chat-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .aw-chat-row.admin .aw-chat-bubble {
          background: #ffffff;
          color: #111;
          border-bottom-left-radius: 4px;
          border: 1px solid #e4e4e7;
        }
        .aw-chat-row.customer .aw-chat-bubble {
          background: #0a0a0a;
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        
        .aw-chat-bubble time {
          display: block;
          font-size: 10px;
          margin-top: 6px;
          opacity: 0.6;
          text-align: right;
        }

        /* টাইপিং ইন্ডিকেটর */
        .aw-typing { display: flex; gap: 4px; padding: 14px 18px; background: #fff; border: 1px solid #e4e4e7; border-radius: 18px; width: fit-content; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
        .aw-typing span { width: 6px; height: 6px; background: #a1a1aa; border-radius: 50%; animation: bounce 1.4s infinite both; }
        .aw-typing span:nth-child(2) { animation-delay: 0.2s; }
        .aw-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        /* কুইক রিপ্লাই */
        .aw-quick-replies {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .aw-quick-replies button {
          padding: 6px 14px;
          border: 1px solid #e4e4e7;
          background: #ffffff;
          border-radius: 20px;
          font-size: 12px;
          color: #3f3f46;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aw-quick-replies button:hover {
          background: #0a0a0a;
          color: #fff;
          border-color: #0a0a0a;
        }

        /* -----------------------------
           কম্পোজ বক্স (নিচে ফিক্সড)
           ----------------------------- */
        .aw-composer-area {
          flex-shrink: 0; /* কম্পোজ বক্স স্ক্রল হবে না, নিচে থাকবে */
          padding: 16px 24px 20px;
          background: #ffffff;
          border-top: 1px solid #f0f0f0;
        }

        .aw-compose-box {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: #f4f4f5;
          padding: 10px 16px;
          border-radius: 24px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .aw-compose-box:focus-within {
          background: #ffffff;
          border-color: #d4d4d8;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .aw-compose-icon {
          background: transparent;
          border: none;
          color: #71717a;
          cursor: pointer;
          padding: 8px 0;
          display: grid;
          place-items: center;
        }
        .aw-compose-icon:hover { color: #111; }

        .aw-compose-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 14px;
          color: #111;
          resize: none;
          outline: none;
          min-height: 24px;
          max-height: 150px;
          padding: 6px 0;
          line-height: 1.5;
          scrollbar-width: none; /* ফায়ারফক্স */
        }
        .aw-compose-input::-webkit-scrollbar { display: none; } /* ক্রোম */
        .aw-compose-input::placeholder { color: #a1a1aa; }

        .aw-send-btn {
          background: #0a0a0a;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .aw-send-btn:hover:not(:disabled) {
          background: #27272a;
          transform: scale(1.05);
        }
        .aw-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .aw-footer-note {
          text-align: center;
          font-size: 11px;
          color: #a1a1aa;
          margin-top: 12px;
        }

        /* মেসেজ ফিডব্যাক */
        .aw-msg-feedback { font-size: 12px; margin: 0 0 12px 0; text-align: center; }
        .aw-msg-feedback.error { color: #dc2626; }
        .aw-msg-feedback.success { color: #16a34a; }

        /* -----------------------------
           মোবাইল রেসপন্সিভ 
           ----------------------------- */
        @media (max-width: 768px) { 
          .aw-message-shell { border-left: none; border-right: none; }
          .aw-header { padding: 12px 16px; }
          .aw-btn-copy { display: none; } /* মোবাইলে স্পেস বাঁচাতে */
          .aw-chat-scroll { padding: 16px; }
          .aw-initial-form-container { margin: 20px auto; padding: 24px; box-shadow: none; border: none; background: transparent;}
          .aw-form-grid { grid-template-columns: 1fr; gap: 12px; }
          .aw-composer-area { padding: 12px 16px; }
          .aw-chat-row { max-width: 90%; }
        }
      `}</style>

      <div className="aw-message-shell">
        
        {/* হেডার */}
        <header className="aw-header">
          <div className="aw-header-left">
            <div className="aw-avatar">AW</div>
            <div className="aw-header-info">
              <h2>Al Waha Parts</h2>
              <p><span className="aw-status-dot"></span> Usually replies in 1 day</p>
            </div>
          </div>
          <div className="aw-header-right">
            {thread && (
              <button className="aw-btn-copy" onClick={() => navigator.clipboard?.writeText(thread.thread_id)} title="Copy Chat ID">
                ID: AW-{thread.thread_id.slice(0, 6).toUpperCase()}
              </button>
            )}
            <button className="aw-close-btn" type="button" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </header>

        {/* মেসেজ এরিয়া (স্ক্রল হবে) */}
        <div className="aw-chat-scroll" ref={scrollRef}>
          
          {/* প্রথমবার হলে ফর্ম দেখাবে */}
          {!thread && (
            <div className="aw-initial-form-container">
              <div className="aw-intro-text">
                <h3>How can we help with your car?</h3>
                <p>Fill out your details below to start a secure conversation with our parts desk.</p>
              </div>
              <div className="aw-form-grid">
                <div className="aw-form-group full-width">
                  <label htmlFor="aw-name">Full name</label>
                  <input id="aw-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} placeholder="Your name..." />
                </div>
                <div className="aw-form-group full-width">
                  <label htmlFor="aw-email">Email Address</label>
                  <input id="aw-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} placeholder="you@example.com" />
                </div>
                <div className="aw-form-group">
                  <label htmlFor="aw-phone">Phone</label>
                  <input id="aw-phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="Optional" />
                </div>
                <div className="aw-form-group">
                  <label htmlFor="aw-subject">Subject</label>
                  <input id="aw-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} placeholder="Parts enquiry" />
                </div>
              </div>
            </div>
          )}

          {/* চ্যাট থ্রেড (যদি মেসেজ থাকে) */}
          {thread && messages.map((item) => (
            <div className={`aw-chat-row ${item.sender_type}`} key={item.id}>
              <div className="aw-chat-avatar">
                {item.sender_type === 'admin' ? 'AW' : 'YOU'}
              </div>
              <div className="aw-chat-bubble">
                {item.message}
                <time>{time(item.created_at)}</time>
              </div>
            </div>
          ))}

          {/* কুইক রিপ্লাই (যদি চ্যাট থাকে) */}
          {thread && (
             <div className="aw-quick-replies">
               {quickReplies.map((item) => (
                 <button key={item} type="button" onClick={() => setDraft(item === 'Fitment help' ? 'Please help me find the right part for my car.' : item === 'Stock & price' ? 'Please check stock and price for this part.' : item === 'Booking help' ? 'I need help with a booking.' : 'Can you help me track my order?')}>
                   {item}
                 </button>
               ))}
             </div>
          )}

          {/* টাইপিং ইন্ডিকেটর */}
          {loading && (
            <div className="aw-chat-row admin">
              <div className="aw-chat-avatar">AW</div>
              <div className="aw-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        {/* কম্পোজ বক্স (নিচে ফিক্সড) */}
        <footer className="aw-composer-area">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {error && <p className="aw-msg-feedback error">{error}</p>}
            {sent && !error && <p className="aw-msg-feedback success">Message sent successfully.</p>}

            <div className="aw-compose-box">
              <button type="button" className="aw-compose-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              
              <textarea 
                className="aw-compose-input"
                ref={textareaRef}
                value={draft} 
                onChange={(event) => setDraft(event.target.value)} 
                required 
                maxLength={4000} 
                rows={1} 
                placeholder="Write your message..." 
              />
              
              <button className="aw-send-btn" type="submit" disabled={loading || !draft.trim()}>
                {loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                )}
              </button>
            </div>
            
            <p className="aw-footer-note">Al Waha Parts may make mistakes. Verify info.</p>
          </form>
        </footer>

      </div>
    </section>
  );
}
