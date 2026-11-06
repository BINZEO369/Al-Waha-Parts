type PageLoaderProps = {
  label?: string;
};

export function PageLoader({ label = 'Loading Al Waha Parts' }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="page-loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <strong>{label}</strong>
      <small>Please wait</small>
    </div>
  );
}
