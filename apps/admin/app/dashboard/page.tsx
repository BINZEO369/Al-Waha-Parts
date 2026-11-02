'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookingsTable } from '../../components/BookingsTable';
import { MetricCard } from '../../components/MetricCard';
import { adminFetch } from '../../lib/auth';

type DashboardData = { parts: number; vehicles: number; bookings: number; active_admins: number };

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { adminFetch<DashboardData>('/api/v1/admin/dashboard').then(setData).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.')); }, []);
  return (
    <div className="admin-page">
      <header className="admin-topbar"><div><span className="admin-kicker">Operations overview</span><h1>Good morning, parts desk.</h1><p className="admin-subtitle">Live inventory and customer activity from Supabase.</p></div><Link className="admin-button" href="/parts">+ Add new part</Link></header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <div className="metrics">
        <MetricCard label="Parts indexed" value={data?.parts ?? '—'} note="Live database count" />
        <MetricCard label="Active vehicles" value={data?.vehicles ?? '—'} note="Fitment records" />
        <MetricCard label="All bookings" value={data?.bookings ?? '—'} note="Customer requests" />
        <MetricCard label="Active admins" value={data?.active_admins ?? '—'} note="Access-controlled users" />
      </div>
      <section className="admin-section"><div className="section-heading"><div><span className="admin-kicker">Live queue</span><h2>Recent booking requests</h2></div><Link href="/bookings">View all →</Link></div><BookingsTable /></section>
      <section className="admin-lower"><div className="insight-card"><span className="admin-kicker">Catalog control</span><h2>Keep every product record accurate.</h2><p>Edit prices, stock, fitment, visibility and customer-facing content directly from the operations desk.</p><Link className="admin-button" href="/parts">Open inventory →</Link></div><div className="activity-card"><span className="admin-kicker">Security status</span><div className="system-line"><i className="online-dot" /> API access <b>Protected</b></div><div className="system-line"><i className="online-dot" /> Supabase Auth <b>Connected</b></div><div className="system-line"><i className="online-dot" /> Admin database <b>Live</b></div></div></section>
    </div>
  );
}
