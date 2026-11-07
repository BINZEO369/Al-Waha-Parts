import styles from './BrandPageLoading.module.css';

type BrandPageLoadingProps = {
  variant: 'brands' | 'models';
  label: string;
};

export function BrandPageLoading({ variant, label }: BrandPageLoadingProps) {
  const count = variant === 'brands' ? 12 : 6;

  return (
    <section className={styles.state} aria-busy="true">
      <p className={styles.label} role="status" aria-live="polite">
        {label}
      </p>
      <div
        className={`${styles.grid} ${variant === 'models' ? styles.models : ''}`}
        aria-hidden="true"
      >
        {Array.from({ length: count }, (_, index) => (
          <div className={styles.card} key={`${variant}-${index}`}>
            <span className={`${styles.placeholder} ${styles.media}`} />
            <span className={`${styles.placeholder} ${styles.title}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
