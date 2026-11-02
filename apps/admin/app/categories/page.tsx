import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Categories() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Catalog structure / section 04"
        title="Part categories"
        description="Organise the live catalog with clear names, slugs, featured states, and intentional ordering."
        action="Add category"
      />
      <section className="workspace-hero red-wash">
        <div>
          <span className="eyebrow">
            <b>04</b>Catalog architecture
          </span>
          <h2>Make the next right part easy to find.</h2>
          <p>
            Category records, search, active states, and featured flags are connected to the
            production API.
          </p>
        </div>
        <div className="hero-mark">CT</div>
      </section>
      <AdminResourcePanel kind="categories" />
      <div className="workspace-grid">
        <WorkspaceCard
          number="04A"
          label="Customer-facing"
          title="Simple, useful labels."
          description="Keep category names direct and descriptions practical for real workshop searches."
          action="Manage groups"
        />
        <WorkspaceCard
          number="04B"
          label="Merchandising"
          title="Feature what matters."
          description="Use featured states and sort order to guide discovery without clutter."
          action="Review featured"
        />
      </div>
    </div>
  );
}
