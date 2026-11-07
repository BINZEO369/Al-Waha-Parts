'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../lib/auth';

type Manufacturer = { id: string; manufacturer_name: string; logo_url?: string | null; model_count?: number };
type Model = {
  id: string;
  manufacturer_id: string;
  manufacturer_name?: string;
  model_name: string;
  generation?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  cover_image_url?: string | null;
  status?: string | null;
};

export function ManufacturerModelDirectory() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminFetch<Manufacturer[]>('/api/v1/admin/car-brands'),
      adminFetch<Model[]>('/api/v1/admin/vehicles'),
    ])
      .then(([brandRows, modelRows]) => {
        setManufacturers(brandRows);
        setModels(modelRows);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Manufacturer models could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return models.filter((model) => {
      const matchesManufacturer = selectedManufacturer === 'all' || model.manufacturer_id === selectedManufacturer;
      const haystack = `${model.manufacturer_name ?? ''} ${model.model_name} ${model.generation ?? ''}`.toLowerCase();
      return matchesManufacturer && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [models, query, selectedManufacturer]);

  return (
    <section className="content-section model-directory" aria-labelledby="manufacturer-model-directory-title">
      <div className="section-title">
        <div>
          <span className="eyebrow"><b>09A</b>Manufacturer model map</span>
          <h2 id="manufacturer-model-directory-title">Every brand, every model.</h2>
          <p>Review the live normalized relationship before changing a logo or fitment record.</p>
        </div>
        <Link className="text-button" href="/vehicles">Manage models ↗</Link>
      </div>
      <div className="directory-toolbar">
        <label className="field-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model or manufacturer…" aria-label="Search model or manufacturer" />
        </label>
        <select value={selectedManufacturer} onChange={(event) => setSelectedManufacturer(event.target.value)} aria-label="Filter models by manufacturer">
          <option value="all">All manufacturers</option>
          {manufacturers.map((manufacturer) => <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.manufacturer_name}</option>)}
        </select>
      </div>
      {loading && <div className="empty-table-state loading-state">Loading the live manufacturer model map…</div>}
      {!loading && error && <div className="admin-alert" role="alert">{error}</div>}
      {!loading && !error && !filteredModels.length && <div className="empty-table-state">No models match this filter.</div>}
      {!loading && !error && filteredModels.length > 0 && (
        <div className="model-directory-grid">
          {filteredModels.map((model) => (
            <article className="model-directory-card" key={model.id}>
              <div className="model-directory-media">
                {model.cover_image_url ? <img src={model.cover_image_url} alt="" loading="lazy" /> : <span>{model.model_name.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="model-directory-copy">
                <small>{model.manufacturer_name ?? 'Manufacturer'}{model.generation ? ` · ${model.generation}` : ''}</small>
                <strong>{model.model_name}</strong>
                <span>{model.year_start ?? '—'}–{model.year_end ?? 'Present'} · {model.status ?? 'unknown'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
