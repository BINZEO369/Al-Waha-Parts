'use client';

import { FormEvent, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { useCart } from './CartProvider';

export function BookingForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!items.length) {
      setState('error');
      setMessage('Select a product from the catalog first. Its live database details will be attached automatically.');
      return;
    }

    setState('loading');
    setMessage('');
    setBookingNumber('');
    const form = new FormData(formElement);
    const payload = {
      customer_name: String(form.get('customer_name') || '').trim(),
      customer_phone: String(form.get('customer_phone') || '').trim(),
      customer_email: String(form.get('customer_email') || '').trim() || undefined,
      customer_note: String(form.get('customer_note') || '').trim() || undefined,
      delivery_method: deliveryMethod,
      shipping_address: String(form.get('shipping_address') || '').trim() || undefined,
      customer_city: String(form.get('customer_city') || '').trim() || undefined,
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
      setMessage('Your selected product details and total were saved. Our parts desk will call you to confirm delivery and handover.');
      formElement.reset();
      setDeliveryMethod('pickup');
      clearCart();
    } catch (cause) {
      setState('error');
      setMessage(cause instanceof Error ? cause.message : 'We could not save this booking yet.');
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="booking-form-heading">
        <div>
          <span className="section-kicker">Automatic product booking</span>
          <h2>Your selected product is ready.</h2>
        </div>
        <p>Product identity, live price, stock and total are checked again from the database when you submit.</p>
      </div>

      <section className="cart-panel" aria-labelledby="cart-title">
        <div className="cart-panel-heading">
          <div><span className="section-kicker">From the live database</span><h3 id="cart-title">Selected products ({items.length})</h3></div>
          {items.length > 0 && <button type="button" className="cart-clear" onClick={clearCart}>Clear selection</button>}
        </div>
        {items.length ? (
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.part_id}>
                <div className="cart-item-image">{item.image_url ? <img src={item.image_url} alt="" /> : <span>AWP</span>}</div>
                <div className="cart-item-copy"><strong>{item.part_name}</strong><small>{item.sku} · {item.condition || 'Catalog product'}</small><span>{formatSar(item.unit_price)} each · {item.stock_quantity == null ? 'Available to order' : `${item.stock_quantity} in stock`}</span></div>
                <label className="cart-quantity">Qty<input aria-label={`Quantity for ${item.part_name}`} type="number" min="1" max={item.stock_quantity ?? 99} value={item.quantity} onChange={(event) => updateQuantity(item.part_id, Number(event.target.value))} /></label>
                <strong className="cart-item-total">{formatSar(item.unit_price * item.quantity)}</strong>
                <button type="button" className="cart-remove" aria-label={`Remove ${item.part_name}`} onClick={() => removeItem(item.part_id)}>×</button>
              </article>
            ))}
          </div>
        ) : <div className="cart-empty">No product selected. Return to the catalog and press Booking now on the product you want.</div>}
        <div className="cart-total"><span>Total booking amount <small>(SAR, rechecked before save)</small></span><strong>{formatSar(subtotal)}</strong></div>
      </section>

      <div className="booking-contact-note"><strong>Product details are automatic; delivery details come from you.</strong><span>We do not ask you to choose a vehicle or enter product details again. Add the contact and delivery information needed for our parts desk to call and complete the handover.</span></div>
      <div className="form-grid">
        <label>Name for callback<input name="customer_name" required autoComplete="name" placeholder="Your name" /></label>
        <label>Phone for callback<input name="customer_phone" required autoComplete="tel" inputMode="tel" placeholder="+971 5X XXX XXXX" /></label>
      </div>
      <div className="form-grid">
        <label>Email (optional)<input type="email" name="customer_email" autoComplete="email" placeholder="you@company.com" /></label>
        <label>Delivery method<select name="delivery_method" value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value as 'pickup' | 'delivery')}>
          <option value="pickup">Pickup / confirm with parts desk</option>
          <option value="delivery">Delivery in Saudi Arabia</option>
        </select></label>
      </div>
      <div className="form-grid">
        <label>City<input name="customer_city" autoComplete="address-level2" placeholder="Enter your city" /></label>
        <label>Delivery address<input name="shipping_address" autoComplete="street-address" required={deliveryMethod === 'delivery'} placeholder={deliveryMethod === 'delivery' ? 'Required for delivery' : 'Optional for pickup'} /></label>
      </div>
      <label>Note for the parts desk (optional)<textarea name="customer_note" rows={3} placeholder="Anything the team should know before calling?" /></label>
      <div className="booking-form-actions">
        <button className="button" disabled={state === 'loading' || !items.length}>{state === 'loading' ? 'Saving booking…' : 'Confirm booking'}</button>
        <span>No online payment. The team will call to confirm the SAR total, delivery method and handover.</span>
      </div>
      {state === 'success' && <div className="booking-status-panel success" role="status" aria-live="polite"><strong>Booking received: {bookingNumber}</strong><span>{message}</span></div>}
      {state === 'error' && <div className="booking-status-panel error" role="alert">{message}</div>}
    </form>
  );
}
