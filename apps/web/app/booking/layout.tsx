import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Car Parts | Al Waha Parts',
  description: 'Submit a car parts booking for confirmation by the Al Waha Parts team in Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/booking' },
  robots: { index: false, follow: true },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
