'use client';
import styles from './VehiclesPage.module.css';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';

type Vehicle = {
  id: string;
  manufacturer_name: string;
  manufacturer_logo?: string | null;
  model_name: string;
  generation?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  cover_image_url?: string | null;
};

export function VehiclesPage() {
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
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load vehicles.'),
      )
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const manufacturers = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.manufacturer_name).filter(Boolean))],
    [vehicles],
  );
  const models = useMemo(
    () => [
      ...new Set(
        vehicles
          .filter((vehicle) => !manufacturer || vehicle.manufacturer_name === manufacturer)
          .map((vehicle) => vehicle.model_name)
          .filter(Boolean),
      ),
    ],
    [vehicles, manufacturer],
  );
  const years = useMemo(
    () =>
      [
        ...new Set(
          vehicles
            .filter(
              (vehicle) =>
                (!manufacturer || vehicle.manufacturer_name === manufacturer) &&
                (!model || vehicle.model_name === model),
            )
            .flatMap((vehicle) => {
              if (!vehicle.year_start) return [];
              const end = vehicle.year_end ?? vehicle.year_start;
              return Array.from(
                { length: Math.min(end - vehicle.year_start + 1, 50) },
                (_, index) => end - index,
              );
            }),
        ),
      ]
        .sort()
        .reverse(),
    [vehicles, manufacturer, model],
  );
  const selectedVehicle = vehicles.find(
    (vehicle) =>
      vehicle.manufacturer_name === manufacturer &&
      vehicle.model_name === model &&
      (!year || (vehicle.year_start ?? 0) <= Number(year)) &&
      (!year || (vehicle.year_end ?? Number(year)) >= Number(year)),
  );

  return (
    <main className={`${styles.root} page-shell`}>
      <section className="page-intro">
        <p className="eyebrow">Fitment finder / live database</p>
        <h1>Start with the vehicle.</h1>
        <p>
          Choose a real vehicle record from the database, then open the catalog with its compatible
          parts filter.
        </p>
      </section>
      <div className="finder-card">
        <div className="form-grid">
          <label>
            Manufacturer
            <select
              value={manufacturer}
              onChange={(event) => {
                setManufacturer(event.target.value);
                setModel('');
                setYear('');
              }}
            >
              <option value="">Select manufacturer</option>
              {manufacturers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model
            <select
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                setYear('');
              }}
              disabled={!manufacturer}
            >
              <option value="">Select model</option>
              {models.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Year
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              disabled={!model}
            >
              <option value="">Select year</option>
              {years.map((item) => (
                <option key={item} value={String(item)}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedVehicle?.cover_image_url && (
          <img
            className="finder-vehicle-image"
            src={selectedVehicle.cover_image_url}
            alt={`${selectedVehicle.manufacturer_name} ${selectedVehicle.model_name}`}
          />
        )}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && !vehicles.length && (
          <p className="empty-state">No vehicles are published in the database yet.</p>
        )}
        <button
          className="button"
          disabled={loading || !selectedVehicle}
          onClick={() => {
            if (selectedVehicle) window.location.href = `/catalog?vehicle_id=${selectedVehicle.id}`;
          }}
        >
          Show compatible parts <span>→</span>
        </button>
      </div>
    </main>
  );
}
