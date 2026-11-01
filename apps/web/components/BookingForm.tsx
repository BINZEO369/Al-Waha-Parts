'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Vehicle {
  id: string;
  manufacturer_name: string;
  model_name: string;
  generation?: string | null;
  year_start?: number | null;
  year_end?: number | null;
}

export function BookingForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');

  useEffect(() => {
    const requestedPart = new URLSearchParams(window.location.search).get('part');
    if (requestedPart) setPartNumber(requestedPart);
    if (!apiUrl) return;
    fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/vehicles?limit=100`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load vehicle fitment data.');
        const payload = await response.json();
        setVehicles(payload.data ?? []);
      })
      .catch(() => setVehicles([]));
  }, [apiUrl]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('loading');
    setMessage('');
    setBookingNumber('');
    const form = new FormData(event.currentTarget);
    const vehicle = vehicles.find((item) => item.id === selectedVehicle);
    const customerNote = [
      String(form.get('customer_note') || '').trim(),
      vehicle ? `Vehicle: ${vehicle.manufacturer_name} ${vehicle.model_name} ${vehicle.generation ?? ''}`.trim() : '',
      `Delivery preference: ${String(form.get('delivery_method') || 'pickup')}`,
    ].filter(Boolean).join('\n');
    const payload = {
      customer_name: String(form.get('customer_name') || '').trim(),
      customer_phone: String(form.get('customer_phone') || '').trim(),
      customer_email: String(form.get('customer_email') || '').trim(),
      customer_note: customerNote,
      part_number: partNumber.trim(),
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
      setMessage('Your request is now with the Al Waha Parts desk. We will confirm fitment and availability shortly.');
      event.currentTarget.reset();
      setPartNumber('');
      setSelectedVehicle('');
    } catch (cause) {
      setState('error');
      setMessage(cause instanceof Error ? cause.message : 'We could not send this booking yet.');
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="booking-form-heading">
        <div>
          <span className="section-kicker">Database-connected request</span>
          <h2>Tell us what your car needs.</h2>
        </div>
        <p>Your request is matched against the live catalog before our parts desk calls you.</p>
      </div>
      <div className="form-grid">
        <label>
          Name
          <input name="customer_name" required placeholder="Your full name" />
        </label>
        <label>
          Phone
          <input name="customer_phone" required placeholder="+971 5X XXX XXXX" />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Email
          <input type="email" name="customer_email" placeholder="you@company.com" />
        </label>
        <label>
          Part number / SKU / OEM
          <input value={partNumber} onChange={(event) => setPartNumber(event.target.value)} required placeholder="AWP-BR-001 or OEM number" />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Vehicle from database
          <select value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)}>
            <option value="">Select vehicle (optional)</option>
            {vehicles.map((vehicle) => (
              <option value={vehicle.id} key={vehicle.id}>
                {vehicle.manufacturer_name} {vehicle.model_name} {vehicle.generation ? `· ${vehicle.generation}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Delivery preference
          <select name="delivery_method" defaultValue="pickup">
            <option value="pickup">Pickup / confirm with parts desk</option>
            <option value="delivery">Delivery in UAE</option>
          </select>
        </label>
      </div>
      <label>
        Fitment details / message
        <textarea name="customer_note" rows={5} placeholder="Tell us the car year, engine, part condition or any fitment details." />
      </label>
      <div className="booking-form-actions">
        <button className="button" disabled={state === 'loading'}>
          {state === 'loading' ? 'Sending request…' : 'Send booking request'}
        </button>
        <span>We only use these details to respond to your parts request.</span>
      </div>
      {state === 'success' && (
        <div className="booking-status-panel success"><strong>Request received: {bookingNumber}</strong><span>{message}</span></div>
      )}
      {state === 'error' && <div className="booking-status-panel error">{message}</div>}
    </form>
  );
}
