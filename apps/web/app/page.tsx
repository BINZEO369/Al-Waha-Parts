'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';

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

export function HeroCarousel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!apiUrl) return;
    apiFetch<Slide[]>(apiUrl, '/api/v1/hero-slides')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data);
      })
      .catch(() => {
        /* keep fallback */
      });
  }, [apiUrl]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = window.setTimeout(next, 5500);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [current, paused, slides.length, next]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section
      className="hero-banner"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide backgrounds */}
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
                alt={s.title}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </picture>
          ) : (
            <div className="hero-image hero-image-empty" />
          )}
        </div>
      ))}

      {/* Overlay content — INSIDE banner, TOP area, small */}
      <div className="hero-content-overlay">
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

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-prev" onClick={prev} aria-label="Previous slide">
            ‹
          </button>
          <button className="hero-arrow hero-arrow-next" onClick={next} aria-label="Next slide">
            ›
          </button>
          <div className="hero-dots" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`hero-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === current}
                role="tab"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
