'use client';

import { useEffect, useMemo, useState } from 'react';
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

type CustomerGroup = {
  key: string;
  phone: string;
  name: string;
  email?: string | null;
  note?: string | null;
  bookings: BookingRow[];
  totalAmount: number;
  latestAt: string;
  pendingCount: number;
};

type SortKey = 'newest' | 'oldest' | 'amount';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

function statusClass(status: string) {
  return status.replace(/\s+/g, '-');
}

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function groupByCustomer(rows: BookingRow[]): CustomerGroup[] {
  const map = new Map<string, CustomerGroup>();
  for (const row of rows) {
    const key = (row.customer_phone || row.customer_email || row.id).toString().trim();
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        phone: row.customer_phone,
        name: row.customer_name,
        email: row.customer_email,
        note: row.customer_note,
        bookings: [],
        totalAmount: 0,
        latestAt: row.created_at,
        pendingCount: 0,
      };
      map.set(key, g);
    }
    g.bookings.push(row);
    g.totalAmount += Number(row.total_amount ?? 0);
    if (row.booking_status === 'pending') g.pendingCount += 1;
    if (new Date(row.created_at) > new Date(g.latestAt)) {
      g.latestAt = row.created_at;
      g.name = row.customer_name;
      if (row.customer_phone) g.phone = row.customer_phone;
      if (row.customer_email) g.email = row.customer_email;
      if (row.customer_note) g.note = row.customer_note;
    } else if (!g.email && row.customer_email) {
      g.email = row.customer_email;
    }
  }
  for (const g of map.values()) {
    g.bookings.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return Array.from(map.values());
}

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
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function BookingsTable() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copiedPhone, setCopiedPhone] = useState('');

  useEffect(() => {
    adminFetch<BookingRow[]>('/api/v1/admin/bookings?limit=100')
      .then(setRows)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load bookings.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalOrders = rows.length;
    const customerKeys = new Set(rows.map((r) => r.customer_phone || r.customer_email || r.id));
    const totalCustomers = customerKeys.size;
    const totalRevenue = rows.reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);
    const pending = rows.filter((r) => r.booking_status === 'pending').length;
    return { totalOrders, totalCustomers, totalRevenue, pending };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.booking_status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => {
        if (r.customer_name?.toLowerCase().includes(q)) return true;
        if (r.customer_phone?.includes(q)) return true;
        if (r.booking_number?.toLowerCase().includes(q)) return true;
        if (r.customer_email?.toLowerCase().includes(q)) return true;
        if (r.customer_city?.toLowerCase().includes(q)) return true;
        if (
          r.booking_items?.some((it) => {
            const name = it.part_name_snapshot || it.parts?.part_name || '';
            const sku = it.sku_snapshot || it.parts?.sku || '';
            return name.toLowerCase().includes(q) || sku.toLowerCase().includes(q);
          })
        )
          return true;
        return false;
      });
    }
    return result;
  }, [rows, statusFilter, query]);

  const groups = useMemo(() => {
    const list = groupByCustomer(filteredRows);
    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.latestAt).getTime() - new Date(b.latestAt).getTime());
    } else if (sortBy === 'amount') {
      list.sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
      list.sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
    }
    return list;
  }, [filteredRows, sortBy]);

  function isExpanded(group: CustomerGroup) {
    const val = expanded[group.key];
    if (val !== undefined) return val;
    return group.bookings.length === 1 || group.pendingCount > 0;
  }

  function toggle(group: CustomerGroup) {
    setExpanded((prev) => ({ ...prev, [group.key]: !isExpanded(group) }));
  }

  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone((p) => (p === phone ? '' : p)), 1500);
    } catch {
      /* ignore */
    }
  }

  function updateBookingStatus(bookingId: string, newStatus: string) {
    setRows((current) =>
      current.map((r) => (r.id === bookingId ? { ...r, booking_status: newStatus } : r)),
    );
  }

  if (loading)
    return <div className="empty-table-state">Loading bookings from the database…</div>;
  if (error) return <div className="admin-alert">{error}</div>;
  if (!rows.length)
    return <div className="empty-table-state">No bookings have been saved yet.</div>;

  return (
    <>
      <style jsx>{`
        .bookings-wrapper {
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ================= STATS ================= */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 16px 18px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .stat-card:hover {
          border-color: #111;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #111;
        }
        .stat-card.accent::before {
          background: #dc2626;
        }
        .stat-label {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 6px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 900;
          color: #111;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .stat-value.red {
          color: #dc2626;
        }
        .stat-sub {
          font-size: 10.5px;
          color: rgba(0, 0, 0, 0.4);
          margin-top: 5px;
          font-weight: 500;
        }

        /* ================= TOOLBAR ================= */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 10px;
        }
        .search-box {
          flex: 1 1 220px;
          position: relative;
          min-width: 0;
        }
        .search-box input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          font-size: 13px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: #fafafa;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          color: #111;
        }
        .search-box input:focus {
          border-color: #111;
          background: #fff;
        }
        .search-box input::placeholder {
          color: rgba(0, 0, 0, 0.35);
        }
        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: rgba(0, 0, 0, 0.4);
          pointer-events: none;
        }

        .filter-select {
          appearance: none;
          padding: 10px 32px 10px 12px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: #fafafa;
          cursor: pointer;
          outline: none;
          font-family: inherit;
          color: #111;
          transition: all 0.2s ease;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23111' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .filter-select:hover,
        .filter-select:focus {
          border-color: #111;
          background-color: #fff;
        }

        /* ================= GROUPS ================= */
        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .customer-group {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }
        .customer-group:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .customer-group.has-pending {
          border-color: #dc2626;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          cursor: pointer;
          user-select: none;
          background: #fff;
          transition: background 0.15s ease;
        }
        .group-header:hover {
          background: #fafafa;
        }

        .group-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 900;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .customer-group.has-pending .group-avatar {
          background: #dc2626;
        }

        .group-info {
          flex: 1;
          min-width: 0;
        }
        .group-name {
          font-size: 15px;
          font-weight: 800;
          color: #111;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .group-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.55);
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .group-meta a {
          color: inherit;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .group-meta a:hover {
          color: #dc2626;
        }
        .copy-btn {
          background: none;
          border: none;
          padding: 0;
          color: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          text-decoration: underline;
          font-family: inherit;
        }
        .copy-btn:hover {
          color: #dc2626;
        }

        .order-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #111;
          color: #fff;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }
        .order-count-badge.pending {
          background: #dc2626;
        }

        .group-total {
          text-align: right;
          flex-shrink: 0;
          margin-right: 8px;
        }
        .group-total-label {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(0, 0, 0, 0.4);
        }
        .group-total-amount {
          font-size: 16px;
          font-weight: 900;
          color: #111;
          letter-spacing: -0.3px;
          margin-top: 2px;
        }

        .expand-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #111;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .expand-btn:hover {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .expand-btn svg {
          width: 14px;
          height: 14px;
          transition: transform 0.25s ease;
        }
        .expand-btn.open svg {
          transform: rotate(180deg);
        }

        /* ================= ORDERS ================= */
        .group-orders {
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .order-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          overflow: hidden;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .order-id {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .order-id small {
          font-size: 11px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.5);
        }

        .order-body {
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 700px) {
          .order-body {
            grid-template-columns: 2fr 1fr;
            gap: 16px;
          }
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .product-item {
          display: flex;
          gap: 10px;
          padding: 8px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }
        .product-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 800;
          color: rgba(0, 0, 0, 0.25);
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
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
        .product-name {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-sku {
          font-size: 10.5px;
          color: rgba(0, 0, 0, 0.5);
          font-weight: 500;
        }
        .product-chips {
          display: flex;
          gap: 5px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .chip {
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 20px;
          background: #111;
          color: #fff;
          letter-spacing: 0.2px;
        }
        .chip.fitment {
          background: #fff;
          color: #dc2626;
          border: 1px solid #dc2626;
        }

        .no-items {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.4);
          font-style: italic;
          padding: 10px;
          background: #fafafa;
          border-radius: 6px;
          border: 1px dashed #e5e5e5;
          text-align: center;
        }

        .order-summary {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .order-total-box {
          background: #111;
          color: #fff;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .order-total-label {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2px;
        }
        .order-total-amount {
          font-size: 17px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .delivery-method {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 800;
          padding: 5px 9px;
          border-radius: 6px;
          width: fit-content;
          border: 1.5px solid #111;
          background: #fff;
          color: #111;
        }
        .delivery-method.delivery {
          background: #111;
          color: #fff;
        }
        .delivery-method.pickup {
          background: #fff;
          color: #111;
        }
        .delivery-method svg {
          width: 12px;
          height: 12px;
        }

        .delivery-detail {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.55);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .delivery-detail strong {
          color: #111;
          font-weight: 700;
        }
        .order-note {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.6);
          background: #fafafa;
          border-left: 2px solid #dc2626;
          border-radius: 4px;
          padding: 6px 9px;
          line-height: 1.4;
          font-style: italic;
        }

        /* ================= STATUS SELECT (BW+RED ONLY) ================= */
        :global(.booking-status-select) {
          appearance: none;
          padding: 6px 28px 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          border: 1.5px solid #111;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          text-transform: capitalize;
          letter-spacing: 0.3px;
          background-color: #fff;
          color: #111;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23111' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 8px center;
          font-family: inherit;
        }
        :global(.booking-status-select:disabled) {
          opacity: 0.5;
          cursor: wait;
        }
        :global(.booking-status-select.pending) {
          border-color: #dc2626;
          color: #dc2626;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
        }
        :global(.booking-status-select.confirmed) {
          border-color: #111;
          color: #111;
        }
        :global(.booking-status-select.processing) {
          border-color: #dc2626;
          background-color: #dc2626;
          color: #fff;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
        }
        :global(.booking-status-select.completed) {
          border-color: #111;
          background-color: #111;
          color: #fff;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
        }
        :global(.booking-status-select.cancelled) {
          border-color: #dc2626;
          color: #dc2626;
          border-style: dashed;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
        }

        /* ================= STATES ================= */
        .empty-table-state {
          padding: 40px 20px;
          text-align: center;
          color: rgba(0, 0, 0, 0.5);
          font-size: 13px;
          background: #fafafa;
          border: 1px dashed #e5e5e5;
          border-radius: 12px;
          font-weight: 500;
        }
        .admin-alert {
          padding: 14px 18px;
          background: #fff;
          border: 1.5px solid #dc2626;
          color: #dc2626;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
        }

        /* ================= MOBILE ================= */
        @media (max-width: 600px) {
          .group-header {
            flex-wrap: wrap;
          }
          .group-info {
            flex-basis: calc(100% - 100px);
          }
          .group-total {
            order: 3;
            text-align: left;
            margin-right: 0;
            width: 100%;
            display: flex;
            gap: 8px;
            align-items: baseline;
          }
          .expand-btn {
            margin-left: auto;
          }
          .stat-value {
            font-size: 20px;
          }
          .group-orders {
            padding: 12px;
          }
          .order-body {
            padding: 12px;
          }
          .group-meta {
            gap: 8px;
          }
        }
      `}</style>

      <div className="bookings-wrapper">
        {/* ============ STATS ============ */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Customers</div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-sub">Unique phones</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Pending</div>
            <div className="stat-value red">{stats.pending}</div>
            <div className="stat-sub">Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">{formatSar(stats.totalRevenue)}</div>
            <div className="stat-sub">All bookings</div>
          </div>
        </div>

        {/* ============ TOOLBAR ============ */}
        <div className="toolbar">
          <div className="search-box">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, booking #, part, SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount">Highest amount</option>
          </select>
        </div>

        {/* ============ GROUPS ============ */}
        {!groups.length ? (
          <div className="empty-table-state">No bookings match your filters.</div>
        ) : (
          <div className="groups-list">
            {groups.map((group) => {
              const open = isExpanded(group);
              const hasPending = group.pendingCount > 0;
              return (
                <div
                  key={group.key}
                  className={`customer-group ${hasPending ? 'has-pending' : ''}`}
                >
                  <div
                    className="group-header"
                    onClick={() => toggle(group)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(group);
                      }
                    }}
                  >
                    <div className="group-avatar">{initials(group.name)}</div>
                    <div className="group-info">
                      <div className="group-name">
                        {group.name}
                        <span className="order-count-badge">
                          {group.bookings.length}{' '}
                          {group.bookings.length === 1 ? 'order' : 'orders'}
                        </span>
                        {hasPending && (
                          <span className="order-count-badge pending">
                            {group.pendingCount} pending
                          </span>
                        )}
                      </div>
                      <div
                        className="group-meta"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`tel:${group.phone}`}>{group.phone}</a>
                        {group.email && (
                          <a href={`mailto:${group.email}`}>{group.email}</a>
                        )}
                        {group.phone && (
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => void copyPhone(group.phone)}
                          >
                            {copiedPhone === group.phone ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="group-total">
                      <div className="group-total-label">Total Spent</div>
                      <div className="group-total-amount">
                        {formatSar(group.totalAmount)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`expand-btn ${open ? 'open' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(group);
                      }}
                      aria-label={open ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {open && (
                    <div className="group-orders">
                      {group.bookings.map((row) => {
                        const items = row.booking_items ?? [];
                        const isDelivery = row.delivery_method === 'delivery';
                        return (
                          <div className="order-card" key={row.id}>
                            <div className="order-header">
                              <div className="order-id">
                                <strong>{row.booking_number}</strong>
                                <small>
                                  {new Date(row.created_at).toLocaleString()}
                                </small>
                              </div>
                              <BookingStatusControl
                                row={row}
                                onSaved={(status) =>
                                  updateBookingStatus(row.id, status)
                                }
                              />
                            </div>
                            <div className="order-body">
                              <div className="products-list">
                                {items.length ? (
                                  items.map((item, i) => (
                                    <div
                                      className="product-item"
                                      key={`${row.id}-${i}`}
                                    >
                                      <div className="product-thumb">
                                        {item.parts?.primary_image_url ? (
                                          <img
                                            src={item.parts.primary_image_url}
                                            alt=""
                                            loading="lazy"
                                          />
                                        ) : (
                                          'AWP'
                                        )}
                                      </div>
                                      <div className="product-info">
                                        <span className="product-name">
                                          {item.part_name_snapshot ||
                                            item.parts?.part_name ||
                                            'Catalog product'}
                                        </span>
                                        <span className="product-sku">
                                          SKU:{' '}
                                          {item.sku_snapshot ||
                                            item.parts?.sku ||
                                            '—'}
                                        </span>
                                        <div className="product-chips">
                                          <span className="chip">
                                            Qty {item.quantity}
                                          </span>
                                          {item.vehicles && (
                                            <span className="chip fitment">
                                              {item.vehicles.manufacturers
                                                ?.manufacturer_name ??
                                                'Manufacturer'}{' '}
                                              {item.vehicles.model_name}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="no-items">No item snapshot</div>
                                )}
                              </div>
                              <div className="order-summary">
                                <div className="order-total-box">
                                  <div className="order-total-label">
                                    Order Total
                                  </div>
                                  <div className="order-total-amount">
                                    {formatSar(Number(row.total_amount ?? 0))}
                                  </div>
                                </div>
                                <span
                                  className={`delivery-method ${
                                    isDelivery ? 'delivery' : 'pickup'
                                  }`}
                                >
                                  {isDelivery ? (
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="1"
                                        y="3"
                                        width="15"
                                        height="13"
                                      ></rect>
                                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                      <circle
                                        cx="18.5"
                                        cy="18.5"
                                        r="2.5"
                                      ></circle>
                                    </svg>
                                  ) : (
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                  )}
                                  {isDelivery ? 'Delivery' : 'Pickup'}
                                </span>
                                <span className="delivery-detail">
                                  <strong>
                                    {row.customer_city || 'City not provided'}
                                  </strong>
                                  {row.shipping_address
                                    ? ` · ${row.shipping_address}`
                                    : ''}
                                </span>
                                {row.customer_note && (
                                  <span className="order-note">
                                    “{row.customer_note}”
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
