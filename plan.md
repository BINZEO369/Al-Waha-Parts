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


# Admin redesign addendum

## Design direction

**Style options:** editorial operations desk (0.06), monochrome control room (0.08), red-white service console (0.86). Chosen: red-white service console.

- Swiss-style operations dashboard with automotive service energy.
- White surfaces keep inventory readable; charcoal creates structure; Al Waha red is reserved for action, active navigation, and alerts.
- Fixed desktop rail with compact mobile header and horizontally scrollable section navigation.
- Every section gets a clear title, purpose, primary action, and explicit loading/empty/error state.
- Manrope handles interface text; DM Mono handles labels, codes, statuses, and metadata.
