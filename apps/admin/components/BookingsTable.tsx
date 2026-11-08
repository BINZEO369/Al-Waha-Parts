'use client';

import { useEffect, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { adminFetch } from '../lib/auth';

type BookingItem = {
  quantity: number;
  unit_price: number;
  line_total?: number | null;
  part_name_snapshot?: string | null;
  sku_snapshot?: string | null;
  parts?: { part_name?: string | null; sku?: string | null; primary_image_url?: string | null } | null;
  vehicles?: { manufacturer_name?: string | null; model_name?: string | null; cover_image_url?: string | null } | null;
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

function BookingStatusControl({
  row,
  onSaved,
}: {
  row: BookingRow;
  onSaved: (status: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  async function update(status: string) {
    setSaving(true);
    try {
      await adminFetch(`/api/v1/admin/bookings/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ booking_status: status }),
      });
      onSaved(status);
    } finally {
      setSaving(false);
    }
  }
  return (
    <select
      className={`booking-status-select ${statusClass(row.booking_status)}`}
      value={row.booking_status}
      disabled={saving}
      onChange={(event) => void update(event.target.value)}
      aria-label={`Update ${row.booking_number} status`}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

function statusClass(status: string) {
  return status.replace(/\s+/g, '-');
}

export function BookingsTable() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch<BookingRow[]>('/api/v1/admin/bookings?limit=100')
      .then(setRows)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load bookings.'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-table-state">Loading bookings from the database…</div>;
  if (error) return <div className="admin-alert">{error}</div>;
  if (!rows.length)
    return <div className="empty-table-state">No bookings have been saved yet.</div>;

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
            <div className="booking-cell booking-id">
              <strong>{row.booking_number}</strong>
              <small>{new Date(row.created_at).toLocaleString()}</small>
            </div>
            <div className="booking-cell">
              <strong>{row.customer_name}</strong>
              <a href={`tel:${row.customer_phone}`}>{row.customer_phone}</a>
              {row.customer_email && (
                <a href={`mailto:${row.customer_email}`}>{row.customer_email}</a>
              )}
              {row.customer_note && (
                <small className="booking-note" title={row.customer_note}>
                  {row.customer_note}
                </small>
              )}
            </div>
            <div className="booking-cell booking-products">
              {items.length ? (
                items.map((item, index) => (
                  <span className="booking-product-line" key={`${row.id}-${index}`}>
                    <span className="booking-product-thumb">{item.parts?.primary_image_url ? <img src={item.parts.primary_image_url} alt="" loading="lazy" /> : 'AWP'}</span>
                    <span><strong>{item.part_name_snapshot || item.parts?.part_name || 'Catalog product'}</strong><small>{item.sku_snapshot || item.parts?.sku || '—'} · Qty {item.quantity}</small>{item.vehicles && <small className="booking-fitment">{item.vehicles.manufacturer_name} {item.vehicles.model_name}</small>}</span>
                  </span>
                ))
              ) : (
                <small>No item snapshot</small>
              )}
            </div>
            <div className="booking-cell booking-total">
              <strong>{formatSar(Number(row.total_amount ?? 0))}</strong>
              <small>{row.currency || 'SAR'}</small>
            </div>
            <div className="booking-cell">
              <strong>{row.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}</strong>
              <small>{row.customer_city || 'City not provided'}</small>
              {row.shipping_address && (
                <small title={row.shipping_address}>{row.shipping_address}</small>
              )}
            </div>
            <div className="booking-cell">
              <BookingStatusControl
                row={row}
                onSaved={(status) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.id === row.id ? { ...item, booking_status: status } : item,
                    ),
                  )
                }
              />
              <small>{new Date(row.created_at).toLocaleDateString()}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
