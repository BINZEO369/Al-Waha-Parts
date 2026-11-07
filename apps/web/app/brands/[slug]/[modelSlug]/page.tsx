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
  
  const [isCardOpen, setIsCardOpen] = useState(true);
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

  // Auto-hide the card after 5 seconds
  useEffect(() => {
    if (detail) {
      const timer = setTimeout(() => {
        setIsCardOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [detail]);

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
    { label: 'Transmission', value: vehicle.transmission },
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

        /* DYNAMIC FULL BLEED HERO SECTION - GAP REMOVED */
        .full-bleed-hero {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          background: #f0f0f0;
          overflow: hidden; 
          /* min-height এবং flex প্রোপার্টি সরিয়ে দেওয়া হয়েছে যাতে হেডারের নিচে কোনো গ্যাপ না থাকে */
        }

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
          background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%);
          z-index: 2;
          pointer-events: none;
        }

        .hero-placeholder {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #666;
          background: #111;
        }

        /* "i" INFO TOGGLE BUTTON */
        .info-toggle-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; 
          height: 32px; 
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 0 8px rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .info-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.1);
        }
        .info-toggle-btn svg {
          width: 16px; 
          height: 16px; 
        }

        /* FULL-WIDTH GLASS BOTTOM SHEET CARD */
        .liquid-details-card {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 16px 24px; 
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          transform: translateY(0);
        }

        .liquid-details-card.hidden {
          transform: translateY(105%); 
        }

        .card-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px; 
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .brand-header img {
          width: 22px; 
          height: 22px;
          object-fit: contain;
          border-radius: 4px;
          padding: 2px;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .brand-header strong {
          font-size: 11px; 
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 800;
        }

        .vehicle-title {
          font-size: 20px; 
          font-weight: 800;
          margin: 0;
          color: #000;
          line-height: 1.15;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 8px 12px; 
          padding-top: 10px; 
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .spec-label {
          font-size: 9px; 
          color: #666;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .spec-value {
          font-size: 12px; 
          font-weight: 700;
          color: #111;
          line-height: 1.2;
        }

        .liquid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          padding: 10px 18px; 
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px; 
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          white-space: nowrap;
        }
        .liquid-btn:hover {
          background: #333;
          transform: translateY(-1px);
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
          .info-toggle-btn {
            top: 12px;
            right: 12px;
            width: 28px; 
            height: 28px;
          }
          .info-toggle-btn svg {
            width: 14px; 
            height: 14px;
          }
          .liquid-details-card {
            padding: 12px 16px; 
            border-radius: 16px 16px 0 0;
          }
          .card-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .vehicle-title { font-size: 18px; }
          .specs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 10px;
            padding-top: 8px;
          }
          .liquid-btn {
            width: 100%;
            padding: 8px 12px;
            font-size: 11px;
          }
          .parts-section-wrapper {
            padding: 40px 16px;
          }
          .parts-section h2 { font-size: 22px; margin-bottom: 20px; }
        }
      `}</style>

      <section className="full-bleed-hero">
        {gallery.length ? (
          <>
            <img className="hero-bg-image" src={gallery[0]} alt={title} />
            <div className="hero-overlay"></div>
          </>
        ) : (
          <div className="hero-placeholder">No Image Available</div>
        )}

        <button 
          className="info-toggle-btn" 
          onClick={() => setIsCardOpen(!isCardOpen)}
          aria-label="Toggle Vehicle Details"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>

        <div className={`liquid-details-card ${isCardOpen ? '' : 'hidden'}`}>
          <div className="card-content-wrapper">
            
            <div className="card-header-row">
              <div>
                <div className="brand-header">
                  {manufacturerLogo && <img src={manufacturerLogo} alt={`${brand.manufacturer_name} logo`} />}
                  <strong>{brand.manufacturer_name}</strong>
                </div>
                <h1 className="vehicle-title">{title}</h1>
              </div>
              
              <Link className="liquid-btn" href={`/category?vehicle_id=${encodeURIComponent(vehicle.id)}`}>
                Browse Parts
              </Link>
            </div>
            
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

          </div>
        </div>
      </section>

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
