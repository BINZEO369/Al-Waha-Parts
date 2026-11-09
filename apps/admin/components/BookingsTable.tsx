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
  bookings: BookingRow[];
  totalSpent: number;
  latestBooking: BookingRow;
};

/* =========================================================
 * HELPERS
 * =======================================================*/
function statusClass(status: string) {
  return status.replace(/\s+/g, '-');
}

function getGroupKey(row: BookingRow): string {
  return (row.customer_phone || row.customer_name || row.id).trim().toLowerCase();
}

function isRecent(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* =========================================================
 * STATUS SELECT
 * =======================================================*/
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
    <div className={`status-wrap ${statusClass(row.booking_status)}`}>
      <select
        className="status-select"
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
      <svg
        className="status-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* =========================================================
 * COPY BUTTON
 * =======================================================*/
function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy phone number'}
      title={copied ? 'Copied!' : 'Copy phone'}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

/* =========================================================
 * MAIN COMPONENT
 * =======================================================*/
export function BookingsTable() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount' | 'orders'>('newest');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    adminFetch<BookingRow[]>('/api/v1/admin/bookings?limit=100')
      .then(setRows)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load bookings.'),
      )
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Group by phone ---------- */
  const groups = useMemo<CustomerGroup[]>(() => {
    const map = new Map<string, CustomerGroup>();
    rows.forEach((row) => {
      const key = getGroupKey(row);
      if (!map.has(key)) {
        map.set(key, {
          key,
          phone: row.customer_phone,
          name: row.customer_name,
          email: row.customer_email,
          bookings: [],
          totalSpent: 0,
          latestBooking: row,
        });
      }
      const group = map.get(key)!;
      group.bookings.push(row);
      group.totalSpent += Number(row.total_amount ?? 0);
      if (new Date(row.created_at) > new Date(group.latestBooking.created_at)) {
        group.latestBooking = row;
        group.name = row.customer_name;
        group.email = row.customer_email;
        group.phone = row.customer_phone;
      }
    });

    const result = Array.from(map.values());
    result.forEach((g) => {
      g.bookings.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    });
    return result;
  }, [rows]);

  /* ---------- Stats ---------- */
  const stats = useMemo(
    () => ({
      total: rows.length,
      customers: groups.length,
      pending: rows.filter((r) => r.booking_status === 'pending').length,
      revenue: rows.reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0),
    }),
    [rows, groups],
  );

  /* ---------- Filter + sort ---------- */
  const filteredGroups = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = groups
      .map((group) => {
        const bookings = group.bookings.filter((b) => {
          if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
          if (!term) return true;
          return (
            b.booking_number.toLowerCase().includes(term) ||
            b.customer_name.toLowerCase().includes(term) ||
            (b.customer_phone || '').toLowerCase().includes(term) ||
            (b.customer_email || '').toLowerCase().includes(term) ||
            (b.customer_city || '').toLowerCase().includes(term) ||
            (b.booking_items ?? []).some((it) =>
              (
                it.part_name_snapshot ||
                it.parts?.part_name ||
                ''
              )
                .toLowerCase()
                .includes(term),
            )
          );
        });
        return { ...group, bookings };
      })
      .filter((g) => g.bookings.length > 0);

    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.latestBooking.created_at).getTime() -
          new Date(a.latestBooking.created_at).getTime(),
      );
    } else if (sortBy === 'oldest') {
      sorted.sort(
        (a, b) =>
          new Date(a.latestBooking.created_at).getTime() -
          new Date(b.latestBooking.created_at).getTime(),
      );
    } else if (sortBy === 'amount') {
      sorted.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'orders') {
      sorted.sort((a, b) => b.bookings.length - a.bookings.length);
    }
    return sorted;
  }, [groups, search, statusFilter, sortBy]);

  /* ---------- Auto-expand ---------- */
  useEffect(() => {
    if (!filteredGroups.length) return;
    const next = new Set<string>();
    let multi = 0;
    filteredGroups.forEach((g) => {
      if (g.bookings.length === 1) {
        next.add(g.key);
      } else if (multi < 2) {
        next.add(g.key);
        multi++;
      }
    });
    setExpanded(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGroups.length]);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /* ---------- States ---------- */
  if (loading) return <div className="empty-table-state">Loading bookings from the database…</div>;
  if (error) return <div className="admin-alert">{error}</div>;

  return (
    <>
      <style jsx>{`
        /* =========================================================
         * COLOR SYSTEM: WHITE / BLACK / RED  (only 3 colors)
         * White: #fff, #fafafa, #f5f5f5, #eee, #ddd, #ccc
         * Black: #000, #111, #333, #555, #666, #888, #999
         * Red:   #dc2626, #b91c1c, #fee2e2, #fca5a5
         * =======================================================*/

        .bookings-page {
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
        }

        /* ================= STATS BAR ================= */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .stats-bar {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          border-color: #ccc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        .stat-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #888;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .stat-card.pending {
          border-left: 3px solid #dc2626;
        }
        .stat-card.pending .stat-value {
          color: #dc2626;
        }
        .stat-card.revenue {
          background: #111;
          border-color: #111;
        }
        .stat-card.revenue .stat-label {
          color: #aaa;
        }
        .stat-card.revenue .stat-value {
          color: #fff;
        }

        /* ================= FILTER BAR ================= */
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          padding: 12px;
        }
        @media (min-width: 900px) {
          .filter-bar {
            flex-direction: row;
            align-items: center;
            padding: 12px 14px;
          }
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: #999;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 10px 12px 10px 34px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: all 0.2s;
        }
        .search-input::placeholder {
          color: #999;
        }
        .search-input:focus {
          border-color: #111;
          background: #fff;
        }

        .status-pills {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          flex-shrink: 0;
        }
        .status-pills::-webkit-scrollbar { display: none; }
        .status-pill {
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #e5e5e5;
          background: #fff;
          color: #111;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          text-transform: capitalize;
          letter-spacing: 0.2px;
        }
        .status-pill:hover {
          border-color: #111;
        }
        .status-pill.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .sort-label {
          font-size: 11px;
          font-weight: 800;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .sort-select {
          padding: 8px 10px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #111;
          background: #fff;
          cursor: pointer;
          outline: none;
        }
        .sort-select:focus {
          border-color: #111;
        }

        /* ================= GROUP LIST ================= */
        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ================= CUSTOMER GROUP ================= */
        .customer-group {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .customer-group.open {
          border-color: #d4d4d4;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #fafafa;
          cursor: pointer;
          transition: background 0.15s;
          outline: none;
          border: none;
          width: 100%;
          text-align: left;
          font: inherit;
          color: inherit;
        }
        .group-header:hover {
          background: #f5f5f5;
        }
        .group-header:focus-visible {
          background: #f5f5f5;
          box-shadow: inset 0 0 0 2px #111;
        }
        .customer-group.open .group-header {
          border-bottom: 1px solid #ebebeb;
          background: #fafafa;
        }

        .customer-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }

        .customer-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .customer-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .customer-name {
          font-size: 14px;
          font-weight: 800;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .customer-phone-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .customer-phone {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .copy-btn {
          width: 20px;
          height: 20px;
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
        .copy-btn:hover {
          color: #111;
          border-color: #111;
        }
        .copy-btn.copied {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .group-stats {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .group-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }
        .group-stat-value {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          line-height: 1.1;
        }
        .group-stat.spent .group-stat-value {
          color: #dc2626;
        }
        .group-stat-label {
          font-size: 9px;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .chevron {
          width: 18px;
          height: 18px;
          color: #999;
          transition: transform 0.25s ease, color 0.2s;
          flex-shrink: 0;
        }
        .customer-group.open .chevron {
          transform: rotate(180deg);
          color: #111;
        }

        /* ================= GROUP BODY ================= */
        .group-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: #fafafa;
        }

        /* ================= BOOKING CARD ================= */
        .booking-item {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .booking-item:hover {
          border-color: #d4d4d4;
        }

        .booking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 1px solid #f5f5f5;
          flex-wrap: wrap;
        }

        .booking-id-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .booking-number {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          letter-spacing: 0.2px;
        }
        .booking-date {
          font-size: 11px;
          color: #888;
          font-weight: 500;
        }
        .new-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          background: #dc2626;
          color: #fff;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .booking-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 12px 14px;
        }
        @media (min-width: 768px) {
          .booking-body {
            grid-template-columns: 2fr 1fr;
            gap: 14px;
          }
        }

        /* ---------- Products ---------- */
        .booking-products {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .product-row {
          display: flex;
          gap: 10px;
          padding: 8px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          align-items: center;
        }
        .product-thumb {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #ebebeb;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          color: #ccc;
          overflow: hidden;
        }
        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
        }
        .product-detail {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .product-title {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-sub {
          font-size: 10px;
          color: #888;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-qty {
          font-size: 10px;
          font-weight: 800;
          color: #b91c1c;
          padding: 3px 8px;
          background: #fee2e2;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .no-products {
          font-size: 11px;
          color: #999;
          font-style: italic;
          padding: 10px;
          background: #fafafa;
          border: 1px dashed #e5e5e5;
          border-radius: 8px;
          text-align: center;
        }

        /* ---------- Summary ---------- */
        .booking-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-left: 14px;
          border-left: 1px solid #f0f0f0;
          justify-content: center;
        }
        @media (max-width: 767px) {
          .booking-summary {
            padding-left: 0;
            border-left: none;
            border-top: 1px solid #f0f0f0;
            padding-top: 12px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          }
        }

        .summary-total {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .summary-label {
          font-size: 9px;
          font-weight: 800;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-amount-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .summary-amount {
          font-size: 18px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.3px;
          line-height: 1;
        }
        .summary-currency {
          font-size: 10px;
          font-weight: 700;
          color: #999;
        }

        .delivery-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          padding: 5px 9px;
          border-radius: 6px;
          width: fit-content;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .delivery-badge.delivery {
          background: #111;
          color: #fff;
        }
        .delivery-badge.pickup {
          background: #fff;
          color: #111;
          border: 1px solid #111;
        }
        .delivery-badge svg {
          width: 11px;
          height: 11px;
        }
        .delivery-city {
          font-size: 11px;
          color: #666;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .delivery-address {
          font-size: 10px;
          color: #999;
          font-weight: 500;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* ================= STATUS SELECT ================= */
        .status-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .status-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 7px 26px 7px 10px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
          text-transform: capitalize;
          letter-spacing: 0.3px;
          font-family: inherit;
        }
        .status-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .status-arrow {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          pointer-events: none;
          color: inherit;
        }

        /* pending — neutral (white / black) */
        .status-wrap.pending { color: #111; }
        .status-wrap.pending .status-select {
          background: #fff;
          color: #111;
          border-color: #d4d4d4;
        }

        /* confirmed — black outline */
        .status-wrap.confirmed { color: #111; }
        .status-wrap.confirmed .status-select {
          background: #fff;
          color: #111;
          border-color: #111;
        }

        /* processing — light red */
        .status-wrap.processing { color: #b91c1c; }
        .status-wrap.processing .status-select {
          background: #fee2e2;
          color: #b91c1c;
          border-color: #fca5a5;
        }

        /* completed — filled black */
        .status-wrap.completed { color: #fff; }
        .status-wrap.completed .status-select {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        /* cancelled — filled red */
        .status-wrap.cancelled { color: #fff; }
        .status-wrap.cancelled .status-select {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }

        /* ================= EMPTY ================= */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 60px 20px;
          background: #fff;
          border: 1px dashed #e5e5e5;
          border-radius: 16px;
          color: #999;
        }
        .empty-state svg {
          width: 36px;
          height: 36px;
          color: #ccc;
        }
        .empty-state p {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
        }

        /* ================= MOBILE ================= */
        @media (max-width: 768px) {
          .group-header {
            padding: 14px;
            gap: 10px;
          }
          .customer-avatar {
            width: 36px;
            height: 36px;
            font-size: 12px;
          }
          .group-stats {
            gap: 10px;
          }
          .group-stat-value {
            font-size: 12px;
          }
          .booking-body {
            padding: 10px 12px;
          }
          .booking-header {
            padding: 10px 12px;
          }
        }
        @media (max-width: 480px) {
          .group-stat.spent {
            display: none;
          }
        }
      `}</style>

      <div className="bookings-page">
        {/* ============ STATS ============ */}
        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Customers</span>
            <span className="stat-value">{stats.customers}</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card revenue">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">{formatSar(stats.revenue)}</span>
          </div>
        </div>

        {/* ============ FILTERS ============ */}
        <div className="filter-bar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name, phone, booking #, product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="status-pills" role="tablist" aria-label="Filter by status">
            {['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                type="button"
                className={`status-pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
                role="tab"
                aria-selected={statusFilter === s}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="sort-wrap">
            <span className="sort-label">Sort</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'newest' | 'oldest' | 'amount' | 'orders')
              }
              aria-label="Sort bookings"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount">Highest Amount</option>
              <option value="orders">Most Orders</option>
            </select>
          </div>
        </div>

        {/* ============ EMPTY ============ */}
        {!filteredGroups.length ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p>{rows.length ? 'No bookings match your filters' : 'No bookings yet'}</p>
          </div>
        ) : (
          <div className="groups-list">
            {filteredGroups.map((group) => {
              const isOpen = expanded.has(group.key);
              const initials = getInitials(group.name);
              return (
                <div
                  key={group.key}
                  className={`customer-group ${isOpen ? 'open' : ''}`}
                >
                  {/* ====== GROUP HEADER ====== */}
                  <button
                    type="button"
                    className="group-header"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={isOpen}
                  >
                    <div className="customer-avatar">{initials}</div>
                    <div className="customer-meta">
                      <div className="customer-name-row">
                        <span className="customer-name">{group.name}</span>
                      </div>
                      <div className="customer-phone-row">
                        <span className="customer-phone">{group.phone}</span>
                        <CopyPhoneButton phone={group.phone} />
                      </div>
                    </div>
                    <div className="group-stats">
                      <div className="group-stat">
                        <span className="group-stat-value">
                          {group.bookings.length}
                        </span>
                        <span className="group-stat-label">
                          {group.bookings.length === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>
                      <div className="group-stat spent">
                        <span className="group-stat-value">
                          {formatSar(group.totalSpent)}
                        </span>
                        <span className="group-stat-label">Total</span>
                      </div>
                    </div>
                    <svg
                      className="chevron"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* ====== GROUP BODY ====== */}
                  {isOpen && (
                    <div className="group-body">
                      {group.bookings.map((booking) => {
                        const items = booking.booking_items ?? [];
                        const isDelivery = booking.delivery_method === 'delivery';
                        const recent = isRecent(booking.created_at);
                        return (
                          <div className="booking-item" key={booking.id}>
                            {/* header row */}
                            <div className="booking-header">
                              <div className="booking-id-info">
                                <span className="booking-number">
                                  #{booking.booking_number}
                                </span>
                                <span className="booking-date">
                                  {new Date(booking.created_at).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {recent && <span className="new-badge">NEW</span>}
                              </div>
                              <BookingStatusControl
                                row={booking}
                                onSaved={(status) =>
                                  setRows((current) =>
                                    current.map((item) =>
                                      item.id === booking.id
                                        ? { ...item, booking_status: status }
                                        : item,
                                    ),
                                  )
                                }
                              />
                            </div>

                            {/* body: products + summary */}
                            <div className="booking-body">
                              <div className="booking-products">
                                {items.length ? (
                                  items.map((item, idx) => (
                                    <div
                                      className="product-row"
                                      key={`${booking.id}-${idx}`}
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
                                      <div className="product-detail">
                                        <span className="product-title">
                                          {item.part_name_snapshot ||
                                            item.parts?.part_name ||
                                            'Catalog product'}
                                        </span>
                                        <span className="product-sub">
                                          {item.sku_snapshot ||
                                            item.parts?.sku ||
                                            '—'}
                                          {item.vehicles &&
                                            ` · ${item.vehicles.manufacturers?.manufacturer_name ?? ''} ${item.vehicles.model_name ?? ''}`.trimEnd()}
                                        </span>
                                      </div>
                                      <span className="product-qty">
                                        ×{item.quantity}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="no-products">
                                    No product details available
                                  </div>
                                )}
                              </div>

                              <div className="booking-summary">
                                <div className="summary-total">
                                  <span className="summary-label">Total</span>
                                  <div className="summary-amount-row">
                                    <span className="summary-amount">
                                      {formatSar(Number(booking.total_amount ?? 0))}
                                    </span>
                                    <span className="summary-currency">
                                      {booking.currency || 'SAR'}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`delivery-badge ${isDelivery ? 'delivery' : 'pickup'}`}
                                >
                                  {isDelivery ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <rect x="1" y="3" width="15" height="13" />
                                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                      <circle cx="5.5" cy="18.5" r="2.5" />
                                      <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                  ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                      <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                  )}
                                  {isDelivery ? 'Delivery' : 'Pickup'}
                                </span>

                                <div className="delivery-city">
                                  {booking.customer_city || 'City not provided'}
                                </div>
                                {booking.shipping_address && (
                                  <div className="delivery-address">
                                    {booking.shipping_address}
                                  </div>
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
