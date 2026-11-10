# TODO

## Booking endpoint rejects invalid or incomplete requests
- The public booking endpoint must require a customer name, phone, and either cart items or a manual part number.
- It must reject an unmatched manual part number instead of creating a booking with no booking items.
- It must validate delivery and payment values, require a delivery address for delivery requests, trim optional email and note fields, and continue rechecking live stock and prices before saving.
- It must verify that each selected active vehicle is actually linked to the requested part in `part_vehicles` before creating the booking.

## Booking UI submits a clear, accessible customer request
- The form must show the live cart, quantity controls, manual part number fallback, vehicle fitment, contact information, delivery preference, address, and notes.
- Delivery address must become required when delivery is selected.
- Loading, success, and error states must be visible and announced to assistive technology; the form must clear only after a successful response.

## Storefront uses only real database content
- Homepage banners, categories, products, and selected vehicles must remain database-driven; empty database sections must stay hidden rather than showing invented records.
- Public vehicle responses must default to `status=active` so inactive records cannot appear in the finder or booking form.

## Homepage car-brand logos are database-driven
- Show exactly ten default car-brand logos directly below the homepage hero banner: Toyota, Nissan, Honda, Hyundai, Kia, Mitsubishi, Mazda, BMW, Ford, and Chevrolet.
- Seed the brand names, sort order, active state, and logo paths in Supabase; serve active records through the public API.
- The frontend must render brand names and logo URLs returned by the database/API, not a hardcoded brand list, and hide the strip when no database records are available.
- Keep the ten logo assets local and reference each asset by its database-stored path.

## Navigation and search are focused
- Remove the “Welcome to our store!” utility text and placeholder Blog/Pages/Compare/Setting controls.
- Keep only the real Home, Categories, Vehicle Finder, and Contact navigation items plus the booking/cart actions.
- Hide the default full-width header search; expose search from the menu as a right-side drawer that searches the live part catalog and links to the database vehicle finder.

## Hero CTA and API protection
- Center the database-driven hero CTA, keep its label on one line, and use one visible red border.
- Apply a general public API rate limit and a stricter booking submission limit; return a clear retry message when the limit is exceeded.

## Storefront currency and responsive polish are consistent
- Product and booking amounts must display in AED, matching the database currency.
- Cart rows, the menu search drawer, hero CTA, and form controls must remain usable at mobile widths without changing the established Al Waha visual language.

## Admin dashboard becomes responsive and production-ready
- The admin shell must use a clearly named red-and-white section navigation on desktop and a touch-friendly mobile navigation on small screens.
- Dashboard, inventory, bookings, vehicles, categories, admin access, and settings must each have a clear heading, purpose copy, primary action, responsive cards or panels, and honest live/loading/empty/error states.
- Tables, cards, filters, buttons, forms, status badges, and spacing must remain legible and usable on both phone and desktop widths.
- The visual system must consistently use white surfaces, charcoal text, and Al Waha red for active states and actions.

## Homepage car image spotlight appears before Popular Cars
- Convert the user-provided car image to PNG and save it in the website repository with a clear, descriptive filename.
- Place the new section immediately before the homepage “Popular Cars” section.
- Keep a hardcoded title and descriptive copy on the left and the image on the right on desktop and mobile layouts.
- Add a soft white shadow/glow around the image on the top, bottom, left, and right so it blends with the storefront.

## Storefront cookie consent and local preferences
- On the storefront, show cookie choices when no saved consent exists and let the visitor accept all, allow necessary only, or open custom settings.
- Necessary cookies must always remain enabled; preferences, analytics, and marketing choices must be optional and off by default.
- Save consent in a first-party cookie for 180 days using `Path=/`, `SameSite=Lax`, and `Secure` on HTTPS; fall back to same-device browser storage if cookies are blocked.
- Allow visitors to reopen the cookie preferences after dismissing the initial notice, and announce consent changes for optional integrations.
- Do not claim optional analytics/advertising tools are active or load them unless those integrations exist and consent allows them.
- The existing car-brand guide dismissal preference must only be persisted when Preferences cookies are allowed; document its one-year duration and same-device fallback in the privacy policy.
- Keep the controls responsive, accessible, and available in the site's English/Arabic language modes.

## Brands listing and detail pages remain understandable while loading or recovering
- On `/brands` and `/brands/{brand}`, show responsive placeholder cards while live brand/model data is being fetched instead of a blank white panel with only a spinner.
- If a request fails or returns malformed data, show a clear error and a “Try again” control; retries must replace stale results and stale requests must not overwrite newer state.
- Once the API responds, show the live brand cards or that brand's vehicle models with no lingering loading or error state.

## Admin is aligned with the normalized production database
- The admin must treat `manufacturers` as the source of truth for brand identity and `car_models` as the source of truth for vehicle models; it must not depend on the removed combined `car_brands` table.
- Admin users must be able to create, edit, activate, deactivate, and review manufacturer records including company name, slug, logo URL, description, country, founded year, and display order.
- Manufacturer records must show live logo previews and the count of related models; vehicle model records must show their joined manufacturer and live cover image where available.
- The dashboard must expose live counts for parts, manufacturers, models, bookings, categories, hero banners, and active admins, with pending booking visibility where available.
- Image and logo fields must be visibly previewed in the resource rows while preserving the existing database/API CRUD behavior.
- Admin and API typechecks and production builds must pass before the updated admin projects are deployed.

## Admin uploads media directly to ImageKit
- The central API must expose an admin-authenticated ImageKit upload-auth endpoint that returns short-lived token, expiry, signature, and public key values.
- The ImageKit private key must remain server-only; the browser must never receive or bundle it.
- Parts, gallery images, manufacturer logos, model covers, category images, and hero desktop/mobile images must have direct upload controls that save the returned URL into the existing database fields.
- Uploads must accept image files up to 10 MB each, show progress/error feedback, preview uploaded images, and retain a manual URL fallback.
- Production configuration documentation must list `IMAGEKIT_PRIVATE_KEY` and `IMAGEKIT_PUBLIC_KEY`, with the private value added only to the central API environment.


