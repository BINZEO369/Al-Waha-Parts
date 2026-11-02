export function formatCurrency(value: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSar(value: number): string {
  return formatCurrency(value, 'SAR');
}

/** @deprecated Use formatSar for the Saudi main currency. */
export const formatAed = formatSar;
