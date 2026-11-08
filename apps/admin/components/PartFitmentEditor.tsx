'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../lib/auth';

type Part = { id: string; part_name: string; sku: string; status?: string };
type Vehicle = { id: string; manufacturer_name: string; model_name: string; generation?: string | null; chassis_code?: string | null };
type Fitment = { model_id: string; compatible_years?: number[] | null; vehicles?: Vehicle | null } | null;

export function PartFitmentEditor() {
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [partId, setPartId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [yearsText, setYearsText] = useState('');
  const [fitment, setFitment] = useState<Fitment>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminFetch<Part[]>('/api/v1/admin/parts'),
      adminFetch<Vehicle[]>('/api/v1/admin/vehicles'),
    ])
      .then(([nextParts, nextVehicles]) => {
        setParts(nextParts.filter((part) => part.status !== 'inactive'));
        setVehicles(nextVehicles);
        if (nextParts[0]) setPartId(nextParts[0].id);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Fitment data could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!partId) return;
    setMessage('');
    adminFetch<Fitment>(`/api/v1/admin/parts/${partId}/fitment`)
      .then((data) => {
        setFitment(data);
        setVehicleId(data?.model_id ?? '');
        setYearsText((data?.compatible_years ?? []).join(', '));
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Fitment could not be loaded.'));
  }, [partId]);

  const selectedPart = parts.find((part) => part.id === partId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
  const vehicleOptions = useMemo(
    () => vehicles.map((vehicle) => ({ ...vehicle, label: `${vehicle.manufacturer_name} ${vehicle.model_name}${vehicle.generation ? ` · ${vehicle.generation}` : ''}` })),
    [vehicles],
  );

  async function save() {
    setError('');
    setMessage('');
    const years = [...new Set(yearsText.split(',').map((value) => Number(value.trim())).filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2200))].sort((a, b) => a - b);
    if (!partId || !vehicleId) { setError('Select exactly one vehicle model.'); return; }
    setSaving(true);
    try {
      const saved = await adminFetch<Fitment>(`/api/v1/admin/parts/${partId}/fitment`, {
        method: 'PUT',
        body: JSON.stringify({ model_id: vehicleId, compatible_years: years }),
      });
      setFitment(saved);
      setMessage(`Saved: ${selectedPart?.part_name ?? 'Part'} → ${selectedVehicle?.manufacturer_name} ${selectedVehicle?.model_name}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Fitment could not be saved.');
    } finally { setSaving(false); }
  }

  async function clear() {
    if (!partId || !window.confirm('Remove the vehicle fitment from this part?')) return;
    setSaving(true); setError(''); setMessage('');
    try {
      await adminFetch(`/api/v1/admin/parts/${partId}/fitment`, { method: 'DELETE' });
      setFitment(null); setVehicleId(''); setYearsText(''); setMessage('Fitment removed.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Fitment could not be removed.'); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="workspace-card admin-inline-loader" role="status"><span className="loading-spinner" /><div><strong>Loading fitment editor</strong><small>Preparing parts and vehicle models</small></div></section>;
  return (
    <section className="fitment-editor content-section" aria-labelledby="part-fitment-editor-title">
      <div className="section-title"><div><span className="eyebrow"><b>02B</b>One-model fitment</span><h2 id="part-fitment-editor-title">Assign compatible vehicle years</h2><p>Each part can use one model only, with one or more compatible years.</p></div></div>
      <div className="toolbar-card fitment-editor-card">
        <label className="form-field"><span>Part</span><select value={partId} onChange={(event) => setPartId(event.target.value)}><option value="">Choose a part…</option>{parts.map((part) => <option value={part.id} key={part.id}>{part.part_name} · {part.sku}</option>)}</select></label>
        <label className="form-field"><span>Vehicle model</span><select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}><option value="">Choose one model…</option>{vehicleOptions.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.label}</option>)}</select></label>
        <label className="form-field fitment-years-field"><span>Compatible years <small>(comma separated)</small></span><input value={yearsText} onChange={(event) => setYearsText(event.target.value)} placeholder="2018, 2019, 2020" inputMode="numeric" /></label>
        <div className="fitment-editor-actions"><button className="primary-button compact-button" type="button" disabled={saving || !partId || !vehicleId} onClick={() => void save()}>{saving ? 'Saving…' : 'Save fitment'}</button>{fitment && <button className="secondary-button compact-button" type="button" disabled={saving} onClick={() => void clear()}>Remove fitment</button>}</div>
      </div>
      {message && <div className="admin-success" role="status">{message}</div>}
      {error && <div className="admin-alert" role="alert">{error}</div>}
    </section>
  );
}
