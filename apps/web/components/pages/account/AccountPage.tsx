import styles from './AccountPage.module.css';

export function AccountPage() {
  return (
    <main className={`${styles.root} page-shell narrow`}>
      <section className="page-intro">
        <p className="eyebrow">Al Waha Parts</p>
        <h1>Your Account.</h1>
        <p>Authentication and saved vehicle preferences are ready to connect to Supabase Auth.</p>
        <button className="button">
          Continue <span>→</span>
        </button>
      </section>
    </main>
  );
}
