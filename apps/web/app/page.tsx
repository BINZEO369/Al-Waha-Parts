import type { Metadata } from 'next';
import HomeClient, { type HomeInitialData } from './HomeClient';
import { canonicalUrl, fetchPublicData } from '../lib/public-seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Car Parts in Al Jubail, Saudi Arabia',
  description: 'Browse automotive parts by category, brand and vehicle model, with fitment support from Al Waha Parts in Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Car Parts in Al Jubail, Saudi Arabia | Al Waha Parts',
    description: 'Browse automotive parts by category, brand and vehicle model, with fitment support in Al Jubail.',
    url: canonicalUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Parts in Al Jubail, Saudi Arabia | Al Waha Parts',
    description: 'Browse automotive parts by category, brand and vehicle model with fitment support.',
  },
};

type Banner = HomeInitialData['banners'][number];
type Category = HomeInitialData['popularCategories'][number];
type Part = HomeInitialData['parts'][number];
type Vehicle = HomeInitialData['vehicles'][number];
type CarBrand = HomeInitialData['carBrands'][number];

export default async function HomePage() {
  const [banners, carBrands, popularCategories, parts, vehicles] = await Promise.all([
    fetchPublicData<Banner[]>('/api/v1/banners').catch(() => undefined),
    fetchPublicData<CarBrand[]>('/api/v1/car-brands').catch(() => undefined),
    fetchPublicData<Category[]>('/api/v1/popular-categories?limit=6').catch(() => undefined),
    fetchPublicData<Part[]>('/api/v1/parts?limit=12&featured_only=true').catch(() => undefined),
    fetchPublicData<Vehicle[]>('/api/v1/homepage-selected-vehicles?limit=18').catch(() => undefined),
  ]);

  const loaded = [banners, carBrands, popularCategories, parts, vehicles].every(Array.isArray);
  const initialData: HomeInitialData = {
    banners: Array.isArray(banners) ? banners : [],
    carBrands: Array.isArray(carBrands) ? carBrands : [],
    popularCategories: Array.isArray(popularCategories) ? popularCategories : [],
    parts: Array.isArray(parts) ? parts : [],
    vehicles: Array.isArray(vehicles) ? vehicles : [],
    loaded,
  };

  return <HomeClient initialData={initialData} />;
}
