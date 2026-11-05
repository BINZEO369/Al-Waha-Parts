import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Al Waha Parts in Al Jubail',
  description: 'Contact Al Waha Parts for car parts, fitment help and booking support in Al Jubail, Eastern Province, Saudi Arabia.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Al Waha Parts in Al Jubail',
    description: 'Get automotive parts and fitment support in Al Jubail, Saudi Arabia.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
