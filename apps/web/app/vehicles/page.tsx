'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../packages/shared/src/api';

type Vehicle = {
  id: string;
  slug?: string | null;
  car_brand_id?: string | null;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  engine_code?: string | null;
  engine_capacity?: number | string | null;
  fuel_type?: string | null;
  transmission?: string | null;
  vehicle_type?: string | null;
  cover_image_url?: string | null;
};

type VehicleBrand = {
  id: string;
  manufacturer_name: string;
  slug: string;
  logo_url: string;
};

type CompatiblePartRef = { id: string };

const currentYear = new Date().getFullYear();

function vehicleYearRange(vehicle: Vehicle) {
  if (!vehicle.year_start) return 'Model year not provided';
  return `${vehicle.year_start}–${vehicle.year_end ?? 'present'}`;
}

function fitmentLabel(vehicle: Vehicle) {
  const details = [
    vehicle.generation,
    vehicle.chassis_code ? `Chassis ${vehicle.chassis_code}` : null,
    vehicle.engine_code ? `Engine ${vehicle.engine_code}` : null,
  ].filter(Boolean).join(' · ');
  return `${details || 'Standard fitment'} · ${vehicleYearRange(vehicle)}`;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fitmentId, setFitmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compatiblePartCount, setCompatiblePartCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError('Vehicle API is not configured. Add NEXT_PUBLIC_API_URL to the Web project.');
      setLoading(false);
      return;
    }
    const loadAllVehicles = async () => {
      const allVehicles: Vehicle[] = [];
      for (let offset = 0; ; offset += 200) {
        const page = await apiFetch<Vehicle[]>(apiUrl, `/api/v1/vehicles?limit=200&offset=${offset}`);
        allVehicles.push(...page);
        if (page.length < 200) return allVehicles;
      }
    };
    Promise.all([
      loadAllVehicles(),
      apiFetch<VehicleBrand[]>(apiUrl, '/api/v1/car-brands?limit=200'),
    ])
      .then(([allVehicles, nextBrands]) => {
        setVehicles(allVehicles);
        setBrands(nextBrands);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load vehicles.'))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const manufacturers = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.manufacturer_name).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [vehicles],
  );
  const models = useMemo(
    () => [...new Set(vehicles
      .filter((vehicle) => !manufacturer || vehicle.manufacturer_name === manufacturer)
      .map((vehicle) => vehicle.model_name)
      .filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [vehicles, manufacturer],
  );
  const modelVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.manufacturer_name === manufacturer && vehicle.model_name === model),
    [vehicles, manufacturer, model],
  );
  const years = useMemo(() => {
    const available = new Set<number>();
    for (const vehicle of modelVehicles) {
      if (!vehicle.year_start) continue;
      const end = vehicle.year_end ?? currentYear;
      for (let value = vehicle.year_start; value <= end; value += 1) available.add(value);
    }
    return [...available].sort((a, b) => b - a);
  }, [modelVehicles]);
  const fitmentCandidates = useMemo(
    () => modelVehicles.filter((vehicle) => {
      if (!year) return true;
      const end = vehicle.year_end ?? currentYear;
      return !!vehicle.year_start && vehicle.year_start <= Number(year) && end >= Number(year);
    }),
    [modelVehicles, year],
  );
  const selectedVehicle = fitmentCandidates.length === 1
    ? fitmentCandidates[0]
    : fitmentCandidates.find((vehicle) => vehicle.id === fitmentId) ?? null;
  const selectedVehicleId = selectedVehicle?.id ?? '';

  useEffect(() => {
    let active = true;
    setCompatiblePartCount(null);
    if (!apiUrl || !selectedVehicleId) {
      setCountLoading(false);
      return () => { active = false; };
    }
    setCountLoading(true);
    const yearParam = year ? `&year=${encodeURIComponent(year)}` : '';
    apiFetch<CompatiblePartRef[]>(apiUrl, `/api/v1/parts?limit=200&vehicle_id=${encodeURIComponent(selectedVehicleId)}${yearParam}`)
      .then((parts) => { if (active) setCompatiblePartCount(parts.length); })
      .catch(() => { if (active) setCompatiblePartCount(null); })
      .finally(() => { if (active) setCountLoading(false); });
    return () => { active = false; };
  }, [apiUrl, selectedVehicleId, year]);

  const selectManufacturer = (value: string) => {
    setManufacturer(value);
    setModel('');
    setYear('');
    setFitmentId('');
  };
  const selectModel = (value: string) => {
    setModel(value);
    setYear('');
    setFitmentId('');
  };
  const selectYear = (value: string) => {
    setYear(value);
    setFitmentId('');
  };

  return (
    <main className="page-shell vehicle-finder-page">
      <section className="page-intro">
        <p className="eyebrow">Vehicle fitment / live database</p>
        <h1>Find parts that fit your vehicle.</h1>
        <p>Select the make, model and year. Generation, chassis and engine details help distinguish exact fitments before opening compatible parts.</p>
      </section>

      <section className="finder-card" aria-label="Vehicle fitment search">
        <div className="vehicle-finder-steps" aria-label="Search steps">
          <span><b>01</b> Manufacturer</span>
          <span><b>02</b> Model</span>
          <span><b>03</b> Year &amp; fitment</span>
        </div>

        <div className="vehicle-brand-selector" aria-label="Choose a vehicle manufacturer">
          <div className="vehicle-brand-selector-heading">
            <strong>Choose a make</strong>
            <span>Brand names and original logo PNGs load from the database</span>
          </div>
          <div className="vehicle-brand-grid">
            {brands.map((brand) => (
              <button
                type="button"
                className={manufacturer === brand.manufacturer_name ? 'vehicle-brand-option active' : 'vehicle-brand-option'}
                key={brand.id}
                onClick={() => selectManufacturer(brand.manufacturer_name)}
                aria-pressed={manufacturer === brand.manufacturer_name}
              >
                <span className="vehicle-brand-logo-frame">
                  <img src={brand.logo_url} alt={`${brand.manufacturer_name} logo`} loading="lazy" />
                </span>
                <span>{brand.manufacturer_name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid vehicle-finder-fields">
          <label>
            Model
            <select value={model} onChange={(event) => selectModel(event.target.value)} disabled={!manufacturer || loading}>
              <option value="">Select model</option>
              {models.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Model year
            <select value={year} onChange={(event) => selectYear(event.target.value)} disabled={!model || loading}>
              <option value="">Any supported year</option>
              {years.map((item) => <option key={item} value={String(item)}>{item}</option>)}
            </select>
          </label>
          {fitmentCandidates.length > 1 && (
            <label>
              Generation / chassis / engine
              <select value={fitmentId} onChange={(event) => setFitmentId(event.target.value)}>
                <option value="">Select exact fitment</option>
                {fitmentCandidates.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{fitmentLabel(vehicle)}</option>)}
              </select>
            </label>
          )}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {loading && <p className="finder-loading">Loading manufacturers, models and fitment years…</p>}
        {!loading && !error && (!vehicles.length || !manufacturers.length) && <p className="empty-state">No vehicles are published in the database yet.</p>}
        {!loading && model && !years.length && <p className="finder-hint">Model-year data has not been added for this model yet. You can still search by make and model; the parts desk can verify a specific year.</p>}
        {!loading && model && !fitmentCandidates.length && <p className="form-error">No database fitment matches that model year. Try another year or ask our parts desk to verify it.</p>}
        {!loading && fitmentCandidates.length > 1 && !selectedVehicle && <p className="finder-hint">More than one generation matches. Select the generation or chassis code for accurate parts results.</p>}

        {selectedVehicle && (
          <article className="finder-selected-vehicle">
            <div className="finder-selected-photo">
              {selectedVehicle.cover_image_url
                ? <img src={selectedVehicle.cover_image_url} alt={`${selectedVehicle.manufacturer_name} ${selectedVehicle.model_name}`} />
                : <div className="finder-photo-placeholder">{selectedVehicle.vehicle_type || 'Vehicle'}</div>}
            </div>
            <div className="finder-selected-details">
              <div className="finder-brand-row">
                {selectedVehicle.manufacturer_logo
                  ? <img className="finder-brand-logo" src={selectedVehicle.manufacturer_logo} alt={`${selectedVehicle.manufacturer_name} logo`} />
                  : <span className="finder-brand-fallback" aria-hidden="true">{selectedVehicle.manufacturer_name.slice(0, 1)}</span>}
                <span className="finder-brand-label">Database vehicle fitment</span>
              </div>
              <h2>{selectedVehicle.manufacturer_name} {selectedVehicle.model_name}</h2>
              <div className="finder-vehicle-specs">
                <div><small>Selected year</small><strong>{year || vehicleYearRange(selectedVehicle)}</strong></div>
                <div><small>Generation</small><strong>{selectedVehicle.generation || '—'}</strong></div>
                <div><small>Chassis</small><strong>{selectedVehicle.chassis_code || '—'}</strong></div>
                <div><small>Engine</small><strong>{selectedVehicle.engine_code || (selectedVehicle.engine_capacity ? `${selectedVehicle.engine_capacity} L` : '—')}</strong></div>
                <div><small>Fuel / transmission</small><strong>{[selectedVehicle.fuel_type, selectedVehicle.transmission].filter(Boolean).join(' · ') || '—'}</strong></div>
              </div>
              <p className="finder-compatible-count" aria-live="polite">
                {countLoading
                  ? 'Checking compatible parts…'
                  : compatiblePartCount === null
                    ? 'Parts will be filtered by this vehicle fitment.'
                    : compatiblePartCount >= 200
                      ? '200+ compatible parts found'
                      : `${compatiblePartCount} compatible ${compatiblePartCount === 1 ? 'part' : 'parts'} found`}
              </p>
            </div>
          </article>
        )}

        <div className="finder-actions">
          <button
            className="button"
            disabled={loading || !selectedVehicle}
            onClick={() => {
              if (!selectedVehicle) return;
              const make = encodeURIComponent(selectedVehicle.manufacturer_name);
              const modelName = encodeURIComponent(selectedVehicle.model_name);
              const yearParam = year ? `&year=${encodeURIComponent(year)}` : '';
              window.location.href = `/catalog?vehicle_id=${encodeURIComponent(selectedVehicle.id)}&make=${make}&model=${modelName}${yearParam}`;
            }}
          >
            View compatible parts <span>→</span>
          </button>
          {selectedVehicle && <span>Results match this vehicle and selected model year against saved database fitments.</span>}
        </div>
      </section>
    </main>
  );
}
