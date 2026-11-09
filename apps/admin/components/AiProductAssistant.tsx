'use client';

import { FormEvent, useState } from 'react';
import { adminFetch } from '../lib/auth';

type Suggestion = {
  category_name: string | null;
  manufacturer_name: string | null;
  model_name: string | null;
  compatible_years: number[];
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  duplicate_risk: 'low' | 'medium' | 'high';
  confidence: number;
  notes: string[];
};

export function AiProductAssistant() {
  const [partName, setPartName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuggestion(null);
    try {
      const result = await adminFetch<{ run_id: string | null; suggestion: Suggestion }>(
        '/api/v1/admin/ai/suggest-product',
        {
          method: 'POST',
          body: JSON.stringify({
            part_name: partName,
            description,
            sku,
            brand_name: brandName,
            model_name: modelName,
            category_name: categoryName,
          }),
        },
      );
      setRunId(result.run_id);
      setSuggestion(result.suggestion);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to generate an AI preview.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="workspace-card" aria-labelledby="ai-product-assistant-title">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">AI preview / approval required</span>
          <h2 id="ai-product-assistant-title">Product catalog assistant</h2>
          <p>Generate suggestions for catalog fields. Nothing is saved automatically.</p>
        </div>
      </div>
      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Part name *</span>
          <input value={partName} onChange={(event) => setPartName(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>SKU</span>
          <input value={sku} onChange={(event) => setSku(event.target.value)} />
        </label>
        <label className="form-field">
          <span>Manufacturer</span>
          <input value={brandName} onChange={(event) => setBrandName(event.target.value)} />
        </label>
        <label className="form-field">
          <span>Model</span>
          <input value={modelName} onChange={(event) => setModelName(event.target.value)} />
        </label>
        <label className="form-field">
          <span>Category</span>
          <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
        </label>
        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Generating preview…' : 'Suggest metadata'}
        </button>
      </form>
      {error && <p className="admin-error">{error}</p>}
      {suggestion && (
        <div className="workspace-card ai-preview-card">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow">Preview only</span>
              <h3>Review before saving</h3>
            </div>
            <span className="status-pill">
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>
          <p>
            <strong>Category:</strong> {suggestion.category_name || 'No confident suggestion'}
          </p>
          <p>
            <strong>Manufacturer / model:</strong> {suggestion.manufacturer_name || '—'} /{' '}
            {suggestion.model_name || '—'}
          </p>
          <p>
            <strong>Compatible years:</strong>{' '}
            {suggestion.compatible_years.length
              ? suggestion.compatible_years.join(', ')
              : 'Not determined'}
          </p>
          <p>
            <strong>Duplicate risk:</strong> {suggestion.duplicate_risk}
          </p>
          <p>
            <strong>SEO title:</strong> {suggestion.seo_title || '—'}
          </p>
          <p>
            <strong>SEO description:</strong> {suggestion.seo_description || '—'}
          </p>
          {suggestion.notes.length > 0 && (
            <p>
              <strong>Notes:</strong> {suggestion.notes.join(' ')}
            </p>
          )}
          <small>
            {runId ? `Audit run: ${runId}` : 'Audit run recorded'}. Approval workflow will be added
            before any database write.
          </small>
        </div>
      )}
    </section>
  );
}
