import { CatalogClient } from '../../components/CatalogClient';
export default function CatalogPage() {
  return (
    <main className="page-shell catalog-page">
      <style>{`
        .catalog-page :global(.category-chip:focus-visible),
        .catalog-page :global(.search-field input:focus-visible) { outline: 2px solid var(--red); outline-offset: 2px; }
      `}</style>
      <CatalogClient />
    </main>
  );
}
