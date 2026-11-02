'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { adminFetch } from '../lib/auth';

type ResourceKind = 'parts' | 'vehicles' | 'categories' | 'admins';

type Resource = Record<string, unknown> & { id: string };

const config: Record<
  ResourceKind,
  { endpoint: string; title: string; empty: string; search: string }
> = {
  parts: {
    endpoint: '/api/v1/admin/parts',
    title: 'Inventory records',
    empty: 'No parts found in the live catalog.',
    search: 'Search part, SKU, brand, or OEM number…',
  },
  vehicles: {
    endpoint: '/api/v1/admin/vehicles',
    title: 'Vehicle records',
    empty: 'No vehicles found in the fitment library.',
    search: 'Search manufacturer, model, or chassis…',
  },
  categories: {
    endpoint: '/api/v1/admin/categories',
    title: 'Category records',
    empty: 'No categories found in the catalog.',
    search: 'Search category name or slug…',
  },
  admins: {
    endpoint: '/api/v1/admin/admins',
    title: 'Team access records',
    empty: 'No admin records found.',
    search: 'Search name, email, or role…',
  },
};

function text(value: unknown, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}
function statusClass(value: unknown) {
  return `status ${String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '-')}`;
}

function summary(kind: ResourceKind, row: Resource) {
  if (kind === 'parts')
    return {
      title: text(row.part_name),
      meta: `${text(row.sku)} · ${text(row.brand_name, 'Unbranded')}`,
      detail: `${text(row.stock_quantity, '0')} units · ${formatSar(Number(row.sale_price ?? row.price ?? 0))}`,
      status: row.status,
    };
  if (kind === 'vehicles')
    return {
      title: `${text(row.manufacturer_name)} ${text(row.model_name)}`,
      meta: `${text(row.generation, 'Generation not set')} · ${text(row.chassis_code, 'No chassis')}`,
      detail: `${text(row.year_start, '—')}–${text(row.year_end, '—')} · ${text(row.vehicle_type, 'Vehicle')}`,
      status: row.status,
    };
  if (kind === 'categories')
    return {
      title: text(row.category_name),
      meta: text(row.slug),
      detail: `${row.is_featured ? 'Featured' : 'Standard'} · order ${text(row.sort_order, '0')}`,
      status: row.status,
    };
  return {
    title: text(row.name),
    meta: text(row.email),
    detail: `${text(row.role)} · ${text(row.last_seen_at, 'Not seen yet')}`,
    status: row.status,
  };
}

export function AdminResourcePanel({ kind }: { kind: ResourceKind }) {
  const [rows, setRows] = useState<Resource[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const meta = config[kind];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminFetch<Resource[]>(meta.endpoint)
      .then((data) => {
        if (mounted) setRows(data);
      })
      .catch((cause: unknown) => {
        if (mounted)
          setError(cause instanceof Error ? cause.message : 'Live data could not be loaded.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [meta.endpoint]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = Object.values(row)
          .filter((value) => typeof value === 'string' || typeof value === 'number')
          .join(' ')
          .toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) && (status === 'all' || row.status === status)
        );
      }),
    [rows, query, status],
  );
  const statuses = Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean)));

  return (
    <section className="resource-panel content-section" aria-labelledby={`${kind}-records`}>
      <div className="section-title">
        <div>
          <span className="eyebrow">
            <b>
              {kind === 'parts'
                ? '02'
                : kind === 'vehicles'
                  ? '03'
                  : kind === 'categories'
                    ? '04'
                    : '06'}
            </b>
            {meta.title}
          </span>
          <h2 id={`${kind}-records`}>{meta.title}</h2>
          <p>
            {filtered.length} of {rows.length} live records
          </p>
        </div>
        <span className="section-meta">Supabase · live</span>
      </div>
      <div className="toolbar-card resource-toolbar">
        <div className="field-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={meta.search}
            aria-label={meta.search}
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <div className="empty-table-state loading-state">
          <span className="loading-spinner" /> Loading live {kind} from Supabase…
        </div>
      )}
      {!loading && error && (
        <div className="admin-alert" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && !filtered.length && (
        <div className="empty-table-state">
          {rows.length ? 'No records match your search or filter.' : meta.empty}
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="resource-list">
          {filtered.map((row) => {
            const item = summary(kind, row);
            return (
              <article className="resource-row" key={row.id}>
                <div className="resource-avatar">{item.title.slice(0, 2).toUpperCase()}</div>
                <div className="resource-main">
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </div>
                <div className="resource-detail">
                  <strong>{item.detail}</strong>
                  <small>
                    {kind === 'parts'
                      ? `Price · ${text(row.currency, 'SAR')}`
                      : kind === 'admins'
                        ? 'Access review'
                        : 'Live database record'}
                  </small>
                </div>
                <span className={statusClass(item.status)}>
                  {text(item.status, 'unknown').replace(/_/g, ' ')}
                </span>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`More actions for ${item.title}`}
                >
                  •••
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
