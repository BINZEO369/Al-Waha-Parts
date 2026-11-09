import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BrandModelClientView, {
  type BrandDetail,
  type BrandModelDetail,
  type VehicleDetail,
} from './ClientView';
import { canonicalUrl, fetchPublicData } from '../../../../lib/public-seo';

type PageProps = { params: Promise<{ slug: string; modelSlug: string }> };

async function loadModelDetail(brandSlug: string, modelSlug: string): Promise<BrandModelDetail | null | undefined> {
  const brandDetail = await fetchPublicData<BrandDetail>(
    `/api/v1/car-brands/slug/${encodeURIComponent(brandSlug)}`,
  );
  if (brandDetail === null || brandDetail === undefined) return brandDetail;

  const model = brandDetail.vehicles.find((vehicle) => vehicle.slug === modelSlug);
  if (!model) return null;

  const vehicleDetail = await fetchPublicData<VehicleDetail>(
    `/api/v1/vehicles/slug/${encodeURIComponent(modelSlug)}`,
  );
  if (vehicleDetail === null || vehicleDetail === undefined) return vehicleDetail;

  const manufacturerId = vehicleDetail.vehicle.car_brand_id || vehicleDetail.vehicle.manufacturer_id;
  if (
    vehicleDetail.vehicle.id !== model.id ||
    (manufacturerId && manufacturerId !== brandDetail.brand.id)
  ) {
    return null;
  }

  const vehicle: BrandModelDetail['vehicle'] = {
    ...model,
    ...vehicleDetail.vehicle,
    manufacturer_name:
      vehicleDetail.vehicle.manufacturer_name || model.manufacturer_name || brandDetail.brand.manufacturer_name,
    manufacturer_logo:
      vehicleDetail.vehicle.manufacturer_logo || model.manufacturer_logo || brandDetail.brand.logo_url,
    car_brand_id: manufacturerId || model.car_brand_id || brandDetail.brand.id,
  };

  return { brand: brandDetail.brand, vehicle, parts: vehicleDetail.parts };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, modelSlug } = await params;
  const detail = await loadModelDetail(slug, modelSlug);
  const title = detail
    ? `${detail.vehicle.manufacturer_name} ${detail.vehicle.model_name}`.trim()
    : modelSlug.replace(/-/g, ' ');
  const yearRange = detail?.vehicle.year_start && detail.vehicle.year_end
    ? ` (${detail.vehicle.year_start}–${detail.vehicle.year_end})`
    : '';
  const description = detail
    ? `Vehicle specifications and compatible parts for ${title}${yearRange} in the Al Waha Parts catalog, Al Jubail, Saudi Arabia.`
    : `Vehicle specifications and compatible car parts for ${title} in the Al Waha Parts catalog.`;
  const canonical = canonicalUrl(`/brands/${encodeURIComponent(detail?.brand.slug || slug)}/${encodeURIComponent(detail?.vehicle.slug || modelSlug)}`);

  return {
    title: `${title} Parts & Fitment`,
    description,
    alternates: { canonical },
    ...(detail === null ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${title} Parts & Fitment | Al Waha Parts`,
      description,
      url: canonical,
      ...(detail?.vehicle.cover_image_url ? { images: [{ url: detail.vehicle.cover_image_url, alt: title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title: `${title} Parts & Fitment | Al Waha Parts`, description },
  };
}

export default async function BrandModelPage({ params }: PageProps) {
  const { slug, modelSlug } = await params;
  const detail = await loadModelDetail(slug, modelSlug);
  if (detail === null) notFound();
  return <BrandModelClientView key={`${slug}/${modelSlug}`} slug={slug} modelSlug={modelSlug} initialDetail={detail ?? null} />;
}
