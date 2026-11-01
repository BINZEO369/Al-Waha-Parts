'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';

type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string | null;
  cta_label: string;
  cta_href: string;
  image_url?: string | null;
  mobile_image_url?: string | null;
};

const FALLBACK_BANNER: Banner = {
  id: 'fallback-hero',
  eyebrow: 'Al Waha Parts',
  title: 'The right part for the right vehicle.',
  description: 'Verified automotive parts with fitment support across the UAE.',
  cta_label: 'Browse parts',
  cta_href: '/catalog',
};

function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      return;
    }

    apiFetch<Banner[]>(apiUrl, '/api/v1/banners')
      .then((items) => setBanners(items))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % banners.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[active] ?? FALLBACK_BANNER;

  return (
    <section
      className={'hero-carousel-root'}
      aria-label="Featured parts banners"
      aria-busy={loading}
    >
      <style jsx global>{`
        .hero-carousel-root {
          width: 100%;
          max-width: none;
          min-height: 390px;
          padding: 35px max(18px, calc((100vw - var(--max)) / 2 + 18px)) 42px;
          margin: 0;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          align-items: center;
          gap: clamp(16px, 3vw, 48px);
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
        }

        .hero-carousel-copy {
          max-width: 500px;
          position: relative;
          z-index: 1;
          padding: 16px 0 20px;
          animation: copy-in 0.35s ease both;
        }

        .hero-carousel-copy .eyebrow {
          margin: 0 0 10px;
          color: #555;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
          line-height: 1.4;
          text-transform: none;
        }

        .hero-carousel-copy h1 {
          max-width: 590px;
          margin: 0;
          color: #292929;
          font-family: Montserrat, sans-serif;
          font-size: clamp(42px, 5.5vw, 68px);
          font-weight: 800;
          line-height: 0.98;
          letter-spacing: -0.065em;
        }

        .hero-carousel-rule {
          display: block;
          width: 52px;
          height: 2px;
          margin: 13px 0 12px;
          background: var(--red);
        }

        .hero-carousel-lede {
          max-width: 370px;
          margin: 0 0 23px;
          color: #666;
          font-size: 12px;
          line-height: 1.75;
        }

        .hero-carousel-actions .button {
          min-width: 132px;
          min-height: 40px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--red);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          text-transform: none;
          transition:
            background 0.18s ease,
            transform 0.18s ease;
        }

        .hero-carousel-actions :global(.button:hover) {
          background: var(--red-dark);
          transform: translateY(-2px);
        }

        .hero-carousel-visual {
          min-width: 0;
          min-height: 300px;
          height: 100%;
          display: grid;
          place-items: center;
          overflow: hidden;
          animation: visual-in 0.45s ease both;
        }

        .hero-carousel-visual picture {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
        }

        .hero-carousel-visual img {
          width: 100%;
          height: min(350px, 100%);
          object-fit: contain;
          object-position: center;
          mix-blend-mode: multiply;
        }

        .hero-carousel-dots {
          position: absolute;
          left: 50%;
          bottom: 17px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          transform: translateX(-50%);
        }

        .hero-carousel-dot {
          width: 9px;
          height: 9px;
          padding: 0;
          border: 1px solid #777;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }

        .hero-carousel-dot.active {
          border-color: var(--red);
          background: var(--red);
        }

        .hero-carousel-loading {
          grid-column: 1 / -1;
          width: 100%;
          height: 240px;
          border-radius: 2px;
          background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 38%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: shimmer 1.25s ease infinite;
        }

        @keyframes copy-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes visual-in {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          to {
            background-position: -100% 0;
          }
        }

        @media (max-width: 800px) {
          .hero-carousel-root {
            min-height: 0;
            padding: 32px 18px 38px;
            grid-template-columns: 1fr;
            gap: 0;
          }

          .hero-carousel-copy {
            max-width: 560px;
            padding: 6px 0 0;
          }

          .hero-carousel-copy h1 {
            font-size: clamp(40px, 8vw, 58px);
          }

          .hero-carousel-lede {
            max-width: 420px;
            margin-bottom: 17px;
          }

          .hero-carousel-visual {
            min-height: 245px;
            height: 245px;
            margin-top: 2px;
          }

          .hero-carousel-visual img {
            height: 245px;
          }

          .hero-carousel-dots {
            bottom: 14px;
          }
        }

        @media (max-width: 480px) {
          .hero-carousel-root {
            padding: 28px 16px 36px;
          }

          .hero-carousel-copy .eyebrow {
            margin-bottom: 8px;
            font-size: 11px;
          }

          .hero-carousel-copy h1 {
            font-size: clamp(38px, 10vw, 46px);
          }

          .hero-carousel-lede {
            max-width: 310px;
            font-size: 11px;
          }

          .hero-carousel-visual {
            min-height: 205px;
            height: 205px;
          }

          .hero-carousel-visual img {
            height: 205px;
          }
        }

        /* Final palette refinement: pure white stage behind the database banner. */
        .hero-carousel-root {
          background: #fff;
        }
      `}</style>
      {banner ? (
        <>
          <div className={'hero-carousel-copy'} key={`${banner.id}-copy`}>
            <p className="eyebrow">{banner.eyebrow}</p>
            <h1>{banner.title}</h1>
            <span className={'hero-carousel-rule'} aria-hidden="true" />
            {banner.description && <p className={'hero-carousel-lede'}>{banner.description}</p>}
            <div className={'hero-carousel-actions'}>
              <Link className="button" href={banner.cta_href}>
                {banner.cta_label}
              </Link>
            </div>
          </div>
          <div className={'hero-carousel-visual'} key={`${banner.id}-visual`}>
            {(banner.image_url || banner.mobile_image_url) && (
              <picture>
                {banner.mobile_image_url && (
                  <source media="(max-width: 700px)" srcSet={banner.mobile_image_url} />
                )}
                <img src={banner.image_url || banner.mobile_image_url || ''} alt={banner.title} />
              </picture>
            )}
          </div>
          {banners.length > 1 && (
            <div className={'hero-carousel-dots'} aria-label="Select banner">
              {banners.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === active ? 'hero-carousel-dot active' : 'hero-carousel-dot'}
                  onClick={() => setActive(index)}
                  aria-label={`Show banner ${index + 1}: ${item.title}`}
                  aria-current={index === active ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className={'hero-carousel-loading'} aria-hidden="true" />
      )}
    </section>
  );
}

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
  slug?: string | null;
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
      <path
        d="M4 10h11M10 5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
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
      apiFetch<Category[]>(apiUrl, '/api/v1/popular-categories?limit=200'),
      apiFetch<Part[]>(apiUrl, '/api/v1/parts?limit=200&featured_only=true'),
      apiFetch<Vehicle[]>(apiUrl, '/api/v1/homepage-selected-vehicles?limit=200'),
    ])
      .then(([nextPopularCategories, nextParts, nextVehicles]) => {
        setPopularCategories(nextPopularCategories);
        setParts(nextParts);
        setVehicles(nextVehicles);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load live database data.');
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const homeSelectedParts = parts;
  const homeSelectedVehicles = vehicles;
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    window.location.href = value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog';
  }

  return (
    <main className="home-page">
      <style jsx>{`
        .home-page :global(.section-link:focus-visible),
        .home-page :global(a:focus-visible),
        .home-page :global(button:focus-visible),
        .home-page :global(input:focus-visible) {
          outline: 2px solid var(--red);
          outline-offset: 3px;
        }
      `}</style>
      <HeroCarousel />

      {error && <div className="store-section data-alert home-data-alert">{error}</div>}
      {loading && (
        <div className="store-section home-loading">
          Loading categories, parts and vehicles from the database…
        </div>
      )}

      {!loading && popularCategories.length > 0 && (
        <section className="store-section category-promo-section" aria-label="Popular categories">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Browse the live catalog</span>
              <h2>Popular Categories</h2>
            </div>
            <Link className="section-link" href="/category">
              View all categories <ArrowIcon />
            </Link>
          </div>
          <div className="category-promo-grid">
            {popularCategories.map((category) => (
              <Link
                className="promo-card promo-card-database category-promo-card"
                href={`/category?category=${category.id}`}
                key={category.id}
              >
                <div>
                  <small>Popular category</small>
                  <strong>{category.category_name.trim()}</strong>
                  <p>{category.description || 'Browse available parts and find the right fit.'}</p>
                  <span>
                    Browse parts <ArrowIcon />
                  </span>
                </div>
                {category.image_url && <img src={category.image_url} alt="" />}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && homeSelectedParts.length > 0 && (
        <section className="store-section arrivals-section">
          <div className="section-heading arrivals-heading">
            <div>
              <span className="section-kicker">From the live catalog</span>
              <h2>New Arrivals</h2>
            </div>
            <Link className="section-link" href="/catalog">
              Open full catalog <ArrowIcon />
            </Link>
          </div>
          <div className="arrival-grid">
            {homeSelectedParts.map((part) => (
              <article className="arrival-card" key={part.id}>
                <Link
                  href={`/catalog/${part.slug ?? part.id}`}
                  className="arrival-image"
                  aria-label={`View ${part.part_name}`}
                >
                  <span className="sale-badge">{part.condition || 'Available'}</span>
                  {part.primary_image_url ? (
                    <img src={part.primary_image_url} alt={part.part_name} />
                  ) : (
                    <span className="database-image-empty">No product image</span>
                  )}
                  <span className="quick-view">View product details</span>
                </Link>
                <div className="arrival-details">
                  <small>{part.parts_categories?.category_name || 'Database catalog'}</small>
                  <h3>
                    <Link href={`/catalog/${part.slug ?? part.id}`}>{part.part_name}</Link>
                  </h3>
                  <div className="rating" aria-label="Verified database item">
                    Verified <span>· {part.sku}</span>
                  </div>
                  <div className="price-row">
                    <strong>{formatSar(part.sale_price ?? part.price)}</strong>
                    {part.sale_price && <del>{formatSar(part.price)}</del>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && homeSelectedVehicles.length > 0 && (
        <section className="store-section vehicle-home-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Vehicle fitment database</span>
              <h2>Popular Vehicles</h2>
            </div>
            <Link className="section-link" href="/vehicles">
              Open vehicle finder <ArrowIcon />
            </Link>
          </div>
          <div className="vehicle-home-grid">
            {homeSelectedVehicles.map((vehicle) => (
              <Link className="vehicle-home-card" href="/vehicles" key={vehicle.id}>
                {vehicle.cover_image_url ? (
                  <img
                    src={vehicle.cover_image_url}
                    alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`}
                  />
                ) : (
                  <span className="database-image-empty">No vehicle image</span>
                )}
                <div>
                  <small>{vehicle.vehicle_type || 'Vehicle'}</small>
                  <strong>
                    {vehicle.manufacturer_name} {vehicle.model_name}
                  </strong>
                  <span>
                    {vehicle.year_start || '—'}–{vehicle.year_end || 'present'} ·{' '}
                    {vehicle.generation || vehicle.chassis_code || 'Fitment data'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading &&
        !popularCategories.length &&
        !homeSelectedParts.length &&
        !homeSelectedVehicles.length &&
        !error && (
          <section className="store-section home-empty-state">
            <h2>No published database records yet.</h2>
            <p>
              Categories, parts and vehicles will appear here after they are added to the live
              database.
            </p>
          </section>
        )}

      <section className="store-section service-strip">
        <div>
          <strong>Database-first catalog</strong>
          <span>Only published records appear</span>
        </div>
        <div>
          <strong>Fitment support</strong>
          <span>Use the vehicle finder</span>
        </div>
        <div>
          <strong>Request a part</strong>
          <span>Booking goes to the parts desk</span>
        </div>
        <div>
          <strong>Live availability</strong>
          <span>Stock comes from the catalog</span>
        </div>
      </section>

      <section className="store-section newsletter-card">
        <div>
          <span className="section-kicker">Search the live catalog</span>
          <h2>Find your next part faster.</h2>
        </div>
        <form className="newsletter-search" onSubmit={submitSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search part, brand or SKU ..."
            aria-label="Search live catalog"
          />
          <button aria-label="Search" type="submit">
            <SearchIcon />
          </button>
        </form>
      </section>
    </main>
  );
}
