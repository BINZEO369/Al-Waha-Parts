'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { adminFetch } from '../lib/auth';
import { ImageKitUploadField } from './ImageKitUploadField';

type ResourceKind = 'parts' | 'vehicles' | 'manufacturers' | 'categories' | 'admins' | 'banners';
type Resource = Record<string, unknown> & { id: string };

type Lookup = { id: string; manufacturer_id?: string; manufacturer_name?: string; model_name?: string; category_name?: string; generation?: string | null; slug?: string | null };

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
  upload?: 'single' | 'multiple';
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
      { key: 'category_id', label: 'Category', type: 'select', required: true },
      { key: 'manufacturer_id', label: 'Manufacturer', type: 'select' },
      { key: 'model_id', label: 'Vehicle model', type: 'select' },
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
      { key: 'primary_image_url', label: 'Primary image', upload: 'single' },
      { key: 'image_urls', label: 'Gallery images', type: 'textarea', upload: 'multiple' },
      { key: 'is_featured', label: 'Featured record', type: 'checkbox' },
    ],
  },
  manufacturers: {
    endpoint: '/api/v1/admin/manufacturers',
    title: 'Manufacturer records',
    empty: 'No manufacturers found in the live database.',
    search: 'Search manufacturer, slug, or country…',
    fields: [
      { key: 'manufacturer_name', label: 'Manufacturer name', required: true },
      { key: 'slug', label: 'URL slug', required: true },
      { key: 'logo_url', label: 'Logo image', upload: 'single' },
      { key: 'country', label: 'Country' },
      { key: 'founded_year', label: 'Founded year', type: 'number' },
      { key: 'company_description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'draft'] },
      { key: 'is_active', label: 'Visible in storefront', type: 'checkbox' },
      { key: 'sort_order', label: 'Display order', type: 'number' },
    ],
  },
  vehicles: {
    endpoint: '/api/v1/admin/vehicles',
    title: 'Vehicle records',
    empty: 'No vehicles found in the fitment library.',
    search: 'Search manufacturer, model, or chassis…',
    fields: [
      { key: 'manufacturer_id', label: 'Manufacturer', type: 'select', required: true },
      { key: 'model_name', label: 'Model name', required: true },
      { key: 'generation', label: 'Generation' },
      { key: 'chassis_code', label: 'Chassis code' },
      { key: 'year_start', label: 'Start year', type: 'number' },
      { key: 'year_end', label: 'End year', type: 'number' },
      { key: 'engine_code', label: 'Engine code' },
      { key: 'engine_capacity', label: 'Engine capacity', type: 'number' },
      { key: 'fuel_type', label: 'Fuel type' },
      { key: 'transmission', label: 'Transmission' },
      { key: 'vehicle_type', label: 'Vehicle type' },
      { key: 'slug', label: 'URL slug', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'draft'] },
      { key: 'cover_image_url', label: 'Cover image', upload: 'single' },
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
      { key: 'image_url', label: 'Category image', upload: 'single' },
      { key: 'sort_order', label: 'Display order', type: 'number' },
      { key: 'is_featured', label: 'Featured category', type: 'checkbox' },
    ],
  },
  banners: {
    endpoint: '/api/v1/admin/banners',
    title: 'Hero banner records',
    empty: 'No hero banners found.',
    search: 'Search hero title, slug, or CTA…',
    fields: [
      { key: 'slug', label: 'Slug', required: true },
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Headline', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'cta_label', label: 'CTA label', required: true },
      { key: 'cta_href', label: 'CTA link', required: true },
      { key: 'image_url', label: 'Desktop image', required: true, upload: 'single' },
      { key: 'mobile_image_url', label: 'Mobile image', upload: 'single' },
      { key: 'badge_text', label: 'Badge text' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'active', 'inactive', 'archived'],
      },
      { key: 'sort_order', label: 'Display order', type: 'number' },
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
  if (kind === 'manufacturers')
    return {
      title: text(row.manufacturer_name),
      meta: `${text(row.slug)} · ${text(row.country, 'Country not set')}`,
      detail: `${row.is_active === false ? 'Hidden' : 'Visible'} · ${text(row.logo_url, 'No logo')}`,
      status: row.status,
    };
  if (kind === 'vehicles')
    return {
      title: `${text(row.manufacturer_name)} ${text(row.model_name)}`,
      meta: `${text(row.generation, 'Generation not set')} · ${text(row.chassis_code, 'No chassis')}`,
      detail: `${text(row.vehicle_type, 'Vehicle')} · logo ID ${text(row.manufacturer_id, 'not linked')}`,
      status: row.status,
    };
  if (kind === 'categories')
    return {
      title: text(row.category_name),
      meta: text(row.slug),
      detail: `${row.is_featured ? 'Featured' : 'Standard'} · order ${text(row.sort_order, '0')}`,
      status: row.status,
    };
  if (kind === 'banners')
    return {
      title: text(row.title),
      meta: `${text(row.slug)} · ${text(row.eyebrow, 'No eyebrow')}`,
      detail: `${text(row.cta_label)} → ${text(row.cta_href)} · order ${text(row.sort_order, '0')}`,
      status: row.status,
    };
  return {
    title: text(row.name),
    meta: text(row.email),
    detail: `${text(row.role)} · ${text(row.last_seen_at, 'Not seen yet')}`,
    status: row.status,
  };
}

