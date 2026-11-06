import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader } from '../../components/AdminSection';

export default function CarBrands() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Catalog relations / section 09"
        title="Car brands & logos"
        description="Manage the database logo IDs used by vehicle models and parts. Every change is reflected in the public brand strip and vehicle pages."
      />
      <section className="workspace-hero red-wash" aria-labelledby="car-brand-management-title">
        <div>
          <span className="eyebrow"><b>09</b>Database logo directory</span>
          <h2 id="car-brand-management-title">Keep brand identity centralized.</h2>
          <p>Create, edit, hide, or permanently delete a car brand logo record without placing image URLs directly inside vehicle models.</p>
        </div>
        <div className="hero-mark" aria-hidden="true">BR</div>
      </section>
      <AdminResourcePanel kind="carBrands" />
    </div>
  );
}
