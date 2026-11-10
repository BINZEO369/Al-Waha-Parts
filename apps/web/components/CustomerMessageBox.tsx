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

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSent(false);
    if (!apiUrl) { setError('Messaging is temporarily unavailable. Please try again shortly.'); return; }
    setLoading(true);
    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      const body = thread ? { ...thread, message } : { customer_name: name || 'Guest', customer_email: email, customer_phone: phone, subject, message };
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <section className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[600px] border border-gray-100">
        
        {/* Chat Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
          
          {/* Initial Bot Greeting (Static) */}
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">AI</div>
              <span className="text-sm font-medium text-gray-400">Derez AI</span>
            </div>
            <p className="text-gray-800 text-[15px] leading-relaxed max-w-[85%]">
              Hey, I'm Derez AI. What do you want me to help you with?
            </p>
          </div>

          {/* Render Messages */}
          {messages.map((item) => (
            <div key={item.id} className={`flex flex-col gap-1 ${item.sender_type === 'customer' ? 'items-end' : 'items-start'}`}>
              
              {item.sender_type === 'admin' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">AI</div>
                  <span className="text-sm font-medium text-gray-400">Derez AI</span>
                </div>
              )}

              {item.sender_type === 'customer' ? (
                <div className="relative bg-[#1a1a1a] text-white text-[15px] px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  {item.message}
                  {/* Tail effect from the image */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1a1a1a] rounded-full border-2 border-white"></div>
                </div>
              ) : (
                <p className="text-gray-800 text-[15px] leading-relaxed max-w-[85%] pl-8">
                  {item.message}
                </p>
              )}
            </div>
          ))}

          {/* Loading/Typing Indicator */}
          {loading && (
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">AI</div>
                <span className="text-sm font-medium text-gray-400">Derez AI</span>
              </div>
              <div className="flex items-center gap-1.5 pl-8 pt-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Input Area (Matching the image) */}
        <div className="p-4 bg-white">
          <form onSubmit={submit} className="bg-[#f4f4f4] rounded-[1.5rem] p-3 flex flex-col gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reply...."
              className="w-full bg-transparent outline-none px-2 text-[15px] text-gray-800 placeholder-gray-400"
              required
            />
            
            <div className="flex justify-between items-center px-1 mt-1">
              <div className="flex gap-4 text-gray-500">
                <button type="button" className="hover:text-gray-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button type="button" className="hover:text-gray-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !message.trim()} 
                className="bg-[#2a2a2a] text-white rounded-xl w-9 h-9 flex items-center justify-center disabled:opacity-50 transition-all hover:bg-black"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              </button>
            </div>
          </form>
          
          <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
            Derez may make mistakes. Verify info
          </p>
        </div>
        
      </section>
    </div>
  );
}
