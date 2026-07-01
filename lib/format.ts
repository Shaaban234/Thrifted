// Formatting helpers.

// Prices are stored in PKR (Pakistani Rupees) across the app.
export function formatPrice(pkr: number): string {
  const rounded = Math.round(pkr);
  const neg = rounded < 0;
  const grouped = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}Rs ${grouped}`;
}

// Buyer protection fee model (mock, Vinted-style flat + percentage), in PKR.
export function protectionFee(itemPrice: number): number {
  return Math.round(49 + itemPrice * 0.05);
}

export const SHIPPING_FEE = 199; // PKR

// Flat fee (PKR) a seller pays to feature one of their listings.
export const FEATURE_FEE = 500;

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
