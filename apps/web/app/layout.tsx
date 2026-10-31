import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Header, Footer } from '../components/Header';
import './globals.css';
export const metadata: Metadata = {
  title: 'Al Waha Parts — New Car Parts in UAE',
  description: 'Shop quality automotive parts, wheels, brakes and suspension with fitment support across the UAE.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
