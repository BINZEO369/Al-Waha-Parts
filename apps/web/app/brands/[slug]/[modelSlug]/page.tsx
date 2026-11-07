'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../../packages/shared/src/api';
import { PartCard, type PartCardData } from '../../../../components/PartCard';
import { PageLoader } from '../../../../components/PageLoader';

type Brand = {
  id: string;
  manufacturer_name: string;
  slug: string;
  logo_url: string | null;
  sort_order: number;
};
type Vehicle = {
  id: string;
  slug: string;
  car_brand_id?: string | null;
  manufacturer_id?: string | null;
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
        const detailManufacturerId =
          vehicleDetail.vehicle.car_brand_id || vehicleDetail.vehicle.manufacturer_id;
        if (
          vehicleDetail.vehicle.id !== model.id ||
          (detailManufacturerId && detailManufacturerId !== brandDetail.brand.id)
        ) {
          throw new Error('The selected model does not belong to this car brand.');
        }
        const completeVehicle: Vehicle = {
          ...model,
          ...vehicleDetail.vehicle,
          manufacturer_name:
            vehicleDetail.vehicle.manufacturer_name ||
            model.manufacturer_name ||
            brandDetail.brand.manufacturer_name,
          manufacturer_logo:
            vehicleDetail.vehicle.manufacturer_logo ||
            model.manufacturer_logo ||
            brandDetail.brand.logo_url,
          car_brand_id:
            detailManufacturerId || model.car_brand_id || brandDetail.brand.id,
        };
        if (active)
          setDetail({
            brand: brandDetail.brand,
            vehicle: completeVehicle,
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
        <PageLoader label="Loading vehicle details" />
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
  
  // Title generation
  const yearPrefix = vehicle.year_start ? `${vehicle.year_start} ` : '';
  const title = `${yearPrefix}${vehicle.manufacturer_name} ${vehicle.model_name}`.trim();
  const manufacturerLogo = vehicle.manufacturer_logo || brand.logo_url;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];

  return (
    <main className="page-shell vehicle-detail-page">
      <style jsx>{`
        .vehicle-detail-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 24px;
          color: #666;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #000;
        }
        
        /* Hero Card (Matching Image 2 style) */
        .vehicle-hero-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          margin-bottom: 40px;
        }
        @media (min-width: 768px) {
          .vehicle-hero-card {
            flex-direction: row;
          }
        }
        
        .vehicle-image-container {
          flex: 1;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          min-height: 300px;
        }
        .vehicle-image-container img {
          max-width: 100%;
          max-height: 350px;
          object-fit: contain;
        }
        .vehicle-placeholder {
          font-size: 24px;
          font-weight: bold;
          color: #ccc;
        }

        .vehicle-info-container {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .brand-header img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #eaeaea;
          padding: 4px;
        }
        .brand-header strong {
          font-size: 16px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .vehicle-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 24px 0;
          color: #111;
          line-height: 1.2;
        }

        /* Specs Grid (Matching Image 2 style) */
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
          padding-top: 24px;
          border-top: 1px solid #eaeaea;
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .spec-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .spec-value {
          font-size: 15px;
          font-weight: 600;
          color: #222;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
          color: #fff;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: background 0.2s;
          width: max-content;
        }
        .action-btn:hover {
          background: #1d4ed8;
        }

        /* Parts Section */
        .parts-section {
          margin-top: 40px;
        }
        .parts-section h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #111;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .empty-state {
          padding: 40px;
          text-align: center;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px dashed #ccc;
          color: #666;
        }
      `}</style>

      <Link className="back-link" href={`/brands/${encodeURIComponent(brand.slug)}`}>
        ← Back to {brand.manufacturer_name}
      </Link>

      {/* Hero Section (Matching the clean card design) */}
      <section className="vehicle-hero-card">
        <div className="vehicle-image-container">
          {gallery.length ? (
            <img src={gallery[0]} alt={title} />
          ) : (
            <div className="vehicle-placeholder">No Image</div>
          )}
        </div>
        
        <div className="vehicle-info-container">
          <div className="brand-header">
            {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
            <strong>{brand.manufacturer_name}</strong>
          </div>
          
          <h1 className="vehicle-title">{title}</h1>
          
          {/* Only showing data that exists in the database */}
          <div className="specs-grid">
            {vehicle.vehicle_type && (
              <div className="spec-item">
                <span className="spec-label">Body Type</span>
                <span className="spec-value">{vehicle.vehicle_type}</span>
              </div>
            )}
            {vehicle.generation && (
              <div className="spec-item">
                <span className="spec-label">Generation</span>
                <span className="spec-value">{vehicle.generation}</span>
              </div>
            )}
            {vehicle.chassis_code && (
              <div className="spec-item">
                <span className="spec-label">Chassis Code</span>
                <span className="spec-value">{vehicle.chassis_code}</span>
              </div>
            )}
            {vehicle.year_start && (
              <div className="spec-item">
                <span className="spec-label">Year</span>
                <span className="spec-value">
                  {vehicle.year_start} {vehicle.year_end ? `- ${vehicle.year_end}` : ' - Present'}
                </span>
              </div>
            )}
          </div>

          <Link className="action-btn" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>
            Browse Compatible Parts
          </Link>
        </div>
      </section>

      {/* Parts List Section */}
      <section className="parts-section">
        <h2>Compatible Parts ({parts.length})</h2>
        {parts.length ? (
          <div className="catalog-grid">
            {parts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No compatible products are published yet.</strong>
            <p style={{ marginTop: '8px' }}>Our parts desk can still help source the right item for this vehicle.</p>
          </div>
        )}
      </section>
    </main>
  );
}
