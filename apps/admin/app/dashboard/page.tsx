'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookingsTable } from '../../components/BookingsTable';
import { MetricCard } from '../../components/MetricCard';
import { SectionHeader, InfoStrip } from '../../components/AdminSection';
import { adminFetch } from '../../lib/auth';

type DashboardData = { parts: number; vehicles: number; bookings: number; active_admins: number };

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { adminFetch<DashboardData>('/api/v1/admin/dashboard').then(setData).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.')); }, []);
  return (
    <div className="admin-page">
      <SectionHeader eyebrow="Operations overview" title="Good morning, parts desk." description="A live view of your catalog, customer requests, and access-controlled operations." action="Add new part" actionHref="/parts" />
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <section className="metric-grid" aria-label="Live totals">
        <MetricCard label="Parts indexed" value={data?.parts ?? '—'} note="Live catalog records" />
        <MetricCard label="Active vehicles" value={data?.vehicles ?? '—'} note="Fitment library" accent="dark" />
        <MetricCard label="All bookings" value={data?.bookings ?? '—'} note="Customer requests" />
        <MetricCard label="Active admins" value={data?.active_admins ?? '—'} note="Verified access" accent="dark" />
      </section>
      <section className="content-section"><div className="section-title"><div><span className="eyebrow"><b>05</b>Customer requests</span><h2>Recent booking queue</h2><p>Review the latest requests before they become delays.</p></div><Link className="text-button" href="/bookings">View all bookings ↗</Link></div><BookingsTable /></section>
      <section className="overview-grid"><article className="feature-panel"><span className="eyebrow">Catalog control</span><h2>Keep every product record accurate.</h2><p>Edit prices, stock, fitment, visibility, and customer-facing content from one focused operations desk.</p><Link className="light-button" href="/parts">Open inventory <span>↗</span></Link></article><article className="health-panel"><span className="eyebrow">System health</span><h2>Everything connected.</h2><InfoStrip label="API access">Protected and responding</InfoStrip><InfoStrip label="Supabase Auth">Connected and verified</InfoStrip><InfoStrip label="Admin database">Live production records</InfoStrip></article></section>
    </div>
  );
}
