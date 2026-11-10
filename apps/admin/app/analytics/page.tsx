'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MetricCard } from '../../components/MetricCard';
import { SectionHeader } from '../../components/AdminSection';
import { adminFetch } from '../../lib/auth';

type Breakdown = { label: string; count: number };
type AnalyticsData = {
  days: number;
  totals: { sessions: number; page_views: number; previous_sessions: number; previous_page_views: number; active_last_30m: number; unique_visitors: number; returning_visitors: number };
  sample_sizes: { sessions: number; events: number };
  hourly_activity: Array<{ hour_start: string; page_views: number; page_exits: number; sessions: number }>;
  top_pages: Array<{ path: string; views: number }>;
  countries: Breakdown[];
  locations: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  acquisition_sources: Breakdown[];
  acquisition_mediums: Breakdown[];
  visitors: Array<{
    visitor_ref: string; first_seen_at: string; last_seen_at: string; visit_count: number; total_page_views: number;
    first_landing_path: string | null; last_path: string | null; first_referrer: string | null;
    first_acquisition_source: string | null; first_acquisition_medium: string | null; first_acquisition_campaign: string | null;
    country_code: string | null; region: string | null; city: string | null; device_type: string | null;
    device_model: string | null; browser: string | null; operating_system: string | null; language: string | null;
    timezone: string | null; last_session_ref: string | null;
  }>;
  recent_sessions: Array<{
    session_ref: string;
    visitor_ref: string;
    acquisition_source: string; acquisition_medium: string; acquisition_campaign: string | null; landing_referrer_host: string | null;
    visit_number: number;
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
type AnalyticsInsights = {
  insight: {
    summary: string;
    key_signals: string[];
    recommendations: Array<{ priority: 'high' | 'medium' | 'low'; title: string; detail: string }>;
    caveats: string[];
  };
  generated_at: string;
  period_days: number;
  sampled_rows: { sessions: number; events: number };
};

const number = new Intl.NumberFormat('en');
const dateTime = (value: string) => new Date(value).toLocaleString();
const timeOnly = (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const compareText = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 'No activity in prior period' : 'Up from 0 in prior period';
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? '+' : ''}${change}% vs prior period`;
};
const duration = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  const seconds = Math.floor(value / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

function BreakdownPanel({ title, note, rows }: { title: string; note: string; rows: Breakdown[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <section className="content-section analytics-panel">
      <div className="section-title analytics-panel-heading"><div><span className="eyebrow">Live signal</span><h2>{title}</h2><p>{note}</p></div><span className="analytics-panel-count">{number.format(rows.reduce((sum, row) => sum + row.count, 0))}</span></div>
      {rows.length ? (
        <div className="analytics-breakdown">
          {rows.map((row, index) => (
            <div className="analytics-breakdown-row" key={row.label}>
              <div className="analytics-breakdown-label"><b>{String(index + 1).padStart(2, '0')}</b><span title={row.label}>{row.label}</span><strong>{number.format(row.count)}</strong></div>
              <span className="analytics-bar"><i style={{ width: `${Math.max((row.count / max) * 100, 4)}%` }} /></span>
            </div>
          ))}
        </div>
      ) : <div className="empty-table-state">No consented analytics data for this period.</div>}
    </section>
  );
}

function HourlyActivityPanel({ rows }: { rows: AnalyticsData['hourly_activity'] }) {
  const maximum = Math.max(...rows.map((row) => Math.max(row.page_views, row.sessions)), 1);
  return (
    <section className="content-section analytics-realtime-panel">
      <div className="section-title analytics-panel-heading"><div><span className="eyebrow">Rolling 24 hours · exact hourly aggregates</span><h2>Traffic activity</h2><p>Hourly session starts, consented page views and exits. Times use your browser’s local timezone.</p></div><span className="analytics-panel-count">24h</span></div>
      {rows.length ? <>
        <div className="analytics-hourly-chart" role="img" aria-label="Hourly sessions and page views over the last 24 hours">
          {rows.map((row) => (
            <div className="analytics-hourly-column" key={row.hour_start} title={`${dateTime(row.hour_start)} · ${row.sessions} sessions · ${row.page_views} page views · ${row.page_exits} exits`}>
              <div className="analytics-hourly-bars"><i className="analytics-hourly-views" style={{ height: `${Math.max(2, (row.page_views / maximum) * 100)}%` }} /><i className="analytics-hourly-sessions" style={{ height: `${Math.max(2, (row.sessions / maximum) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="analytics-hourly-axis"><span>{rows[0] ? timeOnly(rows[0].hour_start) : '24h ago'}</span><span>12 hours</span><span>Now</span></div>
        <div className="analytics-chart-legend"><span><i className="analytics-hourly-views" /> Page views</span><span><i className="analytics-hourly-sessions" /> New sessions</span></div>
      </> : <div className="empty-table-state">No hourly activity is available yet.</div>}
    </section>
  );
}

function AnalyticsAiPanel({
  result, loading, error, stale, onGenerate,
}: { result: AnalyticsInsights | null; loading: boolean; error: string; stale: boolean; onGenerate: () => void }) {
  return (
    <section className="content-section analytics-ai-panel">
      <div className="section-title analytics-ai-heading">
        <div><span className="eyebrow">AI analyst · aggregate data only</span><h2>Insights & next actions</h2><p>Evidence-based interpretation for the selected reporting period. AI runs only when you request it.</p></div>
        <button type="button" className="primary-button" onClick={onGenerate} disabled={loading}>{loading ? 'Analyzing…' : result ? 'Refresh AI insights' : 'Generate AI insights'}</button>
      </div>
      <div className="analytics-ai-privacy">AI receives aggregate counts and sanitized page paths only—never IP addresses, visitor/session IDs, raw user-agent strings or individual event records.</div>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      {loading && <div className="empty-table-state" role="status">Analyzing the latest consented aggregates…</div>}
      {!result && !loading && !error && <div className="analytics-ai-empty">Generate an on-demand analysis for key traffic signals, likely opportunities and practical next steps.</div>}
      {result && !loading && <div className="analytics-ai-results">
        <div className="analytics-ai-result-meta"><span>{result.period_days}-day snapshot · generated {dateTime(result.generated_at)}</span><span>{number.format(result.sampled_rows.sessions)} session rows / {number.format(result.sampled_rows.events)} event rows sampled</span>{stale && <b>Live metrics have updated since this analysis</b>}</div>
        <p className="analytics-ai-summary">{result.insight.summary}</p>
        <div className="analytics-ai-columns">
          <div><h3>Signals</h3>{result.insight.key_signals.length ? <ul>{result.insight.key_signals.map((signal, index) => <li key={`${index}-${signal}`}>{signal}</li>)}</ul> : <p className="analytics-ai-muted">No reliable signals identified.</p>}</div>
          <div><h3>Recommended actions</h3>{result.insight.recommendations.length ? <div className="analytics-ai-recommendations">{result.insight.recommendations.map((item, index) => <article key={`${index}-${item.title}`}><span className={`analytics-priority analytics-priority-${item.priority}`}>{item.priority}</span><div><b>{item.title}</b><p>{item.detail}</p></div></article>)}</div> : <p className="analytics-ai-muted">No actions were recommended from this sample.</p>}</div>
        </div>
        {result.insight.caveats.length > 0 && <div className="analytics-ai-caveats"><b>Data limits</b><ul>{result.insight.caveats.map((caveat, index) => <li key={`${index}-${caveat}`}>{caveat}</li>)}</ul></div>}
      </div>}
    </section>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AnalyticsInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const inFlight = useRef(false);
  const requestSequence = useRef(0);

  const load = useCallback(async (silent = false) => {
    if (silent && inFlight.current) return;
    const requestId = ++requestSequence.current;
    inFlight.current = true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const result = await adminFetch<AnalyticsData>(`/api/v1/admin/analytics?days=${days}`);
      if (requestId !== requestSequence.current) return;
      setData(result);
      setLastUpdatedAt(new Date().toISOString());
    } catch (cause) {
      if (requestId === requestSequence.current)
        setError(cause instanceof Error ? cause.message : 'Analytics could not be loaded.');
    } finally {
      if (requestId === requestSequence.current) {
        if (!silent) setLoading(false);
        inFlight.current = false;
      }
    }
  }, [days]);

  useEffect(() => { void load(false); }, [load]);
  useEffect(() => {
    setAiData(null);
    setAiError('');
  }, [days]);
  useEffect(() => {
    if (!autoRefresh) return;
    const refreshIfVisible = () => { if (!document.hidden) void load(true); };
    const timer = window.setInterval(refreshIfVisible, 30_000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [autoRefresh, load]);

  async function generateAiInsights() {
    setAiLoading(true);
    setAiError('');
    try {
      const result = await adminFetch<AnalyticsInsights>('/api/v1/admin/analytics/insights', {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
      setAiData(result);
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : 'AI analytics insights could not be generated.');
    } finally {
      setAiLoading(false);
    }
  }

  const aiIsStale = Boolean(aiData && lastUpdatedAt && Date.parse(lastUpdatedAt) - Date.parse(aiData.generated_at) > 30_000);

  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Consented storefront visits"
        title="Analytics & journeys"
        description="Review page paths, visit timing, coarse location, and browser/device categories only from visitors who chose Allow."
      />
      <div className="analytics-toolbar">
        <div><span className="eyebrow">Reporting window</span><strong>Consent-aware traffic intelligence</strong><small><span className="analytics-live-dot" /> {autoRefresh ? 'Live · auto-updates every 30 seconds' : 'Auto-refresh paused'}{lastUpdatedAt ? ` · Updated ${dateTime(lastUpdatedAt)}` : ''}</small></div>
        <label htmlFor="analytics-period">Period<select id="analytics-period" value={days} onChange={(event) => setDays(Number(event.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select></label>
        <div className="analytics-toolbar-actions"><button className="secondary-button" type="button" onClick={() => { void load(false); }} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh now'}</button><button className="analytics-auto-toggle" type="button" aria-pressed={autoRefresh} onClick={() => setAutoRefresh((enabled) => !enabled)}>{autoRefresh ? 'Pause live' : 'Resume live'}</button></div>
      </div>
      {error && <div className="admin-alert" role="alert"><span>{error}</span> <button className="text-button" type="button" onClick={() => { void load(false); }}>Try again</button></div>}
      {loading && !data ? <div className="empty-table-state" role="status">Loading consented analytics…</div> : null}
      {data && (
        <>
          <section className="metric-grid" aria-label="Analytics totals">
            <MetricCard label="Consented sessions" value={number.format(data.totals.sessions)} note={`${compareText(data.totals.sessions, data.totals.previous_sessions)} · ${data.days}d`} />
            <MetricCard label="Page views" value={number.format(data.totals.page_views)} note={`${compareText(data.totals.page_views, data.totals.previous_page_views)} · after Allow`} accent="dark" />
            <MetricCard label="Active, last 30 min" value={number.format(data.totals.active_last_30m)} note="Based on recent event activity" />
            <MetricCard label="Unique visitors" value={number.format(data.totals.unique_visitors)} note="Anonymous IDs, consented only" accent="dark" />
            <MetricCard label="Returning visitors" value={number.format(data.totals.returning_visitors)} note="Seen in more than one visit" />
          </section>
          <div className="analytics-trust-strip"><span className="analytics-live-dot" /> <strong>Tracking is consent-gated</strong><span>IP is visible only to verified admins</span><span>Location is approximate</span><span>Raw user-agent is never stored</span></div>
          <HourlyActivityPanel rows={data.hourly_activity} />
          <AnalyticsAiPanel result={aiData} loading={aiLoading} error={aiError} stale={aiIsStale} onGenerate={() => { void generateAiInsights(); }} />
          <p className="analytics-disclaimer">Breakdowns use up to the latest {number.format(data.sample_sizes.sessions)} sessions and {number.format(data.sample_sizes.events)} recent events; headline totals are exact. Missing location or device values remain Unknown rather than being guessed.</p>
          <div className="analytics-overview-grid">
            <BreakdownPanel title="Top pages" note="Most viewed paths in the recent event sample." rows={data.top_pages.map((row) => ({ label: row.path, count: row.views }))} />
            <BreakdownPanel title="Countries & locations" note="Approximate hosting-proxy location, when available." rows={data.locations} />
            <BreakdownPanel title="Devices & operating systems" note="Coarse categories inferred from browser data." rows={data.devices} />
            <BreakdownPanel title="Browsers" note="Browser family inferred from the request header." rows={data.browsers} />
            <BreakdownPanel title="Acquisition sources" note="Normalized first-touch source: search, social, referral or direct." rows={data.acquisition_sources} />
          </div>
          <section className="content-section">
            <div className="section-title"><div><span className="eyebrow">Identity map</span><h2>Visitors</h2><p>Anonymous first-party IDs connect repeat visits without collecting names or guessing identity.</p></div><span className="section-meta">Showing {data.visitors.length} of {number.format(data.totals.unique_visitors)}</span></div>
            {data.visitors.length ? (
              <div className="data-table analytics-table">
                <div className="analytics-table-head analytics-visitor-grid"><span>Visitor / frequency</span><span>First seen</span><span>Latest journey</span><span>Location / device</span><span>Source / last session</span></div>
                {data.visitors.map((visitor) => (
                  <div className="analytics-table-row analytics-visitor-grid" key={visitor.visitor_ref}>
                    <span><strong>{visitor.visitor_ref}</strong><small>{visitor.visit_count === 1 ? 'First visit' : `${visitor.visit_count} visits · Returning`} · {visitor.total_page_views} page views</small></span>
                    <span><strong>{dateTime(visitor.first_seen_at)}</strong><small>Latest {dateTime(visitor.last_seen_at)}</small></span>
                    <span><strong>{visitor.first_landing_path || 'Unknown'} → {visitor.last_path || 'Unknown'}</strong><small>{visitor.last_session_ref ? `Session ${visitor.last_session_ref}` : 'Session unavailable'}</small></span>
                    <span><strong>{[visitor.city, visitor.region, visitor.country_code].filter(Boolean).join(', ') || 'Unknown location'}</strong><small>{[visitor.device_type, visitor.operating_system, visitor.browser].filter(Boolean).join(' · ') || 'Unknown device'}</small></span>
                    <span><strong>{visitor.first_acquisition_source || 'Direct'}</strong><small>{visitor.first_acquisition_medium || 'direct'} · {visitor.first_referrer || 'No referrer'}</small></span>
                  </div>
                ))}
              </div>
            ) : <div className="empty-table-state">No consented visitor IDs in this period.</div>}
          </section>
          <section className="content-section">
            <div className="section-title"><div><span className="eyebrow">Journey snapshots</span><h2>Recent sessions</h2><p>Landing, latest page, last exit, source, device and elapsed session time.</p></div><span className="section-meta">Showing {data.recent_sessions.length} of {number.format(data.totals.sessions)}</span></div>
            {data.recent_sessions.length ? (
              <div className="data-table analytics-table">
                <div className="analytics-table-head analytics-session-grid"><span>Visitor / session</span><span>Landing → current</span><span>Exit / duration</span><span>Location / IP</span><span>Device / browser</span><span>Referrer</span></div>
                {data.recent_sessions.map((session) => (
                  <div className="analytics-table-row analytics-session-grid" key={session.session_ref}>
                    <span><strong>{session.visitor_ref} · {session.acquisition_source}</strong><small>{session.acquisition_medium}{session.acquisition_campaign ? ` · ${session.acquisition_campaign}` : ''} · Session {session.session_ref} · Visit #{session.visit_number} · {dateTime(session.started_at)}</small></span>
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
