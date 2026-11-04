import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Vehicles() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Fitment library / section 03"
        title="Vehicle library"
        description="Manage models under a car-brand ID. Brand and model records are stored together in the car_brands registry."
        action="Add vehicle"
      />
      <section className="workspace-hero">
        <div>
          <span className="eyebrow">
            <b>03</b>Fitment foundation
          </span>
          <h2>Every part starts with the right vehicle model.</h2>
          <p>
            Model records and their images are loaded from car_brands. Choose a brand ID, then mark
            Featured vehicle to show that model on the homepage.
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
          description="Keep each model linked to its root car-brand ID, with its own image and model details."
          action="Manage records"
        />
        <WorkspaceCard
          number="03B"
          label="Fitment links"
          title="Make matching dependable."
          description="Fitment records point to model IDs in car_brands, so brand, models, parts, and images stay connected."
          action="Open relationships"
        />
      </div>
    </div>
  );
}
