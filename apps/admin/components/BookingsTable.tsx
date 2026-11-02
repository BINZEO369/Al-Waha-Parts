'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';

type BookingItem = {
  quantity: number;
  unit_price: number;
  line_total?: number | null;
  part_name_snapshot?: string | null;
  sku_snapshot?: string | null;
  parts?: { part_name?: string | null; sku?: string | null } | null;
};

type BookingRow = {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_note?: string | null;
  booking_status: string;
  created_at: string;
  total_amount?: number | null;
  currency?: string | null;
  delivery_method?: string | null;
  customer_city?: string | null;
  shipping_address?: string | null;
  booking_items?: BookingItem[];
};

export function BookingsTable() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError('Admin API is not configured.');
      setLoading(false);
      return;
    }
    apiFetch<BookingRow[]>(apiUrl, '/api/v1/admin/bookings?limit=100')
      .then(setRows)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-table-state">Loading bookings from the database…</div>;
  if (error) return <div className="admin-alert">{error}</div>;
  if (!rows.length) return <div className="empty-table-state">No bookings have been saved yet.</div>;

  return (
    <div className="data-table booking-table-wrap">
      <div className="table-head booking-grid">
        <span>Booking</span>
        <span>Customer</span>
        <span>Selected product</span>
        <span>Total</span>
        <span>Delivery</span>
        <span>Status / received</span>
      </div>
      {rows.map((row) => {
        const items = row.booking_items ?? [];
        return (
          <div className="table-row booking-grid" key={row.id}>
            <div className="booking-cell booking-id"><strong>{row.booking_number}</strong><small>{new Date(row.created_at).toLocaleString()}</small></div>
            <div className="booking-cell"><strong>{row.customer_name}</strong><a href={`tel:${row.customer_phone}`}>{row.customer_phone}</a>{row.customer_email && <a href={`mailto:${row.customer_email}`}>{row.customer_email}</a>}{row.customer_note && <small className="booking-note" title={row.customer_note}>{row.customer_note}</small>}</div>
            <div className="booking-cell booking-products">
              {items.length ? items.map((item, index) => <span key={`${row.id}-${index}`}><strong>{item.part_name_snapshot || item.parts?.part_name || 'Catalog product'}</strong><small>{item.sku_snapshot || item.parts?.sku || '—'} · Qty {item.quantity}</small></span>) : <small>No item snapshot</small>}
            </div>
            <div className="booking-cell booking-total"><strong>{formatSar(Number(row.total_amount ?? 0))}</strong><small>{row.currency || 'SAR'}</small></div>
            <div className="booking-cell"><strong>{row.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}</strong><small>{row.customer_city || 'City not provided'}</small>{row.shipping_address && <small title={row.shipping_address}>{row.shipping_address}</small>}</div>
            <div className="booking-cell"><b className={`status ${row.booking_status}`}>{row.booking_status}</b><small>{new Date(row.created_at).toLocaleDateString()}</small></div>
          </div>
        );
      })}
    </div>
  );
}
