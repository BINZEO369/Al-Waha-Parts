'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { HeroCarousel } from '../components/HeroCarousel';

type Category = {
  id: string;
  category_name: string;
  slug?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
};

type Part = {
  id: string;
  part_name: string;
  brand_name?: string | null;
  sku: string;
  price: number;
  sale_price?: number | null;
  condition?: string | null;
  tested_status?: string | null;
  stock_quantity?: number | null;
  primary_image_url?: string | null;
  image_urls?: string[] | null;
  parts_categories?: { category_name?: string | null } | null;
  is_featured?: boolean;
  sort_order?: number;
};

type Vehicle = {
  id: string;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  vehicle_type?: string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function money(value: number, currency = 'AED') {
  return `${currency} ${Number(value).toFixed(2)}`;
}

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [categories, setCategories] = useState<Category[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!apiUrl) {
      setError('Live catalog is not configured yet.');
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<Category[]>(apiUrl, '/api/v1/categories?limit=100'),
      apiFetch<Part[]>(apiUrl, '/api/v1/parts?limit=8'),
      apiFetch<Vehicle[]>(apiUrl, '/api/v1/vehicles?limit=8'),
    ])
      .then(([nextCategories, nextParts, nextVehicles]) => {
        setCategories(nextCategories);
        setParts(nextParts);
        setVehicles(nextVehicles);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load live database data.');
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const featuredCategories = useMemo(
    () => categories.filter((category) => category.is_featured).slice(0, 8),
    [categories],
  );
  const featuredParts = useMemo(
    () => parts.filter((part) => part.is_featured).slice(0, 4),
    [parts],
  );
  const featuredVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.is_featured).slice(0, 4),
    [vehicles],
  );
  const promoCategories = featuredCategories.slice(0, 3);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    window.location.href = value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog';
  }

  return (
    <main className="home-page">
      <HeroCarousel />

      {error && <div className="store-section data-alert home-data-alert">{error}</div>}
      {loading && <div className="store-section home-loading">Loading categories, parts and vehicles from the database…</div>}

      {!loading && featuredCategories.length > 0 && (
        <section className="store-section categories-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">From the live database</span>
              <h2>Popular Categories</h2>
            </div>
            <Link className="section-link" href="/catalog">View all categories <ArrowIcon /></Link>
          </div>
          <div className="category-grid">
            {featuredCategories.map((category) => (
              <Link className="category-card" href={`/catalog?category=${category.id}`} key={category.id}>
                {category.image_url ? <img src={category.image_url} alt="" /> : <span className="category-no-image">No image</span>}
                <span>
                  <strong>{category.category_name.trim()}</strong>
                  <small>{category.description || 'Browse available parts'}</small>
                </span>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && promoCategories.length > 0 && (
        <section className="store-section promo-section" aria-label="Database collections">
          {promoCategories.map((category) => (
            <Link className="promo-card promo-card-database" href={`/catalog?category=${category.id}`} key={category.id}>
              <div>
                <small>Database collection</small>
                <strong>{category.category_name.trim()}</strong>
                <span>Browse parts <ArrowIcon /></span>
              </div>
              {category.image_url && <img src={category.image_url} alt="" />}
            </Link>
          ))}
        </section>
      )}

      {!loading && featuredParts.length > 0 && (
        <section className="store-section arrivals-section">
          <div className="section-heading arrivals-heading">
            <div>
              <span className="section-kicker">Real records / current catalog</span>
              <h2>Featured Parts</h2>
            </div>
            <Link className="section-link" href="/catalog">Open full catalog <ArrowIcon /></Link>
          </div>
          <div className="arrival-grid">
            {featuredParts.map((part) => (
              <article className="arrival-card" key={part.id}>
                <Link href={`/booking?part=${encodeURIComponent(part.sku)}`} className="arrival-image">
                  <span className="sale-badge">{part.condition || 'Available'}</span>
                  {part.primary_image_url ? <img src={part.primary_image_url} alt={part.part_name} /> : <span className="database-image-empty">No product image</span>}
                  <span className="quick-view">Request this part</span>
                </Link>
                <div className="arrival-details">
                  <small>{part.parts_categories?.category_name || 'Database catalog'}</small>
                  <h3>{part.part_name}</h3>
                  <div className="rating" aria-label="Verified database item">Verified <span>· {part.sku}</span></div>
                  <div className="price-row">
                    <strong>{money(part.sale_price ?? part.price)}</strong>
                    {part.sale_price && <del>{money(part.price)}</del>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && featuredVehicles.length > 0 && (
        <section className="store-section vehicle-home-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Vehicle fitment database</span>
              <h2>Popular Vehicles</h2>
            </div>
            <Link className="section-link" href="/vehicles">Open vehicle finder <ArrowIcon /></Link>
          </div>
          <div className="vehicle-home-grid">
            {featuredVehicles.map((vehicle) => (
              <Link className="vehicle-home-card" href="/vehicles" key={vehicle.id}>
                {vehicle.cover_image_url ? <img src={vehicle.cover_image_url} alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`} /> : <span className="database-image-empty">No vehicle image</span>}
                <div>
                  <small>{vehicle.vehicle_type || 'Vehicle'}</small>
                  <strong>{vehicle.manufacturer_name} {vehicle.model_name}</strong>
                  <span>{vehicle.year_start || '—'}–{vehicle.year_end || 'present'} · {vehicle.generation || vehicle.chassis_code || 'Fitment data'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && !featuredCategories.length && !featuredParts.length && !featuredVehicles.length && !error && (
        <section className="store-section home-empty-state">
          <h2>No published database records yet.</h2>
          <p>Categories, parts and vehicles will appear here after they are added to the live database.</p>
        </section>
      )}

      <section className="store-section service-strip">
        <div><strong>Database-first catalog</strong><span>Only published records appear</span></div>
        <div><strong>Fitment support</strong><span>Use the vehicle finder</span></div>
        <div><strong>Request a part</strong><span>Booking goes to the parts desk</span></div>
        <div><strong>Live availability</strong><span>Stock comes from the catalog</span></div>
      </section>

      <section className="store-section newsletter-card">
        <div>
          <span className="section-kicker">Search the live catalog</span>
          <h2>Find your next part faster.</h2>
        </div>
        <form className="newsletter-search" onSubmit={submitSearch}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search part, brand or SKU ..." aria-label="Search live catalog" />
          <button aria-label="Search" type="submit"><SearchIcon /></button>
        </form>
      </section>
    </main>
  );
}
