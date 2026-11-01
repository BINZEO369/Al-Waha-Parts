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
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % banners.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[active];
  if (!banner && !loading) return null;

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
