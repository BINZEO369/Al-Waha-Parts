'use client';

import { FormEvent, useState } from 'react';

export function BookingForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(form.get('customer_name')),
      customer_phone: String(form.get('customer_phone')),
      customer_email: String(form.get('customer_email') || ''),
      customer_note: String(form.get('customer_note') || ''),
      part_number: String(form.get('part_number') || ''),
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('failed');
      setState('success');
      e.currentTarget.reset();
    } catch {
      setState('error');
    }
  }
  return (
    <form className="booking-form" onSubmit={submit}>
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
          Part number / SKU
          <input name="part_number" placeholder="OEM or part number" />
        </label>
      </div>
      <label>
        What do you need?
        <textarea
          name="customer_note"
          rows={5}
          placeholder="Tell us the vehicle, part and any fitment details."
        />
      </label>
      <button className="button" disabled={state === 'loading'}>
        {state === 'loading' ? 'Sending request…' : 'Send booking request'}
      </button>
      {state === 'success' && (
        <p className="form-success">Request received. Our parts desk will call you shortly.</p>
      )}
      {state === 'error' && (
        <p className="form-error">
          We could not send this yet. Please try again or call the parts desk.
        </p>
      )}
    </form>
  );
}
