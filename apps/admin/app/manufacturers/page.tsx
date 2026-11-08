import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Manufacturers() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Catalog foundation / section 03A"
        title="Manufacturers"
        description="Maintain one clean manufacturer record with its logo, slug, country, and storefront visibility. Models are linked separately by ID."
        action="Add manufacturer"
      />
      <section className="workspace-hero">
        <div>
          <span className="eyebrow"><b>03A</b>Normalized catalog data</span>
          <h2>One manufacturer, one logo, many models.</h2>
          <p>Every model is connected to its manufacturer through the live database relation, so logos never repeat as separate model brands.</p>
        </div>
        <div className="hero-mark">MF</div>
      </section>
      <AdminResourcePanel kind="manufacturers" />
      <div className="workspace-grid">
        <WorkspaceCard number="03A" label="Brand identity" title="Keep the storefront consistent." description="Update logos and manufacturer metadata once, then reuse them across all model pages." action="Manage logos" />
        <WorkspaceCard number="03B" label="Model relation" title="Select models instead of typing IDs." description="Create and edit models from the Vehicles section with a manufacturer selector." action="Open models" />
      </div>
    </div>
  );
}
