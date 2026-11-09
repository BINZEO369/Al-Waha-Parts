'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../lib/auth';
import { ImageKitUploadField } from './ImageKitUploadField';

type ProductRecord = Record<string, unknown> & { id: string };
type ManufacturerOption = {
  id: string;
  manufacturer_name: string;
  logo_url?: string | null;
  status?: string | null;
};
type ModelOption = {
  id: string;
  manufacturer_id: string;
  model_name: string;
  generation?: string | null;
  year_start?: number | null;
  year_end?: number | null;
};
type CategoryOption = { id: string; category_name: string; slug?: string | null };
type LookupBundle = {
  manufacturers: ManufacturerOption[];
  models: ModelOption[];
  categories: CategoryOption[];
};
type FitmentRecord = {
  model_id: string;
  compatible_years?: number[] | null;
  vehicles?: { model_name?: string | null } | null;
};
type FitmentDraft = { manufacturer_id: string; model_id: string; years_text: string };
type FormValues = Record<string, string | boolean>;
type ProductSuggestion = {
  product_title: string | null;
  part_number: string | null;
  oem_numbers: string[];
  category_name: string | null;
  manufacturer_name: string | null;
  model_name: string | null;
  compatible_years: number[];
  condition: string | null;
  position: string | null;
  seo_title: string | null;
  seo_description: string | null;
  duplicate_risk: 'low' | 'medium' | 'high';
  confidence: number;
  notes: string[];
};
type AiResponse = { run_id: string | null; suggestion: ProductSuggestion; requires_approval: boolean };
type AiCard = { key: string; label: string; value: string; hint?: string; available: boolean };

const emptyLookups: LookupBundle = { manufacturers: [], models: [], categories: [] };
const emptyFitment = (): FitmentDraft => ({ manufacturer_id: '', model_id: '', years_text: '' });
const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

function rowText(row: ProductRecord | null, key: string, fallback = '') {
  const value = row?.[key];
  return value === null || value === undefined ? fallback : String(value);
}

function initialValues(row: ProductRecord | null): FormValues {
  const gallery = row?.image_urls;
  return {
    part_name: rowText(row, 'part_name'),
    slug: rowText(row, 'slug'),
    category_id: rowText(row, 'category_id'),
    manufacturer_id: rowText(row, 'manufacturer_id'),
    brand_name: rowText(row, 'brand_name'),
    sku: rowText(row, 'sku'),
    part_number: rowText(row, 'part_number'),
    oem_number: rowText(row, 'oem_number'),
    price: rowText(row, 'price'),
    sale_price: rowText(row, 'sale_price'),
    stock_quantity: rowText(row, 'stock_quantity', '0'),
    currency: rowText(row, 'currency', 'SAR') || 'SAR',
    status: rowText(row, 'status', 'active') || 'active',
    description: rowText(row, 'description'),
    condition: rowText(row, 'condition'),
    tested_status: rowText(row, 'tested_status'),
    position: rowText(row, 'position'),
    warranty_months: rowText(row, 'warranty_months'),
    storage_location: rowText(row, 'storage_location'),
    seo_title: rowText(row, 'seo_title'),
    seo_description: rowText(row, 'seo_description'),
    primary_image_url: rowText(row, 'primary_image_url'),
    image_urls: Array.isArray(gallery) ? JSON.stringify(gallery) : rowText(row, 'image_urls'),
    is_featured: Boolean(row?.is_featured),
  };
}

function parseYears(value: string) {
  const tokens = value.split(/[\s,;]+/).map((part) => part.trim()).filter(Boolean);
  const years = tokens.map(Number);
  if (years.some((year) => !Number.isInteger(year) || year < 1900 || year > 2200)) {
    throw new Error('Use four-digit compatible years between 1900 and 2200.');
  }
  return [...new Set(years)].sort((a, b) => a - b);
}

