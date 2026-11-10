'use client';

import { useEffect, useMemo, useState } from 'react';
import { SectionHeader } from '../../components/AdminSection';
import { adminFetch } from '../../lib/auth';

type Message = { id: string; thread_id: string; sender_type: 'customer' | 'admin'; customer_name: string; customer_email?: string | null; customer_phone?: string | null; subject?: string | null; message: string; status: 'new' | 'read' | 'replied' | 'closed'; reply_to_id?: string | null; read_at?: string | null; created_at: string };

const dateTime = (value: string) => new Date(value).toLocaleString();
function groupThreads(messages: Message[]) { const grouped = new Map<string, Message[]>(); for (const message of messages) grouped.set(message.thread_id, [...(grouped.get(message.thread_id) ?? []), message]); return [...grouped.values()].map((items) => items.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))).sort((a, b) => +new Date(b[b.length - 1]!.created_at) - +new Date(a[a.length - 1]!.created_at)); }

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('all');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const threads = useMemo(() => groupThreads(messages), [messages]);
  const active = threads.find((thread) => thread[0]?.thread_id === selectedThread) ?? threads[0] ?? [];

  async function load() { setLoading(true); try { const data = await adminFetch<Message[]>(`/api/v1/admin/messages${status === 'all' ? '' : `?status=${status}`}`); setMessages(data); if (!selectedThread && data[0]) setSelectedThread(data[0].thread_id); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Messages could not be loaded.'); } finally { setLoading(false); } }
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 20000); return () => window.clearInterval(timer); }, [status]);

  async function sendReply() { if (!active[0] || !reply.trim()) return; setSending(true); setError(''); try { await adminFetch(`/api/v1/admin/messages/${active[0].thread_id}/reply`, { method: 'POST', body: JSON.stringify({ message: reply }) }); setReply(''); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Reply could not be sent.'); } finally { setSending(false); } }
  async function updateStatus(next: 'read' | 'closed') { if (!active[0]) return; try { await adminFetch(`/api/v1/admin/messages/${active[0].thread_id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Status could not be updated.'); } }

  return <div className="admin-page"><SectionHeader eyebrow="Customer care / direct inbox" title="Messages from customers." description="Reply directly to customers from a protected admin workspace. Each customer gets a separate thread ID; all messages in that thread are automatically removed after three days." />
    <div className="messages-toolbar"><div><span className="messages-live-dot" /> Auto-refresh every 20 seconds</div><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All messages</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select><button className="secondary-button" type="button" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <div className="admin-alert" role="alert">{error}</div>}
    <div className="messages-layout"><section className="messages-inbox"><div className="messages-inbox-heading"><strong>{threads.length} conversation{threads.length === 1 ? '' : 's'}</strong><small>Newest first</small></div>{threads.length ? threads.map((thread) => { const latest = thread[thread.length - 1]!; const first = thread[0]!; return <button className={`message-thread-card ${first.thread_id === active[0]?.thread_id ? 'active' : ''}`} type="button" key={first.thread_id} onClick={() => setSelectedThread(first.thread_id)}><span className={`message-status status-${latest.status}`}>{latest.status}</span><strong>{first.customer_name}</strong><small>{first.subject || 'Customer message'}</small><p>{latest.message}</p><time>{dateTime(latest.created_at)}</time></button>; }) : <div className="messages-empty">No customer messages in this filter.</div>}</section>
      <section className="messages-conversation">{active.length ? <><div className="messages-conversation-head"><div><span className="eyebrow">Customer thread</span><h2>{active[0]!.subject || 'Customer message'}</h2><p>{active[0]!.customer_name} · {active[0]!.customer_email || 'No email'} · {active[0]!.customer_phone || 'No phone'}</p></div><div className="messages-actions"><button className="secondary-button" type="button" onClick={() => void updateStatus('read')}>Mark read</button><button className="secondary-button" type="button" onClick={() => void updateStatus('closed')}>Close</button></div></div><div className="messages-history">{active.map((item) => <article className={`admin-message-bubble ${item.sender_type}`} key={item.id}><div><strong>{item.sender_type === 'admin' ? 'You / Al Waha Parts' : item.customer_name}</strong><time>{dateTime(item.created_at)}</time></div><p>{item.message}</p></article>)}</div><div className="messages-reply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} maxLength={4000} placeholder="Write a helpful reply about fitment, price, stock or next steps…" /><button className="primary-button" type="button" onClick={() => void sendReply()} disabled={sending || !reply.trim()}>{sending ? 'Sending…' : 'Reply to customer'}</button></div></> : <div className="messages-empty messages-empty-large"><strong>Select a conversation</strong><span>Customer messages will appear here.</span></div>}</section>
    </div>
  </div>;
}
