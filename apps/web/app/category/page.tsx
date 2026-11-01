import { CatalogClient } from '../../components/CatalogClient';

export default function CategoryPage() {
  return (
    <main className="page-shell category-page">
      <style>{`
        .category-page :global(.catalog-toolbar) { border-left: 3px solid var(--red); padding-left: 16px; }
      `}</style>
      <CatalogClient />
    </main>
  );
}
