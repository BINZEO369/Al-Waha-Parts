'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, supabase } from '../lib/auth';

const links: Array<[string, string, string, string]> = [
  ['/dashboard', 'Overview', '01', 'Live workspace'],
  ['/parts', 'Inventory', '02', 'Parts & stock'],
  ['/vehicles', 'Vehicles', '03', 'Fitment library'],
  ['/categories', 'Categories', '04', 'Catalog structure'],
  ['/bookings', 'Bookings', '05', 'Customer requests'],
  ['/admins', 'Admin access', '06', 'Team permissions'],
  ['/settings', 'Settings', '07', 'System health'],
  ['/banners', 'Hero banners', '08', 'Storefront hero'],
  ['/car-brands', 'Car brands', '09', 'Logo directory'],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(pathname !== '/login');
  const [adminName, setAdminName] = useState('Admin user');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (pathname === '/login') { setChecking(false); return; }
    let mounted = true;
    const client = supabase;
    async function verify() {
      if (!client) { setAuthError('Supabase authentication is not configured.'); setChecking(false); return; }
      const { data } = await client.auth.getSession();
      if (!data.session) { router.replace(`/login?next=${encodeURIComponent(pathname)}`); return; }
      try {
        await adminFetch<{ parts: number }>('/api/v1/admin/dashboard');
        if (mounted) { setAdminName(data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Admin user'); setChecking(false); }
      } catch (error) { if (mounted) setAuthError(error instanceof Error ? error.message : 'Admin access could not be verified.'); }
    }
    void verify();
    const listener = client?.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') router.replace('/login'); });
    return () => { mounted = false; listener?.data.subscription.unsubscribe(); };
  }, [pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (checking) return <div className="admin-loading" role="status" aria-live="polite"><div className="admin-loading-card"><div className="loading-mark"><span>AW</span><i /></div><div className="admin-loading-copy"><strong>Preparing your workspace</strong><span>Verifying secure access</span></div><div className="loading-progress"><b /></div></div></div>;
  if (authError) return <div className="admin-loading"><strong>{authError}</strong><Link className="primary-button" href="/login">Return to login</Link></div>;

  async function signOut() { await supabase?.auth.signOut(); router.replace('/login'); }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="brand-lockup" href="/dashboard"><span className="brand-mark">AW</span><span><strong>AL WAHA</strong><b>PARTS</b><small>OPERATIONS DESK</small></span></Link>
        <div className="nav-caption">Workspace</div>
        <nav className="admin-nav">{links.map(([href, label, number, detail]) => <Link className={pathname === href ? 'active' : ''} href={href} key={href}><span className="nav-number">{number}</span><span><strong>{label}</strong><small>{detail}</small></span></Link>)}</nav>
        <div className="sidebar-footer"><div className="admin-user"><div className="avatar">{adminName.slice(0, 1).toUpperCase()}</div><div><strong>{adminName}</strong><small>Verified admin</small></div></div><button className="sign-out" type="button" onClick={signOut}>Sign out ↗</button></div>
      </aside>
      <div className="mobile-topbar"><Link className="brand-lockup" href="/dashboard"><span className="brand-mark">AW</span><span><strong>AL WAHA</strong><b>PARTS</b></span></Link><span className="mobile-status"><i /> Live</span></div>
      <nav className="mobile-nav" aria-label="Admin sections">{links.map(([href, label, number]) => <Link className={pathname === href ? 'active' : ''} href={href} key={href}><span>{number}</span>{label}</Link>)}</nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
