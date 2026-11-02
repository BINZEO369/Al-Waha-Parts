import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Vehicles() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Fitment library / section 03"
        title="Vehicle library"
        description="Manage manufacturers, models, generations, years, chassis codes, and active fitment records."
        action="Add vehicle"
      />
      <section className="workspace-hero">
        <div>
          <span className="eyebrow">
            <b>03</b>Fitment foundation
          </span>
          <h2>Every part starts with the right vehicle.</h2>
          <p>
            Live vehicle records are loaded from Supabase and remain searchable on phone, tablet,
            and desktop.
          </p>
        </div>
        <div className="hero-mark">VH</div>
      </section>
      <AdminResourcePanel kind="vehicles" />
      <div className="workspace-grid">
        <WorkspaceCard
          number="03A"
          label="Vehicle records"
          title="Manufacturers and models."
          description="Keep names, years, chassis codes, and media complete for every supported vehicle."
          action="Manage records"
        />
        <WorkspaceCard
          number="03B"
          label="Fitment links"
          title="Make matching dependable."
          description="Connect active vehicles to catalog parts so customer searches return useful results."
          action="Open relationships"
        />
      </div>
    </div>
  );
}
