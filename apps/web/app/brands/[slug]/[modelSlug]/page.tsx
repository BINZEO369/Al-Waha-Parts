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
  
  // Title generation (Year completely removed)
  const title = `${vehicle.manufacturer_name} ${vehicle.model_name}`.trim();
  const manufacturerLogo = vehicle.manufacturer_logo || brand.logo_url;
  const gallery = [vehicle.cover_image_url, ...(vehicle.vehicle_images ?? [])].filter(
    Boolean,
  ) as string[];
  const specs = [
    { label: 'Vehicle type', value: vehicle.vehicle_type },
    { label: 'Generation', value: vehicle.generation },
    { label: 'Chassis', value: vehicle.chassis_code },
    {
      label: 'Year range',
      value:
        vehicle.year_start && vehicle.year_end
          ? `${vehicle.year_start}–${vehicle.year_end}`
          : vehicle.year_start || vehicle.year_end,
    },
    { label: 'Engine code', value: vehicle.engine_code },
    { label: 'Engine capacity', value: vehicle.engine_capacity },
    { label: 'Fuel type', value: vehicle.fuel_type },
    { label: 'Transmission / gearbox', value: vehicle.transmission },
  ].filter(
    (spec): spec is { label: string; value: string | number } =>
      spec.value !== null && spec.value !== undefined && String(spec.value).trim() !== '',
  );

  return (
    <main className="vehicle-detail-wrapper">
      <style jsx>{`
        .vehicle-detail-wrapper {
          overflow-x: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
          background: #fafafa;
        }

        /* FULL BLEED HERO SECTION */
        .full-bleed-hero {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          height: 60vh; 
          min-height: 400px;
          background: #0a0a0a;
          overflow: hidden;
        }

        /* Blurred Background */
        .hero-bg-blur {
          position: absolute;
          inset: -20px;
          width: calc(100% + 40px);
          height: calc(100% + 40px);
          object-fit: cover;
          filter: blur(25px) brightness(0.3);
          z-index: 0;
          pointer-events: none;
        }

        /* Main Image */
        .hero-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 30%);
          z-index: 2;
        }

        .hero-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #666;
          background: #111;
          z-index: 1;
        }

        /* Floating Back Button (Tiny) */
        .glass-back-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 5px 10px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .glass-back-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Vehicle details card */
        .liquid-details-card {
          position: absolute;
          bottom: 12px;
          left: 12px;
          z-index: 5;
          padding: 16px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 14px;
          width: min(440px, calc(100vw - 24px));
          max-height: min(52vh, 390px);
          overflow-y: auto;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
        
        .liquid-details-card:hover {
          transform: translateY(-1px);
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .brand-header img {
          width: 22px;
          height: 22px;
          object-fit: contain;
          border-radius: 2px;
          padding: 1px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .brand-header strong {
          font-size: 11px;
          color: #222;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-weight: 800;
        }

        .vehicle-title {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: #000;
          line-height: 1.1;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 10px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.72);
        }
        .spec-label {
          font-size: 9px;
          color: #666;
          text-transform: uppercase;
          font-weight: 700;
        }
        .spec-value {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        /* Micro Liquid Button */
        .liquid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          padding: 9px 12px;
          border-radius: 7px;
          font-weight: 600;
          font-size: 12px;
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
          .full-bleed-hero {
            height: 50vh;
            min-height: 350px;
          }
          .glass-back-btn {
            top: 8px;
            left: 8px;
            padding: 4px 8px;
            font-size: 9px;
          }
          .liquid-details-card {
            bottom: 8px;
            left: 8px;
            width: min(440px, calc(100vw - 16px));
            max-height: 48vh;
            padding: 12px;
          }
          .vehicle-title { font-size: 18px; }
          .specs-grid { gap: 6px; }
          .spec-item { padding: 7px 8px; }
          .spec-label { font-size: 8px; }
          .spec-value { font-size: 11px; }
          .parts-section-wrapper {
            padding: 40px 16px;
          }
          .parts-section h2 { font-size: 22px; margin-bottom: 20px; }
        }
      `}</style>

      {/* Full-Width Hero Section */}
      <section className="full-bleed-hero">
        {gallery.length ? (
          <>
            <img className="hero-bg-blur" src={gallery[0]} alt="" aria-hidden="true" />
            <img className="hero-bg-image" src={gallery[0]} alt={title} />
            <div className="hero-overlay"></div>
          </>
        ) : (
          <div className="hero-placeholder">No Image Available</div>
        )}

        {/* Glass Back Button */}
        <Link className="glass-back-btn" href={`/brands/${encodeURIComponent(brand.slug)}`}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>

        {/* Vehicle details card with populated database specifications */}
        <div className="liquid-details-card">
          <div className="brand-header">
            {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
            <strong>{brand.manufacturer_name}</strong>
          </div>
          
          <h1 className="vehicle-title">{title}</h1>
          
          {specs.length > 0 && (
            <div className="specs-grid">
              {specs.map(({ label, value }) => (
                <div className="spec-item" key={label}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-value">{value}</span>
                </div>
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
