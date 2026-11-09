# Al Waha Parts booking flow polish

## Implementation
- Keep the existing server-side booking architecture: the web app posts to the Fastify API, which validates catalog items and writes to Supabase with the server-only service-role connection.
- Correct customer-facing currency formatting from SAR to AED without changing database values.
- Harden `POST /api/v1/bookings`: trim and validate contact fields, validate delivery/payment enums, require a delivery address for delivery orders, and reject an unmatched manual part number instead of creating a zero-item booking.
- Improve the booking form with delivery-aware address requirements, clearer loading/error/success states, accessible live regions, and resilient form reset behavior.
- Preserve the existing visual language—white surfaces, red accent, compact editorial typography—while making cart rows and actions clearer on mobile.

## Project structure
- `apps/web/components/BookingForm.tsx`: cart review and customer booking form.
- `apps/web/app/booking/page.tsx`: booking page intro and page-level presentation.
- `apps/web/app/layout.tsx`: shared storefront styles, including booking/cart responsive rules.
- `apps/api/src/app.ts`: public booking endpoint and server-side validation.
- `packages/shared/src/currency.ts`: shared AED display formatter.

## Design
- **Candidate styles:** Editorial motorsport utility (<0.08); Gulf-modern commerce (<0.06); Workshop service desk (<0.07).
- **Chosen movement:** Editorial motorsport utility.
- **Core principles:** decisive red action color, high-contrast white workspace, compact metadata, and visible request progress.
- **Color philosophy:** red signals action and confirmation; warm off-white keeps the catalog practical rather than glossy.
- **Layout paradigm:** a focused single-column request desk with a compact cart rail inside the form, not a generic centered checkout template.
- **Signature elements:** numbered request context, thin divider rules, and red status rails.
- **Interaction philosophy:** every field explains why it is needed; unavailable or invalid requests are stopped before submission.
- **Animation:** no distracting motion; use subtle focus and state transitions only.
- **Typography:** existing Montserrat display treatment with the current compact sans-serif body system.
- **Brand essence:** a dependable UAE parts desk that verifies fitment before the customer commits; direct, precise, reassuring.
- **Brand voice:** “Send what you know. We’ll confirm the match.” / “No payment is taken online.”
- **Wordmark:** preserve the existing Al Waha Parts wordmark and layout.
- **Signature brand color:** the existing red accent.

# Homepage car spotlight addendum

## Implementation and design
- Convert the user-provided car image to PNG and store it in `apps/web/public/` with a descriptive filename.
- Add a responsive, hardcoded editorial spotlight immediately before the homepage “Popular Cars” section: copy and title on the left, supplied car image on the right on desktop and mobile.
- Blend the image into the existing white/off-white storefront using a soft white glow/shadow on all four sides; retain the existing Al Waha red for a small accent and CTA.
- Implement the section in `apps/web/app/page.tsx` and keep it independent of database loading so its copy is always available.

## Cookie consent and local preference management
- Add a global storefront consent manager mounted in the root layout, with a first-party consent cookie that stores the user's essential, preferences, analytics and marketing choices for 180 days.
- Offer Accept all, Necessary only, Customise/Save preferences, and a persistent entry point for reopening settings; non-essential choices default off.
- Keep cookie preference checks in a small reusable helper and broadcast changes for any future optional integrations. Do not load analytics or advertising scripts that the site does not currently have.
- Gate the existing car-brand guide's one-year dismissal cookie behind optional Preferences consent; use a same-device fallback if cookies are blocked, and reflect both storage behaviors accurately in the privacy policy.
- Match the existing Al Waha red/white interface, work on mobile, remain keyboard-accessible, and provide English/Arabic copy consistent with the site's language toggle.

## Brand browsing loading and recovery
- Replace blank brand-list and brand-model spinners with responsive skeleton cards while the existing API request is pending.
- If a brand request fails or returns an invalid response, show an accessible error and a retry action; cancel stale requests after a retry or navigation.
- Preserve the live API contract, brand/model links, and existing cookie-consent behavior.

# Admin redesign addendum

## Design direction

**Style options:** editorial operations desk (0.06), monochrome control room (0.08), red-white service console (0.86). Chosen: red-white service console.

- Swiss-style operations dashboard with automotive service energy.
- White surfaces keep inventory readable; charcoal creates structure; Al Waha red is reserved for action, active navigation, and alerts.
- Fixed desktop rail with compact mobile header and horizontally scrollable section navigation.
- Every section gets a clear title, purpose, primary action, and explicit loading/empty/error state.
- Manrope handles interface text; DM Mono handles labels, codes, statuses, and metadata.

# Normalized database admin upgrade

## Goal

Turn the admin app into a premium operations workspace backed by the connected Supabase production database. The normalized vehicle source of truth is `manufacturers` → `car_models`, with `part_model_fitments`, `parts_categories`, `hero_banners`, `homepage_selected_vehicles`, `parts`, `bookings`, and `admins` supporting the storefront and operations workflow.

## Implementation

- Add normalized manufacturer CRUD at `/api/v1/admin/car-brands`, including model counts and logo metadata.
- Keep vehicle model CRUD on `car_models`, expose joined manufacturer identity, and show live model media in admin rows.
- Expand dashboard live metrics to include manufacturers, models, categories, banners, and pending bookings.
- Add media previews in the shared admin resource panel for brand logos, vehicle covers, part images, category images, and banners.
- Update admin copy and navigation so brand/model management is a first-class workflow.
- Validate admin and API typechecks/builds, then deploy the connected production projects.

## Design

**Style:** International automotive operations suite: quiet white workspace, charcoal typography, red Al Waha action color, compact data-dense panels, live image previews, and clear status signals.

