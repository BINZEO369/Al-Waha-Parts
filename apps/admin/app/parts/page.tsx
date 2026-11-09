import { AdminResourcePanel } from '../../components/AdminResourcePanel';

export default function InventoryPage() {
  return (
    <div className="admin-page inventory-page">
      <header className="page-heading inventory-page-heading">
        <div>
          <span className="eyebrow"><b>02</b>Operations / Catalog control</span>
          <h1>Inventory</h1>
          <p>One workspace for product details, live vehicle fitment, pricing, stock, and AI-assisted catalog entry.</p>
        </div>
        <div className="inventory-shortcut-card" aria-label="Inventory keyboard shortcuts">
          <span><kbd>N</kbd><small>New product</small></span>
          <i aria-hidden="true" />
          <span><kbd>/</kbd><small>Search inventory</small></span>
        </div>
      </header>
      <AdminResourcePanel kind="parts" />
    </div>
  );
}
