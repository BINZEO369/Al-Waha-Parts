'use client';

import { useCallback, useEffect, useState } from 'react';
import { MetricCard } from '../../components/MetricCard';
import { SectionHeader } from '../../components/AdminSection';
import { adminFetch } from '../../lib/auth';

type Breakdown = { label: string; count: number };
type AnalyticsData = {
  days: number;
  totals: { sessions: number; page_views: number; active_last_30m: number };
  sample_sizes: { sessions: number; events: number };
  top_pages: Array<{ path: string; views: number }>;
  countries: Breakdown[];
  locations: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  recent_sessions: Array<{
    session_ref: string;
    started_at: string;
    last_seen_at: string;
    duration_ms: number;
    landing_path: string;
    current_path: string | null;
    exit_path: string | null;
    referrer: string | null;
    ip_address: string | null;
    country_code: string | null;
    region: string | null;
    city: string | null;
    device_type: string | null;
    device_model: string | null;
    browser: string | null;
    operating_system: string | null;
    language: string | null;
    timezone: string | null;
  }>;
  recent_events: Array<{
    session_ref: string;
    event_name: string;
    page_path: string;
    page_title: string | null;
    referrer: string | null;
    duration_ms: number | null;
    created_at: string;
  }>;
};

const number = new Intl.NumberFormat('en');
const dateTime = (value: string) => new Date(value).toLocaleString();
const duration = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  const seconds = Math.floor(value / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

function BreakdownPanel({ title, note, rows }: { title: string; note: string; rows: Breakdown[] }) {
  return (
    <section className="content-section analytics-panel">
      <div className="section-title"><div><span className="eyebrow">Consent-based sample</span><h2>{title}</h2><p>{note}</p></div></div>
      {rows.length ? (
        <div className="analytics-breakdown">
          {rows.map((row) => (
            <div className="analytics-breakdown-row" key={row.label}>
              <span title={row.label}>{row.label}</span><strong>{number.format(row.count)}</strong>
            </div>
          ))}
        </div>
      ) : <div className="empty-table-state">No consented analytics data for this period.</div>}
    </section>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminFetch<AnalyticsData>(`/api/v1/admin/analytics?days=${days}`);
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analytics could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [days, reloadKey]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Consented storefront visits"
        title="Analytics & journeys"
        description="Review page paths, visit timing, coarse location, and browser/device categories only from visitors who chose Allow."
      />
      <div className="analytics-toolbar">
        <label htmlFor="analytics-period">Reporting period</label>
        <select id="analytics-period" value={days} onChange={(event) => setDays(Number(event.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
        <button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="admin-alert" role="alert"><span>{error}</span> <button className="text-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button></div>}
      {loading && !data ? <div className="empty-table-state" role="status">Loading consented analytics…</div> : null}
      {data && (
        <>
          <section className="metric-grid" aria-label="Analytics totals">
            <MetricCard label="Consented sessions" value={number.format(data.totals.sessions)} note={`Last ${data.days} days`} />
            <MetricCard label="Page views" value={number.format(data.totals.page_views)} note="Recorded after Allow" accent="dark" />
            <MetricCard label="Active, last 30 min" value={number.format(data.totals.active_last_30m)} note="Based on recent event activity" />
          </section>
          <p className="analytics-disclaimer">Raw IP addresses and raw user-agent strings are not stored in analytics tables. Location is approximate and can be unavailable. Breakdowns use up to the latest {number.format(data.sample_sizes.sessions)} sessions and page rankings use up to {number.format(data.sample_sizes.events)} recent events; headline totals are exact.</p>
          <div className="analytics-overview-grid">
            <BreakdownPanel title="Top pages" note="Most viewed paths in the recent event sample." rows={data.top_pages.map((row) => ({ label: row.path, count: row.views }))} />
            <BreakdownPanel title="Countries & locations" note="Approximate hosting-proxy location, when available." rows={data.locations} />
            <BreakdownPanel title="Devices & operating systems" note="Coarse categories inferred from browser data." rows={data.devices} />
            <BreakdownPanel title="Browsers" note="Browser family inferred from the request header." rows={data.browsers} />
          </div>
          <section className="content-section">
            <div className="section-title"><div><span className="eyebrow">Journey snapshots</span><h2>Recent sessions</h2><p>Landing, latest page, last exit, source, device and elapsed session time.</p></div><span className="section-meta">Showing {data.recent_sessions.length} of {number.format(data.totals.sessions)}</span></div>
            {data.recent_sessions.length ? (
              <div className="data-table analytics-table">
                <div className="analytics-table-head analytics-session-grid"><span>Started / session</span><span>Landing → current</span><span>Exit / duration</span><span>Location / IP</span><span>Device / browser</span><span>Referrer</span></div>
                {data.recent_sessions.map((session) => (
                  <div className="analytics-table-row analytics-session-grid" key={session.session_ref}>
                    <span><strong>{dateTime(session.started_at)}</strong><small>Session {session.session_ref}</small></span>
                    <span><strong>{session.landing_path}</strong><small>→ {session.current_path || 'Unknown'}</small></span>
                    <span><strong>{session.exit_path || 'Still active / not recorded'}</strong><small>{duration(session.duration_ms)}</small></span>
                    <span><strong>{[session.city, session.region, session.country_code].filter(Boolean).join(', ') || 'Unknown'}</strong><small>{session.ip_address || 'IP unavailable'} · {session.timezone || 'Timezone unavailable'}</small></span>
                    <span><strong>{[session.device_type, session.operating_system, session.device_model].filter(Boolean).join(' · ') || 'Unknown'}</strong><small>{session.browser || 'Unknown'}{session.language ? ` · ${session.language}` : ''}</small></span>
                    <span><strong>{session.referrer || 'Direct / unavailable'}</strong><small>Last seen {dateTime(session.last_seen_at)}</small></span>
                  </div>
                ))}
              </div>
            ) : <div className="empty-table-state">No consented sessions yet. Page tracking starts only after a visitor selects Allow.</div>}
          </section>
          <section className="content-section">
            <div className="section-title"><div><span className="eyebrow">Page navigation log</span><h2>Recent page events</h2><p>Page views and exits, ordered by the time the API received them.</p></div><span className="section-meta">Latest {data.recent_events.length}</span></div>
            {data.recent_events.length ? (
              <div className="data-table analytics-table">
                <div className="analytics-table-head analytics-event-grid"><span>Time</span><span>Event</span><span>Page</span><span>Session</span><span>Time on page</span><span>Referrer</span></div>
                {data.recent_events.map((event, index) => (
                  <div className="analytics-table-row analytics-event-grid" key={`${event.session_ref}-${event.created_at}-${index}`}>
                    <span>{dateTime(event.created_at)}</span><span>{event.event_name === 'page_view' ? 'Page view' : 'Page exit'}</span><span title={event.page_title || undefined}>{event.page_path}</span><span>{event.session_ref}</span><span>{duration(event.duration_ms)}</span><span>{event.referrer || 'Direct / unavailable'}</span>
                  </div>
                ))}
              </div>
            ) : <div className="empty-table-state">No page events recorded in this period.</div>}
          </section>
        </>
      )}
    </div>
  );
}
