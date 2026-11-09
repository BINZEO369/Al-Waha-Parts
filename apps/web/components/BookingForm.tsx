'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { formatSar } from '../../../packages/shared/src/currency';
import { useCart } from './CartProvider';

export function BookingForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!items.length) {
      setState('error');
      setMessage('Please select a product first.');
      return;
    }

    setState('loading');
    setMessage('');
    setBookingNumber('');
    setCopied(false);
    const form = new FormData(formElement);
    const isDelivery = deliveryMethod === 'delivery';

    const payload = {
      customer_name: String(form.get('customer_name') || '').trim(),
      customer_phone: String(form.get('customer_phone') || '').trim(),
      customer_email: String(form.get('customer_email') || '').trim() || undefined,
      customer_note: String(form.get('customer_note') || '').trim() || undefined,
      delivery_method: deliveryMethod,
      shipping_address: isDelivery
        ? String(form.get('shipping_address') || '').trim() || undefined
        : undefined,
      customer_city: isDelivery
        ? String(form.get('customer_city') || '').trim() || undefined
        : undefined,
      items: items.map((item) => ({
        part_id: item.part_id,
        quantity: item.quantity,
      })),
      payment_method: 'cash_on_delivery' as const,
    };

    try {
      if (!apiUrl) throw new Error('Live booking API is not configured.');
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || 'Unable to create the booking.');
      setState('success');
      setBookingNumber(result?.data?.booking_number || 'Submitted');
      setMessage('We will call you shortly to confirm.');
      formElement.reset();
      setDeliveryMethod('pickup');
      clearCart();
    } catch (cause) {
      setState('error');
      setMessage(cause instanceof Error ? cause.message : 'We could not save this booking yet.');
    }
  }

  async function copyBookingNumber() {
    if (!bookingNumber) return;
    try {
      await navigator.clipboard.writeText(bookingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <style>{`
        /* =========================================================
         * WHITE / BLACK / RED ONLY
         * =======================================================*/

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          padding: 24px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
          position: relative;
        }
        @media (max-width: 600px) {
          .booking-form { padding: 16px; gap: 16px; }
        }

        /* ================= PRODUCTS ================= */
        .bf-products {
          border: 1px solid #ebebeb;
          border-radius: 10px;
          overflow: hidden;
        }
        .bf-products-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #fafafa;
          border-bottom: 1px solid #ebebeb;
        }
        .bf-products-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #111;
        }
        .bf-products-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 7px;
          border-radius: 20px;
          background: #111;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }
        .bf-clear {
          background: #fff;
          border: 1px solid #e5e5e5;
          color: #111;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .bf-clear:hover {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .bf-items {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .bf-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .bf-item:last-child { border-bottom: none; }
        .bf-item-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #fafafa;
          border: 1px solid #ebebeb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 800;
          color: #ccc;
        }
        .bf-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 3px;
        }
        .bf-item-info { flex: 1; min-width: 140px; }
        .bf-item-name {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 3px;
        }
        .bf-item-meta {
          font-size: 11px;
          color: #888;
          font-weight: 500;
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .bf-dot { color: #ccc; }
        .bf-qty {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .bf-qty label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #888;
        }
        .bf-qty input {
          width: 54px;
          padding: 6px 8px;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          color: #111;
          background: #fff;
          outline: none;
          font-family: inherit;
        }
        .bf-qty input:focus { border-color: #111; }
        .bf-line-total {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          min-width: 70px;
          text-align: right;
          flex-shrink: 0;
        }
        .bf-remove {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e5e5e5;
          background: #fff;
          color: #888;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
          flex-shrink: 0;
        }
        .bf-remove:hover {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }
        .bf-empty {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #888;
          font-weight: 500;
        }
        .bf-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #111;
          color: #fff;
        }
        .bf-total span {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #ccc;
        }
        .bf-total strong {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }

        /* ================= FIELDS ================= */
        .bf-fields { display: flex; flex-direction: column; gap: 14px; }
        .bf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 600px) {
          .bf-row { grid-template-columns: 1fr; gap: 14px; }
        }
        .bf-field { display: flex; flex-direction: column; gap: 6px; }
        .bf-field label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #111;
        }
        .bf-field input,
        .bf-field select,
        .bf-field textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .bf-field input::placeholder,
        .bf-field textarea::placeholder { color: #999; }
        .bf-field input:focus,
        .bf-field select:focus,
        .bf-field textarea:focus {
          border-color: #111;
          background: #fff;
        }
        .bf-field textarea { resize: vertical; min-height: 80px; }

        /* ================= PICKUP INFO CARD ================= */
        .bf-pickup {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 18px;
          border: 1px solid #e5e5e5;
          border-left: 3px solid #dc2626;
          border-radius: 10px;
          background: #fafafa;
        }
        .bf-pickup-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .bf-pickup-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #fee2e2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bf-pickup-icon svg { width: 18px; height: 18px; }
        .bf-pickup-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .bf-pickup-title {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          line-height: 1.3;
        }
        .bf-pickup-desc {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
          font-weight: 500;
        }
        .bf-map-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .bf-map-btn:hover { background: #dc2626; }
        .bf-map-btn svg { width: 14px; height: 14px; }

        /* ================= SUBMIT ================= */
        .bf-submit {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #111;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .bf-submit:hover:not(:disabled) { background: #dc2626; }
        .bf-submit:disabled {
          background: #ccc;
          color: #fff;
          cursor: not-allowed;
        }
        .bf-submit .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ================= ERROR ================= */
        .bf-error {
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          background: #dc2626;
          color: #fff;
          animation: shakeIn 0.4s ease;
        }
        @keyframes shakeIn {
          0% { transform: translateX(0); opacity: 0; }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); opacity: 1; }
        }

        /* ================= SUCCESS MODAL ================= */
        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: overlayIn 0.3s ease forwards;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .success-card {
          position: relative;
          background: #fff;
          border-radius: 20px;
          padding: 36px 28px 28px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          animation: cardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          overflow: hidden;
        }
        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Decorative red dots at corners */
        .success-card::before,
        .success-card::after {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .success-card::before {
          top: -40px;
          left: -40px;
        }
        .success-card::after {
          bottom: -40px;
          right: -40px;
        }

        /* Animated checkmark circle */
        .success-circle {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          animation: circlePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s backwards;
        }
        @keyframes circlePop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .success-circle::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid #dc2626;
          animation: ringPulse 1.4s ease-out 0.4s infinite;
          opacity: 0;
        }
        @keyframes ringPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .success-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.5s ease-out 0.5s forwards;
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        .success-title {
          font-size: 22px;
          font-weight: 800;
          color: #111;
          margin: 6px 0 0;
          letter-spacing: -0.4px;
          animation: fadeUp 0.4s ease 0.5s backwards;
        }
        .success-subtitle {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
          animation: fadeUp 0.4s ease 0.6s backwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Booking number copy box */
        .success-id-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 14px 16px;
          background: #fafafa;
          border: 1px dashed #d4d4d4;
          border-radius: 12px;
          margin-top: 8px;
          animation: fadeUp 0.4s ease 0.7s backwards;
        }
        .success-id-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
          min-width: 0;
          flex: 1;
        }
        .success-id-label {
          font-size: 9px;
          font-weight: 800;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .success-id-value {
          font-size: 15px;
          font-weight: 800;
          color: #111;
          letter-spacing: 0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .success-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          font-family: inherit;
        }
        .success-copy-btn:hover {
          background: #dc2626;
        }
        .success-copy-btn.copied {
          background: #dc2626;
        }
        .success-copy-btn svg {
          width: 12px;
          height: 12px;
        }

        /* CTA buttons */
        .success-actions {
          display: flex;
          gap: 8px;
          width: 100%;
          margin-top: 8px;
          animation: fadeUp 0.4s ease 0.8s backwards;
        }
        .success-btn {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .success-btn.primary {
          background: #dc2626;
          color: #fff;
        }
        .success-btn.primary:hover {
          background: #111;
        }
        .success-btn.secondary {
          background: #fff;
          color: #111;
          border: 1px solid #e5e5e5;
        }
        .success-btn.secondary:hover {
          border-color: #111;
        }
        .success-btn svg {
          width: 12px;
          height: 12px;
        }

        /* Confetti dots */
        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0;
          pointer-events: none;
          z-index: 1;
        }
        .confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc2626;
          opacity: 0;
          animation: confettiFall 1.6s ease-out 0.3s forwards;
        }
        .confetti-dot:nth-child(1) { left: 15%; animation-delay: 0.3s; }
        .confetti-dot:nth-child(2) { left: 30%; background: #111; animation-delay: 0.4s; width: 8px; height: 8px; }
        .confetti-dot:nth-child(3) { left: 45%; animation-delay: 0.35s; }
        .confetti-dot:nth-child(4) { left: 60%; background: #111; animation-delay: 0.45s; width: 5px; height: 5px; }
        .confetti-dot:nth-child(5) { left: 75%; animation-delay: 0.4s; }
        .confetti-dot:nth-child(6) { left: 85%; background: #111; animation-delay: 0.5s; width: 7px; height: 7px; }
        @keyframes confettiFall {
          0% {
            transform: translateY(40px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(420px) rotate(540deg);
            opacity: 0;
          }
        }

        @media (max-width: 480px) {
          .success-card { padding: 28px 20px 22px; }
          .success-title { font-size: 18px; }
          .success-circle { width: 66px; height: 66px; }
          .success-actions { flex-direction: column; }
        }
      `}</style>

      {/* ================= PRODUCTS ================= */}
      <section className="bf-products">
        <header className="bf-products-head">
          <div className="bf-products-title">
            <span className="bf-products-count">{items.length}</span>
            <span>Selected Products</span>
          </div>
          {items.length > 0 && (
            <button type="button" className="bf-clear" onClick={clearCart}>
              Clear all
            </button>
          )}
        </header>

        {items.length ? (
          <ul className="bf-items">
            {items.map((item) => (
              <li className="bf-item" key={item.part_id}>
                <div className="bf-item-thumb">
                  {item.image_url ? <img src={item.image_url} alt="" /> : <span>AWP</span>}
                </div>
                <div className="bf-item-info">
                  <div className="bf-item-name">{item.part_name}</div>
                  <div className="bf-item-meta">
                    <span>{item.sku}</span>
                    <span className="bf-dot">·</span>
                    <span>{formatSar(item.unit_price)} each</span>
                  </div>
                </div>
                <div className="bf-qty">
                  <label htmlFor={`qty-${item.part_id}`}>Qty</label>
                  <input
                    id={`qty-${item.part_id}`}
                    type="number"
                    min="1"
                    max={item.stock_quantity ?? 99}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.part_id, Number(e.target.value))}
                  />
                </div>
                <div className="bf-line-total">
                  {formatSar(item.unit_price * item.quantity)}
                </div>
                <button
                  type="button"
                  className="bf-remove"
                  onClick={() => removeItem(item.part_id)}
                  aria-label={`Remove ${item.part_name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bf-empty">No products selected</div>
        )}

        {items.length > 0 && (
          <div className="bf-total">
            <span>Total</span>
            <strong>{formatSar(subtotal)}</strong>
          </div>
        )}
      </section>

      {/* ================= FIELDS ================= */}
      <div className="bf-fields">
        <div className="bf-row">
          <div className="bf-field">
            <label htmlFor="bf-name">Full Name</label>
            <input
              id="bf-name"
              name="customer_name"
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
          <div className="bf-field">
            <label htmlFor="bf-phone">Phone</label>
            <input
              id="bf-phone"
              name="customer_phone"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="+971 5X XXX XXXX"
            />
          </div>
        </div>

        <div className="bf-field">
          <label htmlFor="bf-email">Email</label>
          <input
            id="bf-email"
            type="email"
            name="customer_email"
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>

        <div className="bf-field">
          <label htmlFor="bf-delivery">Delivery Method</label>
          <select
            id="bf-delivery"
            name="delivery_method"
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
          >
            <option value="pickup">Pickup from store</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {deliveryMethod === 'delivery' ? (
          <div className="bf-row">
            <div className="bf-field">
              <label htmlFor="bf-city">City</label>
              <input
                id="bf-city"
                name="customer_city"
                autoComplete="address-level2"
                required
                placeholder="Al Jubail, Dammam…"
              />
            </div>
            <div className="bf-field">
              <label htmlFor="bf-address">Delivery Address</label>
              <input
                id="bf-address"
                name="shipping_address"
                autoComplete="street-address"
                required
                placeholder="Street address"
              />
            </div>
          </div>
        ) : (
          <div className="bf-pickup">
            <div className="bf-pickup-head">
              <div className="bf-pickup-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="bf-pickup-info">
                <span className="bf-pickup-title">Pickup from our store</span>
                <span className="bf-pickup-desc">
                  You must collect your product from our store after the booking is confirmed. Use the map below to find our location.
                </span>
              </div>
            </div>
            <Link href="/map" className="bf-map-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              View Store Location
            </Link>
          </div>
        )}

        <div className="bf-field">
          <label htmlFor="bf-note">Notes</label>
          <textarea
            id="bf-note"
            name="customer_note"
            rows={3}
            placeholder="Additional notes"
          />
        </div>
      </div>

      {/* ================= SUBMIT ================= */}
      <button
        className="bf-submit"
        type="submit"
        disabled={state === 'loading' || !items.length}
      >
        {state === 'loading' ? (
          <>
            <span className="spinner" />
            Saving…
          </>
        ) : (
          'Confirm Booking'
        )}
      </button>

      {state === 'error' && (
        <div className="bf-error" role="alert">
          {message}
        </div>
      )}

      {/* ================= SUCCESS MODAL ================= */}
      {state === 'success' && (
        <div className="success-overlay" onClick={() => setState('idle')}>
          <div
            className="success-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            {/* Confetti dots */}
            <div className="confetti" aria-hidden="true">
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
            </div>

            {/* Animated checkmark */}
            <div className="success-circle">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="34"
                height="34"
                aria-hidden="true"
              >
                <polyline
                  className="success-check"
                  points="20 6 9 17 4 12"
                />
              </svg>
            </div>

            <h2 id="success-title" className="success-title">
              Booking Confirmed
            </h2>
            <p className="success-subtitle">{message}</p>

            {/* Booking ID copy box */}
            <div className="success-id-box">
              <div className="success-id-content">
                <span className="success-id-label">Booking ID</span>
                <span className="success-id-value">{bookingNumber}</span>
              </div>
              <button
                type="button"
                className={`success-copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyBookingNumber}
                aria-label={copied ? 'Copied' : 'Copy booking ID'}
              >
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="success-actions">
              <Link href="/track" className="success-btn primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Track Booking
              </Link>
              <button
                type="button"
                className="success-btn secondary"
                onClick={() => setState('idle')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
