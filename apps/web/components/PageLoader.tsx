type PageLoaderProps = {
  label?: string;
};

export function PageLoader({ label = 'Loading Al Waha Parts' }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="page-loader-content">
        <span className="page-loader-spinner" aria-hidden="true" />
        <span className="page-loader-label">{label}</span>
      </div>
    </div>
  );
}
