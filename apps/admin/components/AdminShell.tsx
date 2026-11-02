'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, supabase } from '../lib/auth';

const links: Array<[string, string, string]> = [
  ['/dashboard', 'Overview', 'OV'],
  ['/parts', 'Parts', 'PT'],
  ['/vehicles', 'Vehicles', 'VH'],
  ['/categories', 'Categories', 'CT'],
  ['/bookings', 'Bookings', 'BK'],
  ['/admins', 'Admins', 'AD'],
  ['/settings', 'Settings', 'ST'],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(pathname !== '/login');
  const [adminName, setAdminName] = useState('Admin user');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (pathname === '/login') return;
    let mounted = true;
    const client = supabase;
    async function verify() {
      if (!client) { setAuthError('Supabase authentication is not configured.'); setChecking(false); return; }
      const { data } = await client.auth.getSession();
      if (!data.session) { router.replace('/login'); return; }
      try {
        await adminFetch<{ parts: number }>('/api/v1/admin/dashboard');
        if (mounted) setAdminName(data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Admin user');
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Admin access could not be verified.');
        await client.auth.signOut();
        router.replace('/login');
        return;
      }
      if (mounted) setChecking(false);
    }
    void verify();
    const listener = client?.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') router.replace('/login'); });
    return () => { mounted = false; listener?.data.subscription.unsubscribe(); };
  }, [pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (checking) return <div className="admin-loading"><div className="admin-loading-mark">AW</div><strong>Verifying secure access…</strong></div>;
  if (authError) return <div className="admin-loading"><strong>{authError}</strong><Link className="admin-button" href="/login">Return to login</Link></div>;

  async function signOut() { await supabase?.auth.signOut(); router.replace('/login'); }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/dashboard"><b>AL WAHA</b><span>PARTS</span><small>OPERATIONS DESK</small></Link>
        <div className="admin-sidebar-label">Workspace</div>
        <nav className="admin-nav">{links.map(([href, label, icon]) => <Link className={pathname === href ? 'active' : ''} href={href} key={href}><i>{icon}</i>{label}</Link>)}</nav>
        <div className="admin-user"><div className="avatar">{adminName.slice(0, 1).toUpperCase()}</div><div><strong>{adminName}</strong><small>Verified admin</small></div><button type="button" onClick={signOut} aria-label="Sign out">↗</button></div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
