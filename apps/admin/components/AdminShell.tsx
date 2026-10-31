'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
const links: Array<[string, string]> = [
  ['/dashboard', 'Overview'],
  ['/parts', 'Parts'],
  ['/vehicles', 'Vehicles'],
  ['/categories', 'Categories'],
  ['/bookings', 'Bookings'],
  ['/admins', 'Admins'],
  ['/settings', 'Settings'],
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          AL WAHA <span>PARTS</span>
          <small>OPERATIONS</small>
        </Link>
        <nav className="admin-nav">
          {links.map(([href, label]) => (
            <Link className={pathname === href ? 'active' : ''} href={href} key={href}>
              <i>{label?.slice(0, 1)}</i>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-user">
          <div className="avatar">A</div>
          <div>
            <strong>Parts desk</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
