'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
type Message = { id: string; sender_type: 'customer' | 'admin'; customer_name: string; subject: string; message: string; status: string; created_at: string };
type ThreadState = { thread_id: string; access_token: string };

function readThread(): ThreadState | null {
  try { const raw = window.localStorage.getItem(threadStorageKey); return raw ? JSON.parse(raw) as ThreadState : null; } catch { return null; }
}
function saveThread(thread: ThreadState) { try { window.localStorage.setItem(threadStorageKey, JSON.stringify(thread)); } catch { /* storage is optional */ } }

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

  const loadThread = useCallback(async (current: ThreadState) => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/api/v1/messages/thread?thread_id=${encodeURIComponent(current.thread_id)}&access_token=${encodeURIComponent(current.access_token)}`, { cache: 'no-store' });
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!apiUrl) { setError('Messaging is temporarily unavailable. Please try again shortly.'); return; }
    setLoading(true);
    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      const body = thread ? { ...thread, message } : { customer_name: name, customer_email: email, customer_phone: phone, subject, message };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { thread_id?: string; access_token?: string; message?: Message }; error?: { message?: string } };
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

  return <section className="customer-message-box" aria-labelledby="customer-message-title">
    <div className="customer-message-intro"><span className="eyebrow">Message the parts desk</span><h2 id="customer-message-title">Need help finding the right part?</h2><p>Send us a message with your vehicle or part details. Our team can reply directly here. Each private thread is kept for three days, then automatically removed.</p><div className="customer-message-promise"><span>01</span><b>Tell us what you need</b><span>02</span><b>We check fitment</b><span>03</span><b>Reply in your thread</b></div></div>
    {messages.length > 0 && <div className="customer-message-thread" aria-live="polite"><div className="customer-message-thread-head"><strong>Your conversation</strong><small>Live refresh · every 3 seconds</small></div>{messages.map((item) => <article className={`customer-message-bubble ${item.sender_type}`} key={item.id}><span>{item.sender_type === 'admin' ? 'Al Waha Parts' : 'You'}</span><p>{item.message}</p><time>{new Date(item.created_at).toLocaleString()}</time></article>)}</div>}
    <form className="customer-message-form" onSubmit={submit}><div className="customer-message-form-grid">{!thread && <><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Your name" /></label><label>Email <span>(optional)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="you@example.com" /></label><label>Phone <span>(optional)</span><input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} placeholder="Phone number" /></label><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="What can we help with?" /></label></>}</div><label>Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={4000} rows={5} placeholder="Tell us the part name, SKU, car make/model/year, or your question…" /></label>{error && <p className="customer-message-error" role="alert">{error}</p>}{sent && !error && <p className="customer-message-success" role="status">Message sent. Keep this browser to receive replies in this conversation.</p>}<button className="button" type="submit" disabled={loading}>{loading ? 'Sending…' : thread ? 'Send reply' : 'Send message'}</button></form>
  </section>;
}
