'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { adminFetch } from '../lib/auth';

type ResourceKind = 'parts' | 'vehicles' | 'categories' | 'admins';
type Resource = Record<string, unknown> & { id: string };

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
};
const config: Record<
  ResourceKind,
  { endpoint: string; title: string; empty: string; search: string; fields: Field[] }
> = {
  parts: {
    endpoint: '/api/v1/admin/parts',
    title: 'Inventory records',
    empty: 'No parts found in the live catalog.',
    search: 'Search part, SKU, brand, or OEM number…',
    fields: [
      { key: 'part_name', label: 'Part name', required: true },
      { key: 'sku', label: 'SKU', required: true },
      { key: 'brand_name', label: 'Brand' },
      { key: 'oem_number', label: 'OEM number' },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'sale_price', label: 'Sale price', type: 'number' },
      { key: 'stock_quantity', label: 'Stock quantity', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'select', options: ['SAR', 'AED'] },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['active', 'inactive', 'draft', 'out_of_stock'],
      },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_featured', label: 'Featured record', type: 'checkbox' },
    ],
  },
  vehicles: {
    endpoint: '/api/v1/admin/vehicles',
    title: 'Vehicle records',
    empty: 'No vehicles found in the fitment library.',
    search: 'Search manufacturer, model, or chassis…',
    fields: [
      { key: 'manufacturer_name', label: 'Manufacturer', required: true },
      { key: 'model_name', label: 'Model', required: true },
      { key: 'generation', label: 'Generation' },
      { key: 'chassis_code', label: 'Chassis code' },
      { key: 'year_start', label: 'Year from', type: 'number' },
      { key: 'year_end', label: 'Year to', type: 'number' },
      { key: 'vehicle_type', label: 'Vehicle type' },
      { key: 'slug', label: 'URL slug' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'draft'] },
      { key: 'cover_image_url', label: 'Cover image URL' },
      { key: 'is_featured', label: 'Featured vehicle', type: 'checkbox' },
    ],
  },
  categories: {
    endpoint: '/api/v1/admin/categories',
    title: 'Category records',
    empty: 'No categories found in the catalog.',
    search: 'Search category name or slug…',
    fields: [
      { key: 'category_name', label: 'Category name', required: true },
      { key: 'slug', label: 'URL slug', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      { key: 'image_url', label: 'Image URL' },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'is_featured', label: 'Featured category', type: 'checkbox' },
    ],
  },
  admins: {
    endpoint: '/api/v1/admin/admins',
    title: 'Team access records',
    empty: 'No admin records found.',
    search: 'Search name, email, or role…',
    fields: [],
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

function initialValues(fields: Field[], row?: Resource | null) {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      row?.[field.key] ?? (field.type === 'checkbox' ? false : ''),
    ]),
  );
}

export function AdminResourcePanel({ kind }: { kind: ResourceKind }) {
  const [rows, setRows] = useState<Resource[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);
  const meta = config[kind];

  const load = () => {
    setLoading(true);
    adminFetch<Resource[]>(meta.endpoint)
      .then(setRows)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Live data could not be loaded.'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
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
        <div className="section-actions">
          <span className="section-meta">Supabase · live</span>
          {meta.fields.length > 0 && (
            <button
              className="primary-button compact-button"
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(true);
              }}
            >
              + Add new
            </button>
          )}
        </div>
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
                {meta.fields.length > 0 ? (
                  <button
                    className="edit-button"
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setEditing(row);
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <span className="read-only-label">Read only</span>
                )}
              </article>
            );
          })}
        </div>
      )}
      {(creating || editing) && (
        <ResourceForm
          kind={kind}
          row={editing}
          fields={meta.fields}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </section>
  );
}

function ResourceForm({
  kind,
  row,
  fields,
  onClose,
  onSaved,
}: {
  kind: ResourceKind;
  row: Resource | null;
  fields: Field[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues(fields, row));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: string, value: unknown) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined,
        ),
      );
      for (const field of fields)
        if (field.type === 'number' && payload[field.key] !== undefined)
          payload[field.key] = Number(payload[field.key]);
      await adminFetch(row ? `${config[kind].endpoint}/${row.id}` : config[kind].endpoint, {
        method: row ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="resource-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{row ? 'Edit record' : 'New record'}</span>
            <h3>
              {row ? 'Update' : 'Create'} {config[kind].title.replace(' records', '')}
            </h3>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close form">
            ×
          </button>
        </div>
        <div className="form-grid">
          {fields.map((field) => (
            <label
              className={
                field.type === 'textarea'
                  ? 'form-field full-width'
                  : field.type === 'checkbox'
                    ? 'form-checkbox'
                    : 'form-field'
              }
              key={field.key}
            >
              {field.type === 'checkbox' ? (
                <>
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={(event) => set(field.key, event.target.checked)}
                  />
                  {field.label}
                </>
              ) : (
                <>
                  <span>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => set(field.key, event.target.value)}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => set(field.key, event.target.value)}
                    >
                      <option value="">Choose…</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type ?? 'text'}
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => set(field.key, event.target.value)}
                    />
                  )}
                </>
              )}
            </label>
          ))}
        </div>
        {error && (
          <div className="admin-alert" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : row ? 'Save changes' : 'Create record'}
          </button>
        </div>
      </form>
    </div>
  );
}
