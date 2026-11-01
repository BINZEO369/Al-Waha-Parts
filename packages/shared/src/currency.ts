/**
 * Catalog prices remain stored in AED. SAMA's official exchange-rate table
 * (conversion date 2026-10-27) quotes 1 AED = 1.020940 SAR.
 * Source: https://www.sama.gov.sa/en-US/Currency/FinExc/Pages/Currency.aspx
 */
export const AED_TO_SAR_RATE = 1.02094;

export function convertAedToSar(value: number): number {
  return value * AED_TO_SAR_RATE;
}

export function formatAedAsSar(value: number): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertAedToSar(value));
}
