'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../packages/shared/src/api';

type Vehicle = {
  id: string;
  manufacturer_name: string;
  model_name: string;
  model_year?: number | null;
  year?: number | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError('Vehicle API is not configured. Add NEXT_PUBLIC_API_URL to the Web project.');
      setLoading(false);
      return;
    }
    apiFetch<Vehicle[]>(apiUrl, '/api/v1/vehicles?limit=100')
      .then(setVehicles)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load vehicles.'))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const manufacturers = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.manufacturer_name).filter(Boolean))],
    [vehicles],
  );
  const models = useMemo(
    () => [...new Set(vehicles.filter((vehicle) => !manufacturer || vehicle.manufacturer_name === manufacturer).map((vehicle) => vehicle.model_name).filter(Boolean))],
    [vehicles, manufacturer],
  );
  const years = useMemo(
    () => [...new Set(vehicles.filter((vehicle) => (!manufacturer || vehicle.manufacturer_name === manufacturer) && (!model || vehicle.model_name === model)).map((vehicle) => vehicle.model_year ?? vehicle.year).filter(Boolean))].sort().reverse(),
    [vehicles, manufacturer, model],
  );

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">Fitment finder</p>
        <h1>Start with the vehicle.</h1>
        <p>
          Vehicle lookup is connected to the live catalog API. Select your make, model and year to
          narrow the right parts.
        </p>
      </section>
      <div className="finder-card">
        <div className="form-grid">
          <label>
            Manufacturer
            <select value={manufacturer} onChange={(event) => { setManufacturer(event.target.value); setModel(''); setYear(''); }}>
              <option value="">Select manufacturer</option>
              {manufacturers.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Model
            <select value={model} onChange={(event) => { setModel(event.target.value); setYear(''); }} disabled={!manufacturer}>
              <option value="">Select model</option>
              {models.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Year
            <select value={year} onChange={(event) => setYear(event.target.value)} disabled={!model}>
              <option value="">Select year</option>
              {years.map((item) => <option key={item} value={String(item)}>{item}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && !vehicles.length && <p className="empty-state">No vehicles are published in the database yet.</p>}
        <button className="button" disabled={loading || !manufacturer}>
          Show compatible parts <span>→</span>
        </button>
      </div>
    </main>
  );
}
