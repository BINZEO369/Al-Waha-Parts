import type { Metadata } from 'next';
import BrandDirectoryClient, { type Brand } from './ClientView';
import { canonicalUrl, fetchPublicData } from '../../lib/public-seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Car Brands and Vehicle Models',
  description: 'Browse vehicle brands and their listed models in the Al Waha Parts catalog for Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/brands' },
  openGraph: {
    title: 'Car Brands and Vehicle Models | Al Waha Parts',
    description: 'Browse available vehicle brands and models in the Al Waha Parts catalog.',
    url: canonicalUrl('/brands'),
  },
};

export default async function BrandsPage() {
  const data = await fetchPublicData<Brand[]>('/api/v1/car-brands').catch(() => undefined);
  return <BrandDirectoryClient initialBrands={Array.isArray(data) ? data : null} />;
}
