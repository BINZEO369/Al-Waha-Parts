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
  
  // Title generation (Year completely removed)
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`.trim();
  const manufacturerLogo = vehicle.manufacturer_logo || brand.logo_url;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];

  return (
    <main className="vehicle-detail-wrapper">
      <style jsx>{`
        /* Main wrapper - hide overflow to prevent horizontal scroll from full-bleed */
        .vehicle-detail-wrapper {
          overflow-x: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
          background: #fafafa;
        }

        /* 
         * FULL BLEED HERO SECTION 
         * Starts exactly from the header (no top margin/padding) 
         */
        .full-bleed-hero {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          min-height: 85vh; /* Roughly screen height */
          display: flex;
          align-items: flex-end;
          background: #111;
          overflow: hidden;
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

        /* Gradient overlay for readability */
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%),
                      linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
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
          color: #666;
          background: linear-gradient(135deg, #222, #111);
          z-index: 1;
        }

        /* Floating Back Button (Glass Style) */
        .glass-back-btn {
          position: absolute;
          top: 30px;
          left: 40px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .glass-back-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        /* Container to align the liquid card */
        .hero-content-container {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 40px 60px 40px;
          display: flex;
        }

        /* LIQUID GLASS CARD */
        .liquid-details-card {
          padding: 40px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 28px;
          max-width: 600px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.8);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .liquid-details-card:hover {
          transform: translateY(-5px);
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .brand-header img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.05);
          padding: 8px;
          background: #fff;
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .brand-header strong {
          font-size: 18px;
          color: #111;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .vehicle-title {
          font-size: 42px;
          font-weight: 900;
          margin: 0 0 30px 0;
          color: #000;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .spec-label {
          font-size: 12px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .spec-value {
          font-size: 16px;
          font-weight: 800;
          color: #000;
        }

        /* Liquid Gradient Button */
        .liquid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #111, #333);
          color: #fff;
          padding: 18px 36px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          width: 100%;
          border: 1px solid rgba(255,255,255,0.1);
          letter-spacing: 0.5px;
        }
        .liquid-btn:hover {
          background: linear-gradient(135deg, #000, #222);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        /* 
         * PARTS SECTION 
         * Contained within a standard max-width wrapper 
         */
        .parts-section-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 80px 40px;
        }

        .parts-section h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 32px;
          color: #111;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .parts-section h2 span {
          font-size: 16px;
          background: #eaeaea;
          padding: 4px 12px;
          border-radius: 20px;
          color: #555;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }
        .empty-state {
          padding: 60px;
          text-align: center;
          background: #fff;
          border-radius: 24px;
          border: 1px dashed #ddd;
          color: #666;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .vehicle-title { font-size: 36px; }
        }

        @media (max-width: 768px) {
          .full-bleed-hero {
            min-height: 90vh;
          }
          .glass-back-btn {
            top: 20px;
            left: 20px;
            padding: 10px 16px;
            font-size: 13px;
          }
          .hero-content-container {
            padding: 0 20px 40px 20px;
          }
          .liquid-details-card {
            padding: 30px 24px;
            border-radius: 24px;
            width: 100%;
          }
          .vehicle-title { font-size: 28px; }
          .specs-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .parts-section-wrapper {
            padding: 50px 20px;
          }
          .parts-section h2 { font-size: 24px; }
        }
      `}</style>

      {/* Full-Width Hero Section (Starts exactly from header) */}
      <section className="full-bleed-hero">
        {gallery.length ? (
          <>
            <img className="hero-bg-image" src={gallery[0]} alt={title} />
            <div className="hero-overlay"></div>
          </>
        ) : (
          <div className="hero-placeholder">No Image Available</div>
        )}

        {/* Glass Back Button floating on top-left */}
        <Link className="glass-back-btn" href={`/brands/${encodeURIComponent(brand.slug)}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to {brand.manufacturer_name}
        </Link>

        {/* Floating Liquid Glass Details Card */}
        <div className="hero-content-container">
          <div className="liquid-details-card">
            <div className="brand-header">
              {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
              <strong>{brand.manufacturer_name}</strong>
            </div>
            
            <h1 className="vehicle-title">{title}</h1>
            
            {/* Specs Grid (No Year) */}
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
        </div>
      </section>

      {/* Parts List Section (Standard Container) */}
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
              <h3 style={{ marginBottom: '10px', color: '#333' }}>No compatible products yet</h3>
              <p>Our parts desk can still help source the right item for this vehicle.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