function nextAvailabilityStatus(kind: ResourceKind, row: Resource): 'active' | 'inactive' | null {
  const current = String(row.status ?? '');
  if (current === 'active') return 'inactive';
  if (current === 'inactive') return 'active';
  if (
    current === 'draft' ||
    current === 'archived' ||
    (kind === 'admins' && current === 'suspended')
  )
    return 'active';
  return null;
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
  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);
  const meta = config[kind];

  const load = () => {
    setLoading(true);
    setError('');
    setActionError('');
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
  const activeCount = rows.filter((row) => row.status === 'active').length;
  const inactiveCount = rows.filter((row) => row.status === 'inactive').length;
  const otherStatuses = statuses.filter((value) => value !== 'active' && value !== 'inactive');
  async function setAvailability(row: Resource, nextStatus: 'active' | 'inactive') {
    setActionError('');
    try {
      await adminFetch(`${meta.endpoint}/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      load();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Status could not be updated.');
    }
  }
  async function remove(row: Resource, title: string) {
    const confirmation =
      kind === 'banners'
        ? `Permanently delete ${title}? It will be removed from the database and live storefront. This cannot be undone.`
        : `Delete ${title}? This will hide it from the storefront and keep its history safe.`;
    if (!window.confirm(confirmation)) return;
    setError('');
    try {
      await adminFetch(`${meta.endpoint}/${row.id}`, { method: 'DELETE' });
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This record could not be deleted.');
    }
  }

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
                  : kind === 'manufacturers'
                    ? '03A'
                  : kind === 'categories'
                    ? '04'
                    : kind === 'admins'
                      ? '06'
                      : '08'}
            </b>
            {meta.title}
          </span>
          <h2 id={`${kind}-records`}>{meta.title}</h2>
          <p>
            {filtered.length} of {rows.length} records shown
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
        <div className="availability-filter" role="group" aria-label="Filter records by status">
          <button
            className="availability-filter-button"
            type="button"
            aria-pressed={status === 'all'}
            onClick={() => setStatus('all')}
          >
            All <span>{rows.length}</span>
          </button>
          <button
            className="availability-filter-button"
            type="button"
            aria-pressed={status === 'active'}
            onClick={() => setStatus('active')}
          >
            Active <span>{activeCount}</span>
          </button>
          <button
            className="availability-filter-button"
            type="button"
            aria-pressed={status === 'inactive'}
            onClick={() => setStatus('inactive')}
          >
            Inactive <span>{inactiveCount}</span>
          </button>
          <select
            value={otherStatuses.includes(status) ? status : 'all'}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by another status"
          >
            <option value="all">Other statuses</option>
            {otherStatuses.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
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
      {!loading && actionError && (
        <div className="admin-alert" role="alert">
          {actionError}
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
            const nextStatus = nextAvailabilityStatus(kind, row);
            const canToggleStatus = kind !== 'admins' || row.can_manage_access === true;
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
                <div className="resource-actions">
                  {nextStatus && canToggleStatus && (
                    <button
                      className={`availability-action-button ${nextStatus === 'active' ? 'activate' : 'deactivate'}`}
                      type="button"
                      onClick={() => void setAvailability(row, nextStatus)}
                    >
                      {nextStatus === 'active' ? 'Set active' : 'Set inactive'}
                    </button>
                  )}
                  {meta.fields.length > 0 && (
                    <>
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
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => void remove(row, item.title)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {meta.fields.length === 0 && !(nextStatus && canToggleStatus) && (
                    <span className="read-only-label">Read only</span>
                  )}
                </div>
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
  const [lookups, setLookups] = useState<{ manufacturers: Lookup[]; models: Lookup[]; categories: Lookup[] }>({ manufacturers: [], models: [], categories: [] });
  useEffect(() => {
    if (kind !== 'parts' && kind !== 'vehicles') return;
    adminFetch<typeof lookups>('/api/v1/admin/lookups').then(setLookups).catch(() => undefined);
  }, [kind]);
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
      if (typeof payload.image_urls === 'string') {
        try { payload.image_urls = JSON.parse(payload.image_urls); }
        catch { payload.image_urls = String(payload.image_urls).split(/[,\n]/).map((url: string) => url.trim()).filter(Boolean); }
      }
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
          {fields.map((field) => {
            const dynamicOptions = field.key === 'manufacturer_id' ? lookups.manufacturers : field.key === 'model_id' ? lookups.models.filter((model) => !values.manufacturer_id || model.manufacturer_id === values.manufacturer_id) : field.key === 'category_id' ? lookups.categories : undefined;
            const optionLabel = (option: string | Lookup) => typeof option === 'string' ? option.replace(/_/g, ' ') : option.manufacturer_name ?? option.model_name ?? option.category_name ?? option.slug ?? option.id;
            const optionValue = (option: string | Lookup) => typeof option === 'string' ? option : option.id;
            return (<label
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
                  {field.upload ? (
                    <>
                      <ImageKitUploadField
                        value={values[field.key]}
                        multiple={field.upload === 'multiple'}
                        folder={kind}
                        onChange={(value) => set(field.key, value)}
                      />
                      <input
                        required={field.required}
                        type="text"
                        value={String(values[field.key] ?? '')}
                        onChange={(event) => set(field.key, event.target.value)}
                        placeholder="ImageKit URL will appear here"
                      />
                    </>
                  ) : field.type === 'textarea' ? (
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
                      {(dynamicOptions ?? field.options ?? []).map((option) => (
                        <option key={optionValue(option)} value={optionValue(option)}>
                          {optionLabel(option)}
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
          );
          })}
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
