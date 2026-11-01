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
