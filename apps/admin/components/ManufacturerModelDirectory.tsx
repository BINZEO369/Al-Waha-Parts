'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../lib/auth';

type Manufacturer = {
  id: string;
  manufacturer_name: string;
  logo_url?: string | null;
  model_count?: number;
  status?: string | null;
  is_active?: boolean;
};
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

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function ManufacturerModelDirectory() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    Promise.all([
      adminFetch<Manufacturer[]>('/api/v1/admin/manufacturers'),
      adminFetch<Model[]>('/api/v1/admin/vehicles'),
    ])
      .then(([brandRows, modelRows]) => {
        setManufacturers(brandRows);
        setModels(modelRows);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Manufacturer models could not be loaded.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleManufacturers = useMemo(
    () => manufacturers.filter((manufacturer) => !normalizedQuery || manufacturer.manufacturer_name.toLowerCase().includes(normalizedQuery)),
    [manufacturers, normalizedQuery],
  );
  const filteredModels = useMemo(() => models.filter((model) => {
    const matchesManufacturer = selectedManufacturer === 'all' || model.manufacturer_id === selectedManufacturer;
    const haystack = `${model.manufacturer_name ?? ''} ${model.model_name} ${model.generation ?? ''}`.toLowerCase();
    return matchesManufacturer && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [models, normalizedQuery, selectedManufacturer]);
  const groupedModels = useMemo(() => {
    const groups = new Map<string, Model[]>();
    filteredModels.forEach((model) => groups.set(model.manufacturer_id, [...(groups.get(model.manufacturer_id) ?? []), model]));
    return Array.from(groups.entries());
  }, [filteredModels]);

  return (
    <section className="content-section model-directory" aria-labelledby="manufacturer-model-directory-title">
      <div className="section-title">
        <div>
          <span className="eyebrow"><b>09A</b>Manufacturer model map</span>
          <h2 id="manufacturer-model-directory-title">Logo-led model library.</h2>
          <p>Choose a manufacturer logo to focus its models. Every card is loaded from the normalized live database relationship.</p>
        </div>
        <Link className="text-button" href="/vehicles">Manage models ↗</Link>
      </div>
      {loading && <div className="empty-table-state loading-state">Loading the live manufacturer model map…</div>}
      {!loading && error && <div className="admin-alert" role="alert">{error}<button className="text-button" type="button" onClick={load}>Try again</button></div>}
      {!loading && !error && (
        <>
          <div className="manufacturer-logo-grid" aria-label="Manufacturer logos">
            <button className={`manufacturer-logo-card ${selectedManufacturer === 'all' ? 'selected' : ''}`} type="button" onClick={() => setSelectedManufacturer('all')}>
              <span className="manufacturer-logo-mark all-mark">ALL</span>
              <strong>All brands</strong>
              <small>{models.length} models</small>
            </button>
            {visibleManufacturers.map((manufacturer) => {
              const count = models.filter((model) => model.manufacturer_id === manufacturer.id).length;
              return (
                <button
                  className={`manufacturer-logo-card ${selectedManufacturer === manufacturer.id ? 'selected' : ''}`}
                  key={manufacturer.id}
                  type="button"
                  onClick={() => setSelectedManufacturer(manufacturer.id)}
                  aria-pressed={selectedManufacturer === manufacturer.id}
                >
                  <span className="manufacturer-logo-mark">
                    {manufacturer.logo_url ? <img src={manufacturer.logo_url} alt="" loading="lazy" /> : initials(manufacturer.manufacturer_name)}
                  </span>
                  <strong>{manufacturer.manufacturer_name}</strong>
                  <small>{count} {count === 1 ? 'model' : 'models'}</small>
                </button>
              );
            })}
          </div>
          <div className="directory-toolbar">
            <label className="field-search">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model or manufacturer…" aria-label="Search model or manufacturer" />
            </label>
            <span className="directory-result-count">{filteredModels.length} matching models</span>
          </div>
          {!filteredModels.length && <div className="empty-table-state">No models match this filter.</div>}
          {groupedModels.map(([manufacturerId, manufacturerModels]) => {
            const manufacturer = manufacturers.find((item) => item.id === manufacturerId);
            return (
              <section className="model-group" key={manufacturerId} aria-labelledby={`model-group-${manufacturerId}`}>
                <div className="model-group-heading">
                  <div className="model-group-brand">
                    <span className="model-group-logo">{manufacturer?.logo_url ? <img src={manufacturer.logo_url} alt="" /> : initials(manufacturer?.manufacturer_name ?? manufacturerModels[0]?.manufacturer_name ?? 'Brand')}</span>
                    <div><span className="eyebrow">Manufacturer</span><h3 id={`model-group-${manufacturerId}`}>{manufacturer?.manufacturer_name ?? manufacturerModels[0]?.manufacturer_name ?? 'Manufacturer'}</h3></div>
                  </div>
                  <span className="section-meta">{manufacturerModels.length} models</span>
                </div>
                <div className="model-directory-grid">
                  {manufacturerModels.map((model) => (
                    <article className="model-directory-card" key={model.id}>
                      <div className="model-directory-media">
                        {model.cover_image_url ? <img src={model.cover_image_url} alt="" loading="lazy" /> : <span>{initials(model.model_name)}</span>}
                      </div>
                      <div className="model-directory-copy">
                        <small>{model.generation ?? 'Model record'}</small>
                        <strong>{model.model_name}</strong>
                        <span>{model.year_start ?? '—'}–{model.year_end ?? 'Present'} · {model.status ?? 'unknown'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}
