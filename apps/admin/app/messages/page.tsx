'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '../../components/AdminSection';
import { adminFetch } from '../../lib/auth';

type Message = { id: string; thread_id: string; sender_type: 'customer' | 'admin'; customer_name: string; customer_email?: string | null; customer_phone?: string | null; subject?: string | null; message: string; status: 'new' | 'read' | 'replied' | 'closed'; reply_to_id?: string | null; read_at?: string | null; created_at: string };

const dateTime = (value: string) => new Date(value).toLocaleString();
const shortThreadId = (value: string) => `AW-${value.slice(0, 8).toUpperCase()}`;
const initials = (value: string) => value.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'CU';
function groupThreads(messages: Message[]) { const grouped = new Map<string, Message[]>(); for (const message of messages) grouped.set(message.thread_id, [...(grouped.get(message.thread_id) ?? []), message]); return [...grouped.values()].map((items) => items.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))).sort((a, b) => +new Date(b[b.length - 1]!.created_at) - +new Date(a[a.length - 1]!.created_at)); }

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('all');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const refreshing = useRef(false);
  const threads = useMemo(() => groupThreads(messages), [messages]);
  const active = threads.find((thread) => thread[0]?.thread_id === selectedThread) ?? threads[0] ?? [];

  async function load(showSpinner = true) {
    if (refreshing.current) return;
    refreshing.current = true;
    if (showSpinner) setLoading(true);
    try { const data = await adminFetch<Message[]>(`/api/v1/admin/messages${status === 'all' ? '' : `?status=${status}`}`); setMessages(data); if (!selectedThread && data[0]) setSelectedThread(data[0].thread_id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Messages could not be loaded.'); }
    finally { refreshing.current = false; if (showSpinner) setLoading(false); }
  }
  useEffect(() => { void load(true); const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(false); }, 3000); return () => window.clearInterval(timer); }, [status]);

  async function sendReply() { if (!active[0] || !reply.trim()) return; setSending(true); setError(''); try { await adminFetch(`/api/v1/admin/messages/${active[0].thread_id}/reply`, { method: 'POST', body: JSON.stringify({ message: reply }) }); setReply(''); await load(true); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Reply could not be sent.'); } finally { setSending(false); } }
  async function updateStatus(next: 'read' | 'closed') { if (!active[0]) return; try { await adminFetch(`/api/v1/admin/messages/${active[0].thread_id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); await load(true); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Status could not be updated.'); } }

  return <div className="admin-page messages-page"><SectionHeader eyebrow="Customer care / direct inbox" title="Messages from customers." description="A live private inbox for every customer conversation. Threads refresh automatically every three seconds." />
    <div className="messages-toolbar"><div><span className="messages-live-dot" /> Live inbox · refreshes every 3 seconds</div><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All conversations</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select><button className="secondary-button" type="button" onClick={() => void load(true)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <div className="admin-alert" role="alert">{error}</div>}
    <div className="messages-layout"><section className="messages-inbox"><div className="messages-inbox-heading"><div><strong>Inbox</strong><small>{threads.length} conversation{threads.length === 1 ? '' : 's'}</small></div><span className="messages-online-label"><i /> Live</span></div>{threads.length ? threads.map((thread) => { const latest = thread[thread.length - 1]!; const first = thread[0]!; return <button className={`message-thread-card ${first.thread_id === active[0]?.thread_id ? 'active' : ''}`} type="button" key={first.thread_id} onClick={() => setSelectedThread(first.thread_id)}><span className="message-card-avatar">{initials(first.customer_name)}</span><div className="message-card-main"><div className="message-card-top"><strong>{first.customer_name}</strong><time>{dateTime(latest.created_at)}</time></div><small>{first.subject || 'Customer message'}</small><p>{latest.message}</p><div className="message-card-bottom"><span className="message-thread-code">{shortThreadId(first.thread_id)}</span><span className={`message-status status-${latest.status}`}>{latest.status}</span></div></div></button>; }) : <div className="messages-empty">No customer messages in this filter.</div>}</section>
      <section className="messages-conversation">{active.length ? <><div className="messages-conversation-head"><div className="message-contact"><span className="message-contact-avatar">{initials(active[0]!.customer_name)}</span><div><span className="eyebrow">Private customer thread</span><h2>{active[0]!.customer_name}</h2><p>{active[0]!.customer_email || 'No email'} · {active[0]!.customer_phone || 'No phone'}</p><code>{active[0]!.thread_id}</code></div></div><div className="messages-actions"><button className="secondary-button" type="button" onClick={() => void updateStatus('read')}>Mark read</button><button className="secondary-button" type="button" onClick={() => void updateStatus('closed')}>Close</button></div></div><div className="messages-history">{active.map((item) => <article className={`admin-message-bubble ${item.sender_type}`} key={item.id}><div className="admin-bubble-avatar">{item.sender_type === 'admin' ? 'AW' : initials(item.customer_name)}</div><div className="admin-bubble-copy"><div><strong>{item.sender_type === 'admin' ? 'You / Al Waha Parts' : item.customer_name}</strong><time>{dateTime(item.created_at)}</time></div><p>{item.message}</p></div></article>)}</div><div className="messages-reply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} maxLength={4000} placeholder="Write a helpful reply about fitment, price, stock or next steps…" /><button className="primary-button" type="button" onClick={() => void sendReply()} disabled={sending || !reply.trim()}>{sending ? 'Sending…' : 'Send reply'}</button></div></> : <div className="messages-empty messages-empty-large"><strong>Your inbox is ready</strong><span>Customer conversations will appear here automatically.</span></div>}</section>
    </div>
  </div>;
}
