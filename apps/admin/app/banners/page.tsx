import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader } from '../../components/AdminSection';

export default function HeroBanners() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Storefront content / section 08"
        title="Hero banners"
        description="Manage the live homepage hero copy, images, calls to action, and display order. Changes are saved to the existing hero banner API."
      />
      <section className="workspace-hero red-wash" aria-labelledby="hero-management-title">
        <div>
          <span className="eyebrow">
            <b>08</b>Homepage presentation
          </span>
          <h2 id="hero-management-title">Shape the first impression.</h2>
          <p>
            Edit a banner to update it, or permanently delete it from the database and live
            storefront.
          </p>
        </div>
        <div className="hero-mark" aria-hidden="true">
          HB
        </div>
      </section>
      <AdminResourcePanel kind="banners" />
    </div>
  );
}
