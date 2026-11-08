# ImageKit production setup

## Vercel environment variables

Add these two variables to the **`al-waha-parts-api`** Vercel project for the **Production** target:

```text
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxx
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxx
```

`IMAGEKIT_PRIVATE_KEY` is secret and must never be added to the Admin or Web project, GitHub, browser code, or `NEXT_PUBLIC_*` variables. `IMAGEKIT_PUBLIC_KEY` is not a secret, but this implementation keeps it on the API project and returns it only after the authenticated admin requests a short-lived upload signature.

No ImageKit variables are required in `al-waha-parts-admin` or `al-waha-parts-web`. The admin browser calls the authenticated API endpoint, receives a one-time `token`, `expire`, `signature`, and public key, then uploads directly to ImageKit.

## ImageKit dashboard values

In ImageKit Dashboard, open **Developer options / API keys** and copy the active public and private keys. The public key begins with `public_` and the private key begins with `private_`. Use a restricted key if the account supports it; the private key must have the minimum media permission needed for upload operations.

The API endpoint added by this project is:

```text
GET /api/v1/admin/imagekit/auth
```

It requires the existing Supabase admin Bearer token. It returns a ten-minute upload signature. The private key stays on the central API server. The Admin form uploads images directly to ImageKit and writes the returned URL into the relevant database field.

The uploader supports primary product images, product gallery images, manufacturer logos, model cover images, category images, and hero banner desktop/mobile images. It accepts image files up to 10 MB each and uses these ImageKit folders:

```text
/al-waha-parts/parts
/al-waha-parts/manufacturers
/al-waha-parts/vehicles
/al-waha-parts/categories
/al-waha-parts/banners
```

## Deployment steps

1. Add the two variables to the API project's Production environment in Vercel.
2. Redeploy the API project. The code returns HTTP 503 for the upload-auth route until both variables exist.
3. Log in at `https://admin.al-waha.shop`, open Parts, Manufacturers, Models, Categories, or Hero banners, and use the new Upload image control.
4. Confirm that the returned ImageKit URL is saved to the record and that the storefront preview loads it.

ImageKit's official guidance says browser uploads should use short-lived `token`, `signature`, and `expire` values generated on a secure backend, and that private keys must remain server-side. The implementation follows that flow.

References:

- [ImageKit React integration and client-side upload authentication](https://imagekit.io/docs/integration/react)
- [ImageKit API keys and key security](https://imagekit.io/docs/api-keys)
