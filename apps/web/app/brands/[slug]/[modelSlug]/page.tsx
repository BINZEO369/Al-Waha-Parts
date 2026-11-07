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
  engine_code?: string | null;
  engine_capacity?: string | number | null;
  fuel_type?: string | null;
  transmission?: string | null;
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
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`.trim();
  const manufacturerLogo = vehicle.manufacturer_logo || brand.logo_url;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];
  
  // Database values only (labels removed)
  const specs = [
    vehicle.vehicle_type,
    vehicle.generation,
    vehicle.chassis_code,
    vehicle.year_start && vehicle.year_end
      ? `${vehicle.year_start}–${vehicle.year_end}`
      : vehicle.year_start || vehicle.year_end,
    vehicle.engine_code,
    vehicle.engine_capacity,
    vehicle.fuel_type,
    vehicle.transmission,
  ].filter((val) => val !== null && val !== undefined && String(val).trim() !== '');

  return (
    <main className="vehicle-detail-wrapper">
      <style jsx>{`
        .vehicle-detail-wrapper {
          overflow-x: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
          background: #fafafa;
        }

        /* DYNAMIC FULL BLEED HERO SECTION (No black gaps) */
        .full-bleed-hero {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          background: #f0f0f0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        /* Image dictates the height automatically */
        .hero-bg-image {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 30%);
          z-index: 2;
          pointer-events: none;
        }

        .hero-placeholder {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #666;
          background: #111;
        }

        /* Floating Back Button (Micro) */
        .glass-back-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          color: #fff;
          font-size: 9px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .glass-back-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* ULTRA-TINY DETAILS CARD */
        .liquid-details-card {
          position: absolute;
          bottom: 10px;
          left: 10px;
          z-index: 5;
          padding: 8px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          width: 180px; /* Extremely small width */
          max-height: 240px;
          overflow-y: auto;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
        
        .liquid-details-card:hover {
          transform: translateY(-1px);
        }

        .brand-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        .brand-header img {
          width: 14px;
          height: 14px;
          object-fit: contain;
        }

        .vehicle-title {
          font-size: 12px;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #000;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Compact Data Tags */
        .specs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          margin-bottom: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .spec-value {
          font-size: 8px;
          font-weight: 600;
          color: #111;
          background: rgba(0,0,0,0.06);
          padding: 2px 4px;
          border-radius: 4px;
          line-height: 1;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Micro Liquid Button */
        .liquid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          padding: 5px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 9px;
          text-decoration: none;
          transition: all 0.3s ease;
          width: 100%;
          border: none;
        }
        .liquid-btn:hover {
          background: #333;
        }

        /* PARTS SECTION */
        .parts-section-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 60px 40px 80px 40px;
        }

        .parts-section h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 28px;
          color: #111;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .parts-section h2 span {
          font-size: 14px;
          background: #eaeaea;
          padding: 4px 10px;
          border-radius: 20px;
          color: #555;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .empty-state {
          padding: 50px 20px;
          text-align: center;
          background: #fff;
          border-radius: 20px;
          border: 1px dashed #ddd;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-back-btn {
            top: 8px;
            left: 8px;
            font-size: 8px;
            padding: 4px 6px;
          }
          .liquid-details-card {
            width: 150px; /* Even smaller on mobile */
            bottom: 8px;
            left: 8px;
            padding: 6px;
          }
          .vehicle-title { font-size: 11px; }
          .spec-value { font-size: 7px; }
          .parts-section-wrapper {
            padding: 40px 16px;
          }
          .parts-section h2 { font-size: 22px; margin-bottom: 20px; }
        }
      `}</style>

      {/* Dynamic Full-Width Hero Section */}
      <section className="full-bleed-hero">
        {gallery.length ? (
          <>
            <img className="hero-bg-image" src={gallery[0]} alt={title} />
            <div className="hero-overlay"></div>
          </>
        ) : (
          <div className="hero-placeholder">No Image Available</div>
        )}

        {/* Tiny Glass Back Button */}
        <Link className="glass-back-btn" href={`/brands/${encodeURIComponent(brand.slug)}`}>
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>

        {/* ULTRA-TINY Liquid Glass Details Card (Bottom-Left) */}
        <div className="liquid-details-card">
          <div className="brand-header">
            {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
          </div>
          
          <h1 className="vehicle-title" title={title}>{title}</h1>
          
          {/* ONLY Database Values (No labels, no extra text) */}
          {specs.length > 0 && (
            <div className="specs-container">
              {specs.map((value, idx) => (
                <span className="spec-value" key={idx}>{value}</span>
              ))}
            </div>
          )}

          <Link className="liquid-btn" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>
            Parts
          </Link>
        </div>
      </section>

      {/* Parts List Section */}
      <section className="parts-section-wrapper">
        <div className="parts-section">
          <h2>
            Compatible Parts <span>{parts.length} Items</span>
          </h2>
          {parts.length ? (
            <div className="catalog-grid">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3 style={{ marginBottom: '10px', color: '#333', fontSize: '18px' }}>No compatible products yet</h3>
              <p style={{ fontSize: '14px' }}>Our parts desk can still help source the right item for this vehicle.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
