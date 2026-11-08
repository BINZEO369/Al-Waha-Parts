'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../lib/auth';

type Part = { id: string; part_name: string; sku: string; status?: string };
type Vehicle = {
  id: string;
  manufacturer_name: string;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
};
type Fitment = {
  id?: string;
  part_id?: string;
  model_id: string;
  compatible_years?: number[] | null;
  vehicles?: Vehicle | null;
};
type FitmentDraft = { model_id: string; yearsText: string };

const emptyDraft = (): FitmentDraft => ({ model_id: '', yearsText: '' });

function yearsToText(years?: number[] | null) {
  return (years ?? []).join(', ');
}

export function PartFitmentEditor() {
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [partId, setPartId] = useState('');
  const [drafts, setDrafts] = useState<FitmentDraft[]>([emptyDraft()]);
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
        if (nextParts.find((part) => part.status !== 'inactive'))
          setPartId(nextParts.find((part) => part.status !== 'inactive')!.id);
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Fitment data could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!partId) {
      setDrafts([emptyDraft()]);
      return;
    }
    let active = true;
    setMessage('');
    setError('');
    adminFetch<Fitment[]>(`/api/v1/admin/parts/${partId}/fitments`)
      .then((data) => {
        if (!active) return;
        const rows = (data ?? []).map((fitment) => ({
          model_id: fitment.model_id,
          yearsText: yearsToText(fitment.compatible_years),
        }));
        setDrafts(rows.length ? rows : [emptyDraft()]);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Fitment could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [partId]);

  const selectedPart = parts.find((part) => part.id === partId);
  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        label: `${vehicle.manufacturer_name} ${vehicle.model_name}${vehicle.generation ? ` · ${vehicle.generation}` : ''}`,
      })),
    [vehicles],
  );
  const selectedModelIds = new Set(drafts.map((draft) => draft.model_id).filter(Boolean));

  function updateDraft(index: number, key: keyof FitmentDraft, value: string) {
    setDrafts((current) =>
      current.map((draft, rowIndex) =>
        rowIndex === index ? { ...draft, [key]: value } : draft,
      ),
    );
  }

  async function save() {
    setError('');
    setMessage('');
    const chosen = drafts.filter((draft) => draft.model_id);
    if (drafts.some((draft) => !draft.model_id && draft.yearsText.trim())) {
      setError('Choose a model for every row that has compatible years.');
      return;
    }
    if (new Set(chosen.map((draft) => draft.model_id)).size !== chosen.length) {
      setError('Each vehicle model can only be added once.');
      return;
    }

    const fitments: Fitment[] = [];
    for (const draft of chosen) {
      const rawYears = draft.yearsText.split(',').map((value) => value.trim()).filter(Boolean);
      const years = rawYears.map(Number);
      if (years.some((year) => !Number.isInteger(year) || year < 1900 || year > 2200)) {
        setError('Enter compatible years as four-digit years between 1900 and 2200.');
        return;
      }
      fitments.push({
        model_id: draft.model_id,
        compatible_years: [...new Set(years)].sort((a, b) => a - b),
      });
    }

    setSaving(true);
    try {
      const saved = await adminFetch<Fitment[]>(`/api/v1/admin/parts/${partId}/fitments`, {
        method: 'PUT',
        body: JSON.stringify({ fitments }),
      });
      setDrafts(
        saved.length
          ? saved.map((fitment) => ({
              model_id: fitment.model_id,
              yearsText: yearsToText(fitment.compatible_years),
            }))
          : [emptyDraft()],
      );
      setMessage(
        saved.length
          ? `Saved ${saved.length} vehicle model${saved.length === 1 ? '' : 's'} for ${selectedPart?.part_name ?? 'this part'}.`
          : 'All vehicle fitments were removed from this part.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Fitments could not be saved.');
    } finally { setSaving(false); }
  }

  if (loading)
    return (
      <section className="workspace-card admin-inline-loader" role="status">
        <span className="loading-spinner" />
        <div><strong>Loading fitment editor</strong><small>Preparing parts and vehicle models</small></div>
      </section>
    );
  return (
    <section className="fitment-editor content-section" aria-labelledby="part-fitment-editor-title">
      <div className="section-title">
        <div>
          <span className="eyebrow"><b>02B</b>Multi-model fitment</span>
          <h2 id="part-fitment-editor-title">Assign compatible vehicle models and years</h2>
          <p>A part can appear on multiple model pages; set compatible years separately for each model.</p>
        </div>
      </div>
      <div className="toolbar-card fitment-editor-card">
        <label className="form-field">
          <span>Part</span>
          <select value={partId} onChange={(event) => setPartId(event.target.value)}>
            <option value="">Choose a part…</option>
            {parts.map((part) => <option value={part.id} key={part.id}>{part.part_name} · {part.sku}</option>)}
          </select>
        </label>
        <div className="fitment-model-list">
          {drafts.map((draft, index) => (
            <div className="fitment-model-row" key={`${draft.model_id || 'new'}-${index}`}>
              <label className="form-field">
                <span>Vehicle model {index + 1}</span>
                <select
                  value={draft.model_id}
                  onChange={(event) => updateDraft(index, 'model_id', event.target.value)}
                >
                  <option value="">Choose a model…</option>
                  {vehicleOptions
                    .filter((vehicle) => vehicle.id === draft.model_id || !selectedModelIds.has(vehicle.id))
                    .map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.label}</option>)}
                </select>
              </label>
              <label className="form-field fitment-years-field">
                <span>Compatible years <small>(comma separated; blank = all years)</small></span>
                <input
                  value={draft.yearsText}
                  onChange={(event) => updateDraft(index, 'yearsText', event.target.value)}
                  placeholder="2018, 2019, 2020"
                  inputMode="numeric"
                />
              </label>
              <button
                className="secondary-button compact-button fitment-remove-button"
                type="button"
                disabled={saving}
                onClick={() => setDrafts((current) => current.filter((_, rowIndex) => rowIndex !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="secondary-button compact-button fitment-add-button"
            type="button"
            disabled={saving || !partId || selectedModelIds.size >= vehicles.length}
            onClick={() => setDrafts((current) => [...current, emptyDraft()])}
          >
            Add another model
          </button>
        </div>
        <div className="fitment-editor-actions">
          <button className="primary-button compact-button" type="button" disabled={saving || !partId} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save fitments'}
          </button>
        </div>
      </div>
      {message && <div className="admin-success" role="status">{message}</div>}
      {error && <div className="admin-alert" role="alert">{error}</div>}
    </section>
  );
}
