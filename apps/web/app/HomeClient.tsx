'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';
import { brandModelHref, brandSlugFromName } from '../lib/vehicle-routes';
import { PageLoader } from '../components/PageLoader';
import { OptimizedImage } from '../components/OptimizedImage';

/* ==================================================================
 *  TYPES
 * ================================================================== */

export type Banner = {
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

export type HomeInitialData = {
  banners: Banner[];
  popularCategories: Category[];
  parts: Part[];
  vehicles: Vehicle[];
  carBrands: CarBrand[];
  loaded: boolean;
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

function optimizedHeroImageSource(source: string | null | undefined) {
  if (!source) return '';
  const optimizedMobileHero = source.replace(/^\/+/, '').match(/^hero\/img4-mobile\.webp$/);
  if (optimizedMobileHero) return '/hero/img4-mobile-optimized.webp';
  const localHero = source.replace(/^\/+/, '').match(/^hero\/(img[1-4])\.png$/);
  return localHero ? `/hero/${localHero[1]}.webp` : source;
}

function mobileHeroImageSource(source: string) {
  const localHero = source.match(/^\/hero\/(img[1-4])\.webp$/);
  return localHero ? `/hero/${localHero[1]}-mobile.webp` : undefined;
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

function HeroCarousel({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(initialBanners.length === 0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (initialBanners.length > 0) return;
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
    let interval: number | undefined;
    const initialDelay = window.setTimeout(() => {
      interval = window.setInterval(
        () => setActive((current) => (current + 1) % banners.length),
        6000,
      );
    }, 12000);
    return () => {
      window.clearTimeout(initialDelay);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [banners.length]);

  if (loading) return null;

  if (!banners.length) return null;

  const banner = banners[active];
  if (!banner) return null;

  const imageSource = optimizedHeroImageSource(banner.image_url || banner.mobile_image_url);
  const mobileImageCandidate = banner.mobile_image_url || mobileHeroImageSource(imageSource);
  const mobileImageSource = optimizedHeroImageSource(mobileImageCandidate);
  const hasImage = Boolean(imageSource);

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
            <picture>
              {mobileImageSource && mobileImageSource !== imageSource && (
                <source media="(max-width: 600px)" srcSet={mobileImageSource} />
              )}
              <img
                src={imageSource}
                alt=""
                aria-hidden="true"
                width={2048}
                height={768}
                loading={active === 0 ? 'eager' : 'lazy'}
                fetchPriority={active === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </picture>
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
 *  HOME CATEGORY DIRECTORY — matches /category card design
 * ================================================================== */

function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="page-shell category-directory-page">
      <section
        className="category-start-section category-directory-section"
        aria-labelledby="home-category-directory-title"
      >
        <div className="category-start-heading">
          <h2 id="home-category-directory-title">Car parts by category</h2>
          <span className="category-count">{categories.length} categories</span>
        </div>
        <div className="category-start-grid">
          {categories.map((category) => (
            <Link
              className="category-start-card"
              href={category.slug ? `/category/${encodeURIComponent(category.slug)}` : '/category'}
              key={category.id}
            >
              <div className="category-start-image">
                {category.image_url ? (
                  <img src={category.image_url} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span aria-hidden="true">⌁</span>
                )}
              </div>
              <strong>{category.category_name.trim()}</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ==================================================================
 *  FULL-WIDTH IMAGE SHOWCASE — original image, no glows
 *  · Red & dark blurred glows removed (::before / ::after gone)
 *  · Vertical white fade kept for page blend
 * ================================================================== */

type FullWidthImageShowcaseProps = {
  imageSrc: string;
  imageAlt: string;
  title: ReactNode;
  subtitle: string;
  sectionId: string;
  priority?: boolean;
};

function FullWidthImageShowcase({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  sectionId,
  priority = false,
}: FullWidthImageShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

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
      className={`fullwidth-showcase${visible ? ' is-visible' : ''}${priority ? ' is-priority' : ''}`}
      aria-labelledby={sectionId}
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

        .fullwidth-showcase-media {
          position: relative;
          width: 100%;
          height: clamp(360px, 62vh, 720px);
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.35) 6%,
            #000 16%,
            #000 84%,
            rgba(0, 0, 0, 0.35) 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.35) 6%,
            #000 16%,
            #000 84%,
            rgba(0, 0, 0, 0.35) 94%,
            transparent 100%
          );
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

        .fullwidth-showcase.is-priority .fullwidth-showcase-media img {
          opacity: 1;
          animation: none;
          transition: none;
          object-position: center;
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

        .fullwidth-showcase-title :global(em) {
          font-style: normal;
          color: var(--red);
        }

        .fullwidth-showcase-subtitle {
          max-width: 620px;
          margin: 0;
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

        @media (max-width: 640px) {
          .fullwidth-showcase-media {
            height: 360px;
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
            max-width: 90%;
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
          .fullwidth-showcase-title,
          .fullwidth-showcase-subtitle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="fullwidth-showcase-media">
        <Image
          ref={imageRef}
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          priority={priority}
          unoptimized={priority}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
          decoding="async"
        />
      </div>

      <div className="fullwidth-showcase-overlay">
        <h2 id={sectionId} className="fullwidth-showcase-title">
          {title}
        </h2>
        <p className="fullwidth-showcase-subtitle">{subtitle}</p>
      </div>
    </section>
  );
}

/* ==================================================================
 *  HOME PAGE
 * ================================================================== */

export default function Home({ initialData }: { initialData: HomeInitialData }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [popularCategories, setPopularCategories] = useState<Category[]>(initialData.popularCategories);
  const [parts, setParts] = useState<Part[]>(initialData.parts);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialData.vehicles);
  const [carBrands, setCarBrands] = useState<CarBrand[]>(initialData.carBrands);
  const [preferredBrand, setPreferredBrand] = useState('');
  const [homeSelectedVehicles, setHomeSelectedVehicles] = useState<Vehicle[]>(initialData.vehicles.slice(0, HOME_VEHICLE_LIMIT));
  const [loading, setLoading] = useState(!initialData.loaded);
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
    if (initialData.loaded) return;
    if (!apiUrl) {
      setError('Live catalog is not configured yet.');
      setLoading(false);
      return;
    }
    void apiFetch<CarBrand[]>(apiUrl, '/api/v1/car-brands')
      .then((items) => setCarBrands(Array.isArray(items) ? items : []))
      .catch(() => setCarBrands([]));

    Promise.all([
      apiFetch<Category[]>(apiUrl, '/api/v1/popular-categories?limit=6'),
      apiFetch<Part[]>(apiUrl, '/api/v1/parts?limit=12&featured_only=true'),
      apiFetch<Vehicle[]>(apiUrl, '/api/v1/homepage-selected-vehicles?limit=18'),
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
    if (!preferredBrand) {
      setHomeSelectedVehicles(vehicles.slice(0, HOME_VEHICLE_LIMIT));
      return;
    }
    const preferredVehicles = vehicles.filter((vehicle) => vehicle.manufacturer_name.trim().toLowerCase() === preferredBrand.trim().toLowerCase());
    setHomeSelectedVehicles(randomVehicles(preferredVehicles.length ? preferredVehicles : vehicles));
  }, [preferredBrand, vehicles]);

  if (loading) return <PageLoader label="Loading Al Waha Parts" />;

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

      {/* 1. HERO BANNER */}
      <HeroCarousel initialBanners={initialData.banners} />

      {error && (
        <div className="store-section data-alert home-data-alert">{error}</div>
      )}
      {/* CAR BRAND LOGOS */}
      <CarBrandStrip brands={carBrands} />

      {/* SECOND BANNER — unchanged, now after the brand logos */}
      <FullWidthImageShowcase
        sectionId="fullwidth-showcase-two"
        imageSrc="/images/img3.webp"
        imageAlt="Performance braking and drivetrain parts showcase"
        title={
          <>
            Built to <em>stop.</em> Engineered to last.
          </>
        }
        subtitle="Premium brake systems, discs, pads and drivetrain upgrades — delivered with the precision, fitment and durability your vehicle deserves."
      />

      {/* POPULAR VEHICLES */}
      {!loading && homeSelectedVehicles.length > 0 && (
        <section className="store-section vehicle-home-section" style={{ paddingTop: '60px', paddingBottom: '20px' }}>
          <div className="section-heading popular-cars-heading">
            <div>
              <h2 className="popular-cars-title-box">CAR MODEL</h2>
            </div>
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
                <div className="vehicle-home-card-image">
                  {vehicle.cover_image_url && !/(^|\/)logo\.png(?:[?#].*)?$/i.test(vehicle.cover_image_url) ? (
                    <OptimizedImage src={vehicle.cover_image_url} alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`} fill sizes="(max-width: 480px) 50vw, 400px" loading="lazy" fetchPriority="low" quality={70} />
                  ) : (
                    <span className="database-image-empty">No vehicle image</span>
                  )}
                  {vehicle.manufacturer_logo && (
                    <span className="vehicle-home-image-watermark" aria-hidden="true">
                      <img src={vehicle.manufacturer_logo} alt="" loading="lazy" decoding="async" />
                    </span>
                  )}
                </div>
                <div className="vehicle-home-card-top">
                  <strong>{vehicle.model_name}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. PREMIUM CATEGORY SHOWCASE — unchanged */}
      {!loading && popularCategories.length > 0 && (
        <CategoryShowcase categories={popularCategories} />
      )}

      {/* 9. NEW ARRIVALS / PARTS */}
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
                  href={`/products/${part.slug ?? part.id}`}
                  className="arrival-image"
                  aria-label={`View ${part.part_name}`}
                >
                  <span className="sale-badge">
                    {part.condition || 'Available'}
                  </span>
                  {part.primary_image_url ? (
                    <OptimizedImage src={part.primary_image_url} alt={part.part_name} width={400} height={300} sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 300px" loading="lazy" fetchPriority="low" quality={75} />
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
                    <Link href={`/products/${part.slug ?? part.id}`}>
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

      {/* 10. EMPTY STATE */}
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

    </main>
  );
}
//
