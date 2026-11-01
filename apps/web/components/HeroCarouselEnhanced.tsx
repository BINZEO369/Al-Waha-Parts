'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';

/* ---------- Types ---------- */
type Slide = {
  id: string;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  mobile_image_url?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  secondary_label?: string | null;
  secondary_href?: string | null;
};

type MarqueeItem = {
  id: string;
  text: string;
  href?: string | null;
};

type HeroPayload = {
  slides: Slide[];
  marquee: MarqueeItem[];
};

/* ---------- Fallbacks ---------- */
const FALLBACK_SLIDES: Slide[] = [
  {
    id: 'fb-1',
    eyebrow: 'Genuine Parts',
    title: 'Find the right part for your vehicle',
    subtitle: 'Tested OEM & aftermarket parts with fitment guarantee.',
    cta_label: 'Shop catalog',
    cta_href: '/catalog',
    secondary_label: 'Search by vehicle',
    secondary_href: '/vehicles',
  },
  {
    id: 'fb-2',
    eyebrow: 'Fast Delivery',
    title: 'Same-day dispatch across the city',
    subtitle: 'Order before 3 PM and get it delivered today.',
    cta_label: 'Browse parts',
    cta_href: '/catalog',
    secondary_label: 'View offers',
    secondary_href: '/offers',
  },
  {
    id: 'fb-3',
    eyebrow: 'Verified Fitment',
    title: 'Every part verified by chassis code',
    subtitle: 'Reduce returns with our fitment database.',
    cta_label: 'Vehicle finder',
    cta_href: '/vehicles',
    secondary_label: 'How it works',
    secondary_href: '/about',
  },
];

const FALLBACK_MARQUEE: MarqueeItem[] = [
  { id: 'm1', text: '🚚 Free delivery on orders above SAR 300', href: '/offers' },
  { id: 'm2', text: '✅ Every part verified against chassis code' },
  { id: 'm3', text: '⚡ Same-day dispatch before 3 PM' },
  { id: 'm4', text: '🔧 7-day hassle-free returns' },
  { id: 'm5', text: '📞 Need help? Talk to our parts desk' },
];

