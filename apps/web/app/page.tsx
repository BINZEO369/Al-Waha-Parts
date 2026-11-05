'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';
import { brandModelHref, brandSlugFromName } from '../lib/vehicle-routes';

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
  slug?: string | null;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  engine_code?: string | null;
  engine_capacity?: number | string | null;
  fuel_type?: string | null;
  transmission?: string | null;
  vehicle_type?: string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
};

type CarBrand = {
  id: string;
  manufacturer_name: string;
  slug: string;
  logo_url: string;
  sort_order: number;
};

const HOME_VEHICLE_LIMIT = 6;
const HOME_BRAND_PREFERENCE_KEY = 'alwaha-home-brand-preference';

function randomVehicles(items: Vehicle[], limit = HOME_VEHICLE_LIMIT) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    const replacement = shuffled[swapIndex];
    if (current && replacement) {
      shuffled[index] = replacement;
      shuffled[swapIndex] = current;
    }
  }
  return shuffled.slice(0, limit);
}

/* ==================================================================
 *  ICONS
 * ================================================================== */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" width="16" height="16">
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
 * ================================================================== */

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
      .then((items) => setBanners(Array.isArray(items) ? items : []))
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

  if (loading) {
    return (
      <section className="hero-carousel-root" aria-label="Featured banners loading" aria-busy="true">
        <style jsx global>{`
          .hero-carousel-root {
            position: relative;
            width: 100%;
            height: 600px;
            background: #111;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .shimmer {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #1a1a1a 25%, #262626 38%, #1a1a1a 63%);
            background-size: 400% 100%;
            animation: shimmer 1.25s ease infinite;
          }
          @keyframes shimmer { to { background-position: -100% 0; } }
        `}</style>
        <div className="shimmer" aria-hidden="true" />
      </section>
    );
  }

  if (!banners.length) return null;

  const banner = banners[active];
  if (!banner) return null;

  const hasImage = Boolean(banner.image_url || banner.mobile_image_url);

  return (
    <section className="hero-carousel-root" aria-label="Featured parts banners">
      <style jsx global>{`
        .hero-carousel-root {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          background: #0d0d0d;
        }

        .hero-carousel-slide {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          animation: slide-fade 0.5s ease both;
        }

        .hero-carousel-media {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
        }

        .hero-carousel-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hero-carousel-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.85) 0%,
            rgba(0, 0, 0, 0.6) 40%,
            rgba(0, 0, 0, 0.1) 100%
          );
        }

        .hero-carousel-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: var(--max);
          margin: 0 auto;
          padding: 0 24px;
          color: #fff;
        }

        .hero-text-area {
          max-width: 600px;
        }

        .hero-text-area .eyebrow {
          margin: 0 0 16px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hero-text-area h1 {
          margin: 0 0 20px;
          font-family: 'Montserrat';
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-text-area p {
          margin: 0 0 32px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          align-items: center;
        }

        .hero-actions .button {
          padding: 14px 32px;
          background: #e51c23;
          color: #fff;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .hero-actions .button:hover {
          background: #c4161c;
        }

        @keyframes slide-fade {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .hero-carousel-root { height: 500px; }
        }

        @media (max-width: 600px) {
          .hero-carousel-root { height: 450px; }
          .hero-text-area h1 { font-size: 36px; }
        }
      `}</style>

      <div className="hero-carousel-slide" key={banner.id}>
        {hasImage ? (
          <div className="hero-carousel-media">
            <img src={banner.image_url || banner.mobile_image_url || ''} alt="" aria-hidden="true" />
          </div>
        ) : (
          <div className="hero-carousel-media" style={{ background: '#222' }} aria-hidden="true" />
        )}

        <div className="hero-carousel-overlay" aria-hidden="true" />

        <div className="hero-carousel-content">
          <div className="hero-text-area">
            <p className="eyebrow">{banner.eyebrow}</p>
            <h1>{banner.title}</h1>
            {banner.description && <p>{banner.description}</p>}
            <div className="hero-actions">
              <Link className="button" href={banner.cta_href}>
                {banner.cta_label}
              </Link>
            </div>
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
 *  CAR BRAND STRIP
 * ================================================================== */

function CarBrandStrip({ brands }: { brands: CarBrand[] }) {
  if (brands.length === 0) return null;
  const visibleBrands = brands.slice(0, 10);

  return (
    <section className="car-brand-strip" aria-labelledby="car-brand-strip-title">
      <style jsx>{`
        .car-brand-strip {
          box-sizing: border-box;
          width: 100%;
          padding: 22px max(18px, calc((100vw - var(--max)) / 2 + 22px)) 28px;
          border-bottom: 1px solid #ededed;
          background: #fff;
        }

        .car-brand-strip-inner {
          max-width: var(--max);
          margin: 0 auto;
        }

        .car-brand-strip h2 {
          width: fit-content;
          margin: 0 auto 22px;
          padding: 10px 20px;
          border: 1px solid var(--red);
          color: var(--red);
          font-family: 'Montserrat';
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -.02em;
          text-align: center;
          text-transform: none;
          border-radius: 4px;
        }

        .car-brand-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .car-brand-item {
          width: 100%;
          max-width: 150px;
          min-height: 76px;
          justify-self: center;
          box-sizing: border-box;
          padding: 8px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid #ebebeb;
          border-radius: 6px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .car-brand-item:hover {
          border-color: var(--red);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .car-brand-item img {
          display: block;
          width: auto;
          max-width: 100%;
          height: 18px;
          object-fit: contain;
        }

        .car-brand-item span {
          width: 100%;
          color: #555;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 1.2;
          text-align: center;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .car-brand-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .car-brand-strip {
            padding: 18px 14px 22px;
          }

          .car-brand-strip h2 {
            padding: 8px 14px;
            font-size: 16px;
          }

          .car-brand-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px;
          }

          .car-brand-item {
            max-width: none;
            min-height: 64px;
            padding: 7px 3px;
            gap: 5px;
          }

          .car-brand-item img {
            height: 14px;
          }

          .car-brand-item span {
            width: 100%;
            font-size: 8px;
            text-align: center;
          }
        }
      `}</style>
      <div className="car-brand-strip-inner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <h2 id="car-brand-strip-title" style={{ margin: 0 }}>Browse by car brand</h2>
          <Link className="section-link" href="/brands">View all brands <ArrowIcon /></Link>
        </div>
        <div className="car-brand-grid">
          {visibleBrands.map((brand) => (
            <Link
              className="car-brand-item"
              href={`/brands/${brand.slug}`}
              key={brand.id}
              aria-label={`View ${brand.manufacturer_name} vehicles`}
              onClick={() => {
                window.localStorage.setItem(HOME_BRAND_PREFERENCE_KEY, brand.manufacturer_name);
              }}
            >
              <img src={brand.logo_url} alt="" aria-hidden="true" loading="lazy" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
 *  PREMIUM CATEGORY SHOWCASE
 * ================================================================== */

function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  const displayCategories = categories.slice(0, 3);

  return (
    <section className="ultimate-showcase" aria-label="Explore our collections">
      <style jsx>{`
        .ultimate-showcase {
          position: relative;
          width: 100%;
          background: #ffffff;
          padding: 110px 0;
          overflow: hidden;
          border-top: 1px solid #f2f2f2;
          border-bottom: 1px solid #f2f2f2;
        }

        .showcase-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          display: flex;
          flex-direction: column;
          gap: 130px;
        }

        .showcase-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 72px;
        }

        .showcase-text {
          flex: 0 0 48%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .showcase-text .eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #9a9a9a;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .showcase-text .eyebrow::before {
          content: '';
          display: block;
          width: 26px;
          height: 1px;
          background: #c9c9c9;
        }

        .showcase-text h2 {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(38px, 4.4vw, 58px);
          font-weight: 300;
          color: #0a0a0a;
          line-height: 1.06;
          margin: 0 0 26px 0;
          letter-spacing: -0.045em;
        }

        .showcase-text p {
          font-size: 15px;
          color: #6f6f6f;
          line-height: 1.75;
          margin: 0 0 34px 0;
          font-weight: 400;
          max-width: 460px;
        }

        .showcase-index {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 34px;
          width: 100%;
          max-width: 260px;
        }

        .showcase-index .current {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: 0.08em;
        }

        .showcase-index .divider {
          flex: 1;
          height: 1px;
          background: #e2e2e2;
        }

        .showcase-index .total {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #b5b5b5;
          letter-spacing: 0.08em;
        }

        .catalogue-btn {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #0a0a0a;
          text-decoration: none;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 8px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .catalogue-btn :global(svg) {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .catalogue-btn:hover {
          color: var(--red);
          border-color: var(--red);
        }

        .catalogue-btn:hover :global(svg) {
          transform: translateX(8px);
        }

        .showcase-visual {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 420px;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.15) 6%,
            rgba(0, 0, 0, 0.85) 16%,
            #000 24%,
            #000 76%,
            rgba(0, 0, 0, 0.85) 84%,
            rgba(0, 0, 0, 0.15) 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.15) 6%,
            rgba(0, 0, 0, 0.85) 16%,
            #000 24%,
            #000 76%,
            rgba(0, 0, 0, 0.85) 84%,
            rgba(0, 0, 0, 0.15) 94%,
            transparent 100%
          );
        }

        .showcase-visual img {
          display: block;
          width: 100%;
          max-width: 620px;
          max-height: 420px;
          height: auto;
          object-fit: contain;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .showcase-row:hover .showcase-visual img {
          transform: translateY(-6px) scale(1.02);
        }

        .showcase-visual .empty {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 220px;
          color: #d0d0d0;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .showcase-container {
            gap: 100px;
            padding: 0 32px;
          }

          .showcase-row {
            gap: 44px;
          }

          .showcase-text {
            flex: 0 0 50%;
          }

          .showcase-visual {
            min-height: 340px;
          }

          .showcase-visual img {
            max-height: 340px;
          }
        }

        @media (max-width: 768px) {
          .ultimate-showcase {
            padding: 54px 0;
          }

          .showcase-container {
            gap: 54px;
            padding: 0 16px;
          }

          .showcase-row {
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }

          .showcase-text {
            flex: 1 1 58%;
            max-width: none;
            order: -1;
            min-width: 0;
          }

          .showcase-text .eyebrow {
            font-size: 8px;
            letter-spacing: 0.12em;
            margin-bottom: 8px;
            gap: 8px;
          }

          .showcase-text .eyebrow::before {
            width: 14px;
          }

          .showcase-text h2 {
            font-size: clamp(20px, 5.2vw, 26px);
            line-height: 1.08;
            margin-bottom: 10px;
            letter-spacing: -0.025em;
          }

          .showcase-text p {
            font-size: 11px;
            line-height: 1.55;
            margin-bottom: 14px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .showcase-index {
            display: none;
          }

          .catalogue-btn {
            font-size: 9px;
            letter-spacing: 0.1em;
            padding-bottom: 4px;
            gap: 6px;
          }

          .catalogue-btn :global(svg) {
            width: 12px;
            height: 12px;
          }

          .showcase-visual {
            flex: 1 1 42%;
            min-height: 170px;
            -webkit-mask-image: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 0, 0, 0.2) 8%,
              rgba(0, 0, 0, 0.9) 18%,
              #000 26%,
              #000 74%,
              rgba(0, 0, 0, 0.9) 82%,
              rgba(0, 0, 0, 0.2) 92%,
              transparent 100%
            );
            mask-image: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 0, 0, 0.2) 8%,
              rgba(0, 0, 0, 0.9) 18%,
              #000 26%,
              #000 74%,
              rgba(0, 0, 0, 0.9) 82%,
              rgba(0, 0, 0, 0.2) 92%,
              transparent 100%
            );
          }

          .showcase-visual img {
            max-height: 170px;
          }

          .showcase-visual .empty {
            height: 140px;
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .showcase-row {
            gap: 10px;
          }

          .showcase-text h2 {
            font-size: 18px;
          }

          .showcase-text p {
            font-size: 10px;
            -webkit-line-clamp: 2;
          }

          .showcase-visual {
            min-height: 140px;
          }

          .showcase-visual img {
            max-height: 140px;
          }
        }
      `}</style>

      <div className="showcase-container">
        {displayCategories.map((category, index) => (
          <div className="showcase-row" key={category.id}>
            <div className="showcase-text">
              <span className="eyebrow">Explore Collections</span>

              <h2>{category.category_name}</h2>

              <p>
                {category.description ||
                  `Full development, repair and tuning. Discover our premium selection of ${category.category_name.toLowerCase()}, engineered for ultimate precision and performance.`}
              </p>

              <div className="showcase-index" aria-hidden="true">
                <span className="current">0{index + 1}</span>
                <span className="divider" />
                <span className="total">0{displayCategories.length}</span>
              </div>

              <Link
                href={category.slug ? `/category/${category.slug}` : '/category'}
                className="catalogue-btn"
              >
                See Catalogue <ArrowIcon />
              </Link>
            </div>

            <div className="showcase-visual">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.category_name}
                  loading="lazy"
                />
              ) : (
                <div className="empty">Image coming soon</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==================================================================
 *  HOMEPAGE CAR SPOTLIGHT — FULL-BLEED · EDGE-TO-EDGE
 * ================================================================== */

function HomepageCarSpotlight() {
  return (
    <section className="home-spotlight" aria-labelledby="home-spotlight-title">
      <style jsx>{`
        .home-spotlight {
          position: relative;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
          align-items: center;
          gap: clamp(20px, 3vw, 48px);
          padding-top: 70px;
          padding-bottom: 70px;
          padding-left: max(24px, calc((100vw - 1280px) / 2 + 24px));
          padding-right: 0;
          background: #ffffff;
          overflow: hidden;
        }

        .home-spotlight-copy {
          position: relative;
          z-index: 1;
          max-width: 520px;
        }

        .home-spotlight-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          color: var(--red);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .home-spotlight-eyebrow::before {
          width: 32px;
          height: 1.5px;
          background: var(--red);
          content: '';
        }

        .home-spotlight-copy h2 {
          margin: 0 0 22px;
          color: var(--ink);
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(34px, 4.5vw, 60px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.06em;
        }

        .home-spotlight-copy p {
          max-width: 440px;
          margin: 0 0 30px;
          color: #6a6a6a;
          font-size: 14px;
          line-height: 1.8;
        }

        .home-spotlight-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 46px;
          padding: 0 24px;
          background: #0a0a0a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .home-spotlight-cta:hover {
          background: var(--red);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(229, 35, 47, 0.22);
        }

        .home-spotlight-cta :global(svg) {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .home-spotlight-cta:hover :global(svg) {
          transform: translateX(6px);
        }

        .home-spotlight-art {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-height: 480px;
          width: 100%;
          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent 0%,
              #000 12%,
              #000 88%,
              transparent 100%
            ),
            linear-gradient(
              to right,
              transparent 0%,
              #000 18%,
              #000 100%
            );
          -webkit-mask-composite: source-in;
          mask-image:
            linear-gradient(
              to bottom,
              transparent 0%,
              #000 12%,
              #000 88%,
              transparent 100%
            ),
            linear-gradient(
              to right,
              transparent 0%,
              #000 18%,
              #000 100%
            );
          mask-composite: intersect;
        }

        .home-spotlight-art img {
          display: block;
          width: 100%;
          max-width: 860px;
          max-height: 560px;
          height: auto;
          object-fit: contain;
          object-position: right center;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .home-spotlight:hover .home-spotlight-art img {
          transform: translateY(-6px) scale(1.015);
        }

        @media (max-width: 900px) {
          .home-spotlight {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
            gap: 20px;
            padding-top: 54px;
            padding-bottom: 54px;
            padding-left: 24px;
          }

          .home-spotlight-art {
            min-height: 340px;
          }

          .home-spotlight-art img {
            max-height: 400px;
          }
        }

        @media (max-width: 640px) {
          .home-spotlight {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 12px;
            padding-top: 38px;
            padding-bottom: 38px;
            padding-left: 16px;
          }

          .home-spotlight-eyebrow {
            font-size: 8px;
            letter-spacing: 0.14em;
            margin-bottom: 10px;
            gap: 6px;
          }

          .home-spotlight-eyebrow::before {
            width: 16px;
            height: 1px;
          }

          .home-spotlight-copy h2 {
            font-size: clamp(22px, 5.4vw, 32px);
            line-height: 1.06;
            margin-bottom: 12px;
            letter-spacing: -0.045em;
          }

          .home-spotlight-copy p {
            font-size: 11px;
            line-height: 1.6;
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .home-spotlight-cta {
            gap: 6px;
            min-height: 36px;
            padding: 0 12px;
            font-size: 9px;
            letter-spacing: 0.08em;
          }

          .home-spotlight-cta :global(svg) {
            width: 12px;
            height: 12px;
          }

          .home-spotlight-art {
            min-height: 220px;
          }

          .home-spotlight-art img {
            max-height: 240px;
          }
        }

        @media (max-width: 400px) {
          .home-spotlight {
            gap: 8px;
            padding-left: 12px;
          }

          .home-spotlight-copy h2 {
            font-size: 20px;
          }

          .home-spotlight-copy p {
            font-size: 10px;
            -webkit-line-clamp: 2;
          }

          .home-spotlight-cta {
            min-height: 32px;
            padding: 0 9px;
            font-size: 8px;
          }

          .home-spotlight-art {
            min-height: 170px;
          }

          .home-spotlight-art img {
            max-height: 180px;
          }
        }
      `}</style>

      <div className="home-spotlight-copy">
        <span className="home-spotlight-eyebrow">Built for the way you drive</span>
        <h2 id="home-spotlight-title">Better parts. Better journeys.</h2>
        <p>
          Find trusted car parts for the vehicles you love. Explore leading brands and get the right
          fit for every journey ahead.
        </p>
        <Link className="home-spotlight-cta" href="/brands">
          Explore car brands <ArrowIcon />
        </Link>
      </div>

      <div className="home-spotlight-art">
        <img
          src="/performance-car-showcase.png"
          alt="A close-up of a white performance car with a red taillight"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}

/* ==================================================================
 *  FULL-WIDTH IMAGE SHOWCASE — NEW SECTION
 *  · Image spans the FULL viewport width (100vw)
 *  · White fade on top, bottom, left, right — blends into page
 *  · Overlay title + subtitle with scroll-triggered reveal animation
 *  · Subtle parallax on mouse move
 * ================================================================== */

function FullWidthImageShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* ── Subtle parallax on mouse move (desktop only) ── */
  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (event.clientX - cx) / rect.width;
        const dy = (event.clientY - cy) / rect.height;
        image.style.transform = `translate3d(${dx * 14}px, ${dy * 10}px, 0) scale(1.02)`;
        frame = 0;
      });
    };
    const onLeave = () => {
      image.style.transform = 'translate3d(0, 0, 0) scale(1.02)';
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`fullwidth-showcase${visible ? ' is-visible' : ''}`}
      aria-labelledby="fullwidth-showcase-title"
    >
      <style jsx>{`
        .fullwidth-showcase {
          position: relative;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          padding: 0;
          background: #ffffff;
          overflow: hidden;
          isolation: isolate;
        }

        /* ── Image wrapper (full-bleed) ── */
        .fullwidth-showcase-media {
          position: relative;
          width: 100%;
          height: clamp(360px, 62vh, 720px);
          overflow: hidden;
          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 0, 0, 0.35) 6%,
              #000 16%,
              #000 84%,
              rgba(0, 0, 0, 0.35) 94%,
              transparent 100%
            ),
            linear-gradient(
              to right,
              transparent 0%,
              #000 5%,
              #000 95%,
              transparent 100%
            );
          -webkit-mask-composite: source-in;
          mask-image:
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 0, 0, 0.35) 6%,
              #000 16%,
              #000 84%,
              rgba(0, 0, 0, 0.35) 94%,
              transparent 100%
            ),
            linear-gradient(
              to right,
              transparent 0%,
              #000 5%,
              #000 95%,
              transparent 100%
            );
          mask-composite: intersect;
        }

        .fullwidth-showcase-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1.02);
          transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
          opacity: 0;
        }

        .fullwidth-showcase.is-visible .fullwidth-showcase-media img {
          opacity: 1;
          animation: showcase-image-in 1.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes showcase-image-in {
          0% {
            opacity: 0;
            transform: scale(1.08) translateY(24px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1.02) translateY(0);
            filter: blur(0);
          }
        }

        /* ── Overlay text ── */
        .fullwidth-showcase-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
          pointer-events: none;
        }

        .fullwidth-showcase-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          padding: 8px 18px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(10, 10, 10, 0.35);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border-radius: 999px;
          opacity: 0;
          transform: translateY(16px);
        }

        .fullwidth-showcase.is-visible .fullwidth-showcase-eyebrow {
          animation: showcase-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        .fullwidth-showcase-eyebrow::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--red);
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(229, 35, 47, 0.25);
        }

        .fullwidth-showcase-title {
          max-width: 900px;
          margin: 0 0 22px;
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(34px, 5.4vw, 78px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.055em;
          text-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
          opacity: 0;
          transform: translateY(24px);
        }

        .fullwidth-showcase.is-visible .fullwidth-showcase-title {
          animation: showcase-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .fullwidth-showcase-title em {
          font-style: normal;
          color: var(--red);
        }

        .fullwidth-showcase-subtitle {
          max-width: 620px;
          margin: 0 0 34px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 15px;
          line-height: 1.7;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          opacity: 0;
          transform: translateY(20px);
        }

        .fullwidth-showcase.is-visible .fullwidth-showcase-subtitle {
          animation: showcase-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
        }

        .fullwidth-showcase-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 50px;
          padding: 0 30px;
          background: #ffffff;
          color: #0a0a0a;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 999px;
          pointer-events: auto;
          opacity: 0;
          transform: translateY(20px);
          transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fullwidth-showcase.is-visible .fullwidth-showcase-cta {
          animation: showcase-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .fullwidth-showcase-cta:hover {
          background: var(--red);
          color: #ffffff;
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(229, 35, 47, 0.35);
        }

        .fullwidth-showcase-cta :global(svg) {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fullwidth-showcase-cta:hover :global(svg) {
          transform: translateX(6px);
        }

        @keyframes showcase-fade-up {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Ambient red glow accents ── */
        .fullwidth-showcase::before,
        .fullwidth-showcase::after {
          content: '';
          position: absolute;
          z-index: 1;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.4;
        }

        .fullwidth-showcase::before {
          width: 320px;
          height: 320px;
          top: -80px;
          left: 8%;
          background: radial-gradient(circle, rgba(229, 35, 47, 0.5), transparent 70%);
        }

        .fullwidth-showcase::after {
          width: 260px;
          height: 260px;
          bottom: -60px;
          right: 10%;
          background: radial-gradient(circle, rgba(10, 10, 10, 0.35), transparent 70%);
        }

        /* ── Tablet ── */
        @media (max-width: 900px) {
          .fullwidth-showcase-media {
            height: clamp(320px, 55vh, 560px);
          }

          .fullwidth-showcase-title {
            font-size: clamp(28px, 6vw, 52px);
          }

          .fullwidth-showcase-subtitle {
            font-size: 13px;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .fullwidth-showcase-media {
            height: 360px;
          }

          .fullwidth-showcase-eyebrow {
            font-size: 8px;
            letter-spacing: 0.16em;
            padding: 6px 12px;
            margin-bottom: 14px;
            gap: 8px;
          }

          .fullwidth-showcase-eyebrow::before {
            width: 6px;
            height: 6px;
          }

          .fullwidth-showcase-title {
            font-size: clamp(24px, 7vw, 34px);
            line-height: 1.08;
            margin-bottom: 14px;
            letter-spacing: -0.04em;
          }

          .fullwidth-showcase-subtitle {
            font-size: 11px;
            line-height: 1.6;
            margin-bottom: 22px;
            max-width: 90%;
          }

          .fullwidth-showcase-cta {
            min-height: 40px;
            padding: 0 20px;
            font-size: 10px;
            letter-spacing: 0.1em;
            gap: 8px;
          }

          .fullwidth-showcase-cta :global(svg) {
            width: 13px;
            height: 13px;
          }
        }

        @media (max-width: 380px) {
          .fullwidth-showcase-media {
            height: 320px;
          }

          .fullwidth-showcase-title {
            font-size: 22px;
          }

          .fullwidth-showcase-subtitle {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fullwidth-showcase-media img,
          .fullwidth-showcase-eyebrow,
          .fullwidth-showcase-title,
          .fullwidth-showcase-subtitle,
          .fullwidth-showcase-cta {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="fullwidth-showcase-media">
        <img
          ref={imageRef}
          src="/images/img1.png"
          alt="Performance automotive showcase"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="fullwidth-showcase-overlay">
        <span className="fullwidth-showcase-eyebrow">Precision Engineered</span>
        <h2 id="fullwidth-showcase-title" className="fullwidth-showcase-title">
          Every part. <em>Every drive.</em> Perfected.
        </h2>
        <p className="fullwidth-showcase-subtitle">
          From daily drivers to weekend builds — discover OEM-grade components and performance
          upgrades crafted for the road ahead.
        </p>
        <Link className="fullwidth-showcase-cta" href="/category">
          Start Exploring <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

/* ==================================================================
 *  HOME PAGE
 * ================================================================== */

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [preferredBrand, setPreferredBrand] = useState('');
  const [homeSelectedVehicles, setHomeSelectedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const readPreference = () => {
      try {
        setPreferredBrand(window.localStorage.getItem(HOME_BRAND_PREFERENCE_KEY) || '');
      } catch {
        setPreferredBrand('');
      }
    };
    readPreference();
    window.addEventListener('pageshow', readPreference);
    return () => window.removeEventListener('pageshow', readPreference);
  }, []);

  useEffect(() => {
    if (!apiUrl) {
      setError('Live catalog is not configured yet.');
      setLoading(false);
      return;
    }
    void apiFetch<CarBrand[]>(apiUrl, '/api/v1/car-brands')
      .then((items) => setCarBrands(Array.isArray(items) ? items : []))
      .catch(() => setCarBrands([]));

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

  useEffect(() => {
    if (vehicles.length === 0) {
      setHomeSelectedVehicles([]);
      return;
    }
    const preferredVehicles = preferredBrand
      ? vehicles.filter((vehicle) => vehicle.manufacturer_name.trim().toLowerCase() === preferredBrand.trim().toLowerCase())
      : [];
    setHomeSelectedVehicles(randomVehicles(preferredVehicles.length ? preferredVehicles : vehicles));
  }, [preferredBrand, vehicles]);

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
          font-family: 'Montserrat', sans-serif;
          font-size: 21px;
          letter-spacing: -.03em;
          text-align: center;
        }

        .popular-cars-title-box::after {
          display: none;
        }

        @media (max-width: 520px) {
          .popular-cars-title-box {
            padding: 10px 16px;
            font-size: 18px;
          }
        }
      `}</style>

      {/* 1. HERO BANNER */}
      <HeroCarousel />

      {/* 2. CAR BRAND LOGOS */}
      <CarBrandStrip brands={carBrands} />

      {error && (
        <div className="store-section data-alert home-data-alert">{error}</div>
      )}
      {loading && (
        <div className="store-section home-loading">
          Loading categories, parts and vehicles from the database…
        </div>
      )}

      {/* 3. HOMEPAGE CAR SPOTLIGHT (full-bleed banner below brand logos) */}
      <HomepageCarSpotlight />

      {/* 3b. FULL-WIDTH IMAGE SHOWCASE (new — img1.png, full-bleed, animated overlay) */}
      <FullWidthImageShowcase />

      {/* 4. POPULAR VEHICLES */}
      {!loading && homeSelectedVehicles.length > 0 && (
        <section className="store-section vehicle-home-section" style={{ paddingTop: '60px', paddingBottom: '20px' }}>
          <div className="section-heading popular-cars-heading">
            <h2 className="popular-cars-title-box">Popular Cars</h2>
          </div>
          <div className="vehicle-home-grid">
            {homeSelectedVehicles.map((vehicle) => (
              <Link
                className="vehicle-home-card"
                href={
                  vehicle.slug
                    ? brandModelHref(
                        carBrands.find((brand) => brand.manufacturer_name === vehicle.manufacturer_name)?.slug ||
                          brandSlugFromName(vehicle.manufacturer_name),
                        vehicle.slug,
                      )
                    : '/brands'
                }
                key={vehicle.id}
              >
                <div className="vehicle-home-card-top">
                  <div className="vehicle-home-brand">
                    {vehicle.manufacturer_logo && (
                      <span className="vehicle-home-logo-frame">
                        <img src={vehicle.manufacturer_logo} alt={`${vehicle.manufacturer_name} logo`} loading="lazy" />
                      </span>
                    )}
                  </div>
                  <strong>{vehicle.model_name}</strong>
                  <span>{[vehicle.generation, vehicle.chassis_code].filter(Boolean).join(' · ') || vehicle.vehicle_type || 'Database fitment'}</span>
                </div>
                <div className="vehicle-home-card-image">
                  {vehicle.cover_image_url ? (
                    <img src={vehicle.cover_image_url} alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`} />
                  ) : (
                    <span className="database-image-empty">No vehicle image</span>
                  )}
                </div>
                <div className="vehicle-home-card-specs">
                  <span><small>Years</small><b>{vehicle.year_start ? `${vehicle.year_start}–${vehicle.year_end ?? 'Present'}` : 'Not listed'}</b></span>
                  <span><small>Vehicle type</small><b>{vehicle.vehicle_type || 'Vehicle'}</b></span>
                  <span><small>Engine</small><b>{vehicle.engine_code || (vehicle.engine_capacity ? `${vehicle.engine_capacity} L` : 'View parts ↗')}</b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. PREMIUM CATEGORY SHOWCASE */}
      {!loading && popularCategories.length > 0 && (
        <CategoryShowcase categories={popularCategories} />
      )}

      {/* 6. NEW ARRIVALS / PARTS */}
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
                    <strong>{formatSar(part.sale_price ?? part.price)}</strong>
                    {part.sale_price && <del>{formatSar(part.price)}</del>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 7. EMPTY STATE */}
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

      {/* 8. SERVICE STRIP */}
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
