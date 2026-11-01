'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';

type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string | null;
  cta_label: string;
  cta_href: string;
  image_url: string;
  mobile_image_url?: string | null;
  badge_text?: string | null;
};

const fallback: Banner[] = [{
  id: 'fallback',
  eyebrow: 'Automotive parts / UAE',
  title: 'Keep every vehicle moving.',
  description: 'A trusted parts desk for workshops, fleets and drivers. Search by vehicle, match the fit, and book with confidence.',
  cta_label: 'Explore parts',
  cta_href: '/catalog',
  image_url: 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/4wKGRTiQ8tMFf6VWfzk9Wk.jpg',
  badge_text: 'FITMENT FIRST',
}];

export function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>(fallback);
  const [active, setActive] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) return;
    apiFetch<Banner[]>(apiUrl, '/api/v1/banners').then((items) => {
      if (items.length) setBanners(items);
    }).catch(() => undefined);
  }, [apiUrl]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % banners.length), 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[active] ?? fallback[0]!;
  return (
    <section className="db-hero-carousel" aria-label="Featured parts banners">
      <div className="db-hero-copy">
        <p className="eyebrow">{banner.eyebrow}</p>
        <h1>{banner.title}</h1>
        <p className="hero-lede">{banner.description}</p>
        <div className="hero-actions">
          <Link className="button" href={banner.cta_href}>{banner.cta_label} <span>↗</span></Link>
          <Link className="text-link" href="/vehicles">Find by vehicle <span>→</span></Link>
        </div>
        {banners.length > 1 && <div className="db-hero-dots" aria-label="Select banner">{banners.map((item, index) => <button key={item.id} className={index === active ? 'db-hero-dot active' : 'db-hero-dot'} onClick={() => setActive(index)} aria-label={`Show banner ${index + 1}`} />)}</div>}
      </div>
      <div className="db-hero-visual" style={{ backgroundImage: `url(${banner.image_url})` }}>
        <div className="hero-visual-shade" />
        <div className="db-hero-stamp">{banner.badge_text ?? 'AL WAHA PARTS'}<br /><b>UAE / 2026</b></div>
      </div>
    </section>
  );
}
