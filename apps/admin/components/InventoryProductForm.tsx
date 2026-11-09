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
  brand_name: string | null;
  description: string | null;
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
  keywords: string[];
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
  const tags = row?.tags;
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
    condition: rowText(row, 'condition', 'new') || 'new',
    tested_status: rowText(row, 'tested_status', 'not_tested') || 'not_tested',
    position: rowText(row, 'position', '0'),
    sort_order: rowText(row, 'sort_order', '0'),
    min_order_quantity: rowText(row, 'min_order_quantity', '1'),
    reorder_level: rowText(row, 'reorder_level', '0'),
    warranty_months: rowText(row, 'warranty_months'),
    storage_location: rowText(row, 'storage_location'),
    tags: Array.isArray(tags) ? tags.join(', ') : rowText(row, 'tags'),
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

function parseStringList(value: string) {
  return [...new Set(value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean))];
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
  const [seoOpen, setSeoOpen] = useState(false);

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
    if (aiSuggestion.brand_name)
      cards.push({ key: 'brand', label: 'Brand on product', value: aiSuggestion.brand_name, available: true });
    if (aiSuggestion.description)
      cards.push({ key: 'description', label: 'Product description', value: aiSuggestion.description, available: true });
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
    if (aiSuggestion.manufacturer_name)
      cards.push({
        key: 'manufacturer',
        label: 'Product manufacturer',
        value: aiSuggestion.manufacturer_name,
        hint: suggestedManufacturer ? 'Matched to the live manufacturer list.' : 'No exact live match; select a company manually.',
        available: Boolean(suggestedManufacturer),
      });
    if (aiSuggestion.manufacturer_name || aiSuggestion.model_name || aiSuggestion.compatible_years.length) {
      const compatibleLabel = [
        aiSuggestion.manufacturer_name,
        aiSuggestion.model_name,
        aiSuggestion.compatible_years.length ? aiSuggestion.compatible_years.join(', ') : '',
      ].filter(Boolean).join(' · ');
      const compatibilityCanApply = Boolean(suggestedModel);
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
    if (aiSuggestion.seo_title || aiSuggestion.seo_description)
      cards.push({
        key: 'seo',
        label: 'SEO metadata',
        value: [aiSuggestion.seo_title, aiSuggestion.seo_description].filter(Boolean).join(' · '),
        available: true,
      });
    if (aiSuggestion.keywords.length)
      cards.push({ key: 'tags', label: 'Search tags', value: aiSuggestion.keywords.join(', '), available: true });
    return cards;
  }, [aiSuggestion, suggestedCategory, suggestedManufacturer, suggestedModel]);

  async function requestAiSuggestions() {
    setAiError('');
    setAiResult(null);
    setAppliedFields([]);
    const imageUrls = parseImageUrls(String(values.image_urls ?? ''));
    const analysisImage = String(values.primary_image_url ?? '').trim() || imageUrls[0] || '';
    if (!String(values.part_name).trim() && !analysisImage) {
      setAiError('Enter a product name or upload a product image first.');
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
          image_url: analysisImage,
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
      setAppliedFields(applyAllSuggestions(result.suggestion, true));
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : 'Unable to load AI suggestions.');
    } finally {
      setAiLoading(false);
    }
  }

  function applyAllSuggestions(suggestion: ProductSuggestion, onlyEmpty: boolean) {
    const updates: Record<string, string> = {};
    const applied: string[] = [];
    const canFill = (field: string) => !onlyEmpty || !String(values[field] ?? '').trim();
    const add = (field: string, key: string, value: string | null | undefined) => {
      if (value?.trim() && canFill(field)) { updates[field] = value.trim(); applied.push(key); }
    };
    add('part_name', 'title', suggestion.product_title);
    if (suggestion.product_title && canFill('slug') && !slugManuallyEdited) {
      updates.slug = slugify(suggestion.product_title);
      applied.push('title');
    }
    add('brand_name', 'brand', suggestion.brand_name);
    add('description', 'description', suggestion.description);
    add('part_number', 'part_number', suggestion.part_number);
    add('oem_number', 'oem', suggestion.oem_numbers.length ? suggestion.oem_numbers.join(', ') : null);
    add('condition', 'condition', suggestion.condition);
    add('seo_title', 'seo', suggestion.seo_title);
    add('seo_description', 'seo', suggestion.seo_description);
    add('tags', 'tags', suggestion.keywords.length ? suggestion.keywords.join(', ') : null);

    const matchedCategory = suggestion.category_name
      ? lookups.categories.find((option) => normalizeName(option.category_name) === normalizeName(suggestion.category_name ?? ''))
      : undefined;
    const matchedManufacturer = suggestion.manufacturer_name
      ? lookups.manufacturers.find((option) => normalizeName(option.manufacturer_name) === normalizeName(suggestion.manufacturer_name ?? ''))
      : undefined;
    if (matchedCategory && canFill('category_id')) {
      updates.category_id = matchedCategory.id;
      applied.push('category');
    }
    if (matchedManufacturer && canFill('manufacturer_id')) {
      updates.manufacturer_id = matchedManufacturer.id;
      applied.push('manufacturer');
    }

    const matchedModels = suggestion.model_name
      ? lookups.models.filter((option) =>
          normalizeName(option.model_name) === normalizeName(suggestion.model_name ?? '') &&
          (!matchedManufacturer || option.manufacturer_id === matchedManufacturer.id),
        )
      : [];
    const matchedModel = matchedModels.length === 1 ? matchedModels[0] : undefined;
    if (matchedModel && (!onlyEmpty || fitments.every((fitment) => !fitment.model_id))) {
      const modelId = matchedModel.id;
      const blankIndex = fitments.findIndex((fitment) => !fitment.model_id);
      setFitments((current) => {
        const targetIndex = blankIndex >= 0 ? blankIndex : current.length;
        const draft = { manufacturer_id: matchedModel.manufacturer_id, model_id: modelId, years_text: suggestion.compatible_years.join(', ') };
        return targetIndex < current.length
          ? current.map((fitment, index) => index === targetIndex ? draft : fitment)
          : [...current, draft];
      });
      applied.push('fitment');
    }
    if (Object.keys(updates).length) setValues((current) => ({ ...current, ...updates }));
    if (applied.includes('seo')) setSeoOpen(true);
    return [...new Set(applied)];
  }

  function applySuggestion(key: string) {
    if (!aiSuggestion) return;
    if (key === 'fitment') {
      if (!suggestedModel) return;
      const yearsText = aiSuggestion.compatible_years.join(', ');
      setFitments((current) => {
        const existingIndex = current.findIndex((fitment) => fitment.model_id === suggestedModel.id);
        const targetIndex = existingIndex >= 0 ? existingIndex : current.findIndex((fitment) => !fitment.model_id);
        const draft = { manufacturer_id: suggestedModel.manufacturer_id, model_id: suggestedModel.id, years_text: yearsText };
        return targetIndex >= 0
          ? current.map((fitment, index) => index === targetIndex ? draft : fitment)
          : [...current, draft];
      });
    } else if (key === 'title' && aiSuggestion.product_title) {
      setValue('part_name', aiSuggestion.product_title);
      if (!slugManuallyEdited) setValue('slug', slugify(aiSuggestion.product_title));
    } else if (key === 'brand' && aiSuggestion.brand_name) {
      setValue('brand_name', aiSuggestion.brand_name);
    } else if (key === 'description' && aiSuggestion.description) {
      setValue('description', aiSuggestion.description);
    } else if (key === 'part_number' && aiSuggestion.part_number) {
      setValue('part_number', aiSuggestion.part_number);
    } else if (key === 'oem' && aiSuggestion.oem_numbers.length) {
      setValue('oem_number', aiSuggestion.oem_numbers.join(', '));
    } else if (key === 'category' && suggestedCategory) {
      setValue('category_id', suggestedCategory.id);
    } else if (key === 'manufacturer' && suggestedManufacturer) {
      setValue('manufacturer_id', suggestedManufacturer.id);
    } else if (key === 'condition' && aiSuggestion.condition) {
      setValue('condition', aiSuggestion.condition);
    } else if (key === 'seo') {
      if (aiSuggestion.seo_title) setValue('seo_title', aiSuggestion.seo_title);
      if (aiSuggestion.seo_description) setValue('seo_description', aiSuggestion.seo_description);
      setSeoOpen(true);
    } else if (key === 'tags' && aiSuggestion.keywords.length) {
      setValue('tags', aiSuggestion.keywords.join(', '));
    }
    setAppliedFields((current) => [...new Set([...current, key])]);
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
    const integerFields = {
      position: { value: Number(values.position || 0), label: 'Display position', minimum: 0 },
      sort_order: { value: Number(values.sort_order || 0), label: 'Storefront sort order', minimum: 0 },
      min_order_quantity: { value: Number(values.min_order_quantity || 1), label: 'Minimum order quantity', minimum: 1 },
      reorder_level: { value: Number(values.reorder_level || 0), label: 'Reorder level', minimum: 0 },
    };
    for (const field of Object.values(integerFields)) {
      if (!Number.isInteger(field.value) || field.value < field.minimum) {
        setError(`${field.label} must be a whole number of ${field.minimum} or greater.`);
        return;
      }
    }
    const warrantyText = String(values.warranty_months ?? '').trim();
    const warrantyMonths = warrantyText ? Number(warrantyText) : null;
    if (warrantyMonths !== null && (!Number.isInteger(warrantyMonths) || warrantyMonths < 0)) {
      setError('Warranty must be a whole number of 0 months or greater.');
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
    const textOrNull = (key: string) => String(values[key] ?? '').trim() || null;
    const payload: Record<string, unknown> = {
      part_name: partName,
      slug,
      sku,
      category_id: values.category_id,
      manufacturer_id: textOrNull('manufacturer_id'),
      brand_name: textOrNull('brand_name'),
      part_number: textOrNull('part_number'),
      oem_number: textOrNull('oem_number'),
      description: textOrNull('description'),
      condition: values.condition || 'new',
      tested_status: values.tested_status || 'not_tested',
      price,
      sale_price: salePrice,
      stock_quantity: stockQuantity,
      position: integerFields.position.value,
      sort_order: integerFields.sort_order.value,
      min_order_quantity: integerFields.min_order_quantity.value,
      reorder_level: integerFields.reorder_level.value,
      warranty_months: warrantyMonths,
      storage_location: textOrNull('storage_location'),
      currency: values.currency || 'SAR',
      status: values.status || 'active',
      is_featured: Boolean(values.is_featured),
      tags: parseStringList(String(values.tags ?? '')),
      primary_image_url: textOrNull('primary_image_url'),
      image_urls: parseImageUrls(String(values.image_urls ?? '')),
      seo_title: textOrNull('seo_title'),
      seo_description: textOrNull('seo_description'),
      model_id: firstFitment?.model_id ?? null,
      compatible_years: firstFitment?.compatible_years ?? [],
    };

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
        {row && (
          <div className="inventory-record-meta">
            <span><b>Record ID</b><code>{row.id}</code></span>
            <span><b>Created</b><time>{rowText(row, 'created_at', '—')}</time></span>
            <span><b>Last updated</b><time>{rowText(row, 'updated_at', '—')}</time></span>
            <small>System-generated fields are read-only.</small>
          </div>
        )}

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
          <fieldset className="inventory-composer-main inventory-main-fieldset" disabled={aiLoading} aria-busy={aiLoading}>
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
                <div><small>COMMERCIAL DETAILS</small><h4>Price & availability</h4><p>Existing amounts retain their stored currency; new inventory defaults to Saudi riyals.</p></div>
              </div>
              <div className="inventory-form-grid">
                <label className="form-field">
                  <span>Price ({String(values.currency || 'SAR')}) *</span>
                  <input type="number" min="0" step="0.01" value={String(values.price)} onChange={(event) => setValue('price', event.target.value)} placeholder="0.00" required />
                </label>
                <label className="form-field">
                  <span>Sale price ({String(values.currency || 'SAR')})</span>
                  <input type="number" min="0" step="0.01" value={String(values.sale_price)} onChange={(event) => setValue('sale_price', event.target.value)} placeholder="Optional" />
                </label>
                <label className="form-field">
                  <span>Stock quantity</span>
                  <input type="number" min="0" step="1" value={String(values.stock_quantity)} onChange={(event) => setValue('stock_quantity', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Minimum order quantity</span>
                  <input type="number" min="1" step="1" value={String(values.min_order_quantity)} onChange={(event) => setValue('min_order_quantity', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Reorder level</span>
                  <input type="number" min="0" step="1" value={String(values.reorder_level)} onChange={(event) => setValue('reorder_level', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Status</span>
                  <select value={String(values.status)} onChange={(event) => setValue('status', event.target.value)}>
                    {['active', 'draft', 'inactive', 'out_of_stock'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Condition</span>
                  <select value={String(values.condition)} onChange={(event) => setValue('condition', event.target.value)}>
                    {['new', 'used', 'refurbished', 'damaged'].map((condition) => <option key={condition} value={condition}>{condition.replace(/_/g, ' ')}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Tested status</span>
                  <select value={String(values.tested_status)} onChange={(event) => setValue('tested_status', event.target.value)}>
                    {['not_tested', 'tested', 'failed'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Display position</span>
                  <input type="number" min="0" step="1" value={String(values.position)} onChange={(event) => setValue('position', event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Storefront sort order</span>
                  <input type="number" min="0" step="1" value={String(values.sort_order)} onChange={(event) => setValue('sort_order', event.target.value)} />
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
                <div className="inventory-currency-lock"><span>Currency</span><strong>{String(values.currency || 'SAR')}</strong><small>{String(values.currency || 'SAR') === 'SAR' ? 'Saudi Riyal · default' : 'Existing stored currency · preserved'}</small></div>
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
                <label className="form-field inventory-field-wide">
                  <span>Search tags <small>Separate tags with commas</small></span>
                  <textarea rows={2} value={String(values.tags)} onChange={(event) => setValue('tags', event.target.value)} placeholder="brakes, ceramic, front" />
                </label>
              </div>
            </section>

            <details className="inventory-seo-section" open={seoOpen} onToggle={(event) => setSeoOpen(event.currentTarget.open)}>
              <summary><span><b>05</b> Search and SEO details</span><small>Optional · AI can draft these</small></summary>
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
          </fieldset>

          <aside className="inventory-ai-column">
            <section className="inventory-ai-card" aria-labelledby="inventory-ai-title">
              <div className="inventory-ai-topline"><span className="inventory-ai-mark">AI</span><span className="inventory-ai-protection">REVIEW BEFORE SAVE</span></div>
              <h4 id="inventory-ai-title">Catalog assistant</h4>
              <p>Analyze the uploaded image and details. One click fills supported blank fields; your existing entries stay untouched. Nothing is saved until you press Save.</p>
              <button className="primary-button inventory-ai-button" type="button" disabled={aiLoading || lookupsLoading || Boolean(lookupsError)} onClick={() => void requestAiSuggestions()}>
                {aiLoading ? 'Analyzing image & details…' : aiResult ? 'Analyze again & fill blanks' : 'Analyze image & fill fields'}
              </button>
              {aiError && <div className="admin-alert inventory-ai-error" role="alert">{aiError}</div>}
              {aiLoading && <div className="inventory-ai-loading" role="status"><span className="loading-spinner" /> Checking text and uploaded image…</div>}
              {aiResult && (
                <div className="inventory-ai-results">
                  <p className="inventory-ai-autofill" role="status">
                    {appliedFields.length
                      ? `Filled ${appliedFields.length} suggestion group${appliedFields.length === 1 ? '' : 's'} into empty fields. Review them before saving.`
                      : 'No safe suggestions matched empty fields. Review any available suggestions below.'}
                    {' '}SKU, price, inventory, tested status and uncertain vehicle fitment still require your confirmation.
                  </p>
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
                  <small className="inventory-ai-footer">Preview recorded{aiResult.run_id ? ` · ${aiResult.run_id.slice(0, 8)}` : ''}. AI fills this draft only; final save remains manual.</small>
                </div>
              )}
            </section>
            <div className="inventory-ai-reminder"><b>Live database choices</b><span>Category, manufacturer and model links are applied only when matched to the database. Image evidence may not reveal part numbers or compatibility.</span></div>
          </aside>
        </div>

        {error && <div className="admin-alert inventory-form-error" role="alert">{error}</div>}
        <div className="modal-actions inventory-modal-actions">
          <span className="inventory-save-note">{savedPartId && !row ? 'A draft record already exists; saving again will update it.' : 'AI suggestions only fill this form. Save when you are ready.'}</span>
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit" disabled={saving || aiLoading || lookupsLoading || Boolean(lookupsError) || !fitmentsReady}>
            {saving ? 'Saving product…' : row || savedPartId ? 'Save product changes' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  );
}
