'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { PartCard, type PartCardData } from '../../../components/PartCard';

type Vehicle = {
  id: string;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  vehicle_type?: string | null;
  cover_image_url?: string | null;
  gallery_images?: string[] | null;
};

type VehicleDetail = { vehicle: Vehicle; parts: PartCardData[] };

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError('Vehicle API is not configured.');
      setLoading(false);
      return;
    }
    apiFetch<VehicleDetail>(apiUrl, `/api/v1/vehicles/${encodeURIComponent(id)}`)
      .then(setDetail)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load vehicle details.'))
      .finally(() => setLoading(false));
  }, [apiUrl, id]);

  if (loading) return <main className="page-shell"><div className="empty-state">Loading vehicle details and compatible products…</div></main>;
  if (error || !detail) return <main className="page-shell"><div className="data-alert">{error || 'Vehicle not found.'}</div><Link className="button" href="/vehicles">Back to vehicle finder</Link></main>;

  const { vehicle, parts } = detail;
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`;
  const years = `${vehicle.year_start || '—'}–${vehicle.year_end || 'present'}`;
  const gallery = [vehicle.cover_image_url, ...(vehicle.gallery_images ?? [])].filter(Boolean) as string[];

  return (
    <main className="page-shell vehicle-detail-page">
      <style jsx>{`
        .vehicle-detail-page :global(.vehicle-detail-hero) { border-top: 3px solid var(--red); }
        .vehicle-detail-page :global(.button) { display: inline-flex; align-items: center; justify-content: center; }
        .vehicle-detail-page :global(a:focus-visible) { outline: 2px solid var(--red); outline-offset: 3px; }
      `}</style>
      <Link className="back-link" href="/vehicles">← Vehicle finder</Link>
      <section className="vehicle-detail-hero">
        <div className="vehicle-detail-media">
          {gallery.length ? <img src={gallery[0]} alt={title} /> : <div className="vehicle-detail-placeholder">AWP</div>}
        </div>
        <div className="vehicle-detail-copy">
          <span className="section-kicker">Vehicle fitment profile</span>
          <h1>{title}</h1>
          <p className="vehicle-detail-subtitle">{vehicle.generation || vehicle.chassis_code || 'Verified fitment record'}</p>
          <div className="vehicle-detail-specs">
            <div><small>Years</small><strong>{years}</strong></div>
            <div><small>Type</small><strong>{vehicle.vehicle_type || 'Passenger vehicle'}</strong></div>
            <div><small>Products</small><strong>{parts.length} compatible</strong></div>
          </div>
          <Link className="button" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>Browse all compatible parts</Link>
        </div>
      </section>

      <section className="vehicle-info-strip">
        <div><span className="section-kicker">Database details</span><strong>{vehicle.manufacturer_name} {vehicle.model_name}</strong></div>
        {vehicle.chassis_code && <div><small>Chassis code</small><strong>{vehicle.chassis_code}</strong></div>}
        {vehicle.generation && <div><small>Generation</small><strong>{vehicle.generation}</strong></div>}
        <div><small>Fitment status</small><strong className="fitment-ok">Active and verified</strong></div>
      </section>

      <section className="vehicle-products-section">
        <div className="section-heading"><div><span className="section-kicker">Live catalog matches</span><h2>Parts for this vehicle</h2></div><span className="vehicle-products-count">{parts.length} products</span></div>
        {parts.length ? <div className="catalog-grid">{parts.map((part) => <PartCard key={part.id} part={part} />)}</div> : <div className="empty-state"><strong>No compatible products are published yet.</strong><span>Our parts desk can still help source the right item for this vehicle.</span></div>}
      </section>
    </main>
  );
}
