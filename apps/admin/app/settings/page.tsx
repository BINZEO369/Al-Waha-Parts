import { SectionHeader, WorkspaceCard, InfoStrip } from '../../components/AdminSection';

export default function Settings() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="System health / section 07"
        title="Workspace settings"
        description="Understand the connections behind the operations desk and keep production configuration intentional."
      />
      <section className="workspace-hero dark-wash">
        <div>
          <span className="eyebrow">
            <b>07</b>Production readiness
          </span>
          <h2>Quiet systems. Clear signals.</h2>
          <p>
            Environment variables and deployment controls stay managed in Vercel; this page gives
            the team an honest operational summary.
          </p>
        </div>
        <div className="hero-mark">ST</div>
      </section>
      <div className="info-grid">
        <InfoStrip label="API">Protected · live</InfoStrip>
        <InfoStrip label="Supabase">Connected · live</InfoStrip>
        <InfoStrip label="Authentication">Bearer verified</InfoStrip>
      </div>
      <div className="workspace-grid">
        <WorkspaceCard
          number="07A"
          label="Connections"
          title="One source of truth."
          description="The admin, API, and storefront use the same production Supabase project and deployment configuration."
          action="View runbook"
        />
        <WorkspaceCard
          number="07B"
          label="Operations"
          title="Keep the desk dependable."
          description="Use health checks, clear environment names, and explicit releases when making changes."
          action="Open deployment notes"
        />
      </div>
    </div>
  );
}
