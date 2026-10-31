export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export function getCurrencyMeta(code = 'NGN') {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
}

/**
 * Format monetary amount stored in minor units (e.g. kobo/cents)
 * Example: 250000 minor units -> "₦2,500.00"
 */
export function formatMoney(minorUnits: number, currencyCode = 'NGN'): string {
  const meta = getCurrencyMeta(currencyCode);
  const major = minorUnits / 100;
  
  if (currencyCode === 'NGN') {
    return `₦${major.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${meta.symbol}${major.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Format major units without decimal if whole, e.g. for chart axes or concise chips
 */
export function formatMoneyCompact(majorUnits: number, currencyCode = 'NGN'): string {
  const meta = getCurrencyMeta(currencyCode);
  if (majorUnits >= 1_000_000) {
    return `${meta.symbol}${(majorUnits / 1_000_000).toFixed(1)}M`;
  }
  if (majorUnits >= 1_000) {
    return `${meta.symbol}${(majorUnits / 1_000).toFixed(0)}k`;
  }
  return `${meta.symbol}${majorUnits.toLocaleString('en-US')}`;
}

/**
 * Converts user input (major units, e.g. 2500.50) into integer minor units (250050)
 */
export function toMinorUnits(majorUnits: number): number {
  return Math.round(majorUnits * 100);
}

/**
 * Converts integer minor units (250050) into major units (2500.50)
 */
export function toMajorUnits(minorUnits: number): number {
  return minorUnits / 100;
}
