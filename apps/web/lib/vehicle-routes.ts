export function brandSlugFromName(name: string): string {
  return name
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function brandModelHref(brandSlug: string, modelSlug: string): string {
  return `/brands/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}`;
}