**Core principles:** database-first; media visible at the point of decision; relationships explicit; safe soft-deactivation over destructive deletion; mobile-safe operations.

**Signature elements:** AW red mark, mono live/status labels, image preview tiles for logos and vehicle media.

**Brand essence:** a dependable Saudi parts operations desk—precise, direct, and fitment-first.

## Project structure

- `apps/api/src/app.ts`: authenticated admin endpoints and normalized database queries.
- `apps/admin/components/AdminResourcePanel.tsx`: shared live CRUD, filters, status actions, and media preview rows.
- `apps/admin/app/dashboard/page.tsx`: live operational summary.
- `apps/admin/app/car-brands/page.tsx`: manufacturer/logo management.
- `apps/admin/app/vehicles/page.tsx`: model and fitment management.
- `apps/admin/app/globals.css`: premium responsive workspace styling.

# ImageKit admin media upload addendum

## Implementation

- Keep ImageKit private-key operations inside the central Fastify API and expose an admin-authenticated `/api/v1/admin/imagekit/auth` endpoint that returns a short-lived token, expiry, HMAC-SHA1 signature, and public key.
- Let the authenticated Admin browser upload directly to ImageKit, then save the returned URL into the existing `parts`, `manufacturers`, `car_models`, `parts_categories`, and `hero_banners` image fields.
- Support primary images, multiple gallery images, manufacturer logos, model cover images, category images, and desktop/mobile hero images without exposing the private key to the browser.
- Add file type and 10 MB per-image validation in the Admin uploader and retain manual URL editing as a fallback.

## Project structure

- `apps/api/src/env.ts`: server-only ImageKit key configuration.
- `apps/api/src/app.ts`: authenticated short-lived ImageKit upload signature endpoint.
- `apps/admin/components/ImageKitUploadField.tsx`: direct browser upload and preview control.
- `apps/admin/components/AdminResourcePanel.tsx`: ImageKit control wiring for resource image fields.
- `docs/imagekit-setup.md`: production environment variables and deployment instructions.


# Consent-based storefront analytics addendum

## Implementation
- Reuse the existing `analytics_sessions` and `analytics_events` tables; extend them additively, add query indexes, and enforce row-level security with no direct browser-role grants.
- Storefront tracking runs only after explicit Allow consent. Reject records a necessary-only choice and causes the tracking client to send no analytics requests or persist an analytics session identifier. Consent version 2 forces visitors with an older choice to make a fresh decision before IP collection begins.
- A small first-party client records page views/exits, path transitions, session timing, sanitized referrer/title, language/timezone, coarse device/browser/OS, and viewport dimensions. Paths omit query strings and fragments; no form values or click-level behavior is collected.
- The Fastify API validates and rate-limits incoming events, stores the API-observed request IP only after explicit consent, uses a session-scoped pseudonymous ID, reads coarse location only from trusted Vercel metadata when available, and never stores a raw user-agent string. No GPS/geolocation request or cross-session fingerprint is used.
- A verified-admin-only API summarizes bounded event/session windows; the admin `/analytics` page presents totals, top paths, coarse location/device summaries, and recent landing/current/exit paths.

## Project structure
- `database/migrations/019_consent_based_analytics.sql`, `020_analytics_device_model.sql`, and `021_analytics_ip_address.sql`: additive schema/index/access-control and consented device/IP fields.
- `apps/web/lib/cookie-consent.ts` and `apps/web/components/CookieConsentManager.tsx`: persistent Allow/Reject choice and consent broadcast.
- `apps/web/components/AnalyticsTracker.tsx`: consent-gated page/session event client mounted from `apps/web/app/layout.tsx`.
- `apps/api/src/app.ts`: validated public event intake and verified-admin reporting endpoints.
- `apps/admin/app/analytics/page.tsx` and `apps/admin/components/AdminShell.tsx`: authenticated analytics screen and navigation.

## Data boundaries
- Store an IP address only in a consented session and expose it only through the verified-admin API; do not store exact GPS coordinates, full user-agent strings, URL query strings/fragments, form contents, or a device-derived cross-session identity.
- Country/region/city are approximate and only shown when trusted hosting-proxy metadata exists; missing values remain unknown.
- Database tables are not directly readable or writable by `anon` or `authenticated`; access is mediated by the server-only service role and active-admin authorization.


# Complete parts editor and image-aware AI suggestions

The admin editor remains driven by the live `public.parts` table and the current verified-admin API. It exposes all writable part fields with schema-matched controls, while generated `id`, `created_at`, and `updated_at` remain visible but read-only. Normalized manufacturer/model fitments, categories, and the existing ImageKit path remain intact. In particular, integer display `position`, storefront `sort_order`, and physical vehicle-side descriptions are distinct concepts.

The existing Gemini image/text analysis and AI audit trail will be reused. The AI receives active database category and manufacturer choices, and only exact live matches may populate relationship IDs. One admin action analyzes the primary image (or the first gallery image) plus entered text and fills supported empty fields in the current draft; existing manual entries remain untouched. It can suggest product name/slug, description, brand/part/OEM references, safe exact category/manufacturer/model links, condition, SEO and tags. It never fabricates SKU, price, sale price, inventory, tested status, ordering values or unsupported fitment. Every AI suggestion remains an unsaved draft until the admin explicitly saves.

Implementation stays in `apps/admin/components/InventoryProductForm.tsx`, `apps/api/src/ai.ts`, and the protected AI route in `apps/api/src/app.ts`. No database migration is expected because the production schema already contains the missing columns; the live table was audited before making the UI changes.
