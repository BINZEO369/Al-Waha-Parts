'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatAed } from '../../../packages/shared/src/currency';
import { useCart } from './CartProvider';

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
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [manualPartNumber, setManualPartNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');

  useEffect(() => {
    const requestedPart = new URLSearchParams(window.location.search).get('part');
    if (requestedPart) setManualPartNumber(requestedPart);
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
    const formElement = event.currentTarget;
    if (!items.length && !manualPartNumber.trim()) {
      setState('error');
      setMessage('Add at least one product to the cart or enter a part number.');
      return;
    }

    setState('loading');
    setMessage('');
    setBookingNumber('');
    const form = new FormData(formElement);
    const vehicle = vehicles.find((item) => item.id === selectedVehicle);
    const customerNote = [
      String(form.get('customer_note') || '').trim(),
      vehicle ? `Vehicle: ${vehicle.manufacturer_name} ${vehicle.model_name} ${vehicle.generation ?? ''}`.trim() : '',
    ].filter(Boolean).join('\n');
    const payload = {
      customer_name: String(form.get('customer_name') || '').trim(),
      customer_phone: String(form.get('customer_phone') || '').trim(),
      customer_email: String(form.get('customer_email') || '').trim() || undefined,
      customer_note: customerNote || undefined,
      part_number: manualPartNumber.trim() || undefined,
      delivery_method: deliveryMethod,
      shipping_address: String(form.get('shipping_address') || '').trim() || undefined,
      customer_city: String(form.get('customer_city') || '').trim() || undefined,
      payment_method: 'cash_on_delivery' as const,
      items: items.map((item) => ({
        part_id: item.part_id,
        quantity: item.quantity,
        vehicle_id: selectedVehicle || undefined,
      })),
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
      setMessage('Your request is safely recorded. Our parts desk will confirm fitment, stock and delivery shortly.');
      formElement.reset();
      setManualPartNumber('');
      setSelectedVehicle('');
      setDeliveryMethod('pickup');
      clearCart();
    } catch (cause) {
      setState('error');
      setMessage(cause instanceof Error ? cause.message : 'We could not send this booking yet.');
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="booking-form-heading">
        <div>
          <span className="section-kicker">Secure parts request</span>
          <h2>Review your cart and send the request.</h2>
        </div>
        <p>Prices are rechecked against the live catalog before the booking is saved.</p>
      </div>

      <section className="cart-panel" aria-labelledby="cart-title">
        <div className="cart-panel-heading">
          <div><span className="section-kicker">Your selection</span><h3 id="cart-title">Cart ({items.length} products)</h3></div>
          {items.length > 0 && <button type="button" className="cart-clear" onClick={clearCart}>Clear cart</button>}
        </div>
        {items.length ? (
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.part_id}>
                <div className="cart-item-image">
                  {item.image_url ? <img src={item.image_url} alt="" /> : <span>AWP</span>}
                </div>
                <div className="cart-item-copy"><strong>{item.part_name}</strong><small>{item.sku}</small><span>{formatAed(item.unit_price)} each</span></div>
                <label className="cart-quantity">Qty<input aria-label={`Quantity for ${item.part_name}`} type="number" min="1" max={item.stock_quantity || 99} value={item.quantity} onChange={(event) => updateQuantity(item.part_id, Number(event.target.value))} /></label>
                <strong className="cart-item-total">{formatAed(item.unit_price * item.quantity)}</strong>
                <button type="button" className="cart-remove" aria-label={`Remove ${item.part_name}`} onClick={() => removeItem(item.part_id)}>×</button>
              </article>
            ))}
          </div>
        ) : <div className="cart-empty">Your cart is empty. Add products from the catalog, or use the manual part number below.</div>}
        <div className="cart-total"><span>Estimated subtotal</span><strong>{formatAed(subtotal)}</strong></div>
      </section>

      <div className="form-grid">
        <label>Name<input name="customer_name" required autoComplete="name" placeholder="Your full name" /></label>
        <label>Phone<input name="customer_phone" required autoComplete="tel" inputMode="tel" placeholder="+971 5X XXX XXXX" /></label>
      </div>
      <div className="form-grid">
        <label>Email<input type="email" name="customer_email" autoComplete="email" placeholder="you@company.com" /></label>
        <label>Manual part number / OEM<input value={manualPartNumber} onChange={(event) => setManualPartNumber(event.target.value)} placeholder="Optional if products are in cart" /></label>
      </div>
      <div className="form-grid">
        <label>Vehicle from database<select value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)}>
          <option value="">Select vehicle (optional)</option>
          {vehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.manufacturer_name} {vehicle.model_name} {vehicle.generation ? `· ${vehicle.generation}` : ''}</option>)}
        </select></label>
        <label>Delivery preference<select name="delivery_method" value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value as 'pickup' | 'delivery')}>
          <option value="pickup">Pickup / confirm with parts desk</option><option value="delivery">Delivery in UAE</option>
        </select></label>
      </div>
      <div className="form-grid">
        <label>City<input name="customer_city" autoComplete="address-level2" placeholder="Dubai, Abu Dhabi …" /></label>
        <label>Delivery address<input name="shipping_address" autoComplete="street-address" required={deliveryMethod === 'delivery'} placeholder={deliveryMethod === 'delivery' ? 'Required for delivery' : 'Optional for pickup'} /></label>
      </div>
      <label>Fitment details / message<textarea name="customer_note" rows={4} placeholder="Car year, engine, part condition or other fitment details." /></label>
      <div className="booking-form-actions">
        <button className="button" disabled={state === 'loading'}>{state === 'loading' ? 'Saving secure request…' : 'Submit booking request'}</button>
        <span>No payment is taken online. The parts desk confirms the final quote.</span>
      </div>
      {state === 'success' && <div className="booking-status-panel success" role="status" aria-live="polite"><strong>Request received: {bookingNumber}</strong><span>{message}</span></div>}
      {state === 'error' && <div className="booking-status-panel error" role="alert">{message}</div>}
    </form>
  );
}
