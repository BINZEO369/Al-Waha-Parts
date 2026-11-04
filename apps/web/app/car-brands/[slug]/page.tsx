'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';

type Brand = { id: string; manufacturer_name: string; slug: string; logo_url: string; sort_order: number };
type Vehicle = { id: string; slug?: string | null; manufacturer_name: string; model_name: string; generation?: string | null; chassis_code?: string | null; year_start?: number | null; year_end?: number | null; vehicle_type?: string | null; cover_image_url?: string | null };
type BrandDetail = { brand: Brand; vehicles: Vehicle[] };

export default function CarBrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [detail, setDetail] = useState<BrandDetail | null>(null);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    if (!apiUrl) { setError('Vehicle API is not configured.'); return; }
    apiFetch<BrandDetail>(apiUrl, `/api/v1/car-brands/slug/${encodeURIComponent(slug)}`)
      .then(setDetail)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load brand vehicles.'));
  }, [apiUrl, slug]);
  if (error) return <main className="page-shell"><div className="data-alert">{error}</div><Link className="button" href="/">Back to home</Link></main>;
  if (!detail) return <main className="page-shell"><div className="empty-state">Loading brand vehicles…</div></main>;
  return (
    <main className="page-shell car-brand-page">
      <style jsx>{`
        .car-brand-page .brand-hero { display:grid; grid-template-columns:150px 1fr; gap:28px; align-items:center; padding:28px; margin-bottom:42px; border-top:3px solid var(--red); background:#fff; box-shadow:0 10px 28px rgba(0,0,0,.05); }
        .car-brand-page .brand-logo { width:120px; height:120px; display:grid; place-items:center; border:1px solid #f0c4c7; border-radius:50%; }
        .car-brand-page .brand-logo img { width:82px; height:82px; object-fit:contain; }
        .car-brand-page h1 { margin:7px 0 8px; font-family: 'Montserrat'; font-size:clamp(34px,5vw,58px); line-height:1; }
        .car-brand-page .brand-vehicles { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
        .car-brand-page .brand-vehicle { overflow:hidden; border:1px solid #f0c4c7; background:#fff; transition:transform .2s ease,box-shadow .2s ease; }
        .car-brand-page .brand-vehicle:hover { transform:translateY(-3px); box-shadow:0 9px 22px rgba(229,35,47,.12); }
        .car-brand-page .brand-vehicle img, .car-brand-page .brand-vehicle-empty { width:100%; height:170px; display:grid; place-items:center; object-fit:cover; background:#f8f8f8; }
        .car-brand-page .brand-vehicle-copy { display:grid; gap:5px; padding:15px; }
        .car-brand-page .brand-vehicle-copy strong { font-size:14px; }
        .car-brand-page .brand-vehicle-copy span { color:#888; font-size:10px; }
        @media (max-width:700px) { .car-brand-page .brand-hero { grid-template-columns:1fr; justify-items:center; text-align:center; } .car-brand-page .brand-vehicles { grid-template-columns:1fr 1fr; gap:10px; } }
        @media (max-width:430px) { .car-brand-page .brand-vehicles { grid-template-columns:1fr; } }
      `}</style>
      <Link className="back-link" href="/">← Home</Link>
      <section className="brand-hero"><div className="brand-logo"><img src={detail.brand.logo_url} alt={`${detail.brand.manufacturer_name} logo`} /></div><div><span className="section-kicker">Database car brand</span><h1>{detail.brand.manufacturer_name}</h1><p>{detail.vehicles.length} vehicles are linked to this logo.</p></div></section>
      <section><div className="section-heading"><div><span className="section-kicker">Live fitment records</span><h2>Vehicles by {detail.brand.manufacturer_name}</h2></div></div>
        {detail.vehicles.length ? <div className="brand-vehicles">{detail.vehicles.map((vehicle) => <Link className="brand-vehicle" href={vehicle.slug ? `/vehicles/${vehicle.slug}` : '/vehicles'} key={vehicle.id}>{vehicle.cover_image_url ? <img src={vehicle.cover_image_url} alt={`${vehicle.manufacturer_name} ${vehicle.model_name}`} /> : <div className="brand-vehicle-empty">No vehicle image</div>}<div className="brand-vehicle-copy"><strong>{vehicle.manufacturer_name} {vehicle.model_name}</strong><span>{vehicle.generation || vehicle.chassis_code || vehicle.vehicle_type || 'Vehicle fitment'}</span><span>{vehicle.year_start || '—'}–{vehicle.year_end || 'present'}</span></div></Link>)}</div> : <div className="empty-state">No active vehicles are linked to this brand yet.</div>}
      </section>
    </main>
  );
}
