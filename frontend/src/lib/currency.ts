export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export function normalizeCurrency(currency?: string | null): CurrencyCode {
  const code = currency?.toUpperCase().trim();
  const match = CURRENCIES.find((c) => c.code === code);
  return match ? match.code : DEFAULT_CURRENCY;
}

export function formatCurrency(amount: number, currency?: string | null): string {
  const code = currency?.toUpperCase().trim() || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
