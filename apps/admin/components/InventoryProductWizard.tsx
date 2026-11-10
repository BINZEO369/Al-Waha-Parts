'use client';

import { FormEvent, useEffect, useState } from 'react';
import { adminFetch } from '../lib/auth';
import { ImageKitUploadField } from './ImageKitUploadField';

type Manufacturer = { id: string; manufacturer_name: string; logo_url?: string | null };
type Model = {
  id: string;
  manufacturer_id: string;
  model_name: string;
  generation?: string | null;
  year_start?: number | null;
  year_end?: number | null;
};
type Category = { id: string; category_name: string; slug?: string | null };
type Lookups = { manufacturers: Manufacturer[]; models: Model[]; categories: Category[] };
type ProductRecord = Record<string, unknown> & { id: string };
type FitmentDraft = { manufacturer_id: string; model_id: string; year: string };
type ProductSuggestion = {
  product_title: string | null;
  brand_name: string | null;
  description: string | null;
  part_number: string | null;
  oem_numbers: string[];
  category_name: string | null;
  manufacturer_name: string | null;
  condition: string | null;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  duplicate_risk: 'low' | 'medium' | 'high';
  confidence: number;
  notes: string[];
};
type AiResponse = { run_id: string | null; suggestion: ProductSuggestion; requires_approval: boolean };
type ProductDraft = {
  part_name: string;
  slug: string;
  category_id: string;
  manufacturer_id: string;
  brand_name: string;
  sku: string;
  part_number: string;
  oem_number: string;
  description: string;
  condition: string;
  tested_status: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  position: string;
  status: string;
  primary_image_url: string;
  image_urls: string;
  tags: string;
  is_featured: boolean;
  sort_order: string;
  warranty_months: string;
  min_order_quantity: string;
  reorder_level: string;
  storage_location: string;
  currency: string;
  seo_title: string;
  seo_description: string;
};

const EMPTY_LOOKUPS: Lookups = { manufacturers: [], models: [], categories: [] };
const NO_MANUFACTURER = '__none__';
const STEPS = ['Product image', 'Vehicle fitment', 'Price & warranty', 'AI review'];
const slugify = (value: string) => value.trim().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const parseList = (value: string) => [...new Set(value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean))];
const parseImageList = (value: string) => {
  if (!value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    // Accept manual newline/comma separated gallery URLs too.
  }
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
};
const blankDraft = (): ProductDraft => ({
  part_name: '', slug: '', category_id: '', manufacturer_id: '', brand_name: '', sku: '',
  part_number: '', oem_number: '', description: '', condition: '', tested_status: 'not_tested',
  price: '', sale_price: '', stock_quantity: '', position: '0', status: 'active',
  primary_image_url: '', image_urls: '', tags: '', is_featured: false, sort_order: '0',
  warranty_months: '', min_order_quantity: '1', reorder_level: '0', storage_location: '',
  currency: 'SAR', seo_title: '', seo_description: '',
});

function skuToken() {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `AWP-${new Date().getFullYear()}-${suffix}`;
}

function modelYears(model: Model | undefined) {
  const current = new Date().getFullYear();
  const dbStart = Number(model?.year_start);
  const dbEnd = Number(model?.year_end);
  const start = Number.isInteger(dbStart) && dbStart >= 1900 ? dbStart
    : Number.isInteger(dbEnd) && dbEnd >= 1900 ? Math.max(1900, dbEnd - 35) : Math.max(1980, current - 35);
  const end = Number.isInteger(dbEnd) && dbEnd >= 1900 ? dbEnd : current;
  const first = Math.min(start, end);
  const last = Math.max(start, end);
  return Array.from({ length: Math.min(last - first + 1, 121) }, (_, index) => first + index)
    .filter((year) => year >= 1900 && year <= 2200);
}

