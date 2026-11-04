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
 *  HERO CAROUSEL (অপরিবর্তিত)
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
 *  CAR BRAND STRIP (অপরিবর্তিত)
 * ================================================================== */

function CarBrandStrip({ brands }: { brands: CarBrand[] }) {
  if (brands.length === 0) return null;

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
          font-family: Montserrat, sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -.02em;
          text-align: center;
          text-transform: none;
          border-radius: 4px;
        }

        .car-brand-grid {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 12px;
        }

        .car-brand-item {
          width: 100%;
          max-width: 130px;
          min-height: 85px;
          justify-self: center;
          box-sizing: border-box;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
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
          height: 20px;
          object-fit: contain;
        }

        .car-brand-item span {
          color: #555;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 1.2;
          text-align: center;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .car-brand-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
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
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }

          .car-brand-item {
            max-width: none;
            min-height: 70px;
            padding: 8px 4px;
            gap: 6px;
          }

          .car-brand-item img {
            height: 16px;
          }

          .car-brand-item span {
            font-size: 10px;
          }
        }
      `}</style>
      <div className="car-brand-strip-inner">
        <h2 id="car-brand-strip-title">Browse by car brand</h2>
        <div className="car-brand-grid">
          {brands.map((brand) => (
            <Link
              className="car-brand-item"
              href={`/car-brands/${brand.slug}`}
              key={brand.id}
              aria-label={`View ${brand.manufacturer_name} vehicles`}
            >
              <img src={brand.logo_url} alt="" aria-hidden="true" loading="lazy" />
              <span>{brand.manufacturer_name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
 *  ULTIMATE PREMIUM CATEGORY SHOWCASE (Murphy's Masterpiece Style)
 * ================================================================== */

function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  const displayCategories = categories.slice(0, 3);

  return (
    <section className="ultimate-showcase">
      <style jsx>{`
        /* --- মূল সেকশন ও আর্কিটেকচারাল গ্রিড --- */
        .ultimate-showcase {
          position: relative;
          width: 100%;
          background-color: #f9f9f9;
          padding: 150px 0;
          overflow: hidden;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        /* সূক্ষ্ম ব্যাকগ্রাউন্ড গ্রিড লাইন (ছবির মতো টেকনিক্যাল লুক) */
        .ultimate-showcase::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 25% 100%; /* ৪টি কলাম */
          pointer-events: none;
        }

        .showcase-container {
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          flex-direction: column;
          gap: 180px;
          z-index: 1;
        }

        /* --- রো লেআউট: লেখা বামে, ছবি ডানে --- */
        .showcase-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 80px;
        }

        /* --- বাম পাশ: টেক্সট ও কন্ট্রোল --- */
        .showcase-text {
          flex: 0 0 45%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .showcase-text .eyebrow {
          font-family: 'Courier New', Courier, monospace; /* মনোস্পেস ফন্ট */
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #999;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .showcase-text .eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #ccc;
        }

        .showcase-text h2 {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(44px, 5vw, 64px);
          font-weight: 300; /* অত্যন্ত স্লিম ও প্রিমিয়াম */
          color: #0a0a0a;
          line-height: 1.05;
          margin: 0 0 32px 0;
          letter-spacing: -0.04em;
        }

        .showcase-text p {
          font-size: 16px;
          color: #666;
          line-height: 1.7;
          margin: 0 0 48px 0;
          font-weight: 400;
        }

        /* --- ছবির মতো কাস্টম স্লাইডার --- */
        .custom-pagination {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 56px;
          width: 100%;
          max-width: 320px;
        }

        .custom-pagination .nav-arrow {
          font-size: 16px;
          color: #999;
          cursor: pointer;
          transition: color 0.3s;
          font-family: monospace;
        }

        .custom-pagination .nav-arrow:hover {
          color: #000;
        }

        .custom-pagination .line {
          flex: 1;
          height: 1px;
          background-color: #dcdcdc;
        }

        .custom-pagination .page-num {
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: 0.1em;
        }

        /* --- প্রিমিয়াম টেক্সট বাটন --- */
        .catalogue-btn {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #0a0a0a;
          text-decoration: none;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 8px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .catalogue-btn svg {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .catalogue-btn:hover {
          color: var(--red);
          border-color: var(--red);
        }

        .catalogue-btn:hover svg {
          transform: translateX(8px);
        }

        /* --- ডান পাশ: 3D ফ্লোটিং ইমেজ --- */
        .showcase-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          min-height: 500px;
        }

        /* ইমেজের পেছনে স্টুডিও লাইটিং গ্লো */
        .showcase-visual::before {
          content: '';
          position: absolute;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(220,220,220,0.4) 0%, rgba(249,249,249,0) 70%);
          border-radius: 50%;
          z-index: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .showcase-visual img {
          width: 100%;
          max-width: 750px;
          height: auto;
          max-height: 550px;
          object-fit: contain;
          position: relative;
          z-index: 2;
          /* ছবির মতো গভীর ও নরম 3D ড্রপ-শ্যাডো */
          filter: drop-shadow(0px 30px 50px rgba(0, 0, 0, 0.12)) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.05));
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .showcase-row:hover .showcase-visual img {
          transform: translateY(-12px) scale(1.03);
          filter: drop-shadow(0px 40px 60px rgba(0, 0, 0, 0.18)) drop-shadow(0px 15px 20px rgba(0, 0, 0, 0.08));
        }

        /* --- মোবাইল রেসপন্সিভ --- */
        @media (max-width: 1024px) {
          .ultimate-showcase::before { background-size: 50% 100%; }
          .showcase-container { gap: 120px; }
          .showcase-row { gap: 40px; }
          .showcase-text { flex: 0 0 50%; }
        }

        @media (max-width: 768px) {
          .ultimate-showcase { padding: 80px 0; }
          .ultimate-showcase::before { background-size: 100% 100%; } /* মোবাইলে গ্রিড লাইন অফ */
          .showcase-container { gap: 80px; padding: 0 24px; }
          
          .showcase-row {
            flex-direction: column;
            gap: 48px;
            text-align: center;
          }
          .showcase-text {
            flex: 1;
            width: 100%;
            align-items: center;
          }
          .showcase-text .eyebrow { justify-content: center; }
          
          .custom-pagination {
            max-width: 260px;
            margin: 0 auto 40px auto;
          }
          .showcase-visual { min-height: 300px; }
          .showcase-visual img { max-height: 350px; }
        }
      `}</style>

      <div className="showcase-container">
        {displayCategories.map((category, index) => (
          <div className="showcase-row" key={category.id}>
            {/* বাম পাশ: টেক্সট */}
            <div className="showcase-text">
              <span className="eyebrow">Explore Collections</span>
              <h2>{category.category_name}</h2>
              <p>
                {category.description ||
                  `Full development, repair and tuning. Discover our premium selection of ${category.category_name.toLowerCase()}, engineered for ultimate precision and performance.`}
              </p>
              
              {/* প্রিমিয়াম স্লাইডার কন্ট্রোল */}
              <div className="custom-pagination">
                <span className="nav-arrow">&lt;</span>
                <span className="line"></span>
                <span className="page-num">0{index + 1} / 03</span>
                <span className="line"></span>
                <span className="nav-arrow">&gt;</span>
              </div>

              <Link 
                href={category.slug ? `/category/${category.slug}` : '/category'} 
                className="catalogue-btn"
              >
                See Catalogue <ArrowIcon />
              </Link>
            </div>
            
            {/* ডান পাশ: হিউজ ফ্লোটিং ইমেজ */}
            <div className="showcase-visual">
              {category.image_url ? (
                <img src={category.image_url} alt={category.category_name} loading="lazy" />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ccc',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  [ IMAGE NOT FOUND ]
                </div>
              )}
            </div>
          </div>
        ))}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiUrl) {
      setError('Live catalog is not configured yet.');
      setLoading(false);
      return;
    }
    void apiFetch<CarBrand[]>(apiUrl, '/api/v1/car-brands')
      .then((items) => setCarBrands(Array.isArray(items) ? items.slice(0, 10) : []))
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

      {/* 3. POPULAR VEHICLES */}
      {!loading && homeSelectedVehicles.length > 0 && (
        <section className="store-section vehicle-home-section" style={{ paddingTop: '60px', paddingBottom: '20px' }}>
          <div className="section-heading popular-cars-heading">
            <h2 className="popular-cars-title-box">Popular Cars</h2>
          </div>
          <div className="vehicle-home-grid">
            {homeSelectedVehicles.map((vehicle) => (
              <Link
                className="vehicle-home-card"
                href={vehicle.slug ? `/vehicles/${vehicle.slug}` : '/vehicles'}
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
                  <span><small>Vehicle type</small><b>{vehicle.vehicle_type || 'Vehicle'}</b></span>
                  <span><small>Explore</small><b>View parts <i aria-hidden="true">↗</i></b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. ULTIMATE PREMIUM CATEGORY SHOWCASE */}
      {!loading && popularCategories.length > 0 && (
        <CategoryShowcase categories={popularCategories} />
      )}

      {/* 5. NEW ARRIVALS / PARTS */}
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

      {/* 6. EMPTY STATE */}
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

      {/* 7. SERVICE STRIP */}
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
