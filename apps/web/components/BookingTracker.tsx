'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';

type BookingResult = {
  booking_number: string;
  booking_status: string;
  created_at: string;
  total_amount: number;
  currency: string;
  delivery_method: string;
  customer_city?: string | null;
  items: Array<{
    part_name_snapshot?: string | null;
    sku_snapshot?: string | null;
    vehicle_name_snapshot?: string | null;
    quantity: number;
  }>;
};

export function BookingTracker() {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError('Booking tracking is not configured right now.');
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch<BookingResult>(
        apiUrl,
        `/api/v1/bookings/track?booking_id=${encodeURIComponent(bookingId.trim())}&phone=${encodeURIComponent(phone.trim())}`,
      );
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not find that booking.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="booking-tracker">
      <form className="tracker-form" onSubmit={submit}>
        <label>
          <span>Booking ID</span>
          <input
            required
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
            placeholder="AWP-…"
            autoComplete="off"
          />
        </label>
        <label>
          <span>Phone number used for booking</span>
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. +966…"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <button className="button" disabled={loading}>
          {loading ? 'Checking…' : 'Track booking →'}
        </button>
      </form>
      {error && (
        <p className="tracker-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <section className="tracker-result" aria-live="polite">
          <div className="tracker-result-heading">
            <div>
              <span className="eyebrow">Booking found</span>
              <h2>{result.booking_number}</h2>
              <p>Received {new Date(result.created_at).toLocaleString()}</p>
            </div>
            <strong className={`tracker-status ${result.booking_status}`}>
              {result.booking_status.replace(/_/g, ' ')}
            </strong>
          </div>
          <div className="tracker-facts">
            <div>
              <small>Delivery</small>
              <strong>
                {result.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}
                {result.customer_city ? ` · ${result.customer_city}` : ''}
              </strong>
            </div>
            <div>
              <small>Total</small>
              <strong>
                {new Intl.NumberFormat('en-SA', {
                  style: 'currency',
                  currency: result.currency || 'SAR',
                }).format(Number(result.total_amount || 0))}
              </strong>
            </div>
          </div>
          <div className="tracker-items">
            <small>Requested items</small>
            {result.items.length ? (
              result.items.map((item, index) => (
                <div key={`${item.sku_snapshot}-${index}`}>
                  <strong>{item.part_name_snapshot || 'Catalog part'}</strong>
                  <span>
                    {item.sku_snapshot || '—'} · Qty {item.quantity}
                  </span>
                </div>
              ))
            ) : (
              <p>Your request is being reviewed by the parts desk.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
