export default function Page() {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">Operations</span>
          <h1>Part categories.</h1>
        </div>
        <button className="admin-button">+ Add new</button>
      </header>
      <div className="placeholder-panel">
        <div className="placeholder-icon">AWP</div>
        <h2>Organise the catalog with clean customer-facing categories.</h2>
        <p>
          This workspace is connected to the database schema and ready for the next data-management
          action.
        </p>
      </div>
    </div>
  );
}
