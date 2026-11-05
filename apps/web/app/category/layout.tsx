import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Parts Catalog in Al Jubail',
  description: 'Browse brakes, filters, suspension, wheels and replacement car parts available in the Al Waha Parts catalog for Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/category' },
  openGraph: {
    title: 'Car Parts Catalog in Al Jubail | Al Waha Parts',
    description: 'Browse automotive parts and find the right fit in Al Jubail, Saudi Arabia.',
    url: '/category',
  },
};

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
