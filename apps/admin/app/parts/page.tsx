import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Parts() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Inventory / section 02"
        title="Parts library"
        description="Search live stock, pricing, SKU, brand, and availability without leaving the operations desk."
        action="Add new part"
      />
      <AdminResourcePanel kind="parts" />
      <div className="workspace-grid">
        <WorkspaceCard
          number="02A"
          label="Stock control"
          title="Make availability obvious."
          description="Review stock quantity, sale price, currency, and catalog status together."
          action="Review stock"
        />
        <WorkspaceCard
          number="02B"
          label="Fitment"
          title="Match the right vehicle."
          description="Keep vehicle relationships visible so the storefront and team can recommend confidently."
          action="Open fitment"
        />
      </div>
    </div>
  );
}
