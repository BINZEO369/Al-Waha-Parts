'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const threadStorageKey = 'alwaha-customer-message-thread-v1';
const quickReplies = ['Fitment help', 'Stock & price', 'Book a part', 'Order tracking'];

type Message = {
  id: string;
  sender_type: 'customer' | 'admin' | 'assistant';
  customer_name: string;
  subject: string;
  message: string;
  status: string;
  handled_by_ai?: boolean;
  needs_admin?: boolean;
  created_at: string;
};
type Thread = { thread_id: string; access_token: string };
type TrackingResult = { booking_number: string; booking_status: string; created_at: string; total_amount: number; currency: string; delivery_method: string | null; customer_city: string | null; items: Array<{ part_name_snapshot: string; sku_snapshot: string; vehicle_name_snapshot?: string | null; quantity: number; line_total: number }> };
type BookingResult = { booking_number?: string; booking_status?: string; total_amount?: number; currency?: string };

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
  const [orderId, setOrderId] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPartNumber, setBookingPartNumber] = useState('');
  const [bookingDelivery, setBookingDelivery] = useState<'pickup' | 'delivery'>('pickup');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingCity, setBookingCity] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const invalidThread = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function checkOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTrackingError('');
    setTracking(null);
    if (!apiUrl || !orderId.trim() || !orderPhone.trim()) {
      setTrackingError('Enter both the Order / Booking ID and the phone number used for the order.');
      return;
    }
    setTrackingLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/bookings/track?booking_id=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(orderPhone.trim())}`, { cache: 'no-store' });
      const payload = await response.json() as { data?: TrackingResult; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? 'No order matched those details.');
      setTracking(payload.data);
    } catch (cause) {
      setTrackingError(cause instanceof Error ? cause.message : 'No order matched those details.');
    } finally {
      setTrackingLoading(false);
    }
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError('');
    setBookingResult(null);
    if (!apiUrl || !name.trim() || !phone.trim() || !bookingPartNumber.trim()) {
      setBookingError('Please enter your name, phone number and the part number or OEM number.');
      return;
    }
    if (bookingDelivery === 'delivery' && !bookingAddress.trim()) {
      setBookingError('Please enter a delivery address, or choose pickup.');
      return;
    }
    setBookingLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || undefined,
          part_number: bookingPartNumber.trim(),
          customer_note: 'Booking requested from the Al Waha Parts Messenger Box.',
          delivery_method: bookingDelivery,
          shipping_address: bookingDelivery === 'delivery' ? bookingAddress.trim() : undefined,
          customer_city: bookingCity.trim() || undefined,
          payment_method: 'cash_on_delivery',
        }),
      });
      const payload = await response.json() as { data?: BookingResult; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? 'The booking could not be created.');
      setBookingResult(payload.data);
      setBookingPartNumber('');
      setBookingAddress('');
    } catch (cause) {
      setBookingError(cause instanceof Error ? cause.message : 'The booking could not be created.');
    } finally {
      setBookingLoading(false);
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const loadThread = useCallback(async (current: Thread) => {
    if (!apiUrl || invalidThread.current) return;
    try {
      const response = await fetch(`${apiUrl}/api/v1/messages/thread?thread_id=${encodeURIComponent(current.thread_id)}&access_token=${encodeURIComponent(current.access_token)}`, { cache: 'no-store' });
      if (response.status === 404) {
        invalidThread.current = true;
        clearThread();
        setThread(null);
        setMessages([]);
        setSent(false);
        setError('This conversation has expired or is no longer available. Start a new message below.');
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
    const current = thread ?? readThread();
    if (!current) return;
    invalidThread.current = false;
    setThread(current);
    void loadThread(current);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadThread(current);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadThread, thread?.thread_id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setError('');
    setSent(false);
    if (!apiUrl) {
      setError('Messaging is temporarily unavailable. Please try again shortly.');
      return;
    }
    if (!thread) {
      if (name.trim().length < 2) {
        setError('Please enter your name before sending.');
        return;
      }
      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    setLoading(true);
    try {
      if (!thread) invalidThread.current = false;
      const endpoint = thread ? `${apiUrl}/api/v1/messages/thread/reply` : `${apiUrl}/api/v1/messages`;
      const body = thread
        ? { ...thread, message: draft.trim() }
        : { customer_name: name.trim(), customer_email: email.trim(), customer_phone: phone.trim(), subject: subject.trim(), message: draft.trim() };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { thread_id?: string; access_token?: string; message?: Message }; error?: { message?: string } };
      if (response.status === 404 && thread) {
        invalidThread.current = true;
        clearThread();
        setThread(null);
        setMessages([]);
        setSent(false);
        setError('This conversation has expired. Please send your message again.');
        return;
      }
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? 'Your message could not be sent.');
      const nextThread = thread ?? (payload.data.thread_id && payload.data.access_token ? { thread_id: payload.data.thread_id, access_token: payload.data.access_token } : null);
      if (!thread && payload.data.thread_id && payload.data.access_token) {
        saveThread(nextThread!);
        setThread(nextThread);
      }
      if (payload.data.message) setMessages((current) => [...current, payload.data!.message!]);
      if (nextThread) {
        try {
          const assistantResponse = await fetch(`${apiUrl}/api/v1/messages/assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextThread) });
          const assistantPayload = await assistantResponse.json() as { data?: { message?: Message } };
          if (assistantPayload.data?.message) setMessages((current) => [...current, assistantPayload.data!.message!]);
        } catch {
          // The customer message is already saved; the three-second refresh remains available.
        }
      }
      setDraft('');
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your message could not be sent.');
    } finally {
      setLoading(false);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const isWaitingForAdmin = lastMessage && lastMessage.sender_type === 'customer';

  return (
    <section className="aw-message-page" aria-labelledby="aw-message-title">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

        /* গ্লোবাল সেটআপ - লিকুইড ব্যাকগ্রাউন্ড */
        .aw-message-page { 
          height: 100vh; 
          width: 100%;
          background: radial-gradient(circle at top left, #ffffff, #f0f0f0); /* স্মুথ গ্রেডিয়েন্ট */
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
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px); /* গ্লাস ইফেক্ট */
          border-left: 1px solid rgba(0, 0, 0, 0.05);
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.03);
        }

        /* হেডার - ফ্লোটিং গ্লাস */
        .aw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          flex-shrink: 0; 
          z-index: 10;
        }

        .aw-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aw-avatar {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #111, #333); /* লিকুইড কালো */
          color: #fff;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        }

        .aw-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aw-btn-copy {
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 11px;
          color: #3f3f46;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .aw-btn-copy:hover { background: #111; color: #fff; border-color: #111; }

        .aw-close-btn {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 20px;
          display: grid;
          place-items: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .aw-close-btn:hover { color: #111; }

        /* মেসেজ এরিয়া */
        .aw-chat-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
        }
        .aw-chat-scroll::-webkit-scrollbar { width: 4px; }
        .aw-chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

        /* ইনিশিয়াল ফর্ম - ফ্লোটিং গ্লাস */
        .aw-initial-form-container {
          max-width: 480px;
          margin: 40px auto;
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          padding: 32px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
          border: 1px solid rgba(0,0,0,0.04);
          animation: liquidEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes liquidEntrance {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
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
          padding: 12px 16px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 14px;
          color: #111;
          background: rgba(255,255,255,0.5);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          outline: none !important; 
          font-family: inherit;
        }

        .aw-form-group input:focus {
          background: #fff;
          border-color: #111;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        /* চ্যাট বাবলস - লিকুইড স্টাইল */
        .aw-chat-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 80%;
          animation: messageSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes messageSlideUp {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .aw-chat-row.customer { align-self: flex-end; flex-direction: row-reverse; }
        .aw-chat-row.admin { align-self: flex-start; }
        .aw-chat-row.assistant { align-self: flex-start; }

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
        .aw-chat-row.admin .aw-chat-avatar { background: #e4e4e7; color: #111; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .aw-chat-row.customer .aw-chat-avatar { background: linear-gradient(135deg, #111, #333); color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .aw-chat-row.assistant .aw-chat-avatar { background: #dbeafe; color: #1d4ed8; box-shadow: 0 2px 8px rgba(29,78,216,0.12); }

        /* অ্যাডমিন বাবল - ফ্রস্টেড গ্লাস */
        .aw-chat-row.admin .aw-chat-bubble {
          padding: 14px 18px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: #111;
          border-radius: 20px 20px 20px 4px;
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        .aw-chat-row.assistant .aw-chat-bubble {
          padding: 14px 18px;
          font-size: 14px;
          line-height: 1.5;
          background: #eff6ff;
          color: #172554;
          border-radius: 20px 20px 20px 4px;
          border: 1px solid #dbeafe;
        }

        /* কাস্টমার বাবল - লিকুইড ব্ল্যাক */
        .aw-chat-row.customer .aw-chat-bubble {
          padding: 14px 18px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          background: linear-gradient(135deg, #1a1a1a, #000000);
          color: #fff;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .aw-chat-bubble { white-space: pre-wrap; overflow-wrap: anywhere; }
        .aw-chat-bubble time {
          display: block;
          font-size: 10px;
          margin-top: 6px;
          opacity: 0.5;
          text-align: right;
          font-family: 'DM Mono', monospace;
        }

        /* টাইপিং ইন্ডিকেটর - লিকুইড ডট */
        .aw-typing { 
          display: flex; 
          gap: 5px; 
          padding: 14px 18px; 
          background: rgba(255, 255, 255, 0.9); 
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 1); 
          border-radius: 20px 20px 20px 4px; 
          width: fit-content; 
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }
        .aw-typing span { 
          width: 6px; 
          height: 6px; 
          background: #111; 
          border-radius: 50%; 
          animation: liquidBounce 1.4s infinite ease-in-out both; 
          opacity: 0.4;
        }
        .aw-typing span:nth-child(2) { animation-delay: 0.2s; }
        .aw-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes liquidBounce { 
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; } 
          40% { transform: scale(1.1); opacity: 1; background: #000; } 
        }

        /* কুইক রিপ্লাই */
        .aw-quick-replies {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .aw-quick-replies button {
          padding: 8px 16px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(5px);
          border-radius: 20px;
          font-size: 12px;
          color: #3f3f46;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .aw-quick-replies button:hover {
          background: #111;
          color: #fff;
          border-color: #111;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        }

        /* -----------------------------
           কম্পোজ বক্স (লিকুইড ব্ল্যাক পিল)
           ----------------------------- */
        .aw-composer-area {
          flex-shrink: 0; 
          padding: 16px 24px 20px;
          background: transparent;
        }

        .aw-compose-box {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: linear-gradient(135deg, #111, #000);
          padding: 12px 16px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .aw-compose-box:focus-within {
          box-shadow: 0 20px 45px rgba(0,0,0,0.3), 0 0 0 3px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .aw-compose-icon {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 8px 0;
          display: grid;
          place-items: center;
          outline: none !important;
          transition: color 0.2s;
        }
        .aw-compose-icon:hover { color: #fff; }

        .aw-compose-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 15px;
          color: #fff;
          resize: none;
          outline: none !important; 
          box-shadow: none !important; 
          min-height: 24px;
          max-height: 150px;
          padding: 8px 0;
          line-height: 1.5;
          scrollbar-width: none; 
        }
        .aw-compose-input:invalid {
          outline: none !important; 
          box-shadow: none !important;
        }
        .aw-compose-input::-webkit-scrollbar { display: none; } 
        .aw-compose-input::placeholder { color: #666; }

        /* সেন্ড বাটন - সাদা লিকুইড */
        .aw-send-btn {
          background: #ffffff;
          color: #000;
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          flex-shrink: 0;
          outline: none !important;
          box-shadow: 0 4px 12px rgba(255,255,255,0.1);
        }
        .aw-send-btn:hover:not(:disabled) {
          transform: scale(1.1) rotate(-10deg);
          box-shadow: 0 8px 20px rgba(255,255,255,0.2);
        }
        .aw-send-btn:disabled { opacity: 0.3; cursor: not-allowed; background: #444; color: #888; box-shadow: none; }

        .aw-footer-note {
          text-align: center;
          font-size: 11px;
          color: #999;
          margin-top: 12px;
          font-family: 'DM Mono', monospace;
        }
        .aw-order-track { margin: 8px auto 18px; width: min(480px, 100%); padding: 16px; border: 1px solid #e5e7eb; border-radius: 18px; background: rgba(255,255,255,0.82); }
        .aw-booking-panel { margin: 8px auto 18px; width: min(520px, 100%); padding: 18px; border: 1px solid #e5e7eb; border-radius: 18px; background: rgba(255,255,255,0.92); }
        .aw-booking-panel h4 { margin: 0 0 4px; font-size: 15px; color: #111; }
        .aw-booking-panel p { margin: 0 0 12px; color: #6b7280; font-size: 11px; line-height: 1.5; }
        .aw-booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
        .aw-booking-grid label { display: grid; gap: 4px; color: #374151; font-size: 11px; font-weight: 600; }
        .aw-booking-grid label.full { grid-column: 1 / -1; }
        .aw-booking-grid input, .aw-booking-grid select { width: 100%; min-width: 0; padding: 10px 11px; border: 1px solid #d1d5db; border-radius: 10px; background: #fff; color: #111; font-size: 12px; }
        .aw-booking-grid button { grid-column: 1 / -1; min-height: 38px; border: 0; border-radius: 10px; background: #111; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
        .aw-booking-grid button:disabled { opacity: .55; cursor: wait; }
        .aw-booking-error { margin: 9px 0 0 !important; color: #dc2626 !important; }
        .aw-booking-success { margin: 9px 0 0 !important; color: #15803d !important; }
        .aw-order-track h4 { margin: 0 0 4px; font-size: 14px; color: #111; }
        .aw-order-track p { margin: 0 0 10px; font-size: 11px; color: #6b7280; }
        .aw-order-track-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; }
        .aw-order-track input { min-width: 0; padding: 10px 11px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 12px; }
        .aw-order-track button { border: 0; border-radius: 10px; padding: 0 13px; background: #111; color: #fff; font-size: 12px; font-weight: 600; }
        .aw-order-track-book { margin-top: 10px; padding: 0; border: 0 !important; color: #111 !important; background: transparent !important; font-size: 11px !important; text-decoration: underline; cursor: pointer; }
        .aw-order-track-error { color: #dc2626; font-size: 11px; margin: 8px 0 0; }
        .aw-order-track-result { margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #1f2937; }
        .aw-order-track-result strong { color: #111; }
        .aw-order-track-items { margin: 6px 0 0; padding-left: 18px; }

        /* মেসেজ ফিডব্যাক */
        .aw-msg-feedback { font-size: 12px; margin: 0 0 12px 0; text-align: center; }
        .aw-msg-feedback.error { color: #dc2626; }
        .aw-msg-feedback.success { color: #16a34a; }

        /* -----------------------------
           মোবাইল রেসপন্সিভ (আরও ছোট এবং অপ্টিমাইজড)
           ----------------------------- */
        @media (max-width: 768px) { 
          .aw-message-shell { border-left: none; border-right: none; }
          .aw-header { padding: 10px 16px; } 
          .aw-btn-copy { display: none; } 
          
          .aw-chat-scroll { 
            padding: 12px 10px; 
            gap: 8px; 
          }
          
          .aw-composer-area { padding: 10px 12px 16px; }
          .aw-initial-form-container { margin: 10px auto; padding: 20px 12px; box-shadow: none; border: none; background: transparent; backdrop-filter: none;}
          .aw-form-grid { grid-template-columns: 1fr; gap: 10px; }
          .aw-order-track-grid, .aw-booking-grid { grid-template-columns: 1fr; }
          .aw-booking-grid label.full, .aw-booking-grid button { grid-column: auto; }
          .aw-order-track button { min-height: 36px; }

          .aw-chat-row { 
            max-width: 92%; 
            gap: 6px; 
          }
          
          .aw-chat-avatar {
            width: 20px;
            height: 20px;
            font-size: 7px;
          }

          /* মোবাইলে বাবল আরও ছোট */
          .aw-chat-row.admin .aw-chat-bubble,
          .aw-chat-row.customer .aw-chat-bubble {
            font-size: 12px; 
            padding: 8px 12px; 
            border-radius: 16px;
            line-height: 1.35;
          }
          .aw-chat-bubble time {
            font-size: 8px;
            margin-top: 3px;
          }

          .aw-typing {
            padding: 8px 12px;
          }
          .aw-typing span {
            width: 4px;
            height: 4px;
          }
          
          .aw-quick-replies button {
            padding: 5px 12px;
            font-size: 10px;
          }

          /* মোবাইলে কম্পোজ বক্স আরও সুন্দর */
          .aw-compose-box {
            padding: 8px 12px;
            border-radius: 24px;
          }
          .aw-send-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      <div className="aw-message-shell">
        
        {/* হেডার */}
        <header className="aw-header">
          <div className="aw-header-left">
            <div className="aw-avatar">AW</div>
            <div className="aw-header-info">
              <h2>Al Waha Parts</h2>
              <p><span className="aw-status-dot"></span> Usually replies in 20 minutes</p>
            </div>
          </div>
          <div className="aw-header-right">
            {thread && (
              <button className="aw-btn-copy" onClick={() => navigator.clipboard?.writeText(thread.thread_id)} title="Copy Chat ID">
                ID: AW-{thread.thread_id.slice(0, 6).toUpperCase()}
              </button>
            )}
            <button className="aw-close-btn" type="button" aria-label="Close message center" onClick={() => window.history.back()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </header>

        {/* মেসেজ এরিয়া */}
        <div className="aw-chat-scroll" ref={scrollRef}>
          <section className="aw-order-track" aria-labelledby="aw-order-track-title">
            <h4 id="aw-order-track-title">Track your order</h4>
            <p>Paste your Order / Booking ID and the phone number used at checkout.</p>
            <form onSubmit={checkOrder} className="aw-order-track-grid">
              <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Order / Booking ID" aria-label="Order or Booking ID" />
              <input value={orderPhone} onChange={(event) => setOrderPhone(event.target.value)} placeholder="Phone number" aria-label="Phone number used for order" />
              <button type="submit" disabled={trackingLoading}>{trackingLoading ? 'Checking…' : 'Check order'}</button>
            </form>
            <button type="button" className="aw-order-track-book" onClick={() => setBookingOpen(true)}>Need to place a new booking? Open the booking form</button>
            {trackingError && <p className="aw-order-track-error" role="alert">{trackingError}</p>}
            {tracking && <div className="aw-order-track-result" role="status"><div><strong>{tracking.booking_number}</strong> · {tracking.booking_status.replace(/_/g, ' ')}</div><div>Total: <strong>{tracking.total_amount} {tracking.currency}</strong> · {tracking.delivery_method || 'Delivery method not specified'}</div>{tracking.items.length > 0 && <ul className="aw-order-track-items">{tracking.items.map((item, index) => <li key={`${item.sku_snapshot}-${index}`}>{item.part_name_snapshot} × {item.quantity} — {item.line_total} {tracking.currency}</li>)}</ul>}</div>}
          </section>

          {bookingOpen && <section className="aw-booking-panel" aria-labelledby="aw-booking-title">
            <h4 id="aw-booking-title">Book a part with the parts desk</h4>
            <p>Use a SKU, OEM number or exact part number. If you do not know it, send a message first and I will help identify it from your vehicle details or photo.</p>
            <form className="aw-booking-grid" onSubmit={submitBooking}>
              <label className="full">Part / OEM number<input required value={bookingPartNumber} onChange={(event) => setBookingPartNumber(event.target.value)} placeholder="e.g. OEM or SKU" /></label>
              <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
              <label>Phone<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+966..." inputMode="tel" /></label>
              <label>Email (optional)<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <label>City (optional)<input value={bookingCity} onChange={(event) => setBookingCity(event.target.value)} placeholder="Al Jubail" /></label>
              <label>Request type<select value={bookingDelivery} onChange={(event) => setBookingDelivery(event.target.value as 'pickup' | 'delivery')}><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label>
              {bookingDelivery === 'delivery' && <label className="full">Delivery address<input required value={bookingAddress} onChange={(event) => setBookingAddress(event.target.value)} placeholder="Full delivery address" /></label>}
              <button type="submit" disabled={bookingLoading}>{bookingLoading ? 'Creating booking…' : 'Create booking request'}</button>
            </form>
            {bookingError && <p className="aw-booking-error" role="alert">{bookingError}</p>}
            {bookingResult && <p className="aw-booking-success" role="status">Booking request created: <strong>{bookingResult.booking_number}</strong>. Save this ID to track your order.</p>}
          </section>}
          
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

          {/* চ্যাট থ্রেড */}
          {thread && messages.map((item) => (
            <div className={`aw-chat-row ${item.sender_type}`} key={item.id}>
              <div className="aw-chat-avatar">
                {item.sender_type === 'assistant' ? 'AI' : item.sender_type === 'admin' ? 'AW' : 'YOU'}
              </div>
              <div className="aw-chat-bubble">
                {item.message}
                <time>{time(item.created_at)}</time>
              </div>
            </div>
          ))}

          {thread && (
             <div className="aw-quick-replies">
                 {quickReplies.map((item) => (
                 <button key={item} type="button" onClick={() => {
                   if (item === 'Book a part') {
                     setBookingOpen(true);
                     return;
                   }
                   setDraft(item === 'Fitment help' ? 'Please help me find the right part for my car.' : item === 'Stock & price' ? 'Please check stock and price for this part.' : 'I want to check my order. I will provide my Booking ID and phone number.');
                 }}>
                   {item}
                 </button>
               ))}
             </div>
          )}

          {/* টাইপিং ইন্ডিকেটর */}
          {(loading || isWaitingForAdmin) && (
            <div className="aw-chat-row admin">
              <div className="aw-chat-avatar">AW</div>
              <div className="aw-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        {/* কম্পোজ বক্স */}
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
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                required 
                maxLength={4000} 
                rows={1} 
                placeholder="Write your message... (Enter for a new line)"
              />
              
              <button className="aw-send-btn" type="submit" disabled={loading || !draft.trim()}>
                {loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="aw-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                )}
              </button>
            </div>
            
            <p className="aw-footer-note">Enter = new line · Ctrl/⌘ + Enter = send · Al Waha Parts may make mistakes.</p>
          </form>
        </footer>

      </div>
    </section>
  );
}
