'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
import styles from './HeroCarousel.module.css';

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

export function HeroCarousel() {
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
    const timer = window.setInterval(() => setActive((current) => (current + 1) % banners.length), 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[active];
  if (!banner && !loading) return null;

  return (
    <section className={styles.root} aria-label="Featured parts banners" aria-busy={loading}>
      {banner ? (
        <>
          <div className={styles.copy} key={`${banner.id}-copy`}>
            <p className="eyebrow">{banner.eyebrow}</p>
            <h1>{banner.title}</h1>
            <span className={styles.rule} aria-hidden="true" />
            {banner.description && <p className={styles.lede}>{banner.description}</p>}
            <div className={styles.actions}>
              <Link className="button" href={banner.cta_href}>{banner.cta_label}</Link>
            </div>
          </div>
          <div className={styles.visual} key={`${banner.id}-visual`}>
            {(banner.image_url || banner.mobile_image_url) && (
              <picture>
                {banner.mobile_image_url && <source media="(max-width: 700px)" srcSet={banner.mobile_image_url} />}
                <img src={banner.image_url || banner.mobile_image_url || ''} alt={banner.title} />
              </picture>
            )}
          </div>
          {banners.length > 1 && (
            <div className={styles.dots} aria-label="Select banner">
              {banners.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === active ? `${styles.dot} ${styles.active}` : styles.dot}
                  onClick={() => setActive(index)}
                  aria-label={`Show banner ${index + 1}: ${item.title}`}
                  aria-current={index === active ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className={styles.loading} aria-hidden="true" />
      )}
    </section>
  );
}
