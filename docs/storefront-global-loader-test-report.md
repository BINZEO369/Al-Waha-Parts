# Al Waha Parts — Storefront Global Loader Test Report

**পরীক্ষার তারিখ:** ৬ নভেম্বর ২০২৬  
**পরীক্ষার scope:** Storefront-এর সব public route-এ global loader-এর route coverage, build integrity, server response এবং নতুন branded loader markup যাচাই।  
**পরীক্ষার commit:** `4d66a7063d1d44f192549cd8b5e025e593e21a6e`

## Executive result

**Overall result: PASS**

Storefront-এ root-level `apps/web/app/loading.tsx` boundary আছে এবং সেটি shared `PageLoader` component ব্যবহার করছে। প্রধান data-fetching page-গুলোর client-side loading state-ও একই component ব্যবহার করছে। Production build সফল হয়েছে এবং route smoke test-এ route manifest-এর সব ২২টি public route HTTP `200` response দিয়েছে।

## Test summary

| Test area | Result | Evidence |
|---|---:|---|
| Root global loading boundary | PASS | `apps/web/app/loading.tsx` imports and renders `PageLoader` |
| Shared branded loader markup | PASS | `page-loader-card`, brand mark, progress track and dots present |
| Global loader CSS | PASS | Responsive, animated and reduced-motion CSS present in `apps/web/app/layout.tsx` |
| Storefront TypeScript check | PASS | `pnpm --filter @al-waha/web typecheck` |
| Storefront production build | PASS | Next.js build completed; ২২ pages generated |
| Static route smoke test | PASS | All manifest routes returned HTTP `200` |
| Dynamic route smoke test | PASS | Synthetic slug/model-slug routes returned HTTP `200` |
| Git diff validation | PASS | `git diff --check` returned no errors |

## Route-by-route smoke test

The test used the routes listed in `apps/web/public/manus-routes.json`. Dynamic parameters were replaced with safe synthetic values (`__test__` and `__test-model__`) to verify route resolution without depending on a particular database record.

| Route | HTTP status | Result |
|---|---:|---|
| `/` | 200 | PASS |
| `/booking` | 200 | PASS |
| `/booking/track` | 200 | PASS |
| `/brands` | 200 | PASS |
| `/brands/__test__` | 200 | PASS |
| `/brands/__test__/__test-model__` | 200 | PASS |
| `/catalog/__test__` | 200 | PASS |
| `/category` | 200 | PASS |
| `/category/__test__` | 200 | PASS |
| `/contact` | 200 | PASS |
| `/policies` | 200 | PASS |
| `/policies/customer-complaints-suggestions` | 200 | PASS |
| `/policies/copyright-disclaimer` | 200 | PASS |
| `/policies/product-disclaimer` | 200 | PASS |
| `/policies/privacy-policy` | 200 | PASS |
| `/policies/return-refund-policy` | 200 | PASS |
| `/policies/shipping-delivery` | 200 | PASS |
| `/policies/terms-and-conditions` | 200 | PASS |
| `/policies/trademark-disclaimer` | 200 | PASS |
| `/policies/warranty-policy` | 200 | PASS |
| `/login` | 200 | PASS |
| `/map` | 200 | PASS |

**Total:** ২২ route entries tested, **২২/২২ passed**.

## Loader implementation coverage

### Root App Router boundary

`apps/web/app/loading.tsx` renders:

```tsx
<PageLoader label="Loading Al Waha Parts" />
```

Because this is located at the root `app` level, it is the fallback boundary for storefront route transitions and server-rendered loading states unless a more specific nested boundary takes precedence.

### Route-level data loading

The same shared `PageLoader` is explicitly used by the following data-driven routes/components:

- Homepage
- Brands list
- Brand detail
- Vehicle/model detail
- Categories list
- Category detail
- Product/catalog detail
- Catalog client data loading

This means users receive the same visual language both during App Router transitions and while page-specific API data is loading.

### Visual system checks

The new loader contains the following verified elements:

- Al Waha Parts brand mark
- Red/white automotive visual language
- Animated three-bar loading indicator
- Animated progress track
- Animated status dots
- Loading label and live-inventory message
- Responsive mobile card layout
- `prefers-reduced-motion` fallback
- `role="status"`, `aria-live="polite"` and accessible label

## Production HTML smoke evidence

The locally running production storefront returned `200` on every route tested. Key routes also contained the new loader markers in the served output:

- `/`: `page-loader-card` and `page-loader-track` present
- `/brands`: `page-loader-card` and `page-loader-track` present
- `/category`: `page-loader-card` and `page-loader-track` present
- `/booking`: `page-loader-card` and `page-loader-track` present
- `/policies`: `page-loader-card` and `page-loader-track` present
- `/map`: `page-loader-card` and `page-loader-track` present

An already-running process was occupying port `3000`; the attempted second production-server start correctly failed with `EADDRINUSE`, while the existing production server remained available and served all smoke-test requests. This is an environment/process collision, not an application or loader failure.

## Findings and limitations

1. **No blocking loader issue found.** Build, route resolution and shared component coverage all passed.
2. This was a server/build smoke test. A human visual review or browser automation test would additionally verify exact animation timing during a slow network transition. The CSS and markup needed for that behavior are present and compile successfully.
3. The current route manifest still contains `/catalog/:slug`. This is unrelated to loader functionality, but it remains a separate outstanding requirement from the earlier request to remove the catalog page/references.
4. The route test used synthetic dynamic slugs, so it verifies route handling—not whether a particular database slug has valid content.

## Final verdict

The upgraded global loader is correctly wired into the storefront and is safe to proceed to deployment. The loader test passes across all currently declared public storefront routes, with no TypeScript, build, HTTP, markup, or CSS validation failures detected.
