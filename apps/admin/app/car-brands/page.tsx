import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader } from '../../components/AdminSection';
import { ManufacturerModelDirectory } from '../../components/ManufacturerModelDirectory';

export default function CarBrands() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Catalog relations / section 09"
        title="Car brands & logos"
        description="Manage the live manufacturer directory behind the storefront. Logo previews, model counts, country, and brand metadata stay connected to Supabase."
      />
      <section className="workspace-hero red-wash" aria-labelledby="car-brand-management-title">
        <div>
          <span className="eyebrow"><b>09</b>Database logo directory</span>
          <h2 id="car-brand-management-title">Keep brand identity centralized.</h2>
          <p>Create, edit, activate, or hide a manufacturer safely. Vehicle models remain linked through the normalized manufacturer relationship, so one logo update flows everywhere.</p>
        </div>
        <div className="hero-mark" aria-hidden="true">BR</div>
      </section>
      <ManufacturerModelDirectory />
      <AdminResourcePanel kind="carBrands" />
    </div>
  );
}
