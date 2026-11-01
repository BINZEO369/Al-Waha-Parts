import { CatalogClient } from '../../CatalogClient';
import styles from './CategoryPage.module.css';

export function CategoryPage() {
  return (
    <main className={`${styles.root} page-shell`}>
      <CatalogClient />
    </main>
  );
}
