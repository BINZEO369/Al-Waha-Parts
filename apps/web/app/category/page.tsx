import { CatalogClient } from '../../components/CatalogClient';

export default function CategoryPage() {
  return (
    <main className="page-shell category-page">
      <style>{`
        .category-page :global(.catalog-toolbar) { border-left: 3px solid var(--red); padding-left: 16px; }
        .category-page :global(.catalog-grid) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 700px) {
          .category-page :global(.catalog-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }
      `}</style>
      <CatalogClient />
    </main>
  );
}
