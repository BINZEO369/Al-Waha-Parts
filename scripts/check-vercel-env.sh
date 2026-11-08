#!/usr/bin/env bash
set -euo pipefail

# Run from a Vercel-linked project after: vercel login
# Usage: ./scripts/check-vercel-env.sh api
scope="${1:-api}"
case "$scope" in
  api) required=(SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY IMAGEKIT_PRIVATE_KEY IMAGEKIT_PUBLIC_KEY CORS_ORIGINS) ;;
  admin) required=(NEXT_PUBLIC_API_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ;;
  web) required=(NEXT_PUBLIC_API_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ;;
  *) echo "Usage: $0 api|admin|web" >&2; exit 2 ;;
esac

command -v vercel >/dev/null || { echo "Vercel CLI not found. Install with: pnpm add -g vercel" >&2; exit 1; }

echo "Checking Production variable names for: $scope"
output="$(vercel env ls production 2>/dev/null || true)"
if [[ -z "$output" ]]; then
  echo "Could not read Vercel variables. Run 'vercel login' and link this folder to the correct project." >&2
  exit 1
fi
failed=0
for key in "${required[@]}"; do
  if grep -Eq "(^|[[:space:]])${key}([[:space:]]|$)" <<<"$output"; then
    echo "OK      $key (name exists; value not displayed)"
  else
    echo "MISSING $key"
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  echo "One or more required Production variables are missing."
  exit 1
fi
echo "All required variable names are present. Redeploy after changing values."
