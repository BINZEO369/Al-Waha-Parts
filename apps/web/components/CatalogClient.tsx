'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { PartCard, type PartCardData } from './PartCard';

type Category = { id: string; category_name: string; slug?: string | null; image_url?: string | null };

export function CatalogClient() {
  const [parts, setParts] = useState<PartCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') ?? '');
    setCategoryId(params.get('category') ?? '');
    setVehicleId(params.get('vehicle_id') ?? '');
  }, []);

  useEffect(() => {
    if (!apiUrl) {
      setError('Catalog API is not configured. Add NEXT_PUBLIC_API_URL to the Web project.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      apiFetch<PartCardData[]>(
        apiUrl,
        `/api/v1/parts?limit=100&search=${encodeURIComponent(search)}${categoryId ? `&category_id=${categoryId}` : ''}${vehicleId ? `&vehicle_id=${vehicleId}` : ''}`,
      ),
      apiFetch<Category[]>(apiUrl, '/api/v1/categories'),
    ])
      .then(([nextParts, nextCategories]) => {
        setParts(nextParts);
        setCategories(nextCategories);
      })
      .catch((cause) => {
        setParts([]);
        setError(cause instanceof Error ? cause.message : 'Unable to load the live catalog.');
      })
      .finally(() => setLoading(false));
  }, [apiUrl, search, categoryId, vehicleId]);

  return (
    <>
      <div className="catalog-toolbar">
        <div>
          <span className="eyebrow">Live inventory / from Supabase</span>
          <h1>Parts that fit the work.</h1>
        </div>
        <div className="search-field">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part, brand or SKU"
          />
        </div>
      </div>
      <div className="category-list" aria-label="Part categories">
        <button className={!categoryId ? 'category-chip active' : 'category-chip'} onClick={() => setCategoryId('')}>
          All categories
        </button>
        {categories.map((category) => (
          <button
            className={categoryId === category.id ? 'category-chip active' : 'category-chip'}
            key={category.id}
            onClick={() => setCategoryId(category.id)}
          >
            {category.image_url && <img className="category-chip-image" src={category.image_url} alt="" />}
            {category.category_name}
          </button>
        ))}
      </div>
      {error && <div className="data-alert">{error}</div>}
      <div className="catalog-grid">
        {loading ? (
          <div className="empty-state">Loading the latest catalog from the database…</div>
        ) : parts.length ? (
          parts.map((part) => <PartCard key={part.id} part={part} />)
        ) : (
          <div className="empty-state">
            <strong>No parts are published yet.</strong>
            <span>When an active part is added in Supabase, it will appear here automatically.</span>
          </div>
        )}
      </div>
    </>
  );
}
