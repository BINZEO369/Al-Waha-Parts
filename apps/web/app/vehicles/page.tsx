export default function VehiclesPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">Fitment finder</p>
        <h1>Start with the vehicle.</h1>
        <p>
          Vehicle lookup is connected to the live catalog API. Select your make, model and year to
          narrow the right parts.
        </p>
      </section>
      <div className="finder-card">
        <div className="form-grid">
          <label>
            Manufacturer
            <select>
              <option>Select manufacturer</option>
            </select>
          </label>
          <label>
            Model
            <select>
              <option>Select model</option>
            </select>
          </label>
          <label>
            Year
            <select>
              <option>Select year</option>
            </select>
          </label>
        </div>
        <button className="button">
          Show compatible parts <span>→</span>
        </button>
      </div>
    </main>
  );
}
