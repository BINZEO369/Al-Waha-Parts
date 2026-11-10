'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
type Message = { id: string; sender_type: 'customer' | 'admin'; message: string; created_at: string };
type ThreadState = { thread_id: string; access_token: string };

function readThread(): ThreadState | null {
  try { const raw = window.localStorage.getItem(threadStorageKey); return raw ? JSON.parse(raw) as ThreadState : null; } catch { return null; }
}
function saveThread(thread: ThreadState) { try { window.localStorage.setItem(threadStorageKey, JSON.stringify(thread)); } catch { /* storage is optional */ } }

export function CustomerMessageBox() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const [thread, setThread] = useState<ThreadState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadThread = useCallback(async (current: ThreadState) => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/api/v1/messages/thread?thread_id=${encodeURIComponent(current.thread_id)}&access_token=${encodeURIComponent(current.access_token)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json() as { data?: Message[] };
      setMessages(payload.data ?? []);
    } catch { /* ignore polling errors */ }
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
    if (!message.trim() || !apiUrl) return;
    
    setLoading(true);
    const tempMessage = message; // সেভ করা হলো যাতে রেসপন্স না এলে আবার দেখা যায়
    setMessage(''); // ইনপুট খালি করা হলো

    // অপটিমিস্টিক UI (সাথে সাথে মেসেজ দেখানো)
    const newUserMessage: Message = { id: Date.now().toString(), sender_type: 'customer', message: tempMessage, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      // আপনার ব্যাকএন্ড API অনুযায়ী ডিফল্ট ভ্যালু পাঠানো হচ্ছে (যেহেতু ফর্ম নেই)
      const body = thread ? { ...thread, message: tempMessage } : { customer_name: 'Guest', customer_email: 'guest@example.com', customer_phone: '', subject: 'Enquiry', message: tempMessage };
      
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { thread_id?: string; access_token?: string; message?: Message } };
      
      if (!response.ok || !payload.data) throw new Error('Failed to send');
      
      if (!thread && payload.data.thread_id && payload.data.access_token) {
        const nextThread = { thread_id: payload.data.thread_id, access_token: payload.data.access_token };
        saveThread(nextThread);
        setThread(nextThread);
      }
      // API রেসপন্স মেসেজটি সেট করা (যদি ব্যাকএন্ড থেকে সম্পূর্ণ মেসেজ অবজেক্ট আসে)
      if (payload.data.message) {
         setMessages((current) => current.map(m => m.id === newUserMessage.id ? payload.data!.message! : m));
      }
    } catch (error) {
      // এরর হলে মেসেজটি সরিয়ে ফেলা
      setMessages((current) => current.filter(m => m.id !== newUserMessage.id));
      setMessage(tempMessage);
    } finally { 
      setLoading(false); 
    }
  }

  return (
    // মূল কন্টেইনার - ছবির মতো সাদা, রাউন্ডেড এবং হালকা শ্যাডো
    <div className="w-full max-w-[420px] bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col min-h-[600px] font-sans mx-auto">
      
      {/* হেডার: Derez AI */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 flex items-center justify-center opacity-50">
            {/* ছোট রোবট আইকন */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C10.8954 2 10 2.89543 10 4V5H8C6.89543 5 6 5.89543 6 7V17C6 18.1046 6.89543 19 8 19H16C17.1046 19 18 18.1046 18 17V7C18 5.89543 17.1046 5 16 5H14V4C14 2.89543 13.1046 2 12 2Z" fill="#A1A1AA"/>
              <circle cx="9" cy="10" r="1.5" fill="#F4F4F5"/>
              <circle cx="15" cy="10" r="1.5" fill="#F4F4F5"/>
              <path d="M10 14H14" stroke="#F4F4F5" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
        <span className="text-[15px] font-medium text-[#a1a1aa]">Derez AI</span>
      </div>

      {/* চ্যাট এরিয়া */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto mb-4">
        
        {/* বটের প্রথম মেসেজ (ছবির মতো) */}
        <div className="text-[#1A1A1A] text-[15px] leading-relaxed max-w-[85%]">
          Hey, I'm Derez AI. What do you want me to help you with?
        </div>

        {/* ইউজারের মেসেজ এবং অন্যান্য মেসেজ লিস্ট */}
        {messages.map((item) => (
          <div key={item.id} className={`flex flex-col ${item.sender_type === 'customer' ? 'items-end' : 'items-start'}`}>
            <div className={`${
              item.sender_type === 'customer' 
                ? 'bg-[#1A1A1A] text-white rounded-[20px] rounded-tr-[4px] px-5 py-3.5' 
                : 'text-[#1A1A1A] text-[15px] leading-relaxed'
            } max-w-[85%] text-[15px]`}>
              {item.message}
            </div>
          </div>
        ))}

        {/* লোডিং ইন্ডিকেটর (ছবির মতো ৩টি ডট) */}
        {(loading || messages.length > 0) && !message && (
          <div className="flex items-center gap-1.5 pt-2 pl-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-[#909095]"></div>
          </div>
        )}
      </div>

      {/* ইনপুট এরিয়া (ছবির মতো হুবহু) */}
      <form onSubmit={submit} className="bg-[#F4F4F5] rounded-[24px] p-2 mt-auto">
        <div className="flex flex-col">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply...."
            className="w-full bg-transparent outline-none px-4 pt-2 pb-1 text-[15px] text-black placeholder:text-[#a1a1aa]"
          />
          <div className="flex items-center justify-between px-2 pb-1 mt-2">
            <div className="flex items-center gap-4 text-[#a1a1aa]">
              {/* Plus Icon */}
              <button type="button" className="hover:text-gray-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              {/* Mic Icon */}
              <button type="button" className="hover:text-gray-600 transition-colors">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              </button>
            </div>
            {/* Send Button (কালো বাটন) */}
            <button 
              type="submit" 
              disabled={!message.trim()}
              className="bg-[#27272A] hover:bg-black disabled:opacity-50 text-white w-[36px] h-[36px] flex items-center justify-center rounded-[12px] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </div>
        </div>
      </form>

      {/* ফুটার টেক্সট */}
      <p className="text-center text-[12px] text-[#a1a1aa] mt-5">
        Derez may make mistakes. Verify info
      </p>
    </div>
  );
}
