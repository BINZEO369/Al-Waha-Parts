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
  vehicles?: { model_name?: string | null; cover_image_url?: string | null; manufacturers?: { manufacturer_name?: string | null } | null } | null;
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
    <>
      <style jsx>{`
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ================= CARD ================= */
        .booking-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .booking-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
        }

        /* ================= HEADER ================= */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #fafafa;
          border-bottom: 1px solid #eef0f2;
          flex-wrap: wrap;
        }
        .booking-id-block {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .booking-id-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #fee2e2;
          color: #dc2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .booking-number {
          font-size: 15px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
          letter-spacing: 0.2px;
        }
        .booking-date {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-top: 3px;
        }

        /* ================= BODY ================= */
        .card-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 20px;
        }
        @media (min-width: 900px) {
          .card-body {
            grid-template-columns: 1.15fr 2fr 1fr;
            gap: 24px;
          }
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .section-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #6b7280;
        }

        /* ---------- Customer ---------- */
        .customer-name {
          font-size: 15px;
          font-weight: 800;
          color: #111;
          line-height: 1.3;
        }
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .contact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
        }
        .contact-row svg {
          width: 14px;
          height: 14px;
          color: #9ca3af;
          flex-shrink: 0;
        }
        .contact-row a {
          color: #374151;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }
        .contact-row a:hover {
          color: #dc2626;
          text-decoration: underline;
        }

        .customer-note {
          font-size: 12px;
          color: #6b7280;
          background: #fffbeb;
          border-left: 3px solid #fbbf24;
          border-radius: 6px;
          padding: 8px 10px;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* ---------- Products ---------- */
        .products-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .product-item {
          display: flex;
          gap: 12px;
          padding: 10px;
          background: #fafafa;
          border: 1px solid #f1f2f4;
          border-radius: 10px;
          transition: background 0.15s ease;
        }
        .product-item:hover {
          background: #f5f6f7;
        }
        .product-thumb {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 800;
          color: #d1d5db;
        }
        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
        }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
          flex: 1;
        }
        .product-name {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .product-sku {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }
        .product-chips {
          display: flex;
          gap: 6px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .chip {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          background: #fee2e2;
          color: #b91c1c;
          letter-spacing: 0.2px;
        }
        .chip.fitment {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .no-items {
          font-size: 12px;
          color: #9ca3af;
          font-style: italic;
          padding: 10px;
          background: #fafafa;
          border-radius: 8px;
          border: 1px dashed #e5e7eb;
          text-align: center;
        }

        /* ---------- Summary ---------- */
        .summary {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .total-box {
          background: #111;
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
        }
        .total-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #d1d5db;
          margin-bottom: 4px;
        }
        .total-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .total-amount {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .total-currency {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
        }

        .delivery-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .delivery-method {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 8px;
          width: fit-content;
        }
        .delivery-method svg {
          width: 14px;
          height: 14px;
        }
        .delivery-method.delivery {
          background: #ecfdf5;
          color: #065f46;
        }
        .delivery-method.pickup {
          background: #f5f3ff;
          color: #5b21b6;
        }
        .delivery-detail {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .delivery-detail strong {
          color: #374151;
          font-weight: 700;
        }

        /* ================= STATUS SELECT ================= */
        :global(.booking-status-select) {
          appearance: none;
          padding: 8px 32px 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          text-transform: capitalize;
          letter-spacing: 0.2px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        :global(.booking-status-select:disabled) {
          opacity: 0.6;
          cursor: wait;
        }
        :global(.booking-status-select.pending) {
          background-color: #fef3c7;
          color: #92400e;
        }
        :global(.booking-status-select.confirmed) {
          background-color: #dbeafe;
          color: #1e40af;
        }
        :global(.booking-status-select.processing) {
          background-color: #ede9fe;
          color: #5b21b6;
        }
        :global(.booking-status-select.completed) {
          background-color: #d1fae5;
          color: #065f46;
        }
        :global(.booking-status-select.cancelled) {
          background-color: #fee2e2;
          color: #991b1b;
        }

        /* ================= MOBILE ================= */
        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: stretch;
          }
          .card-header > :last-child {
            display: flex;
            justify-content: flex-end;
          }
          .card-body {
            padding: 16px;
            gap: 20px;
          }
        }
      `}</style>

      <div className="bookings-list">
        {rows.map((row) => {
          const items = row.booking_items ?? [];
          const isDelivery = row.delivery_method === 'delivery';
          return (
            <div className="booking-card" key={row.id}>
              {/* Header */}
              <div className="card-header">
                <div className="booking-id-block">
                  <div className="booking-id-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="booking-number">{row.booking_number}</div>
                    <div className="booking-date">
                      {new Date(row.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
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
                </div>
              </div>

              {/* Body */}
              <div className="card-body">
                {/* 1. Customer */}
                <div className="section">
                  <span className="section-label">Customer</span>
                  <div className="customer-name">{row.customer_name}</div>
                  <div className="contact-list">
                    <div className="contact-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <a href={`tel:${row.customer_phone}`}>{row.customer_phone}</a>
                    </div>
                    {row.customer_email && (
                      <div className="contact-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <a href={`mailto:${row.customer_email}`}>{row.customer_email}</a>
                      </div>
                    )}
                  </div>
                  {row.customer_note && (
                    <div className="customer-note" title={row.customer_note}>
                      “{row.customer_note}”
                    </div>
                  )}
                </div>

                {/* 2. Products */}
                <div className="section">
                  <span className="section-label">
                    Selected Products ({items.length})
                  </span>
                  {items.length ? (
                    <div className="products-list">
                      {items.map((item, index) => (
                        <div className="product-item" key={`${row.id}-${index}`}>
                          <div className="product-thumb">
                            {item.parts?.primary_image_url ? (
                              <img src={item.parts.primary_image_url} alt="" loading="lazy" />
                            ) : (
                              'AWP'
                            )}
                          </div>
                          <div className="product-info">
                            <span className="product-name">
                              {item.part_name_snapshot || item.parts?.part_name || 'Catalog product'}
                            </span>
                            <span className="product-sku">
                              SKU: {item.sku_snapshot || item.parts?.sku || '—'}
                            </span>
                            <div className="product-chips">
                              <span className="chip">Qty {item.quantity}</span>
                              {item.vehicles && (
                                <span className="chip fitment">
                                  {item.vehicles.manufacturers?.manufacturer_name ?? 'Manufacturer'}{' '}
                                  {item.vehicles.model_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-items">No item snapshot</div>
                  )}
                </div>

                {/* 3. Summary */}
                <div className="summary">
                  <div className="total-box">
                    <div className="total-label">Total Amount</div>
                    <div className="total-row">
                      <span className="total-amount">{formatSar(Number(row.total_amount ?? 0))}</span>
                      <span className="total-currency">{row.currency || 'SAR'}</span>
                    </div>
                  </div>

                  <div className="delivery-block">
                    <span className="section-label">Delivery</span>
                    <span className={`delivery-method ${isDelivery ? 'delivery' : 'pickup'}`}>
                      {isDelivery ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      )}
                      {isDelivery ? 'Delivery' : 'Pickup'}
                    </span>
                    <span className="delivery-detail">
                      <strong>{row.customer_city || 'City not provided'}</strong>
                      {row.shipping_address ? ` · ${row.shipping_address}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
