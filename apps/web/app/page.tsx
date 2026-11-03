'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';

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

type Brand = {
  name: string;
  slug: string;
  logo_url?: string | null;
  product_count?: number;
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

const HeroIcons = () => (
  <div className="hero-icon-strip">
    {[
      { name: 'Tires', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z' },
      { name: 'Engine', icon: 'M4 10h2l2-4h8l2 4h2v6h-2v2h-4v-2H8v2H4v-2H2v-6h2zm4 0h4v2H8v-2z' },
      { name: 'Battery', icon: 'M4 6h16v12H4V6zm2 4v4h4v-4H6zm6 0v4h4v-4h-4z' },
      { name: 'Oil', icon: 'M12 2C8 2 4 6 4 10c0 5 4 10 8 12 4-2 8-7 8-12 0-4-4-8-8-8zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z' },
      { name: 'Brake', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z' },
      { name: 'Diagnostics', icon: 'M3 12h4l3 8 4-16 3 8h4' }
    ].map((item) => (
      <div className="hero-icon-item" key={item.name}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{item.name}</span>
      </div>
    ))}
  </div>
);

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
          align-items: flex-end;
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
          object-position: center right;
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
          padding: 0 24px 40px;
          color: #fff;
        }

        .hero-text-area {
          max-width: 600px;
          margin-bottom: 60px;
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
          font-family: Montserrat, sans-serif;
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
          gap: 24px;
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

        .hero-actions .link {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .hero-actions .link:hover {
          text-decoration: underline;
        }

        .hero-icon-strip {
          display: flex;
          justify-content: flex-start;
          gap: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        .hero-icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .hero-icon-item:hover {
          color: #fff;
        }

        .hero-icon-item svg {
          width: 28px;
          height: 28px;
        }

        .hero-icon-item span {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes slide-fade {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .hero-carousel-root { height: 500px; }
          .hero-text-area { margin-bottom: 40px; }
          .hero-icon-strip { gap: 20px; overflow-x: auto; padding-bottom: 10px; }
          .hero-icon-item { flex-shrink: 0; }
        }

        @media (max-width: 600px) {
          .hero-carousel-root { height: auto; min-height: 600px; }
          .hero-carousel-slide { padding-top: 100px; }
          .hero-text-area h1 { font-size: 36px; }
          .hero-actions { flex-direction: column; align-items: flex-start; gap: 16px; }
          .hero-icon-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
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
              <Link className="link" href={banner.cta_href}>
                Shop Now <ArrowIcon />
              </Link>
            </div>
          </div>
          
          <HeroIcons />
        </div>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiUrl) {
      setError('Live catalog is not configured yet.');
      setLoading(false);
      return;
    }

    Promise.all([
      apiFetch<Category[]>(apiUrl, '/api/v1/popular-categories?limit=5'),
      apiFetch<Part[]>(apiUrl, '/api/v1/parts?limit=4&featured_only=true'),
    ])
      .then(([nextPopularCategories, nextParts]) => {
        setPopularCategories(nextPopularCategories);
        setParts(nextParts);
      })
      .catch((cause) => {
        setError(
          cause instanceof Error ? cause.message : 'Unable to load live database data.'
        );
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const homeSelectedParts = parts;

  return (
    <main className="home-page">
      <style jsx>{`
        .home-page {
          background-color: #ffffff;
          color: #111;
        }

        /* Common Section Styles */
        .section-container {
          max-width: var(--max);
          margin: 0 auto;
          padding: 80px 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }

        .section-header h2 {
          margin: 0;
          font-family: Montserrat, sans-serif;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
        }

        .view-all-link:hover {
          color: #111;
        }

        .view-all-link svg {
          width: 16px;
          height: 16px;
        }

        /* Browse by Categories Grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .category-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .category-card h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .category-card p {
          margin: 0 0 16px;
          font-size: 12px;
          color: #666;
        }

        .category-card .shop-link {
          font-size: 12px;
          font-weight: 600;
          color: #111;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 24px;
        }

        .category-card .shop-link svg {
          width: 14px;
          height: 14px;
        }

        .category-card .category-image {
          width: 100%;
          height: 120px;
          margin-top: auto;
          object-fit: contain;
        }

        /* Featured Products Grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .product-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .product-card:hover {
          border-color: #ddd;
          box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .product-card .product-image-wrap {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .product-card img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .product-card h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        @media (max-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .category-grid {
            grid-template-columns: 1fr;
          }
          .product-grid {
            grid-template-columns: 1fr;
          }
          .section-header h2 {
            font-size: 24px;
          }
        }
      `}</style>

      {/* 1. HERO BANNER */}
      <HeroCarousel />

      {error && (
        <div className="section-container" style={{ color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* 2. BROWSE BY CATEGORIES */}
      {!loading && popularCategories.length > 0 && (
        <section className="section-container">
          <div className="section-header">
            <h2>Browse by Categories</h2>
            <Link href="/category" className="view-all-link">
              View All <ArrowIcon />
            </Link>
          </div>
          <div className="category-grid">
            {popularCategories.map((category) => (
              <Link
                className="category-card"
                href={category.slug ? `/category/${category.slug}` : '/category'}
                key={category.id}
              >
                <h3>{category.category_name.trim()}</h3>
                <p>Save 20% off</p>
                <span className="shop-link">
                  Shop Now <ArrowIcon />
                </span>
                {category.image_url ? (
                  <img src={category.image_url} alt="" className="category-image" />
                ) : (
                  <div className="category-image" style={{ background: '#eee', borderRadius: '4px' }} />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. FEATURED PRODUCTS */}
      {!loading && homeSelectedParts.length > 0 && (
        <section className="section-container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link href="/category" className="view-all-link">
              View All <ArrowIcon />
            </Link>
          </div>
          <div className="product-grid">
            {homeSelectedParts.map((part) => (
              <Link 
                href={`/catalog/${part.slug ?? part.id}`} 
                className="product-card" 
                key={part.id}
              >
                <div className="product-image-wrap">
                  {part.primary_image_url ? (
                    <img src={part.primary_image_url} alt={part.part_name} />
                  ) : (
                    <span style={{ color: '#999', fontSize: '14px' }}>No Image</span>
                  )}
                </div>
                <h3>{part.part_name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
