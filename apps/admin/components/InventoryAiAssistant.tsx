'use client';

import { useState } from 'react';
import { adminFetch } from '../lib/auth';

type Lookup = {
  id: string;
  manufacturer_name?: string;
  model_name?: string;
  category_name?: string;
};

type Props = {
  values: Record<string, unknown>;
  manufacturers: Lookup[];
  models: Lookup[];
  categories: Lookup[];
  onApply: (key: string, value: string) => void;
};

type Suggestions = Record<string, string>;

const labels: Record<string, string> = {
  part_name: 'Part name',
  brand_name: 'Brand',
  oem_number: 'OEM number',
  description: 'Description',
};

export function InventoryAiAssistant({ values, manufacturers, models, categories, onApply }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const manufacturer = manufacturers.find((item) => item.id === values.manufacturer_id);
  const model = models.find((item) => item.id === values.model_id);
  const category = categories.find((item) => item.id === values.category_id);

  async function suggest() {
    setLoading(true);
    setError('');
    try {
      const result = await adminFetch<{ suggestions: Suggestions }>('/api/v1/admin/parts/suggest', {
        method: 'POST',
        body: JSON.stringify({
          part_name: values.part_name,
          sku: values.sku,
          manufacturer_name: manufacturer?.manufacturer_name,
          model_name: model?.model_name,
          category_name: category?.category_name,
          oem_number: values.oem_number,
        }),
      });
      setSuggestions(result.suggestions ?? {});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'AI suggestions are unavailable.');
    } finally {
      setLoading(false);
    }
  }

  const entries = Object.entries(suggestions);
  return (
    <section className="inventory-ai-panel full-width" aria-labelledby="inventory-ai-title">
      <div className="inventory-ai-heading">
        <div>
          <span className="eyebrow"><b>AI</b>Review before apply</span>
          <h4 id="inventory-ai-title">Product assistant</h4>
          <p>Generate catalog copy from the selected manufacturer, model, category, and OEM context. Nothing is saved until you approve it.</p>
        </div>
        <button className="secondary-button ai-suggest-button" type="button" onClick={() => void suggest()} disabled={loading}>
          {loading ? 'Thinking…' : 'Suggest fields'}
        </button>
      </div>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      {entries.length > 0 && (
        <div className="ai-suggestion-list">
          {entries.map(([key, value]) => (
            <div className="ai-suggestion" key={key}>
              <div><small>{labels[key] ?? key}</small><span>{value}</span></div>
              <button className="text-button" type="button" onClick={() => onApply(key, value)}>Apply</button>
            </div>
          ))}
          <button className="primary-button compact-button" type="button" onClick={() => entries.forEach(([key, value]) => onApply(key, value))}>
            Apply all suggestions
          </button>
        </div>
      )}
    </section>
  );
}
