'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { PartCard, type PartCardData } from './PartCard';

const fallback: PartCardData[] = [
  {
    id: 'demo-1',
    part_name: 'Front brake pad set',
    brand_name: 'Brembo',
    sku: 'AWP-BR-001',
    price: 280,
    sale_price: 245,
    condition: 'New',
    tested_status: 'tested',
    stock_quantity: 8,
  },
  {
    id: 'demo-2',
    part_name: 'Oil filter housing',
    brand_name: 'Mann',
    sku: 'AWP-OF-044',
    price: 145,
    condition: 'New',
    tested_status: 'tested',
    stock_quantity: 12,
  },
  {
    id: 'demo-3',
    part_name: 'Alternator assembly',
    brand_name: 'Bosch',
    sku: 'AWP-AL-208',
    price: 640,
    condition: 'Refurbished',
    tested_status: 'tested',
    stock_quantity: 3,
  },
];

export function CatalogClient() {
  const [parts, setParts] = useState<PartCardData[]>(fallback);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
      setLoading(false);
      return;
    }
    apiFetch<PartCardData[]>(url, `/api/v1/parts?limit=24&search=${encodeURIComponent(search)}`)
      .then(setParts)
      .catch(() => setParts(fallback))
      .finally(() => setLoading(false));
  }, [search]);
  const visible = parts.filter((p) =>
    `${p.part_name} ${p.brand_name ?? ''} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="catalog-toolbar">
        <div>
          <span className="eyebrow">Inventory / curated selection</span>
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
      <div className="catalog-grid">
        {loading ? (
          <div className="empty-state">Loading the latest catalog…</div>
        ) : visible.length ? (
          visible.map((part) => <PartCard key={part.id} part={part} />)
        ) : (
          <div className="empty-state">
            No parts match that search. Try a part number or request it directly.
          </div>
        )}
      </div>
    </>
  );
}
