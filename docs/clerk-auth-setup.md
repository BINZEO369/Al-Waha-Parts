# Clerk authentication setup for the customer storefront

Clerk powers customer sign-in and account creation on the `apps/web` storefront. The prebuilt Clerk flows send authentication credentials and account identity to the Clerk application selected by the keys below. This integration does not create or sync a customer-auth table in Supabase. The separate admin app and its Supabase authentication remain unchanged.

## Environment variables

Set these values on the storefront deployment (and in the local `apps/web` runtime when testing):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<publishable key from the Clerk Dashboard>
CLERK_SECRET_KEY=<secret key from the Clerk Dashboard>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

Use the development-instance keys (`pk_test_…` and `sk_test_…`) for local or preview environments, and the production-instance keys (`pk_live_…` and `sk_live_…`) for production. These are placeholders only; do not commit real values. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is intended for the browser. `CLERK_SECRET_KEY` must remain server-side and must never use a `NEXT_PUBLIC_` prefix.

After adding or changing environment values, rebuild/redeploy the storefront. The app conditionally enables Clerk only when both keys are present. Until then, sign-in and sign-up routes show a configuration notice instead of breaking the public storefront.

## Clerk Dashboard

Enable the sign-in methods customers should use in the selected Clerk application. Add the storefront's production origin and any preview/local origins to the allowed domains/origins required by those sign-in methods. The site routes are `/sign-in` and `/sign-up`; the storefront's custom sign-up verifies email with a one-time code and sends completed registrations to `/account`.

For the storefront's custom registration form, enable email/password sign-up, email verification by code, and the **First and last name** user-model fields in the Clerk instance settings. Do not require customers to create or join an organization. The form collects a customer's personal first and last name, then verifies their email before creating the active session. The name fields setting is required for Clerk to accept and store the submitted names.

Signed-in customers can open `/account` for a summary of their name, primary email, and account age, then use Clerk's profile/security controls to edit account details and sign-in settings.

## Scope

This adds customer authentication UI and Clerk session awareness, but it does not restrict catalog browsing or booking, attach customer identity to bookings, or modify API authorization. Those behaviors require separate product decisions. Admin login and the API's Supabase bearer-token checks are intentionally not changed.
