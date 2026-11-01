# Page architecture

The web app follows a page-isolated structure inspired by the Jabiyen website.

## Route files are wiring only

Files under `apps/web/app/**/page.tsx` should stay small. They import one page component, pass route params when needed, and export the Next.js route entry point. Do not place page business logic or large style blocks in route files.

## Page components own page behavior

Page implementations live under `apps/web/components/pages/<page>/`:

- `home/HomePage.tsx`
- `catalog/CatalogPage.tsx`
- `category/CategoryPage.tsx`
- `product/ProductPage.tsx`
- `vehicles/VehiclesPage.tsx`
- `booking/BookingPage.tsx`
- `contact/ContactPage.tsx`
- `account/AccountPage.tsx`

A page component may compose shared components such as `CatalogClient`, `BookingForm`, `Header`, and `HeroCarousel`, but page-specific data loading and layout belong in its own folder.

## Page CSS is scoped

Each page folder has a CSS Module named after the page, for example `ContactPage.module.css`. Use the module root as the page scope and keep page-specific overrides there. Shared tokens, typography, header/footer, and reusable controls remain in `app/globals.css`; they should not be copied into page modules.

When adding or changing a page design:

1. Edit only the relevant folder under `components/pages/<page>/`.
2. Put new page-specific selectors in that page's `.module.css`.
3. Keep shared components and global tokens unchanged unless the design is truly shared.
4. Run `pnpm typecheck` and `pnpm -r build` before pushing.

This keeps independent page updates from changing unrelated routes.
