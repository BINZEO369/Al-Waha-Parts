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
  
  // ডিজাইনের জন্য বাটন স্টেট
  const [isFocused, setIsFocused] = useState(false);

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
    if (!apiUrl) { setError('Messaging is temporarily unavailable. Please try again shortly.'); return; }
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      // যদি ইউজার নাম/ইমেইল না দেয়, তবে ডিফল্ট ভ্যালু পাঠাবে (ছবির মত সিম্পল রাখার জন্য)
      const body = thread ? { ...thread, message } : { customer_name: name || 'Guest User', customer_email: email || 'guest@example.com', customer_phone: phone, subject: subject || 'General Inquiry', message };
      
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
    } catch (cause) { 
      setError(cause instanceof Error ? cause.message : 'Your message could not be sent.'); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[600px] font-sans">
      
      {/* হেডার (ছবির মতো সিম্পল) */}
      <div className="flex items-center px-6 py-5 border-b border-gray-50">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 11V7"/><path d="M8 7h8"/></svg>
        </div>
        <span className="text-gray-500 font-medium text-sm">Derez AI</span>
        {thread && (
          <span className="ml-auto text-xs text-gray-400 font-medium">
            {shortThreadId(thread.thread_id)}
          </span>
        )}
      </div>

      {/* চ্যাট এরিয়া */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {/* সিস্টেমের প্রথম মেসেজ (যদি কোনো মেসেজ না থাকে) */}
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 11V7"/><path d="M8 7h8"/></svg>
            </div>
            <div className="text-gray-800 text-[15px] leading-relaxed pt-1">
              Hey, I'm Derez AI. What do you want me to help you with?
            </div>
          </div>
        )}

        {/* ডাইনামিক মেসেজ লিস্ট */}
        {messages.map((item) => (
          <div key={item.id} className={`flex ${item.sender_type === 'customer' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
            {item.sender_type === 'admin' && (
              <div className="w-8 h-8 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 11V7"/><path d="M8 7h8"/></svg>
              </div>
            )}
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
              item.sender_type === 'customer' 
                ? 'bg-[#1A1A1A] text-white rounded-tr-sm' 
                : 'bg-transparent text-gray-800 pt-1'
            }`}>
              {item.message}
            </div>
          </div>
        ))}
        
        {/* লোডিং ইন্ডিকেটর */}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 11V7"/><path d="M8 7h8"/></svg>
              </div>
            <div className="flex items-center gap-1 pt-3">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      {/* ইনপুট এরিয়া (ছবির মতো হুবহু ডিজাইন) */}
      <div className="p-6 pt-2 bg-white">
        <form onSubmit={submit} className={`bg-[#F7F7F8] rounded-2xl p-2 transition-all ${isFocused ? 'ring-1 ring-gray-300' : ''}`}>
          
          {/* ইনপুট ফিল্ড */}
          <textarea 
            value={message} 
            onChange={(event) => setMessage(event.target.value)} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required 
            maxLength={4000} 
            rows={1} 
            placeholder="Reply...." 
            className="w-full bg-transparent resize-none outline-none text-[15px] text-gray-800 placeholder-gray-400 px-3 py-2 min-h-[44px] max-h-32"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          {/* বাটন এবং আইকন */}
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex items-center gap-3 text-gray-400">
              <button type="button" className="p-1.5 hover:text-gray-600 transition-colors" title="Attach">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button type="button" className="p-1.5 hover:text-gray-600 transition-colors" title="Voice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !message.trim()}
              className="bg-[#2C2C2C] text-white p-2 rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </div>
        </form>
        
        {/* ফুটার টেক্সট */}
        <p className="text-center text-[12px] text-gray-400 mt-4">
          Derez may make mistakes. Verify info
        </p>
      </div>
    </div>
  );
}
