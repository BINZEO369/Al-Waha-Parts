import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader } from '../../components/AdminSection';

export default function Parts() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Inventory / section 02"
        title="Inventory desk"
        description="One focused product workflow: choose the manufacturer and model, add stock and media, review AI suggestions, then save once."
      />
      <section className="workspace-hero red-wash inventory-hero" aria-labelledby="inventory-workflow-title">
        <div>
          <span className="eyebrow"><b>02</b>Single product workflow</span>
          <h2 id="inventory-workflow-title">Add, review, and publish from one place.</h2>
          <p>Live manufacturer, model, category, fitment, ImageKit media, inventory, and AI-assisted catalog copy are connected in the same product form. AI suggestions never save without your approval.</p>
        </div>
        <div className="inventory-hero-steps" aria-label="Inventory workflow steps">
          <span><b>01</b>Match</span>
          <span><b>02</b>Describe</span>
          <span><b>03</b>Publish</span>
        </div>
      </section>
      <AdminResourcePanel kind="parts" />
    </div>
  );
}
