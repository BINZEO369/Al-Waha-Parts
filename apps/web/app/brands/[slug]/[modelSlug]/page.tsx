'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../../packages/shared/src/api';
import { PartCard, type PartCardData } from '../../../../components/PartCard';

type Brand = {
  id: string;
  manufacturer_name: string;
  slug: string;
  logo_url: string;
  sort_order: number;
};
type Vehicle = {
  id: string;
  slug: string;
  car_brand_id?: string | null;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  vehicle_type?: string | null;
  cover_image_url?: string | null;
  vehicle_images?: string[] | null;
};
type BrandDetail = { brand: Brand; vehicles: Vehicle[] };
type VehicleDetail = { vehicle: Vehicle; parts: PartCardData[] };

export default function BrandModelPage({
  params,
}: {
  params: Promise<{ slug: string; modelSlug: string }>;
}) {
  const { slug, modelSlug } = use(params);
  const [detail, setDetail] = useState<{
    brand: Brand;
    vehicle: Vehicle;
    parts: PartCardData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!apiUrl) {
        setError('Vehicle API is not configured.');
        setLoading(false);
        return;
      }
      try {
        const brandDetail = await apiFetch<BrandDetail>(
          apiUrl,
          `/api/v1/car-brands/slug/${encodeURIComponent(slug)}`,
        );
        const model = brandDetail.vehicles.find((vehicle) => vehicle.slug === modelSlug);
        if (!model) throw new Error('This model is not listed under the selected car brand.');
        const vehicleDetail = await apiFetch<VehicleDetail>(
          apiUrl,
          `/api/v1/vehicles/slug/${encodeURIComponent(modelSlug)}`,
        );
        if (
          vehicleDetail.vehicle.id !== model.id ||
          (vehicleDetail.vehicle.car_brand_id &&
            vehicleDetail.vehicle.car_brand_id !== brandDetail.brand.id)
        ) {
          throw new Error('The selected model does not belong to this car brand.');
        }
        if (active)
          setDetail({
            brand: brandDetail.brand,
            vehicle: vehicleDetail.vehicle,
            parts: vehicleDetail.parts,
          });
      } catch (cause) {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Unable to load vehicle details.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [apiUrl, slug, modelSlug]);

  if (loading)
    return (
      <main className="page-shell">
        <div className="empty-state">Loading vehicle details and compatible products…</div>
      </main>
    );
  if (error || !detail)
    return (
      <main className="page-shell">
        <div className="data-alert">{error || 'Vehicle not found.'}</div>
        <Link className="button" href={`/brands/${encodeURIComponent(slug)}`}>
          Back to {slug}
        </Link>
      </main>
    );

  const { brand, vehicle, parts } = detail;
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];

  return (
    <main className="page-shell vehicle-detail-page">
      <style jsx>{`
        .vehicle-detail-page :global(.vehicle-detail-hero) {
          border-top: 3px solid var(--red);
        }
        .vehicle-detail-page :global(.button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .vehicle-detail-page :global(a:focus-visible) {
          outline: 2px solid var(--red);
          outline-offset: 3px;
        }
      `}</style>
      <Link className="back-link" href={`/brands/${encodeURIComponent(brand.slug)}`}>
        ← {brand.manufacturer_name} models
      </Link>
      <section className="vehicle-detail-hero">
        <div className="vehicle-detail-media">
          {gallery.length ? (
            <img src={gallery[0]} alt={title} />
          ) : (
            <div className="vehicle-detail-placeholder">AWP</div>
          )}
        </div>
        <div className="vehicle-detail-copy">
          <span className="section-kicker">{brand.manufacturer_name} model profile</span>
          <h1>{title}</h1>
          <p className="vehicle-detail-subtitle">
            {vehicle.generation || vehicle.chassis_code || 'Verified fitment record'}
          </p>
          <div className="vehicle-detail-specs">
            <div>
              <small>Type</small>
              <strong>{vehicle.vehicle_type || 'Passenger vehicle'}</strong>
            </div>
            <div>
              <small>Products</small>
              <strong>{parts.length} compatible</strong>
            </div>
          </div>
          <Link className="button" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>
            Browse all compatible parts
          </Link>
        </div>
      </section>
      <section className="vehicle-info-strip">
        <div>
          <span className="section-kicker">Database details</span>
          <strong>
            {brand.manufacturer_name} {vehicle.model_name}
          </strong>
        </div>
        {vehicle.chassis_code && (
          <div>
            <small>Chassis code</small>
            <strong>{vehicle.chassis_code}</strong>
          </div>
        )}
        {vehicle.generation && (
          <div>
            <small>Generation</small>
            <strong>{vehicle.generation}</strong>
          </div>
        )}
        <div>
          <small>Fitment status</small>
          <strong className="fitment-ok">Active and verified</strong>
        </div>
      </section>
      <section className="vehicle-products-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Live catalog matches</span>
            <h2>Parts for this vehicle</h2>
          </div>
          <span className="vehicle-products-count">{parts.length} products</span>
        </div>
        {parts.length ? (
          <div className="catalog-grid">
            {parts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No compatible products are published yet.</strong>
            <span>Our parts desk can still help source the right item for this vehicle.</span>
          </div>
        )}
      </section>
    </main>
  );
}
