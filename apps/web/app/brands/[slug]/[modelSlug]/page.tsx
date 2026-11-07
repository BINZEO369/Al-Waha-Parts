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
  
  // Title generation (Year removed as requested)
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`.trim();
  const manufacturerLogo = vehicle.manufacturer_logo || brand.logo_url;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];

  return (
    <main className="vehicle-detail-page">
      <style jsx>{`
        .vehicle-detail-page {
          max-width: 1300px;
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
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #000;
        }
        
        /* Full Width Liquid Hero Section */
        .vehicle-hero-section {
          position: relative;
          width: 100%;
          min-height: 550px;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          margin-bottom: 50px;
          background: #1a1a1a; /* Fallback */
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .hero-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        /* Gradient overlay for better text readability over the image */
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
          z-index: 2;
        }

        .hero-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #555;
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
          z-index: 1;
        }

        /* Liquid Glassmorphism Card */
        .liquid-details-card {
          position: relative;
          z-index: 3;
          margin: 30px;
          padding: 32px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          max-width: 550px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
        
        .liquid-details-card:hover {
          transform: translateY(-2px);
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .brand-header img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          padding: 6px;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .brand-header strong {
          font-size: 16px;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .vehicle-title {
          font-size: 36px;
          font-weight: 800;
          margin: 0 0 24px 0;
          color: #111;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .spec-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }
        .spec-value {
          font-size: 15px;
          font-weight: 700;
          color: #111;
        }

        /* Liquid Gradient Button */
        .liquid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: #fff;
          padding: 16px 32px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
          width: 100%;
          border: none;
        }
        .liquid-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.6);
          transform: translateY(-2px);
        }

        /* Parts Section */
        .parts-section {
          margin-top: 40px;
        }
        .parts-section h2 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #111;
          letter-spacing: -0.5px;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .empty-state {
          padding: 50px;
          text-align: center;
          background: rgba(248, 249, 250, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px dashed #ccc;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .vehicle-hero-section {
            min-height: 500px;
          }
          .liquid-details-card {
            margin: 16px;
            padding: 24px;
            max-width: 100%;
          }
          .vehicle-title {
            font-size: 28px;
          }
        }
      `}</style>

      <Link className="back-link" href={`/brands/${encodeURIComponent(brand.slug)}`}>
        ← Back to {brand.manufacturer_name}
      </Link>

      {/* Liquid Full-Width Hero Section */}
      <section className="vehicle-hero-section">
        {gallery.length ? (
          <>
            <img className="hero-bg-image" src={gallery[0]} alt={title} />
            <div className="hero-overlay"></div>
          </>
        ) : (
          <div className="hero-placeholder">No Image Available</div>
        )}
        
        {/* Floating Details Card ON TOP of the image */}
        <div className="liquid-details-card">
          <div className="brand-header">
            {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
            <strong>{brand.manufacturer_name}</strong>
          </div>
          
          <h1 className="vehicle-title">{title}</h1>
          
          {/* Only showing data that exists in the database (Year removed) */}
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
          </div>

          <Link className="liquid-btn" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>
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
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Our parts desk can still help source the right item for this vehicle.</p>
          </div>
        )}
      </section>
    </main>
  );
}
