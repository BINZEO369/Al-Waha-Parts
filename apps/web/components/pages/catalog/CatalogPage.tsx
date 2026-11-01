import { CatalogClient } from '../../CatalogClient';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  return (
    <main className={`${styles.root} page-shell`}>
      <CatalogClient />
    </main>
  );
}
