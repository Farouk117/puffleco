export type Accent = "gold" | "coral" | "royal";

export const accentMap: Record<
  Accent,
  { text: string; bg: string; badgeBg: string; tint: string; border: string }
> = {
  gold: {
    text: "text-brand-primary-dark",
    bg: "bg-brand-primary",
    badgeBg: "bg-brand-primary text-white",
    tint: "bg-brand-primary-light/35",
    border: "border-brand-primary",
  },
  coral: {
    text: "text-brand-coral-dark",
    bg: "bg-brand-coral",
    badgeBg: "bg-brand-coral text-white",
    tint: "bg-brand-coral-light/45",
    border: "border-brand-coral",
  },
  royal: {
    text: "text-brand-royal-gold-dark",
    bg: "bg-brand-royal-gold",
    badgeBg: "bg-brand-royal-gold text-white",
    tint: "bg-brand-royal-gold-light/45",
    border: "border-brand-royal-gold",
  },
};

const ACCENT_CYCLE: Accent[] = ["coral", "royal", "gold"];

export function accentForIndex(index: number): Accent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length];
}

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

export const FREE_DELIVERY_THRESHOLD = 20000;
export const DELIVERY_FEE = 1500;

export const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/toppings", label: "Toppings" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];
