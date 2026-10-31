import { PartsTable } from '../../components/PartsTable';
export default function Parts() {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">Inventory</span>
          <h1>Parts library.</h1>
        </div>
        <button className="admin-button">+ Add new part</button>
      </header>
      <div className="admin-toolbar">
        <input placeholder="Search by part, SKU or OEM number" />
        <select>
          <option>All categories</option>
        </select>
        <select>
          <option>All statuses</option>
        </select>
      </div>
      <PartsTable />
    </div>
  );
}
