import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '../components/AdminShell';
import './globals.css';
export const metadata: Metadata = {
  title: 'Al Waha Parts — Operations',
  description: 'Al Waha Parts admin operations dashboard',
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
