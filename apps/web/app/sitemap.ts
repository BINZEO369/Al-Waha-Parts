import type { MetadataRoute } from 'next';
import { canonicalUrl, fetchPublicData } from '../lib/public-seo';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 200;
const MAX_ITEMS_PER_TYPE = 10_000;

type SlugRow = { slug?: string | null };
type BrandRow = { id?: string | null; slug?: string | null; manufacturer_name?: string | null };
type VehicleRow = {
  slug?: string | null;
  car_brand_id?: string | null;
  manufacturer_id?: string | null;
  manufacturer_name?: string | null;
};
type PartRow = { slug?: string | null };

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const collected: T[] = [];
  let offset = 0;

  while (offset < MAX_ITEMS_PER_TYPE) {
    const pageOffsets = Array.from(
      { length: Math.min(5, Math.ceil((MAX_ITEMS_PER_TYPE - offset) / PAGE_SIZE)) },
      (_, index) => offset + index * PAGE_SIZE,
    );
    const pages = await Promise.all(
      pageOffsets.map((pageOffset) =>
        fetchPublicData<T[]>(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${PAGE_SIZE}&offset=${pageOffset}`).catch(() => undefined),
      ),
    );

    for (const page of pages) {
      if (Array.isArray(page)) collected.push(...page);
    }

    const hasShortPage = pages.some((page) => !Array.isArray(page) || page.length < PAGE_SIZE);
    if (hasShortPage || pages.length === 0) break;
    offset += pages.length * PAGE_SIZE;
  }

  return collected.slice(0, MAX_ITEMS_PER_TYPE);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands, vehicles, products] = await Promise.all([
    fetchPublicData<SlugRow[]>('/api/v1/categories').catch(() => undefined),
    fetchPublicData<BrandRow[]>('/api/v1/car-brands').catch(() => undefined),
    fetchAllPages<VehicleRow>('/api/v1/vehicles'),
    fetchAllPages<PartRow>('/api/v1/parts'),
  ]);

  const brandById = new Map<string, string>();
  const brandByName = new Map<string, string>();
  for (const brand of brands ?? []) {
    if (!brand.slug) continue;
    if (brand.id) brandById.set(brand.id, brand.slug);
    if (brand.manufacturer_name) brandByName.set(brand.manufacturer_name.trim().toLowerCase(), brand.slug);
  }

  const paths = [
    '/',
    '/category',
    '/brands',
    '/contact',
    '/map',
    '/policies',
    '/policies/copyright-disclaimer',
    '/policies/customer-complaints-suggestions',
    '/policies/privacy-policy',
    '/policies/product-disclaimer',
    '/policies/return-refund-policy',
    '/policies/shipping-delivery',
    '/policies/terms-and-conditions',
    '/policies/trademark-disclaimer',
    '/policies/warranty-policy',
  ];

  for (const category of categories ?? []) {
    if (category.slug) paths.push(`/category/${encodeURIComponent(category.slug)}`);
  }
  for (const brand of brands ?? []) {
    if (brand.slug) paths.push(`/brands/${encodeURIComponent(brand.slug)}`);
  }
  for (const vehicle of vehicles) {
    if (!vehicle.slug) continue;
    const brandSlug = (vehicle.car_brand_id && brandById.get(vehicle.car_brand_id)) ||
      (vehicle.manufacturer_name && brandByName.get(vehicle.manufacturer_name.trim().toLowerCase()));
    if (brandSlug) {
      paths.push(`/brands/${encodeURIComponent(brandSlug)}/${encodeURIComponent(vehicle.slug)}`);
    }
  }
  for (const product of products) {
    if (product.slug) paths.push(`/products/${encodeURIComponent(product.slug)}`);
  }

  const uniquePaths = [...new Set(paths)].slice(0, 49_999);
  return uniquePaths.map((path) => ({ url: canonicalUrl(path) }));
}
