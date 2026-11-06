type PageLoaderProps = {
  label?: string;
};

export function PageLoader({ label = 'Loading Al Waha Parts' }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="page-loader-card">
        <div className="page-loader-brand"><span className="page-loader-brand-mark">AW</span><span><strong>AL WAHA</strong><b>PARTS</b></span></div>
        <div className="page-loader-mark" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="page-loader-copy">
          <strong>{label}</strong>
          <small>Connecting to live inventory</small>
        </div>
        <div className="page-loader-track" aria-hidden="true"><i /></div>
        <div className="page-loader-dots" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </div>
  );
}
