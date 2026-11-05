import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Fitment Finder in Saudi Arabia',
  description: 'Find compatible car parts by make, model and year with Al Waha Parts vehicle fitment support in Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/vehicles' },
  openGraph: {
    title: 'Vehicle Fitment Finder | Al Waha Parts',
    description: 'Find the right automotive parts by vehicle make, model and year in Saudi Arabia.',
    url: '/vehicles',
  },
};

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
