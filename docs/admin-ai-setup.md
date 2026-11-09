# Admin AI setup

The first Admin AI feature is a protected product-metadata preview endpoint. It can suggest a category, manufacturer, model, compatible years, SEO fields, keywords and duplicate risk. It never writes product data directly. The response includes `requires_approval: true`, and every request is recorded in `admin_ai_runs`.

## Information needed from the owner

Only one secret is required to enable the first provider: a Gemini API key created in Google AI Studio. Add it only to the API/Vercel environment, never to the web or admin frontend and never to GitHub. Also confirm the production API URL and the production web/admin URLs so CORS can remain restricted. No customer names, phone numbers, emails, booking addresses or payment data should be sent to this AI endpoint.

## API configuration

Set these variables in the API deployment:

```env
GEMINI_API_KEY=your_server_only_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

If `GEMINI_API_KEY` is missing, the endpoint returns a clear `503` configuration response rather than silently failing.

## Endpoint

`POST /api/v1/admin/ai/suggest-product` requires the same admin Bearer token used by the existing Admin API. Send a JSON body such as:

```json
{
  "part_name": "Front brake pad",
  "description": "Ceramic replacement brake pad",
  "sku": "BP-001",
  "oem_number": "04465-0K240",
  "brand_name": "Toyota",
  "model_name": "Hilux",
  "category_name": "Braking System"
}
```

The response is a preview. The future Admin UI should show the suggested fields with Approve and Reject buttons. A database write must happen only after approval, and the approved action should update the relevant part/model/fitment records and mark the audit row as `approved`.

The current implementation also exposes `GET /api/v1/admin/ai/runs` for the latest audit entries. The endpoint is admin-protected and is intended for the Admin AI history screen.