/* ---------- Component ---------- */
export function HeroCarousel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [marquee, setMarquee] = useState<MarqueeItem[]>(FALLBACK_MARQUEE);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  /* Fetch slides + marquee */
  useEffect(() => {
    if (!apiUrl) return;
    apiFetch<HeroPayload>(apiUrl, '/api/v1/hero')
      .then((data) => {
        if (Array.isArray(data?.slides) && data.slides.length > 0) setSlides(data.slides);
        if (Array.isArray(data?.marquee) && data.marquee.length > 0) setMarquee(data.marquee);
      })
      .catch(() => {
        /* silent — keep fallbacks */
      });
  }, [apiUrl]);

  /* Autoplay */
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = window.setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5500);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [current, paused, slides.length]);

  /* Duplicate marquee for seamless loop */
  const marqueeTrack = useMemo(() => [...marquee, ...marquee], [marquee]);

  if (!slides.length) return null;
  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  return (
    <section
      className="hero-banner"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ===== Slide backgrounds ===== */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero-slide ${i === current ? 'is-active' : ''}`}
          aria-hidden={i !== current}
        >
          {s.image_url ? (
            <picture>
              {s.mobile_image_url && (
                <source media="(max-width: 640px)" srcSet={s.mobile_image_url} />
              )}
              <img
                className="hero-image"
                src={s.image_url}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding={i === 0 ? 'sync' : 'async'}
              />
            </picture>
          ) : (
            <div className="hero-image hero-image-empty" />
          )}
        </div>
      ))}

      {/* ===== Overlay: Title + Description + CTAs (TOP) ===== */}
      <div className="hero-content-overlay" key={slide.id}>
        {slide.eyebrow && <span className="hero-eyebrow">{slide.eyebrow}</span>}
        <h1 className="hero-title">{slide.title}</h1>
        {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
        <div className="hero-actions">
          {slide.cta_label && slide.cta_href && (
            <Link href={slide.cta_href} className="hero-btn hero-btn-primary">
              {slide.cta_label}
            </Link>
          )}
          {slide.secondary_label && slide.secondary_href && (
            <Link href={slide.secondary_href} className="hero-btn hero-btn-secondary">
              {slide.secondary_label}
            </Link>
          )}
        </div>
      </div>

      {/* ===== Dots ===== */}
      {slides.length > 1 && (
        <div className="hero-dots" role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`hero-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === current}
              role="tab"
              type="button"
            />
          ))}
        </div>
      )}

      {/* ===== Arrows ===== */}
      {slides.length > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-prev"
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            type="button"
          >
            ‹
          </button>
          <button
            className="hero-arrow hero-arrow-next"
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            aria-label="Next slide"
            type="button"
          >
            ›
          </button>
        </>
      )}

      {/* ===== Marquee (BOTTOM, right → left) ===== */}
      {marquee.length > 0 && (
        <>
          <div className="hero-marquee" aria-hidden="true">
            <div className="hero-marquee-track">
              {marqueeTrack.map((item, idx) => (
                <span className="hero-marquee-item" key={`${item.id}-${idx}`}>
                  {item.href ? <Link href={item.href}>{item.text}</Link> : <span>{item.text}</span>}
                  <span className="hero-marquee-sep">•</span>
                </span>
              ))}
            </div>
          </div>

          <ul className="sr-only">
            {marquee.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </>
      )}

      {/* ===== Styles (styled-jsx — component-scoped) ===== */}
      <style jsx>{`
        .hero-banner {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          margin-top: 0;
          margin-bottom: 0;
          height: clamp(400px, 62vh, 580px);
          overflow: hidden;
          background: #0b1220;
          isolation: isolate;
        }

        .hero-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.62) 0%,
            rgba(0, 0, 0, 0.28) 32%,
            rgba(0, 0, 0, 0) 58%,
            rgba(0, 0, 0, 0.45) 100%
          );
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.7s ease;
          will-change: opacity;
        }
        .hero-slide.is-active {
          opacity: 1;
          z-index: 1;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-image-empty {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        /* Overlay content */
        .hero-content-overlay {
          position: absolute;
          top: clamp(20px, 4vh, 44px);
          left: clamp(16px, 4vw, 56px);
          right: clamp(16px, 4vw, 56px);
          z-index: 3;
          max-width: 640px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: heroContentIn 0.5s ease both;
        }

        @keyframes heroContentIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-eyebrow {
          display: inline-block;
          width: fit-content;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
        }

        .hero-title {
          margin: 0;
          font-size: clamp(18px, 2.4vw, 32px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.015em;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        }

        .hero-subtitle {
          margin: 0;
          font-size: clamp(12px, 1.15vw, 15px);
          line-height: 1.5;
          opacity: 0.95;
          max-width: 480px;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }

        .hero-btn-primary {
          background: #ffffff;
          color: #0b1220;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }
        .hero-btn-primary:hover {
          transform: translateY(-1px);
          background: #f1f5f9;
        }

        .hero-btn-secondary {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .hero-btn-secondary:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.24);
        }

        /* Arrows */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(15, 23, 42, 0.55);
          color: #ffffff;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.15s ease;
        }
        .hero-arrow:hover {
          background: rgba(15, 23, 42, 0.85);
        }
        .hero-arrow-prev {
          left: 14px;
        }
        .hero-arrow-next {
          right: 14px;
        }

        /* Dots */
        .hero-dots {
          position: absolute;
          bottom: calc(44px + 12px);
          left: 0;
          right: 0;
          z-index: 4;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          background: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          transition:
            background 0.2s ease,
            width 0.25s ease;
        }
        .hero-dot.active {
          width: 24px;
          border-radius: 4px;
          background: #ffffff;
        }

        /* Marquee */
        .hero-marquee {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 5;
          height: 44px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            rgba(11, 18, 32, 0.92) 0%,
            rgba(11, 18, 32, 0.78) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }

        .hero-marquee::before,
        .hero-marquee::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 44px;
          z-index: 2;
          pointer-events: none;
        }
        .hero-marquee::before {
          left: 0;
          background: linear-gradient(90deg, rgba(11, 18, 32, 0.95), transparent);
        }
        .hero-marquee::after {
          right: 0;
          background: linear-gradient(270deg, rgba(11, 18, 32, 0.95), transparent);
        }

        .hero-marquee-track {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          white-space: nowrap;
          padding-left: 2.5rem;
          animation: heroMarquee 32s linear infinite;
          will-change: transform;
        }
        .hero-marquee:hover .hero-marquee-track {
          animation-play-state: paused;
        }

        @keyframes heroMarquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .hero-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 2.5rem;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .hero-marquee-item a {
          color: inherit;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .hero-marquee-item a:hover {
          color: #ffffff;
        }
        .hero-marquee-sep {
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
        }

        /* SR-only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-marquee-track {
            animation: none;
            transform: translateX(0);
          }
          .hero-content-overlay {
            animation: none;
          }
          .hero-slide {
            transition: none;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .hero-banner {
            height: clamp(420px, 68vh, 540px);
          }
          .hero-arrow {
            display: none;
          }
          .hero-content-overlay {
            top: 16px;
            left: 14px;
            right: 14px;
            gap: 8px;
            max-width: 100%;
          }
          .hero-title {
            font-size: 18px;
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 12px;
            max-width: 100%;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .hero-actions {
            gap: 6px;
            margin-top: 6px;
          }
          .hero-btn {
            font-size: 11px;
            padding: 8px 13px;
          }
          .hero-marquee {
            height: 38px;
          }
          .hero-marquee-track {
            gap: 1.75rem;
            padding-left: 1.75rem;
            animation-duration: 26s;
          }
          .hero-marquee-item {
            font-size: 11px;
            gap: 1.75rem;
          }
          .hero-dots {
            bottom: calc(38px + 10px);
          }
          .hero-dot {
            width: 7px;
            height: 7px;
          }
          .hero-dot.active {
            width: 20px;
          }
        }

        /* Large desktop */
        @media (min-width: 1280px) {
          .hero-title {
            font-size: 34px;
          }
          .hero-subtitle {
            font-size: 15px;
          }
          .hero-content-overlay {
            max-width: 720px;
          }
        }
      `}</style>
    </section>
  );
}
