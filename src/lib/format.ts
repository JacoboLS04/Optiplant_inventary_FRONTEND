const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("es-CO");

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatSignedNumber(value: number): string {
  return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}`;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)} %`;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es-CO", {
  numeric: "auto",
});

export function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return "hace unos segundos";
  if (diffMinutes < 60) return relativeTimeFormatter.format(-diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return relativeTimeFormatter.format(-diffHours, "hour");
  return relativeTimeFormatter.format(-Math.round(diffHours / 24), "day");
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}
