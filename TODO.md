# TODO

## Booking endpoint rejects invalid or incomplete requests
- The public booking endpoint must require a customer name, phone, and either cart items or a manual part number.
- It must reject an unmatched manual part number instead of creating a booking with no booking items.
- It must validate delivery and payment values, require a delivery address for delivery requests, trim optional email and note fields, and continue rechecking live stock and prices before saving.

## Booking UI submits a clear, accessible customer request
- The form must show the live cart, quantity controls, manual part number fallback, vehicle fitment, contact information, delivery preference, address, and notes.
- Delivery address must become required when delivery is selected.
- Loading, success, and error states must be visible and announced to assistive technology; the form must clear only after a successful response.

## Storefront currency and responsive polish are consistent
- Product and booking amounts must display in AED, matching the database currency.
- Cart rows and form controls must remain usable at mobile widths without changing the established Al Waha visual language.