function parseImageUrls(value: string) {
  if (!value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // Keep compatibility with legacy comma/newline-separated image URL values.
  }
  return value.split(/[\n,]/).map((url) => url.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function InventoryProductForm({
  row,
  onClose,
  onSaved,
}: {
  row: ProductRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<FormValues>(() => initialValues(row));
  const [lookups, setLookups] = useState<LookupBundle>(emptyLookups);
  const [fitments, setFitments] = useState<FitmentDraft[]>([emptyFitment()]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState('');
  const [fitmentsReady, setFitmentsReady] = useState(!row);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedPartId, setSavedPartId] = useState(row?.id ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(row?.slug));
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<AiResponse | null>(null);
  const [appliedFields, setAppliedFields] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setLookupsLoading(true);
    setLookupsError('');
    const lookupRequest = adminFetch<LookupBundle>('/api/v1/admin/lookups');
    const fitmentRequest: Promise<FitmentRecord[]> = row
      ? adminFetch<FitmentRecord[]>(`/api/v1/admin/parts/${row.id}/fitments`)
      : Promise.resolve([]);
    Promise.all([lookupRequest, fitmentRequest])
      .then(([nextLookups, savedFitments]) => {
        if (!active) return;
        setLookups(nextLookups);
        if (row) {
          setFitments(
            savedFitments.length
              ? savedFitments.map((fitment) => ({
                  manufacturer_id:
                    nextLookups.models.find((model) => model.id === fitment.model_id)?.manufacturer_id ?? '',
                  model_id: fitment.model_id,
                  years_text: (fitment.compatible_years ?? []).join(', '),
                }))
              : [emptyFitment()],
          );
        } else {
          setFitments([emptyFitment()]);
        }
        setFitmentsReady(true);
      })
      .catch((cause: unknown) => {
        if (active) {
          setLookupsError(cause instanceof Error ? cause.message : 'Live catalog lookups could not be loaded.');
          setFitmentsReady(false);
        }
      })
      .finally(() => {
        if (active) setLookupsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [row?.id]);

  const setValue = (key: string, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  const selectedPartManufacturer = lookups.manufacturers.find(
    (manufacturer) => manufacturer.id === values.manufacturer_id,
  );
  const aiSuggestion = aiResult?.suggestion;
  const suggestedManufacturer = aiSuggestion?.manufacturer_name
    ? lookups.manufacturers.find(
        (manufacturer) => normalizeName(manufacturer.manufacturer_name) === normalizeName(aiSuggestion.manufacturer_name ?? ''),
      )
    : undefined;
  const candidateModels = aiSuggestion?.model_name
    ? lookups.models.filter(
        (model) =>
          normalizeName(model.model_name) === normalizeName(aiSuggestion.model_name ?? '') &&
          (!aiSuggestion.manufacturer_name || Boolean(suggestedManufacturer)) &&
          (!suggestedManufacturer || model.manufacturer_id === suggestedManufacturer.id),
      )
    : [];
  const suggestedModel = candidateModels.length === 1 ? candidateModels[0] : undefined;
  const suggestedCategory = aiSuggestion?.category_name
    ? lookups.categories.find(
        (category) => normalizeName(category.category_name) === normalizeName(aiSuggestion.category_name ?? ''),
      )
    : undefined;

  const aiCards = useMemo<AiCard[]>(() => {
    if (!aiSuggestion) return [];
    const cards: AiCard[] = [];
    if (aiSuggestion.product_title)
      cards.push({ key: 'title', label: 'Product title', value: aiSuggestion.product_title, available: true });
    if (aiSuggestion.part_number)
      cards.push({ key: 'part_number', label: 'Part number', value: aiSuggestion.part_number, available: true });
    if (aiSuggestion.oem_numbers.length)
      cards.push({ key: 'oem', label: 'OEM number(s)', value: aiSuggestion.oem_numbers.join(', '), hint: 'Joined as a comma-separated reference list.', available: true });
    if (aiSuggestion.category_name)
      cards.push({
        key: 'category',
        label: 'Category',
        value: aiSuggestion.category_name,
        hint: suggestedCategory ? 'Matched to the live category list.' : 'No exact live category match; choose a database category manually.',
        available: Boolean(suggestedCategory),
      });
    if (aiSuggestion.manufacturer_name || aiSuggestion.model_name || aiSuggestion.compatible_years.length) {
      const compatibleLabel = [
        aiSuggestion.manufacturer_name,
        aiSuggestion.model_name,
        aiSuggestion.compatible_years.length ? aiSuggestion.compatible_years.join(', ') : '',
      ].filter(Boolean).join(' · ');
      const compatibilityCanApply = Boolean(
        suggestedModel || (suggestedManufacturer && !aiSuggestion.model_name && !aiSuggestion.compatible_years.length),
      );
      cards.push({
        key: 'fitment',
        label: 'Compatible vehicle',
        value: compatibleLabel || 'No make/model identified',
        hint: compatibilityCanApply
          ? 'Matched to the live manufacturer/model library.'
          : 'No unique live make/model match; select the vehicle from the database list.',
        available: compatibilityCanApply,
      });
    }
    if (aiSuggestion.condition)
      cards.push({ key: 'condition', label: 'Condition', value: aiSuggestion.condition, available: true });
    if (aiSuggestion.position)
      cards.push({ key: 'position', label: 'Position', value: aiSuggestion.position, available: true });
    if (aiSuggestion.seo_title || aiSuggestion.seo_description)
      cards.push({
        key: 'seo',
        label: 'SEO metadata',
        value: [aiSuggestion.seo_title, aiSuggestion.seo_description].filter(Boolean).join(' · '),
        available: true,
      });
    return cards;
  }, [aiSuggestion, suggestedCategory, suggestedManufacturer, suggestedModel]);

  async function requestAiSuggestions() {
    setAiError('');
    setAiResult(null);
    setAppliedFields([]);
    if (!String(values.part_name).trim()) {
      setAiError('Enter a product name first so the assistant has something to analyze.');
      return;
    }
    setAiLoading(true);
    const primaryFitment = fitments.find((fitment) => fitment.model_id);
    const model = lookups.models.find((option) => option.id === primaryFitment?.model_id);
    const category = lookups.categories.find((option) => option.id === values.category_id);
    try {
      const result = await adminFetch<AiResponse>('/api/v1/admin/ai/suggest-product', {
        method: 'POST',
        body: JSON.stringify({
          part_name: values.part_name,
          image_url: values.primary_image_url,
          description: values.description,
          sku: values.sku,
          oem_number: values.oem_number,
          part_number: values.part_number,
          brand_name: values.brand_name,
          model_name: model?.model_name ?? '',
          category_name: category?.category_name ?? '',
        }),
      });
      setAiResult(result);
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : 'Unable to load AI suggestions.');
    } finally {
      setAiLoading(false);
    }
  }

  function applySuggestion(key: string) {
    if (!aiSuggestion) return;
    if (key === 'title' && aiSuggestion.product_title) {
      setValue('part_name', aiSuggestion.product_title);
      if (!slugManuallyEdited) setValue('slug', slugify(aiSuggestion.product_title));
    }
    if (key === 'part_number' && aiSuggestion.part_number)
      setValue('part_number', aiSuggestion.part_number);
    if (key === 'oem' && aiSuggestion.oem_numbers.length)
      setValue('oem_number', aiSuggestion.oem_numbers.join(', '));
    if (key === 'category' && suggestedCategory)
      setValue('category_id', suggestedCategory.id);
    if (key === 'condition' && aiSuggestion.condition)
      setValue('condition', aiSuggestion.condition);
    if (key === 'position' && aiSuggestion.position)
      setValue('position', aiSuggestion.position);
    if (key === 'seo') {
      if (aiSuggestion.seo_title) setValue('seo_title', aiSuggestion.seo_title);
      if (aiSuggestion.seo_description) setValue('seo_description', aiSuggestion.seo_description);
    }
    if (key === 'fitment') {
      const manufacturerId = suggestedModel?.manufacturer_id ?? suggestedManufacturer?.id ?? '';
      const modelId = suggestedModel?.id ?? '';
      const yearsText = aiSuggestion.compatible_years.join(', ');
      setFitments((current) => {
        const existingIndex = modelId ? current.findIndex((fitment) => fitment.model_id === modelId) : -1;
        const targetIndex = existingIndex >= 0 ? existingIndex : current.findIndex((fitment) => !fitment.model_id);
        const draft = {
          manufacturer_id: manufacturerId,
          model_id: modelId,
          years_text: yearsText || (targetIndex >= 0 ? current[targetIndex]?.years_text ?? '' : ''),
        };
        if (targetIndex >= 0)
          return current.map((fitment, index) => index === targetIndex ? draft : fitment);
        return [...current, draft];
      });
    }
    setAppliedFields((current) => current.includes(key) ? current : [...current, key]);
  }

  function updateFitment(index: number, key: keyof FitmentDraft, value: string) {
    setFitments((current) => current.map((fitment, currentIndex) =>
      currentIndex === index ? { ...fitment, [key]: value } : fitment,
    ));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (lookupsLoading || lookupsError || !fitmentsReady) {
      setError('Wait for the live category and vehicle lists to finish loading before saving.');
      return;
    }
    const partName = String(values.part_name).trim();
    const sku = String(values.sku).trim();
    const slug = String(values.slug).trim();
    if (!partName || !sku || !slug || !values.category_id) {
      setError('Product name, slug, SKU, and category are required.');
      return;
    }
    const price = Number(values.price);
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be 0 or greater.');
      return;
    }
    const salePriceText = String(values.sale_price ?? '').trim();
    const salePrice = salePriceText ? Number(salePriceText) : null;
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
      setError('Sale price must be 0 or greater.');
      return;
    }
    if (salePrice !== null && salePrice > price) {
      setError('Sale price cannot be higher than the regular price.');
      return;
    }
    const stockQuantity = Number(values.stock_quantity || 0);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError('Stock quantity must be a whole number of 0 or greater.');
      return;
    }

    const nextFitments: Array<{ model_id: string; compatible_years: number[] }> = [];
    const selectedModels = new Set<string>();
    for (const fitment of fitments) {
      if (fitment.years_text.trim() && !fitment.model_id) {
        setError('Choose a model for every fitment row that has compatible years.');
        return;
      }
      if (!fitment.model_id) continue;
      if (selectedModels.has(fitment.model_id)) {
        setError('Each vehicle model can be selected once per product.');
        return;
      }
      selectedModels.add(fitment.model_id);
      try {
        nextFitments.push({ model_id: fitment.model_id, compatible_years: parseYears(fitment.years_text) });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Check the compatible years.');
        return;
      }
    }

    const firstFitment = nextFitments[0];
    const payload: Record<string, unknown> = {
      part_name: partName,
      slug,
      sku,
      category_id: values.category_id,
      price,
      sale_price: salePrice,
      stock_quantity: stockQuantity,
      currency: values.currency || 'SAR',
      status: values.status || 'active',
      is_featured: Boolean(values.is_featured),
      image_urls: parseImageUrls(String(values.image_urls ?? '')),
      model_id: firstFitment?.model_id ?? null,
      compatible_years: firstFitment?.compatible_years ?? [],
    };
    const optionalFields = [
      'manufacturer_id', 'brand_name', 'part_number', 'oem_number', 'description', 'condition',
      'tested_status', 'position', 'warranty_months', 'storage_location', 'primary_image_url',
      'seo_title', 'seo_description',
    ];
    for (const key of optionalFields) {
      const value = values[key];
      if (value !== undefined && String(value).trim())
        payload[key] = ['warranty_months'].includes(key) ? Number(value) : String(value).trim();
    }

    setSaving(true);
    let partRecordSaved = false;
    try {
      const targetId = row?.id ?? savedPartId;
      const savedPart = await adminFetch<ProductRecord>(
        targetId ? `/api/v1/admin/parts/${targetId}` : '/api/v1/admin/parts',
        {
          method: targetId ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );
      partRecordSaved = true;
      const partId = targetId || savedPart.id;
      if (!partId) throw new Error('Product was saved but the returned record ID was missing.');
      if (!targetId) setSavedPartId(partId);
      await adminFetch<FitmentRecord[]>(`/api/v1/admin/parts/${partId}/fitments`, {
        method: 'PUT',
        body: JSON.stringify({ fitments: nextFitments }),
      });
      onSaved();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The product could not be saved.';
      setError(partRecordSaved
        ? `Product details were saved, but vehicle fitments were not. Press Save again to retry; it will not create a duplicate. ${message}`
        : message,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop inventory-modal-backdrop" role="presentation">
      <form className="resource-modal inventory-product-modal" onSubmit={(event) => void submit(event)}>
        <div className="modal-heading inventory-modal-heading">
          <div>
            <span className="eyebrow"><b>{row ? 'EDIT' : 'NEW'}</b>Single product workflow</span>
            <h3>{row ? 'Edit product' : 'Add product to inventory'}</h3>
            <p>Product details, compatible vehicles, and AI assistance live in one form.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close product form">×</button>
        </div>

        <div className="inventory-form-steps" aria-label="Product workflow sections">
          <span><b>01</b> Product</span>
          <span><b>02</b> Fitment</span>
          <span><b>03</b> Stock & media</span>
          <small>AI suggestions require your approval</small>
        </div>

        {lookupsError && (
          <div className="admin-alert inventory-lookup-alert" role="alert">
            {lookupsError} The product form is paused to avoid saving without current database choices.
          </div>
        )}
        {lookupsLoading && (
          <div className="inventory-loading" role="status"><span className="loading-spinner" /> Loading live manufacturers, models, and categories…</div>
        )}

        <div className="inventory-composer-grid">
          <div className="inventory-composer-main">
            <section className="inventory-form-section">
              <div className="inventory-form-section-heading">
                <span>01</span>
                <div><small>CATALOG RECORD</small><h4>Product details</h4><p>Identify the part and its own brand before setting vehicle compatibility.</p></div>
              </div>
              <div className="inventory-form-grid">
                <label className="form-field inventory-field-wide">
                  <span>Product name *</span>
                  <input value={String(values.part_name)} onChange={(event) => {
                    const value = event.target.value;
                    setValue('part_name', value);
                    if (!slugManuallyEdited) setValue('slug', slugify(value));
                  }} placeholder="e.g. Front brake pad set" required />
                </label>
                <label className="form-field">
                  <span>URL slug *</span>
                  <input value={String(values.slug)} onChange={(event) => {
                    setSlugManuallyEdited(true);
                    setValue('slug', slugify(event.target.value));
                  }} placeholder="front-brake-pad-set" required />
                </label>
                <label className="form-field">
                  <span>SKU *</span>
                  <input value={String(values.sku)} onChange={(event) => setValue('sku', event.target.value)} placeholder="AWP-BRK-001" required />
                </label>
                <label className="form-field">
                  <span>Part number</span>
                  <input value={String(values.part_number)} onChange={(event) => setValue('part_number', event.target.value)} placeholder="Manufacturer part number" />
                </label>
                <label className="form-field">
                  <span>OEM number</span>
                  <input value={String(values.oem_number)} onChange={(event) => setValue('oem_number', event.target.value)} placeholder="One or more OEM references" />
                </label>
                <label className="form-field">
                  <span>Product manufacturer</span>
                  <select value={String(values.manufacturer_id)} onChange={(event) => setValue('manufacturer_id', event.target.value)}>
                    <option value="">Choose from live companies…</option>
                    {lookups.manufacturers.map((manufacturer) => (
                      <option value={manufacturer.id} key={manufacturer.id}>{manufacturer.manufacturer_name}</option>
                    ))}
                  </select>
                  {selectedPartManufacturer?.logo_url && (
                    <span className="inventory-brand-preview"><img src={selectedPartManufacturer.logo_url} alt="" />Live company logo linked to this part</span>
                  )}
                </label>
                <label className="form-field">
                  <span>Brand name (optional)</span>
                  <input value={String(values.brand_name)} onChange={(event) => setValue('brand_name', event.target.value)} placeholder="Part brand or label" />
                </label>
                <label className="form-field">
                  <span>Category *</span>
                  <select value={String(values.category_id)} onChange={(event) => setValue('category_id', event.target.value)} required>
                    <option value="">Choose a live category…</option>
                    {lookups.categories.map((category) => (
                      <option value={category.id} key={category.id}>{category.category_name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="inventory-form-section">
              <div className="inventory-form-section-heading inventory-section-with-action">
                <span>02</span>
                <div><small>DATABASE-DRIVEN FITMENT</small><h4>Compatible vehicles</h4><p>Choose a company first; its models load from the live vehicle tables. Add separate years for each model.</p></div>
                <button className="secondary-button compact-button" type="button" disabled={lookupsLoading || Boolean(lookupsError)} onClick={() => setFitments((current) => [...current, emptyFitment()])}>+ Add model</button>
              </div>
              <div className="inventory-fitment-list">
                {fitments.map((fitment, index) => {
                  const modelsForManufacturer = lookups.models.filter((model) => model.manufacturer_id === fitment.manufacturer_id);
                  const selectedModelIds = new Set(fitments.map((draft) => draft.model_id).filter(Boolean));
                  return (
                    <div className="inventory-fitment-row" key={`${fitment.model_id || 'empty'}-${index}`}>
                      <div className="inventory-fitment-number">{String(index + 1).padStart(2, '0')}</div>
                      <label className="form-field">
                        <span>Vehicle company</span>
                        <select value={fitment.manufacturer_id} onChange={(event) => {
                          updateFitment(index, 'manufacturer_id', event.target.value);
                          updateFitment(index, 'model_id', '');
                        }}>
                          <option value="">Select make…</option>
                          {lookups.manufacturers.map((manufacturer) => (
                            <option value={manufacturer.id} key={manufacturer.id}>{manufacturer.manufacturer_name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="form-field">
                        <span>Model</span>
                        <select value={fitment.model_id} disabled={!fitment.manufacturer_id} onChange={(event) => updateFitment(index, 'model_id', event.target.value)}>
                          <option value="">{fitment.manufacturer_id ? 'Select model…' : 'Select a company first…'}</option>
                          {modelsForManufacturer
                            .filter((model) => model.id === fitment.model_id || !selectedModelIds.has(model.id))
                            .map((model) => (
                              <option value={model.id} key={model.id}>{model.model_name}{model.generation ? ` · ${model.generation}` : ''}</option>
                            ))}
                        </select>
                        {!!fitment.model_id && (
                          <small className="inventory-model-year-range">
                            {lookups.models.find((model) => model.id === fitment.model_id)?.year_start ?? 'Year —'}–{lookups.models.find((model) => model.id === fitment.model_id)?.year_end ?? 'Present'}
                          </small>
                        )}
                      </label>
                      <label className="form-field">
                        <span>Compatible years</span>
                        <input value={fitment.years_text} onChange={(event) => updateFitment(index, 'years_text', event.target.value)} placeholder="2018, 2019, 2020 · blank = all" inputMode="numeric" />
                      </label>
                      <button className="inventory-fitment-remove" type="button" aria-label={`Remove fitment ${index + 1}`} onClick={() => setFitments((current) => current.filter((_, currentIndex) => currentIndex !== index))}>×</button>
                    </div>
                  );
                })}
              </div>
              {fitments.length === 0 && (
                <div className="inventory-no-fitment">No vehicle links selected. Add a model if this part is vehicle-specific.</div>
              )}
              <div className="inventory-live-note"><span className="inventory-live-dot" /> {lookups.models.length.toLocaleString()} models loaded from the live fitment library</div>
            </section>

            <section className="inventory-form-section">
              <div className="inventory-form-section-heading">
                <span>03</span>
                <div><small>COMMERCIAL DETAILS</small><h4>Price & availability</h4><p>Prices use the existing stored amount; new inventory is entered in Saudi riyals.</p></div>
              </div>
              <div className="inventory-form-grid">
                <label className="form-field">
                  <span>Price (SAR) *</span>
                  <input type="number" min="0" step="0.01" value={String(values.price)} onChange={(event) => setValue('price', event.target.value)} placeholder="0.00" required />
                </label>
                <label className="form-field">
                  <span>Sale price (SAR)</span>
                  <input type="number" min="0" step="0.01" value={String(values.sale_price)} onChange={(event) => setValue('sale_price', event.target.value)} placeholder="Optional" />
                </label>
                <label className="form-field">
                  <span>Stock quantity</span>
                  <input type="number" min="0" step="1" value={String(values.stock_quantity)} onChange={(event) => setValue('stock_quantity', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Status</span>
                  <select value={String(values.status)} onChange={(event) => setValue('status', event.target.value)}>
                    {['active', 'draft', 'inactive', 'out_of_stock'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Condition</span>
                  <input value={String(values.condition)} onChange={(event) => setValue('condition', event.target.value)} placeholder="New, refurbished, used…" />
                </label>
                <label className="form-field">
                  <span>Tested status</span>
                  <input value={String(values.tested_status)} onChange={(event) => setValue('tested_status', event.target.value)} placeholder="Tested / not tested" />
                </label>
                <label className="form-field">
                  <span>Position</span>
                  <input value={String(values.position)} onChange={(event) => setValue('position', event.target.value)} placeholder="Front / rear / left / right" />
                </label>
                <label className="form-field">
                  <span>Warranty (months)</span>
                  <input type="number" min="0" step="1" value={String(values.warranty_months)} onChange={(event) => setValue('warranty_months', event.target.value)} placeholder="Optional" />
                </label>
                <label className="form-field">
                  <span>Storage location</span>
                  <input value={String(values.storage_location)} onChange={(event) => setValue('storage_location', event.target.value)} placeholder="Shelf / warehouse reference" />
                </label>
                <label className="form-checkbox inventory-featured-toggle">
                  <input type="checkbox" checked={Boolean(values.is_featured)} onChange={(event) => setValue('is_featured', event.target.checked)} />
                  Feature this product on the storefront
                </label>
                <div className="inventory-currency-lock"><span>Currency</span><strong>SAR</strong><small>Saudi Riyal</small></div>
              </div>
            </section>

            <section className="inventory-form-section">
              <div className="inventory-form-section-heading">
                <span>04</span>
                <div><small>STOREFRONT CONTENT</small><h4>Description & images</h4><p>Upload product media and add customer-facing details.</p></div>
              </div>
              <div className="inventory-media-grid">
                <label className="form-field inventory-field-wide">
                  <span>Description</span>
                  <textarea rows={4} value={String(values.description)} onChange={(event) => setValue('description', event.target.value)} placeholder="Condition, contents, fitment notes, and useful product details…" />
                </label>
                <div className="form-field">
                  <span>Primary product image</span>
                  <ImageKitUploadField value={values.primary_image_url} folder="parts" onChange={(value) => setValue('primary_image_url', value)} />
                  <input type="url" value={String(values.primary_image_url)} onChange={(event) => setValue('primary_image_url', event.target.value)} placeholder="Image URL or upload above" />
                </div>
                <div className="form-field">
                  <span>Product gallery</span>
                  <ImageKitUploadField value={values.image_urls} multiple folder="parts" onChange={(value) => setValue('image_urls', value)} />
                </div>
              </div>
            </section>

            <details className="inventory-seo-section">
              <summary><span><b>05</b> Search and SEO details</span><small>Optional</small></summary>
              <div className="inventory-form-grid">
                <label className="form-field">
                  <span>SEO title</span>
                  <input value={String(values.seo_title)} onChange={(event) => setValue('seo_title', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>SEO description</span>
                  <textarea rows={2} value={String(values.seo_description)} onChange={(event) => setValue('seo_description', event.target.value)} />
                </label>
              </div>
            </details>
          </div>

          <aside className="inventory-ai-column">
            <section className="inventory-ai-card" aria-labelledby="inventory-ai-title">
              <div className="inventory-ai-topline"><span className="inventory-ai-mark">AI</span><span className="inventory-ai-protection">APPROVAL REQUIRED</span></div>
              <h4 id="inventory-ai-title">Catalog assistant</h4>
              <p>Review suggestions from the existing AI setup. Nothing is written until you apply fields and save the product.</p>
              <button className="primary-button inventory-ai-button" type="button" disabled={aiLoading || lookupsLoading || Boolean(lookupsError)} onClick={() => void requestAiSuggestions()}>
                {aiLoading ? 'Analyzing product…' : aiResult ? 'Refresh suggestions' : 'Suggest product details'}
              </button>
              {aiError && <div className="admin-alert inventory-ai-error" role="alert">{aiError}</div>}
              {aiLoading && <div className="inventory-ai-loading" role="status"><span className="loading-spinner" /> Checking text and uploaded image…</div>}
              {aiResult && (
                <div className="inventory-ai-results">
                  <div className="inventory-ai-meta">
                    <span>Confidence <b>{Math.round(aiSuggestion?.confidence ? aiSuggestion.confidence * 100 : 0)}%</b></span>
                    <span className={`inventory-risk inventory-risk-${aiSuggestion?.duplicate_risk ?? 'low'}`}>Duplicate risk · {aiSuggestion?.duplicate_risk ?? 'low'}</span>
                  </div>
                  {aiCards.length ? (
                    <div className="inventory-ai-list">
                      {aiCards.map((card) => (
                        <article className="inventory-ai-suggestion" key={card.key}>
                          <div className="inventory-ai-suggestion-copy">
                            <small>{card.label}</small>
                            <strong>{card.value}</strong>
                            {card.hint && <span>{card.hint}</span>}
                          </div>
                          <button
                            type="button"
                            className={appliedFields.includes(card.key) ? 'inventory-ai-apply is-applied' : 'inventory-ai-apply'}
                            disabled={!card.available || appliedFields.includes(card.key)}
                            onClick={() => applySuggestion(card.key)}
                          >
                            {appliedFields.includes(card.key) ? 'Added' : card.available ? 'Use' : 'No match'}
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="inventory-ai-empty">No usable field suggestions were returned. Add more product details or an image and try again.</p>
                  )}
                  {aiSuggestion?.notes?.length ? <p className="inventory-ai-notes">{aiSuggestion.notes.join(' ')}</p> : null}
                  <small className="inventory-ai-footer">Preview recorded{aiResult.run_id ? ` · ${aiResult.run_id.slice(0, 8)}` : ''}. “Use” fills this draft; final save remains manual.</small>
                </div>
              )}
            </section>
            <div className="inventory-ai-reminder"><b>Live database choices</b><span>AI can only apply a company, model, or category when it matches the existing database list.</span></div>
          </aside>
        </div>

        {error && <div className="admin-alert inventory-form-error" role="alert">{error}</div>}
        <div className="modal-actions inventory-modal-actions">
          <span className="inventory-save-note">{savedPartId && !row ? 'A draft record already exists; saving again will update it.' : 'AI suggestions only fill this form. Save when you are ready.'}</span>
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit" disabled={saving || lookupsLoading || Boolean(lookupsError) || !fitmentsReady}>
            {saving ? 'Saving product…' : row || savedPartId ? 'Save product changes' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  );
}
