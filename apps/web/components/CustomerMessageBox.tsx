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

  // অটো-রিসাইজিং এর জন্য রেফ
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // লেখা পরিবর্তন হলে টেক্সটএরিয়ার উচ্চতা অটোমেটিক বাড়বে
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

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
          background: #f4f4f5; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          display: flex;
          align-items: center; 
          justify-content: center;
          padding: 40px 20px;
        }
        
        /* স্প্লিট কন্টেইনার */
        .aw-message-shell { 
          width: 100%; 
          max-width: 960px; 
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08); 
          display: grid; 
          grid-template-columns: 340px 1fr; 
          overflow: hidden;
          border: 1px solid #eaeaea;
          animation: shellEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes shellEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* -----------------------------
           বাম দিকের কালো প্যানেল 
           ----------------------------- */
        .aw-message-left {
          background: #0a0a0a; 
          color: #fff;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .aw-message-avatar {
          width: 40px;
          height: 40px;
          background: #ffffff;
          color: #111;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 12px;
          margin-bottom: 32px;
        }

        .aw-left-label {
          color: #a1a1aa;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
        }

        .aw-left-title {
          font-size: 22px;
          font-weight: 500;
          line-height: 1.3;
          margin: 0 0 32px 0;
          letter-spacing: -.02em;
        }

        .aw-left-info {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .aw-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #d4d4d8;
          font-size: 13px;
        }
        .aw-info-item svg { color: #71717a; flex-shrink: 0; }

        .aw-left-bottom {
          margin-top: auto;
          padding-top: 30px;
        }

        .aw-btn-white {
          width: 100%;
          padding: 12px;
          background: #ffffff;
          color: #111;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .aw-btn-white:hover { background: #e4e4e7; }


        /* -----------------------------
           ডান দিকের সাদা প্যানেল 
           ----------------------------- */
        .aw-message-right {
          background: #ffffff;
          padding: 32px 40px;
          display: flex;
          flex-direction: column;
          max-height: 85vh; 
          overflow-y: auto;
        }

        .aw-right-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .aw-right-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #111;
        }

        .aw-close-btn {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 20px;
          display: grid;
          place-items: center;
        }
        .aw-close-btn:hover { color: #111; }

        /* ফর্ম গ্রিড */
        .aw-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .aw-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .aw-form-grid .aw-form-group {
          margin-bottom: 0;
        }

        .aw-form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #3f3f46;
        }

        .aw-form-group input, .aw-form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 14px;
          color: #111;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }

        .aw-form-group input:focus, .aw-form-group textarea:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .aw-form-group input::placeholder, .aw-form-group textarea::placeholder {
          color: #a1a1aa;
        }

        /* অটো-এক্সপ্যান্ডিং টেক্সটএরিয়া স্টাইল */
        .aw-form-group textarea {
          resize: none; /* রিসাইজ হ্যান্ডেল বাদ দেওয়া হলো */
          overflow-y: hidden; /* স্ক্রলবার লুকানো হলো */
          min-height: 100px; /* মিনিমাম উচ্চতা */
          max-height: 200px; /* সর্বোচ্চ উচ্চতা, এরপর স্ক্রল হবে */
          line-height: 1.5;
        }

        /* চ্যাট থ্রেড */
        .aw-chat-thread {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 10px 0;
          margin-bottom: 16px;
        }

        .aw-chat-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 85%;
        }
        .aw-chat-row.customer { align-self: flex-end; flex-direction: row-reverse; }
        .aw-chat-row.admin { align-self: flex-start; }

        .aw-chat-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .aw-chat-row.admin .aw-chat-bubble {
          background: #f4f4f5;
          color: #111;
          border-bottom-left-radius: 4px;
        }
        .aw-chat-row.customer .aw-chat-bubble {
          background: #0a0a0a;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        /* কুইক রিপ্লাই */
        .aw-quick-replies {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .aw-quick-replies button {
          padding: 6px 12px;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          border-radius: 20px;
          font-size: 12px;
          color: #3f3f46;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aw-quick-replies button:hover {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        /* ফুটার */
        .aw-form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f4f4f5;
        }

        .aw-form-note {
          font-size: 12px;
          color: #a1a1aa;
          max-width: 200px;
          line-height: 1.4;
        }

        .aw-actions {
          display: flex;
          gap: 12px;
        }

        .aw-btn-reset {
          padding: 10px 20px;
          background: #ffffff;
          color: #3f3f46;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aw-btn-reset:hover { background: #f4f4f5; }

        .aw-btn-submit {
          padding: 10px 20px;
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .aw-btn-submit:hover:not(:disabled) { background: #27272a; }
        .aw-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* টাইপিং ইন্ডিকেটর */
        .aw-typing { display: flex; gap: 4px; padding: 12px 16px; background: #f4f4f5; border-radius: 16px; width: fit-content; border-bottom-left-radius: 4px;}
        .aw-typing span { width: 6px; height: 6px; background: #a1a1aa; border-radius: 50%; animation: bounce 1.4s infinite both; }
        .aw-typing span:nth-child(2) { animation-delay: 0.2s; }
        .aw-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        /* মেসেজ সেন্ড এরর/সাকসেস */
        .aw-msg-feedback { font-size: 13px; margin-top: 12px; padding: 10px; border-radius: 8px; text-align: center;}
        .aw-msg-feedback.error { color: #991b1b; background: #fef2f2; }
        .aw-msg-feedback.success { color: #166534; background: #f0fdf4; }


        /* -----------------------------
           মোবাইল রেসপন্সিভ 
           ----------------------------- */
        @media (max-width: 860px) { 
          .aw-message-page { padding: 0; align-items: flex-start; background: #fff;}
          .aw-message-shell { 
            grid-template-columns: 1fr; 
            border-radius: 0;
            border: none;
            box-shadow: none;
            min-height: 100vh;
          } 
          .aw-message-left { padding: 32px 24px; border-radius: 0; } 
          .aw-message-avatar { margin-bottom: 20px; }
          .aw-left-title { font-size: 20px; margin-bottom: 20px; }
          .aw-left-info { display: none; } 
          .aw-left-bottom { padding-top: 10px; }
          
          .aw-message-right { padding: 24px; max-height: none; } 
          .aw-form-grid { grid-template-columns: 1fr; } 
          .aw-form-footer { flex-direction: column; align-items: stretch; gap: 16px; text-align: center; }
          .aw-form-note { max-width: 100%; margin: 0 auto; }
          .aw-actions { justify-content: space-between; }
          .aw-btn-reset, .aw-btn-submit { flex: 1; justify-content: center; }
        }
      `}</style>

      <div className="aw-message-shell">
        
        {/* বাম দিকের কালো প্যানেল */}
        <div className="aw-message-left">
          <div>
            <span className="aw-message-avatar">AW</span>
            <span className="aw-left-label">Al Waha Parts</span>
            <h1 className="aw-left-title">How can we help with your car?</h1>
          </div>

          <div className="aw-left-info">
            <div className="aw-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Usually replies within 1 business day</span>
            </div>
            <div className="aw-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>Private & secure messaging</span>
            </div>
            <div className="aw-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Parts Desk Team</span>
            </div>
          </div>

          <div className="aw-left-bottom">
            {thread ? (
              <button className="aw-btn-white" onClick={() => navigator.clipboard?.writeText(thread.thread_id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Chat ID (AW-{thread.thread_id.slice(0, 4)})
              </button>
            ) : (
              <div className="aw-info-item" style={{ color: '#71717a', fontSize: '12px' }}>
                Fill out the form to start.
              </div>
            )}
          </div>
        </div>

        {/* ডান দিকের সাদা প্যানেল */}
        <div className="aw-message-right">
          
          <div className="aw-right-header">
            <h2>{thread ? 'Message Thread' : 'Input Details'}</h2>
            <button className="aw-close-btn" type="button" aria-label="Close" onClick={() => { /* Close logic if needed */ }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <form className="aw-message-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* প্রথমবার হলে ফর্ম দেখাবে */}
            {!thread && (
              <div className="aw-form-grid">
                <div className="aw-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="aw-name">Full name</label>
                  <input id="aw-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} placeholder="Your name..." />
                </div>
                <div className="aw-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="aw-email">Email Address</label>
                  <input id="aw-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} placeholder="you@example.com" />
                </div>
                <div className="aw-form-group">
                  <label htmlFor="aw-phone">Phone (Optional)</label>
                  <input id="aw-phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="aw-form-group">
                  <label htmlFor="aw-subject">Subject</label>
                  <input id="aw-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} placeholder="Parts enquiry" />
                </div>
              </div>
            )}

            {/* চ্যাট থ্রেড */}
            {thread && messages.length > 0 && (
              <div className="aw-chat-thread">
                {messages.map((item) => (
                  <div className={`aw-chat-row ${item.sender_type}`} key={item.id}>
                    <div className="aw-chat-bubble">
                      {item.message}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="aw-chat-row admin">
                    <div className="aw-typing"><span></span><span></span><span></span></div>
                  </div>
                )}
              </div>
            )}

            {/* কুইক রিপ্লাই */}
            {thread && (
              <div className="aw-quick-replies">
                {quickReplies.map((item) => (
                  <button key={item} type="button" onClick={() => setDraft(item === 'Fitment help' ? 'Please help me find the right part for my car.' : item === 'Stock & price' ? 'Please check stock and price for this part.' : item === 'Booking help' ? 'I need help with a booking.' : 'Can you help me track my order?')}>
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* মেসেজ লেখার জায়গা (Auto-expanding) */}
            <div className="aw-form-group" style={{ flex: thread ? 'none' : 1 }}>
              <label htmlFor="aw-message">{thread ? 'Write a reply...' : 'What would you like to discuss?'}</label>
              <textarea 
                id="aw-message"
                ref={textareaRef} /* এখানে রেফ যুক্ত করা হয়েছে */
                value={draft} 
                onChange={(event) => setDraft(event.target.value)} 
                required 
                maxLength={4000} 
                rows={1} /* শুরুতে ১ লাইন হবে, লেখা বাড়লে বাড়বে */
                placeholder={thread ? 'Type your reply here...' : 'Share your goals and questions for the session...'} 
              />
            </div>

            {error && <p className="aw-msg-feedback error">{error}</p>}
            {sent && !error && <p className="aw-msg-feedback success">Message sent. We will reply here.</p>}

            {/* ফুটার বাটন */}
            <div className="aw-form-footer">
              <span className="aw-form-note">24 hours free cancellation. By proceeding, you agree to our Terms of Service and Privacy Policy.</span>
              <div className="aw-actions">
                <button type="button" className="aw-btn-reset" onClick={() => { setDraft(''); setName(''); setEmail(''); setPhone(''); setSubject('Parts enquiry'); }}>
                  Reset
                </button>
                <button type="submit" className="aw-btn-submit" disabled={loading}>
                  {loading ? 'Sending...' : (thread ? 'Send Reply' : 'Schedule Now')}
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
