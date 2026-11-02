'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatAed } from '../../../packages/shared/src/currency';

/* ==================================================================
 *  TYPES
 * ================================================================== */

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

/* ==================================================================
 *  ICONS
 * ================================================================== */

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

/* ==================================================================
 *  HERO CAROUSEL
 *  - শুধু ডেটাবেজ থেকে (কোনো fallback নেই)
 *  - টেক্সট ইমেজের উপরে overlay
 *  - object-fit: contain → কোনো জুম / ক্রপ হবে না
 *  - ডেটা না থাকলে সেকশন সম্পূর্ণ hide
 * ================================================================== */

function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /* ---- API থেকে ব্যানার লোড ---- */
  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      return;
    }

    apiFetch<Banner[]>(apiUrl, '/api/v1/banners')
      .then((items) => setBanners(Array.isArray(items) ? items : []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  /* ---- অটো স্লাইড ---- */
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % banners.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);

  /* ------------------------------------------------------------------
   *  LOADING — শুধু shimmer skeleton (কোনো fallback ডেটা না)
   *  ⚠️ এখানে return করার আগে সব hook কল হয়ে গেছে — safe
   * ------------------------------------------------------------------ */
  if (loading) {
    return (
      <section
        className="hero-carousel-root"
        aria-label="Featured banners loading"
        aria-busy="true"
      >
        <style jsx global>{`
          .hero-carousel-root {
            position: relative;
            width: 100%;
            height: 540px;
            overflow: hidden;
            background: #111;
          }
          .hero-carousel-loading {
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              #1a1a1a 25%,
              #262626 38%,
              #1a1a1a 63%
            );
            background-size: 400% 100%;
            animation: shimmer 1.25s ease infinite;
          }
          @keyframes shimmer {
            to {
              background-position: -100% 0;
            }
          }
          @media (max-width: 800px) {
            .hero-carousel-root {
              height: 480px;
            }
          }
          @media (max-width: 480px) {
            .hero-carousel-root {
              height: 420px;
            }
          }
        `}</style>
        <div className="hero-carousel-loading" aria-hidden="true" />
      </section>
    );
  }

  /* ------------------------------------------------------------------
   *  ডেটাবেজে কোনো ব্যানার নেই → হিরো সেকশন সম্পূর্ণ render হবে না
   * ------------------------------------------------------------------ */
  if (!banners.length) {
    return null;
  }

  // The active index can briefly be stale while fresh API data replaces the list.
  const banner = banners[active];
  if (!banner) {
    return null;
  }
  const hasImage = Boolean(banner.image_url || banner.mobile_image_url);

  return (
    <section
      className="hero-carousel-root"
      aria-label="Featured parts banners"
    >
      <style jsx global>{`
        .hero-carousel-root {
          position: relative;
          width: 100%;
          min-height: 540px;
          overflow: hidden;
          background: #0d0d0d;
        }

        /* ---- Slide ---- */
        .hero-carousel-slide {
          position: relative;
          width: 100%;
          min-height: 540px;
          display: flex;
          align-items: center;
          animation: slide-fade 0.5s ease both;
        }

        /* ---- Media: contain (no zoom, no crop) ---- */
        .hero-carousel-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 70% 30%,
              rgba(255, 255, 255, 0.05),
              transparent 55%
            ),
            linear-gradient(135deg, #0e0e0e 0%, #171717 50%, #0a0a0a 100%);
        }

        .hero-carousel-media picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        .hero-carousel-media img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;      /* ← জুম / ক্রপ হবে না */
          object-position: center;
        }

        .hero-carousel-bg-fallback {
          background:
            radial-gradient(
              circle at 20% 30%,
              rgba(220, 38, 38, 0.32),
              transparent 60%
            ),
            linear-gradient(135deg, #1f1f1f, #2c2c2c 60%, #111);
        }

        /* ---- Overlay (টেক্সট পড়ার জন্য) ---- */
        .hero-carousel-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.55) 38%,
            rgba(0, 0, 0, 0.18) 72%,
            rgba(0, 0, 0, 0.05) 100%
          );
        }

        /* ---- Copy ---- */
        .hero-carousel-copy {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 84px max(22px, calc((100vw - var(--max)) / 2 + 22px));
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-carousel-copy > * {
          max-width: 560px;
        }

        .hero-carousel-copy .eyebrow {
          margin: 0 0 14px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.4;
          text-transform: none;
        }

        .hero-carousel-copy h1 {
          margin: 0;
          color: #fff;
          font-family: Montserrat, sans-serif;
          font-size: clamp(40px, 5.4vw, 66px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
        }

        .hero-carousel-rule {
          display: block;
          width: 52px;
          height: 2px;
          margin: 18px 0;
          background: var(--red);
        }

        .hero-carousel-lede {
          margin: 0 0 26px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-carousel-actions {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .hero-carousel-actions .button {
          min-width: 140px;
          min-height: 46px;
          padding: 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--red);
          background: var(--red);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          text-transform: none;
          white-space: nowrap;
          border-radius: 2px;
          transition:
            background 0.18s ease,
            transform 0.18s ease;
        }

        .hero-carousel-actions :global(.button:hover) {
          background: var(--red-dark);
          transform: translateY(-2px);
        }

        /* ---- Dots ---- */
        .hero-carousel-dots {
          position: absolute;
          left: 50%;
          bottom: 22px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 9px;
          transform: translateX(-50%);
        }

        .hero-carousel-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .hero-carousel-dot:hover {
          transform: scale(1.15);
        }

        .hero-carousel-dot.active {
          border-color: var(--red);
          background: var(--red);
        }

        @keyframes slide-fade {
          from {
            opacity: 0;
            transform: scale(1.01);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* ---- Responsive ---- */
        @media (max-width: 800px) {
          .hero-carousel-root,
          .hero-carousel-slide {
            min-height: 480px;
          }

          .hero-carousel-overlay {
            background: linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.55) 0%,
              rgba(0, 0, 0, 0.5) 40%,
              rgba(0, 0, 0, 0.85) 100%
            );
          }

          .hero-carousel-copy {
            padding: 64px 22px;
            justify-content: flex-end;
            min-height: 480px;
          }

          .hero-carousel-copy > * {
            max-width: 100%;
          }

          .hero-carousel-copy h1 {
            font-size: clamp(36px, 9vw, 52px);
          }
        }

        @media (max-width: 480px) {
          .hero-carousel-root,
          .hero-carousel-slide {
            min-height: 420px;
          }

          .hero-carousel-copy {
            padding: 52px 16px;
            min-height: 420px;
          }

          .hero-carousel-copy .eyebrow {
            font-size: 11px;
            margin-bottom: 10px;
          }

          .hero-carousel-copy h1 {
            font-size: clamp(30px, 9.5vw, 40px);
          }

          .hero-carousel-lede {
            font-size: 12px;
            margin-bottom: 20px;
          }

          .hero-carousel-actions .button {
            min-height: 42px;
            font-size: 11px;
          }

          .hero-carousel-dots {
            bottom: 16px;
          }
        }
      `}</style>

      <div className="hero-carousel-slide" key={banner.id}>
        {hasImage ? (
          <picture className="hero-carousel-media">
            {banner.mobile_image_url && (
              <source
                media="(max-width: 700px)"
                srcSet={banner.mobile_image_url}
              />
            )}
            <img
              src={banner.image_url || banner.mobile_image_url || ''}
              alt=""
              aria-hidden="true"
            />
          </picture>
        ) : (
          <div
            className="hero-carousel-media hero-carousel-bg-fallback"
            aria-hidden="true"
          />
        )}

        <div className="hero-carousel-overlay" aria-hidden="true" />

        <div className="hero-carousel-copy">
          <p className="eyebrow">{banner.eyebrow}</p>
          <h1>{banner.title}</h1>
          <span className="hero-carousel-rule" aria-hidden="true" />
          {banner.description && (
            <p className="hero-carousel-lede">{banner.description}</p>
          )}
          <div className="hero-carousel-actions">
            <Link className="button" href={banner.cta_href}>
              {banner.cta_label}
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="hero-carousel-dots" aria-label="Select banner">
          {banners.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={
                index === active
                  ? 'hero-carousel-dot active'
                  : 'hero-carousel-dot'
              }
              onClick={() => setActive(index)}
              aria-label={`Show banner ${index + 1}: ${item.title}`}
              aria-current={index === active ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ==================================================================
 *  HOME PAGE
 *  সেকশন অর্ডার:
 *    1. Hero Banner
 *    2. Popular Vehicles
 *    3. Popular Categories
 *    4. New Arrivals (Parts)
 *    5. Service Strip
 *    6. Search Newsletter
 * ================================================================== */

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to load live database data.',
        );
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const homeSelectedParts = parts;
  const homeSelectedVehicles = vehicles;

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
        .popular-cars-heading {
          width: 100%;
          align-items: center;
          flex-direction: row;
          justify-content: center !important;
          margin-bottom: 22px;
        }
        .popular-cars-title-box {
          display: inline-block;
          margin: 0;
          padding: 12px 22px;
          border: 1px solid var(--red);
          color: var(--red);
          font-family: Montserrat, sans-serif;
          font-size: 21px;
          letter-spacing: -.03em;
          text-align: center;
        }
        .popular-cars-title-box::after { display: none; }
        @media (max-width: 520px) {
          .popular-cars-title-box { padding: 10px 16px; font-size: 18px; }
        }
      `}</style>

      {/* ----------------------------------------------------------------
       *  1. HERO BANNER
       * ---------------------------------------------------------------- */}
      <HeroCarousel />

      {error && (
        <div className="store-section data-alert home-data-alert">{error}</div>
      )}
      {loading && (
        <div className="store-section home-loading">
          Loading categories, parts and vehicles from the database…
        </div>
      )}

      {/* ----------------------------------------------------------------
       *  2. POPULAR VEHICLES (হিরোর ঠিক নিচে)
       * ---------------------------------------------------------------- */}
      {!loading && homeSelectedVehicles.length > 0 && (
        <section className="store-section vehicle-home-section">
          <div className="section-heading popular-cars-heading">
            <h2 className="popular-cars-title-box">Popular Cars</h2>
          </div>
          <div className="vehicle-home-grid">
            {homeSelectedVehicles.map((vehicle) => (
              <Link
                className="vehicle-home-card"
                href={`/vehicles/${vehicle.id}`}
                key={vehicle.id}
              >
                <div className="vehicle-home-card-top">
                  <small>{vehicle.year_end || vehicle.year_start || '—'}</small>
                  <strong>{vehicle.manufacturer_name} {vehicle.model_name}</strong>
                  <span>{vehicle.generation || vehicle.chassis_code || vehicle.vehicle_type || 'Database fitment'}</span>
                </div>
                <div className="vehicle-home-card-image">
                  {vehicle.cover_image_url ? (
                    <img src={vehicle.cover_image_url} alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`} />
                  ) : (
                    <span className="database-image-empty">No vehicle image</span>
                  )}
                </div>
                <div className="vehicle-home-card-specs">
                  <span><small>Model years</small><b>{vehicle.year_start || '—'}–{vehicle.year_end || 'present'}</b></span>
                  <span><small>Type</small><b>{vehicle.vehicle_type || 'Vehicle'}</b></span>
                  <span><small>Fitment</small><b>View parts <span aria-hidden="true">↗</span></b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------
       *  3. POPULAR CATEGORIES (ভেহিকেলের পরে)
       * ---------------------------------------------------------------- */}
      {!loading && popularCategories.length > 0 && (
        <section
          className="store-section category-promo-section"
          aria-label="Popular categories"
        >
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
                  <p>
                    {category.description ||
                      'Browse available parts and find the right fit.'}
                  </p>
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

      {/* ----------------------------------------------------------------
       *  4. NEW ARRIVALS / PARTS (ক্যাটাগরির পরে)
       * ---------------------------------------------------------------- */}
      {!loading && homeSelectedParts.length > 0 && (
        <section className="store-section arrivals-section">
          <div className="section-heading arrivals-heading">
            <div>
              <span className="section-kicker">From the live catalog</span>
              <h2>New Arrivals</h2>
            </div>
            <Link className="section-link" href="/category">
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
                  <span className="sale-badge">
                    {part.condition || 'Available'}
                  </span>
                  {part.primary_image_url ? (
                    <img src={part.primary_image_url} alt={part.part_name} />
                  ) : (
                    <span className="database-image-empty">
                      No product image
                    </span>
                  )}
                  <span className="quick-view">View product details</span>
                </Link>
                <div className="arrival-details">
                  <small>
                    {part.parts_categories?.category_name || 'Database catalog'}
                  </small>
                  <h3>
                    <Link href={`/catalog/${part.slug ?? part.id}`}>
                      {part.part_name}
                    </Link>
                  </h3>
                  <div className="rating" aria-label="Verified database item">
                    Verified <span>· {part.sku}</span>
                  </div>
                  <div className="price-row">
                    <strong>{formatAed(part.sale_price ?? part.price)}</strong>
                    {part.sale_price && <del>{formatAed(part.price)}</del>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---- সব খালি হলে empty state ---- */}
      {!loading &&
        !popularCategories.length &&
        !homeSelectedParts.length &&
        !homeSelectedVehicles.length &&
        !error && (
          <section className="store-section home-empty-state">
            <h2>No published database records yet.</h2>
            <p>
              Categories, parts and vehicles will appear here after they are
              added to the live database.
            </p>
          </section>
        )}

      {/* ----------------------------------------------------------------
       *  5. SERVICE STRIP
       * ---------------------------------------------------------------- */}
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
          <strong>Booking desk</strong>
          <span>Booking goes to the parts desk</span>
        </div>
        <div>
          <strong>Live availability</strong>
          <span>Stock comes from the catalog</span>
        </div>
      </section>

    </main>
  );
}
