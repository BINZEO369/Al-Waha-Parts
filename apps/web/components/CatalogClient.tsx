'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { PartCard, type PartCardData } from './PartCard';
import { PageLoader } from './PageLoader';

type Category = {
  id: string;
  category_name: string;
  slug?: string | null;
  image_url?: string | null;
};

export function CatalogClient() {
  const [parts, setParts] = useState<PartCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modelId, setModelId] = useState('');
  const [carBrandId, setCarBrandId] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [modelName, setModelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') ?? '');
    setCategoryId(params.get('category') ?? '');
    setCarBrandId(params.get('car_brand_id') ?? '');
    setModelId(params.get('model_id') ?? params.get('vehicle_id') ?? '');
    setModelYear(params.get('year') ?? '');
    const make = params.get('make') ?? '';
    const model = params.get('model') ?? '';
    setModelName([make, model].filter(Boolean).join(' '));
  }, []);

  useEffect(() => {
    if (!apiUrl) {
      setError('Catalog API is not configured. Add NEXT_PUBLIC_API_URL to the Web project.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const yearParam = modelYear ? `&year=${encodeURIComponent(modelYear)}` : '';
    Promise.all([
      apiFetch<PartCardData[]>(
        apiUrl,
        `/api/v1/parts?limit=100&search=${encodeURIComponent(search)}${categoryId ? `&category_id=${encodeURIComponent(categoryId)}` : ''}${carBrandId ? `&car_brand_id=${encodeURIComponent(carBrandId)}` : ''}${modelId ? `&model_id=${encodeURIComponent(modelId)}${yearParam}` : ''}`,
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
  }, [apiUrl, search, categoryId, carBrandId, modelId, modelYear]);

  const clearVehicleFilter = () => {
    setModelId('');
    setModelYear('');
    setModelName('');
  };

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search part, brand or SKU"
          />
        </div>
      </div>
      {modelId && (
        <div className="vehicle-filter-summary">
          <div>
            <small>Vehicle fitment active</small>
            <strong>
              {modelName || 'Selected model'}
              {modelYear ? ` · ${modelYear}` : ''}
            </strong>
            <span>Only parts compatible with this saved vehicle fitment are requested.</span>
          </div>
          <button type="button" onClick={clearVehicleFilter}>
            Clear vehicle
          </button>
        </div>
      )}
      <div className="category-list" aria-label="Part categories">
        <button
          className={!categoryId ? 'category-chip active' : 'category-chip'}
          onClick={() => setCategoryId('')}
        >
          All categories
        </button>
        {categories.map((category) => (
          <button
            className={categoryId === category.id ? 'category-chip active' : 'category-chip'}
            key={category.id}
            onClick={() => setCategoryId(category.id)}
          >
            {category.image_url && (
              <img className="category-chip-image" src={category.image_url} alt="" />
            )}
            {category.category_name}
          </button>
        ))}
      </div>
      {error && <div className="data-alert">{error}</div>}
      <div className="catalog-grid">
        {loading ? (
          <PageLoader label="Loading the latest catalog" />
        ) : parts.length ? (
          parts.map((part) => <PartCard key={part.id} part={part} />)
        ) : (
          <div className="empty-state">
            <strong>No compatible parts found.</strong>
            <span>
              {modelId
                ? 'Try another model year or vehicle generation, or ask the parts desk to verify fitment.'
                : 'When an active part is added in Supabase, it will appear here automatically.'}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