## Consent-based storefront analytics are private by default and visible to admins
- Keep the existing `analytics_sessions` and `analytics_events` tables and all existing records; add only missing analytics columns, indexes, and access controls.
- Store analytics only after the visitor selects “Allow”; “Reject” must prevent analytics requests and optional browser storage, while required storefront functionality continues to work.
- After explicit Allow, store the API-observed request IP with the consented session and collect page views/exits, session timing, sanitized path/title/referrer, coarse browser/OS/device (and model when available), and viewport details; approximate country/region/city only when trusted hosting metadata is available.
- Reject must result in no analytics request or analytics database write. Never persist raw user-agent strings, precise GPS location, query strings, form inputs, or cross-session fingerprint identifiers; report unavailable metadata as unknown rather than inventing values.
- Deny direct `anon`/`authenticated` database access to analytics tables; only the service-role API may write events, and only verified active admins may read analytics through admin-protected endpoints.
- Add an authenticated admin Analytics section showing bounded summaries, top pages, location/device breakdowns, and recent session landing/current/exit pages and durations with clear empty/error/loading states.


## Admin product form exposes every editable production `parts` column
The Add/Edit Product form must expose every editable field present in the live `public.parts` table: `part_name`, `category_id`, `brand_name`, `sku`, `oem_number`, `part_number`, `description`, `condition`, `tested_status`, `price`, `sale_price`, `stock_quantity`, integer `position`, `status`, `slug`, `primary_image_url`, gallery `image_urls`, text-array `tags`, `is_featured`, `sort_order`, `warranty_months`, `min_order_quantity`, `reorder_level`, `storage_location`, `seo_title`, `seo_description`, `manufacturer_id`, and `model_id` through the normalized vehicle-fitment editor. Show and preserve each record's `currency` (new items default to SAR), and show `id`, `created_at`, and `updated_at` as read-only system-generated metadata. Inputs, validation, nullable clearing, arrays and numeric values must use the actual database types and constraints. Existing API allowlists, data, categories, product-company links and fitments must be preserved.

## One-click image-aware AI fills supported empty product fields
An admin can upload/select a primary image or gallery image and click one action to analyze the image together with entered product details. The action automatically fills supported blank draft fields, including product title and slug, description, brand, visible part/OEM numbers, matching live category/manufacturer/model links, condition, SEO title/description and tags when evidence permits. If no title has been typed, a valid image alone is enough to request suggestions. Existing manual values are not overwritten automatically, the admin can still use an individual suggestion, and no product is saved until the admin reviews and presses Save. Never invent SKU, prices, stock, tested status, order/reorder values, or unsupported vehicle compatibility; category, manufacturer and model relationship IDs must match live database records. Keep confidence, warnings, audit logging, rate limiting and clear loading/error feedback.


## Guided AI part creation requires ordered inputs and final review
- New product creation starts by requiring one product image, supplied through a public image URL or ImageKit upload. The product title is optional; the admin may enter it or explicitly skip it so AI generates the title from the image.
- The wizard then requires the admin to select a vehicle company and one of that company's live database models, and to select/enter at least one compatible model year. If additional fitment rows are added, every row must have a selected company, matching model and valid year; no blank/incomplete row may be skipped. If a lookup or selection is missing, the admin cannot advance to AI preview or confirm.
- Before generating the AI preview, require a valid price, whole-number stock quantity and warranty month value (zero explicitly means no warranty). AI must not invent or replace those values.
- After these required inputs, the existing image-aware AI workflow suggests supported remaining descriptive/catalog/SEO/tag fields. AI may display category, product-manufacturer and condition candidates only as hints; the administrator must personally choose a live category, a live product manufacturer (or explicitly choose no identifiable manufacturer), and the condition. Vehicle company, model and year are always admin-selected. The system generates the inventory SKU and safe defaults rather than asking AI to invent inventory/ordering values; no AI suggestion silently selects a dropdown.
- Show every writable parts field and all submitted vehicle fitments in a readable review step. The admin can edit/correct the values there or go back; confirmation creates the part and fitments. No product record is created before the explicit Confirm & Add action. If fitment persistence fails after product creation, retry must reuse the saved product ID and must not duplicate the part.
- Keep the existing full editor for already-created parts; only the new-part creation path becomes the guided wizard. Preserve admin authentication, AI rate limits/audit log, existing database tables and media upload behavior.


## Near-real-time analytics and AI insight assistant
- The admin Analytics section refreshes current consented traffic automatically every 30 seconds while the page is visible, indicates the last successful update, allows pausing/resuming refresh, and retains manual refresh and reporting-period selection.
- Show hourly traffic activity plus exact current-period totals and comparison against the immediately preceding equal-length period; label any sampled breakdowns clearly and do not present incomplete samples as exact totals.
- Provide an authenticated, rate-limited AI analysis action that returns a concise evidence-based summary, key signals, prioritized actionable recommendations, and data caveats for the selected period. AI must use the configured existing Gemini API/model, report uncertainty, avoid inventing causes/conversions, and never trigger on each polling refresh.
- The AI service receives only bounded aggregate counts/breakdowns and sanitized page paths; do not send IP addresses, visitor/session identifiers, user-agent strings, or row-level event records. Keep analytics table access restricted to server-side service role and active-admin API routes.
- Preserve consent-gated tracking behavior, existing dashboard routes, privacy disclosures and existing analytics records; display clear loading, rate-limit, unavailable-AI, stale-result and error states.