function validatePublicImage(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function InventoryProductWizard({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [lookups, setLookups] = useState<Lookups>(EMPTY_LOOKUPS);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState('');
  const [fitments, setFitments] = useState<FitmentDraft[]>([{ manufacturer_id: '', model_id: '', year: '' }]);
  const [draft, setDraft] = useState<ProductDraft>(blankDraft);
  const [aiResult, setAiResult] = useState<AiResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPartId, setSavedPartId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLookupsLoading(true);
    setLookupsError('');
    adminFetch<Lookups>('/api/v1/admin/lookups')
      .then((data) => { if (alive) setLookups(data); })
      .catch((cause: unknown) => {
        if (alive) setLookupsError(cause instanceof Error ? cause.message : 'Could not load live vehicle and category choices.');
      })
      .finally(() => { if (alive) setLookupsLoading(false); });
    return () => { alive = false; };
  }, []);

  const setField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  function updateFitment(index: number, key: keyof FitmentDraft, value: string) {
    setFitments((current) => current.map((item, currentIndex) => {
      if (currentIndex !== index) return item;
      if (key === 'manufacturer_id') return { manufacturer_id: value, model_id: '', year: '' };
      if (key === 'model_id') return { ...item, model_id: value, year: '' };
      return { ...item, [key]: value };
    }));
  }

  function validateFitments() {
    if (!fitments.length) return 'Select at least one vehicle company, model and year.';
    const seen = new Set<string>();
    for (const [index, item] of fitments.entries()) {
      if (!item.manufacturer_id) return `Choose a vehicle company for fitment ${index + 1}.`;
      if (!item.model_id) return `Choose a model for fitment ${index + 1}.`;
      const model = lookups.models.find((option) => option.id === item.model_id);
      if (!model || model.manufacturer_id !== item.manufacturer_id)
        return `Choose a model belonging to the selected company for fitment ${index + 1}.`;
      const year = Number(item.year);
      if (!item.year || !Number.isInteger(year) || !modelYears(model).includes(year))
        return `Select a valid model year for fitment ${index + 1}.`;
      const key = `${item.model_id}:${year}`;
      if (seen.has(key)) return `Fitment ${index + 1} repeats a model year already selected.`;
      seen.add(key);
    }
    return '';
  }

  function addFitment() {
    const issue = validateFitments();
    if (issue) { setError(issue); return; }
    setError('');
    setFitments((current) => [...current, { manufacturer_id: '', model_id: '', year: '' }]);
  }

  function validateCommercial() {
    const price = Number(draft.price);
    const stock = Number(draft.stock_quantity);
    const warranty = Number(draft.warranty_months);
    if (!draft.price.trim() || !Number.isFinite(price) || price < 0) return 'Enter a valid price in SAR.';
    if (!draft.stock_quantity.trim() || !Number.isInteger(stock) || stock < 0) return 'Enter a whole-number quantity of 0 or more.';
    if (!draft.warranty_months.trim() || !Number.isInteger(warranty) || warranty < 0) return 'Enter warranty months; enter 0 if there is no warranty.';
    return '';
  }

  function continueToFitment(skipTitle: boolean) {
    setError('');
    if (!validatePublicImage(draft.primary_image_url)) {
      setError('Add an HTTPS public image URL or upload the product image before continuing.');
      return;
    }
    if (!skipTitle && !draft.part_name.trim()) {
      setError('Enter a product title or choose “Skip title — let AI generate it”.');
      return;
    }
    if (skipTitle) setField('part_name', '');
    setStep(1);
  }

  function updatePrimaryImage(value: string) {
    setDraft((current) => {
      const previousImage = current.primary_image_url.trim();
      const nextImage = value.trim();
      const currentGallery = parseImageList(current.image_urls);
      const nextGallery = previousImage && currentGallery.includes(previousImage)
        ? currentGallery.map((url) => url === previousImage ? nextImage : url)
        : nextImage && !currentGallery.includes(nextImage)
          ? [nextImage, ...currentGallery]
          : currentGallery;
      return {
        ...current,
        primary_image_url: value,
        image_urls: JSON.stringify([...new Set(nextGallery.filter(Boolean))]),
      };
    });
    if (aiResult) {
      setAiResult(null);
      setAiError('The image changed. Generate a new AI preview before adding this product.');
    }
  }

  function continueToCommercial() {
    const issue = validateFitments();
    if (issue) { setError(issue); return; }
    setError('');
    setStep(2);
  }

  function continueToReview() {
    const issue = validateCommercial();
    if (issue) { setError(issue); return; }
    setError('');
    setStep(3);
  }

  async function generatePreview() {
    setAiError('');
    setError('');
    const fitmentIssue = validateFitments();
    const commercialIssue = validateCommercial();
    if (!validatePublicImage(draft.primary_image_url)) {
      setAiError('Add a valid HTTPS image before asking AI to analyze this part.');
      return;
    }
    if (fitmentIssue || commercialIssue) {
      setAiError(fitmentIssue || commercialIssue);
      return;
    }
    setAiLoading(true);
    try {
      const result = await adminFetch<AiResponse>('/api/v1/admin/ai/suggest-product', {
        method: 'POST',
        body: JSON.stringify({
          part_name: draft.part_name.trim(),
          image_url: draft.primary_image_url.trim(),
          description: '',
          model_name: '',
          category_name: '',
          brand_name: '',
        }),
      });
      const suggestion = result.suggestion;
      const title = draft.part_name.trim() || suggestion.product_title?.trim() || '';
      const generatedSku = draft.sku || skuToken();
      const suffix = generatedSku.split('-').at(-1)?.toLowerCase() || 'part';
      setDraft((current) => ({
        ...current,
        part_name: current.part_name.trim() || title,
        slug: current.slug.trim() || (title ? `${slugify(title)}-${suffix}` : ''),
        category_id: current.category_id,
        manufacturer_id: current.manufacturer_id,
        brand_name: current.brand_name || suggestion.brand_name || '',
        sku: generatedSku,
        part_number: current.part_number || suggestion.part_number || '',
        oem_number: current.oem_number || suggestion.oem_numbers.join(', '),
        description: current.description || suggestion.description || '',
        condition: current.condition,
        tested_status: current.tested_status || 'not_tested',
        price: current.price,
        sale_price: current.sale_price,
        stock_quantity: current.stock_quantity,
        position: current.position || '0',
        status: current.status || 'active',
        primary_image_url: current.primary_image_url,
        image_urls: current.image_urls || JSON.stringify([current.primary_image_url.trim()]),
        tags: current.tags || suggestion.keywords.join(', '),
        is_featured: current.is_featured,
        sort_order: current.sort_order || '0',
        warranty_months: current.warranty_months,
        min_order_quantity: current.min_order_quantity || '1',
        reorder_level: current.reorder_level || '0',
        storage_location: current.storage_location,
        currency: current.currency || 'SAR',
        seo_title: current.seo_title || suggestion.seo_title || '',
        seo_description: current.seo_description || suggestion.seo_description || '',
      }));
      setAiResult(result);
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : 'AI could not analyze this image. Please retry.');
    } finally {
      setAiLoading(false);
    }
  }

  function buildFitmentPayload() {
    const grouped = new Map<string, number[]>();
    for (const item of fitments) {
      const year = Number(item.year);
      const current = grouped.get(item.model_id) ?? [];
      if (!current.includes(year)) current.push(year);
      grouped.set(item.model_id, current);
    }
    return [...grouped.entries()].map(([model_id, compatible_years]) => ({
      model_id,
      compatible_years: compatible_years.sort((a, b) => a - b),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!aiResult) { setError('Generate and review the AI preview before adding this product.'); return; }
    const fitmentIssue = validateFitments();
    if (fitmentIssue) { setError(fitmentIssue); setStep(1); return; }
    const commercialIssue = validateCommercial();
    if (commercialIssue) { setError(commercialIssue); setStep(2); return; }
    if (!validatePublicImage(draft.primary_image_url)) { setError('A valid HTTPS product image is required.'); setStep(0); return; }
    if (!draft.part_name.trim() || !draft.slug.trim() || !draft.sku.trim()) { setError('Product title, URL slug and inventory SKU are required.'); return; }
    if (!draft.category_id) { setError('Select a live product category before adding this part.'); return; }
    if (!draft.manufacturer_id) { setError('Select a product manufacturer or explicitly choose “No identifiable manufacturer”.'); return; }
    if (!draft.condition) { setError('Select the product condition before adding this part.'); return; }
    const price = Number(draft.price);
    const stock = Number(draft.stock_quantity);
    const warranty = Number(draft.warranty_months);
    const salePrice = draft.sale_price.trim() ? Number(draft.sale_price) : null;
    const position = Number(draft.position || 0);
    const sortOrder = Number(draft.sort_order || 0);
    const minOrderQuantity = Number(draft.min_order_quantity || 1);
    const reorderLevel = Number(draft.reorder_level || 0);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(warranty) || warranty < 0) {
      setError('Check price, whole-number quantity and warranty month values.'); return;
    }
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > price)) {
      setError('Sale price must be 0 or more and cannot exceed the regular price.'); return;
    }
    if ([position, sortOrder, minOrderQuantity, reorderLevel].some((value) => !Number.isInteger(value) || value < 0) || minOrderQuantity < 1) {
      setError('Display/order quantities must be valid whole numbers (minimum order quantity is at least 1).'); return;
    }
    const fitmentPayload = buildFitmentPayload();
    const firstFitment = fitmentPayload[0];
    const manufacturerId = draft.manufacturer_id === NO_MANUFACTURER ? null : draft.manufacturer_id;
    const payload: Record<string, unknown> = {
      part_name: draft.part_name.trim(),
      slug: draft.slug.trim(),
      sku: draft.sku.trim(),
      category_id: draft.category_id,
      manufacturer_id: manufacturerId,
      brand_name: draft.brand_name.trim() || null,
      part_number: draft.part_number.trim() || null,
      oem_number: draft.oem_number.trim() || null,
      description: draft.description.trim() || null,
      condition: draft.condition,
      tested_status: draft.tested_status || 'not_tested',
      price,
      sale_price: salePrice,
      stock_quantity: stock,
      position,
      sort_order: sortOrder,
      min_order_quantity: minOrderQuantity,
      reorder_level: reorderLevel,
      warranty_months: warranty,
      storage_location: draft.storage_location.trim() || null,
      currency: draft.currency || 'SAR',
      status: draft.status || 'active',
      is_featured: Boolean(draft.is_featured),
      tags: parseList(draft.tags),
      primary_image_url: draft.primary_image_url.trim(),
      image_urls: parseImageList(draft.image_urls),
      seo_title: draft.seo_title.trim() || null,
      seo_description: draft.seo_description.trim() || null,
      model_id: firstFitment?.model_id ?? null,
      compatible_years: firstFitment?.compatible_years ?? [],
    };

    setSaving(true);
    let partId = savedPartId;
    try {
      if (partId) {
        await adminFetch<ProductRecord>(`/api/v1/admin/parts/${partId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        const saved = await adminFetch<ProductRecord>('/api/v1/admin/parts', { method: 'POST', body: JSON.stringify(payload) });
        partId = saved.id;
        if (!partId) throw new Error('The API did not return the new product ID.');
        setSavedPartId(partId);
      }
      await adminFetch(`/api/v1/admin/parts/${partId}/fitments`, {
        method: 'PUT', body: JSON.stringify({ fitments: fitmentPayload }),
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The product could not be added. Review the details and try again.');
    } finally {
      setSaving(false);
    }
  }

  function renderFitmentRows() {
    return (
      <div className="inventory-wizard-fitments">
        {fitments.map((fitment, index) => {
          const modelOptions = lookups.models.filter((model) => model.manufacturer_id === fitment.manufacturer_id);
          const selectedModel = lookups.models.find((model) => model.id === fitment.model_id);
          return (
            <div className="inventory-wizard-fitment" key={`fitment-${index}`}>
              <div className="inventory-wizard-fitment-heading">
                <b>Vehicle {String(index + 1).padStart(2, '0')}</b>
                {fitments.length > 1 && <button type="button" className="inventory-wizard-remove" onClick={() => setFitments((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>}
              </div>
              <label className="form-field">
                <span>Vehicle company <b className="required-mark">Required</b></span>
                <select required value={fitment.manufacturer_id} onChange={(event) => updateFitment(index, 'manufacturer_id', event.target.value)}>
                  <option value="">Select a company…</option>
                  {lookups.manufacturers.map((manufacturer) => <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.manufacturer_name}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Vehicle model <b className="required-mark">Required</b></span>
                <select required disabled={!fitment.manufacturer_id} value={fitment.model_id} onChange={(event) => updateFitment(index, 'model_id', event.target.value)}>
                  <option value="">{fitment.manufacturer_id ? 'Select a model…' : 'Select company first…'}</option>
                  {modelOptions.map((model) => <option key={model.id} value={model.id}>{model.model_name}{model.generation ? ` · ${model.generation}` : ''}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Compatible model year <b className="required-mark">Required</b></span>
                <select required disabled={!fitment.model_id} value={fitment.year} onChange={(event) => updateFitment(index, 'year', event.target.value)}>
                  <option value="">{fitment.model_id ? 'Select a year…' : 'Select model first…'}</option>
                  {modelYears(selectedModel).map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
            </div>
          );
        })}
        <button type="button" className="secondary-button inventory-wizard-add-fitment" onClick={addFitment}>+ Add another company/model/year</button>
      </div>
    );
  }

  return (
    <div className="modal-backdrop inventory-modal-backdrop" role="presentation">
      <form className="resource-modal inventory-wizard-modal" onSubmit={(event) => void submit(event)}>
        <div className="modal-heading inventory-modal-heading">
          <div>
            <span className="eyebrow"><b>AI</b>Guided inventory creation</span>
            <h3>Add a part with AI</h3>
            <p>Enter only the essentials. Review and edit every generated detail before the part is added.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close product wizard">×</button>
        </div>

        <nav className="inventory-wizard-steps" aria-label="Product creation steps">
          {STEPS.map((label, index) => (
            <button type="button" key={label} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''} disabled={index > step || (step === 3 && Boolean(aiResult)) || aiLoading || saving} onClick={() => setStep(index)}>
              <span>{index < step ? '✓' : `0${index + 1}`}</span>{label}
            </button>
          ))}
        </nav>

        {lookupsError && <div className="admin-alert inventory-lookup-alert" role="alert">{lookupsError} Refresh the page or retry before continuing.</div>}
        {lookupsLoading && <div className="inventory-loading" role="status"><span className="loading-spinner" /> Loading live companies, models and categories…</div>}

        <fieldset className="inventory-wizard-body" disabled={lookupsLoading || Boolean(lookupsError) || aiLoading || saving} aria-busy={aiLoading || saving}>
          {step === 0 && (
            <section className="inventory-wizard-step-panel">
              <div className="inventory-wizard-intro"><span>01 / PRODUCT IMAGE</span><h4>Start with a clear product photo</h4><p>Upload the part or package image, or paste a public HTTPS image URL. The image is required for AI analysis.</p></div>
              <div className="inventory-wizard-image-card">
                {draft.primary_image_url && <img className="inventory-wizard-image-preview" src={draft.primary_image_url} alt="Product image preview" />}
                <ImageKitUploadField value={draft.primary_image_url} folder="parts" onChange={(value) => setField('primary_image_url', value)} />
                <label className="form-field"><span>Or paste an image URL <b className="required-mark">Required</b></span><input type="url" value={draft.primary_image_url} onChange={(event) => setField('primary_image_url', event.target.value)} placeholder="https://…" required /></label>
              </div>
              <label className="form-field inventory-wizard-title"><span>Product title <small>optional — AI can generate it from the image</small></span><input value={draft.part_name} onChange={(event) => setField('part_name', event.target.value)} placeholder="Enter a title, or skip this field" maxLength={240} /></label>
              <p className="inventory-wizard-note">No product record is created in this step. You can review and edit the AI result before adding it.</p>
              <div className="inventory-wizard-actions"><button type="button" className="secondary-button" disabled={!draft.part_name.trim()} onClick={() => continueToFitment(false)}>Continue with this title</button><button type="button" className="inventory-wizard-text-button" onClick={() => continueToFitment(true)}>Skip title — let AI generate it</button></div>
            </section>
          )}

          {step === 1 && (
            <section className="inventory-wizard-step-panel">
              <div className="inventory-wizard-intro"><span>02 / VEHICLE FITMENT</span><h4>Select every required vehicle detail</h4><p>Company, model and at least one year must be selected for each fitment. Incomplete selections cannot be skipped.</p></div>
              {renderFitmentRows()}
              {error && <p className="admin-alert" role="alert">{error}</p>}
              <div className="inventory-wizard-actions"><button type="button" className="secondary-button" onClick={() => { setError(''); setStep(0); }}>Back</button><button type="button" className="primary-button" onClick={continueToCommercial}>Continue</button></div>
            </section>
          )}

          {step === 2 && (
            <section className="inventory-wizard-step-panel">
              <div className="inventory-wizard-intro"><span>03 / COMMERCIAL DETAILS</span><h4>Enter price, stock and warranty</h4><p>These are business values and are never guessed by AI. Prices are in Saudi Riyals (SAR).</p></div>
              <div className="inventory-wizard-commercial">
                <label className="form-field"><span>Price (SAR) <b className="required-mark">Required</b></span><input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setField('price', event.target.value)} placeholder="0.00" required /></label>
                <label className="form-field"><span>Available quantity <b className="required-mark">Required</b></span><input type="number" min="0" step="1" value={draft.stock_quantity} onChange={(event) => setField('stock_quantity', event.target.value)} placeholder="0" required /></label>
                <label className="form-field"><span>Warranty (months) <b className="required-mark">Required</b></span><input type="number" min="0" step="1" value={draft.warranty_months} onChange={(event) => setField('warranty_months', event.target.value)} placeholder="0 = no warranty" required /></label>
              </div>
              <p className="inventory-wizard-note">Enter 0 for no stock or no warranty. You can change all three values on the final review screen.</p>
              {error && <p className="admin-alert" role="alert">{error}</p>}
              <div className="inventory-wizard-actions"><button type="button" className="secondary-button" onClick={() => { setError(''); setStep(1); }}>Back</button><button type="button" className="primary-button" onClick={continueToReview}>Continue to AI preview</button></div>
            </section>
          )}

          {step === 3 && (
            <section className="inventory-wizard-step-panel">
              {!aiResult ? (
                <>
                  <div className="inventory-wizard-intro"><span>04 / AI PRODUCT DETAILS</span><h4>Generate an editable product draft</h4><p>AI will use the image, optional title and your selected vehicle details. The SKU is system-generated. No part is saved yet.</p></div>
                  <div className="inventory-wizard-summary"><img src={draft.primary_image_url} alt="Selected product" /><div><b>{draft.part_name.trim() || 'Product title will be generated from this image'}</b><small>{fitments.length} required vehicle fitment{fitments.length === 1 ? '' : 's'} · {draft.price || 'Price not set'} SAR · {draft.stock_quantity || 'Quantity not set'} in stock · {draft.warranty_months || 'Warranty not set'} months</small></div></div>
                  {aiError && <div className="admin-alert" role="alert">{aiError}</div>}
                  <div className="inventory-wizard-actions"><button type="button" className="secondary-button" onClick={() => { setError(''); setStep(2); }}>Back</button><button type="button" className="primary-button" disabled={aiLoading || !validatePublicImage(draft.primary_image_url)} onClick={() => void generatePreview()}>{aiLoading ? 'Analyzing image…' : 'Generate product preview'}</button></div>
                </>
              ) : (
                <>
                  <div className="inventory-wizard-intro"><span>AI DRAFT · REVIEW REQUIRED</span><h4>Check and edit every field</h4><p>Only the Confirm & Add button saves this part. Required choices and values must be completed.</p></div>
                  <div className="inventory-wizard-ai-summary"><div><b>AI confidence</b><strong>{Math.round(aiResult.suggestion.confidence * 100)}%</strong></div><div><b>Duplicate risk</b><strong>{aiResult.suggestion.duplicate_risk}</strong></div>{aiResult.suggestion.notes.length > 0 && <p>{aiResult.suggestion.notes.join(' ')}</p>}</div>
                  <div className="inventory-wizard-choice-notice">AI category, manufacturer and condition are shown only as suggestions. Select each required option yourself below; AI will not make dropdown choices for you.</div>
                  <div className="inventory-wizard-choice-hints"><span>AI category suggestion: <b>{aiResult.suggestion.category_name || 'Not identified'}</b></span><span>AI manufacturer suggestion: <b>{aiResult.suggestion.manufacturer_name || 'Not identified'}</b></span><span>AI condition suggestion: <b>{aiResult.suggestion.condition || 'Not identified'}</b></span></div>
                  {aiError && <div className="admin-alert" role="alert">{aiError}</div>}
                  <div className="inventory-wizard-review-grid">
                    <section className="inventory-wizard-review-section"><h5>Product identity</h5>
                      <label className="form-field"><span>Product title <b className="required-mark">Required</b></span><input value={draft.part_name} onChange={(event) => setField('part_name', event.target.value)} maxLength={240} required /></label>
                      <label className="form-field"><span>URL slug <b className="required-mark">Required</b></span><input value={draft.slug} onChange={(event) => setField('slug', slugify(event.target.value))} required /></label>
                      <label className="form-field"><span>Inventory SKU <b className="required-mark">Required</b></span><input value={draft.sku} onChange={(event) => setField('sku', event.target.value.trim().toUpperCase())} required /></label>
                      <label className="form-field"><span>Part number</span><input value={draft.part_number} onChange={(event) => setField('part_number', event.target.value)} /></label>
                      <label className="form-field"><span>OEM number(s)</span><input value={draft.oem_number} onChange={(event) => setField('oem_number', event.target.value)} /></label>
                      <label className="form-field"><span>Product brand name</span><input value={draft.brand_name} onChange={(event) => setField('brand_name', event.target.value)} /></label>
                      <label className="form-field"><span>Product category <b className="required-mark">Admin must select</b></span><select value={draft.category_id} onChange={(event) => setField('category_id', event.target.value)} required><option value="">Select a category…</option>{lookups.categories.map((item) => <option key={item.id} value={item.id}>{item.category_name}</option>)}</select></label>
                      <label className="form-field"><span>Product manufacturer <b className="required-mark">Admin must select</b></span><select value={draft.manufacturer_id} onChange={(event) => setField('manufacturer_id', event.target.value)} required><option value="">Select a manufacturer or confirm none…</option><option value={NO_MANUFACTURER}>No identifiable manufacturer / unbranded</option>{lookups.manufacturers.map((item) => <option key={item.id} value={item.id}>{item.manufacturer_name}</option>)}</select></label>
                    </section>
                    <section className="inventory-wizard-review-section"><h5>Vehicle fitment <span>Make, model and year are mandatory</span></h5>{renderFitmentRows()}</section>
                    <section className="inventory-wizard-review-section"><h5>Price & inventory</h5>
                      <label className="form-field"><span>Price (SAR) <b className="required-mark">Required</b></span><input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setField('price', event.target.value)} required /></label>
                      <label className="form-field"><span>Sale price (optional)</span><input type="number" min="0" step="0.01" value={draft.sale_price} onChange={(event) => setField('sale_price', event.target.value)} /></label>
                      <label className="form-field"><span>Available quantity <b className="required-mark">Required</b></span><input type="number" min="0" step="1" value={draft.stock_quantity} onChange={(event) => setField('stock_quantity', event.target.value)} required /></label>
                      <label className="form-field"><span>Warranty months <b className="required-mark">Required</b></span><input type="number" min="0" step="1" value={draft.warranty_months} onChange={(event) => setField('warranty_months', event.target.value)} required /></label>
                      <label className="form-field"><span>Condition <b className="required-mark">Admin must select</b></span><select value={draft.condition} onChange={(event) => setField('condition', event.target.value)} required><option value="">Select a condition…</option>{['new', 'used', 'refurbished', 'damaged'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                      <label className="form-field"><span>Tested status</span><select value={draft.tested_status} onChange={(event) => setField('tested_status', event.target.value)}>{['not_tested', 'tested', 'failed'].map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></label>
                      <label className="form-field"><span>Status</span><select value={draft.status} onChange={(event) => setField('status', event.target.value)}>{['active', 'draft', 'inactive', 'out_of_stock'].map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></label>
                      <label className="form-field"><span>Minimum order quantity</span><input type="number" min="1" step="1" value={draft.min_order_quantity} onChange={(event) => setField('min_order_quantity', event.target.value)} /></label>
                      <label className="form-field"><span>Reorder level</span><input type="number" min="0" step="1" value={draft.reorder_level} onChange={(event) => setField('reorder_level', event.target.value)} /></label>
                      <label className="form-field"><span>Display position</span><input type="number" min="0" step="1" value={draft.position} onChange={(event) => setField('position', event.target.value)} /></label>
                      <label className="form-field"><span>Storefront sort order</span><input type="number" min="0" step="1" value={draft.sort_order} onChange={(event) => setField('sort_order', event.target.value)} /></label>
                      <label className="form-field"><span>Storage location (optional)</span><input value={draft.storage_location} onChange={(event) => setField('storage_location', event.target.value)} /></label>
                      <div className="inventory-wizard-currency"><span>Currency</span><b>{draft.currency}</b><small>New product default: Saudi Riyal</small></div>
                      <label className="form-checkbox"><input type="checkbox" checked={draft.is_featured} onChange={(event) => setField('is_featured', event.target.checked)} />Feature on the storefront</label>
                    </section>
                    <section className="inventory-wizard-review-section"><h5>Description, images & tags</h5>
                      <label className="form-field"><span>Description</span><textarea rows={5} value={draft.description} onChange={(event) => setField('description', event.target.value)} /></label>
                      <label className="form-field"><span>Primary product image <b className="required-mark">Required</b></span><input type="url" value={draft.primary_image_url} onChange={(event) => updatePrimaryImage(event.target.value)} required /><img className="inventory-wizard-inline-image" src={draft.primary_image_url} alt="Product preview" /></label>
                      <label className="form-field"><span>Gallery image URLs <small>one URL per line</small></span><textarea rows={3} value={parseImageList(draft.image_urls).join('\n')} onChange={(event) => setField('image_urls', event.target.value)} /></label>
                      <label className="form-field"><span>Search tags <small>comma-separated</small></span><input value={draft.tags} onChange={(event) => setField('tags', event.target.value)} /></label>
                    </section>
                    <section className="inventory-wizard-review-section"><h5>Search engine details</h5>
                      <label className="form-field"><span>SEO title</span><input value={draft.seo_title} onChange={(event) => setField('seo_title', event.target.value)} /></label>
                      <label className="form-field"><span>SEO description</span><textarea rows={3} value={draft.seo_description} onChange={(event) => setField('seo_description', event.target.value)} /></label>
                    </section>
                  </div>
                  <div className="inventory-wizard-save-notice"><b>Nothing is saved yet.</b> Confirming creates the product and selected vehicle fitments. You can still edit the fields above.</div>
                </>
              )}
            </section>
          )}
        </fieldset>

        {error && <div className="admin-alert inventory-wizard-global-error" role="alert">{error}</div>}
        {step === 3 && aiResult ? (
          <div className="inventory-wizard-footer"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="primary-button" disabled={saving || aiLoading || lookupsLoading || Boolean(lookupsError)}>{saving ? 'Adding product…' : savedPartId ? 'Retry add / fitments' : 'Confirm & add product'}</button></div>
        ) : null}
      </form>
    </div>
  );
}
