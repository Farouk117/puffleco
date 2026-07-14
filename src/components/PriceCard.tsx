import Image from "next/image";
import Link from "next/link";
import type { Doc } from "@convex/_generated/dataModel";
import { accentMap, formatNaira, type Accent } from "@/lib/data";

export type MenuProduct = Doc<"products"> & {
  imageUrl: string | null;
  discount: Doc<"discounts"> | null;
  isDiscountActive: boolean;
  effectivePrice: number;
};

export default function PriceCard({
  product,
  accent,
  featured = false,
}: {
  product: MenuProduct;
  accent: Accent;
  featured?: boolean;
}) {
  const a = accentMap[accent];
  const soldOut = product.status === "sold_out";

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border-2 transition ${
        soldOut ? "" : "hover:-translate-y-1 hover:rotate-1 hover:shadow-2xl hover:shadow-amber-950/10"
      } ${
        featured ? `${a.border} bg-gradient-to-br from-white to-white ${a.tint}` : "border-brand-line/40 bg-white/80"
      } ${soldOut ? "opacity-70" : ""}`}
    >
      <div className="relative h-40 w-full overflow-hidden bg-brand-cream">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
        ) : null}
        <span className="motion-lines" aria-hidden="true" />
        {soldOut ? (
          <span className="sticker absolute left-4 top-4 bg-slate-900 text-white">Sold out</span>
        ) : product.isDiscountActive ? (
          <span className={`sticker absolute left-4 top-4 ${a.badgeBg}`}>★ On sale</span>
        ) : null}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-brand-ink">{product.name}</h3>
            <p className="mt-2 max-w-[16rem] text-sm leading-6 text-stone-600">{product.description}</p>
          </div>
          {product.isDiscountActive ? (
            <div className="text-right">
              <p className="text-sm font-bold text-stone-400 line-through">{formatNaira(product.basePrice)}</p>
              <p className="font-price text-2xl text-brand-royal-gold-dark">
                {formatNaira(product.effectivePrice)}
              </p>
            </div>
          ) : (
            <p className="font-price text-3xl text-brand-ink">
              {formatNaira(product.basePrice)}
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className={`text-sm font-black uppercase tracking-[0.16em] ${a.text}`}>
            {product.prepTimeMinutes} min prep
          </span>
          <span className="h-px flex-1 bg-brand-line/70" />
          <span className={`h-2.5 w-2.5 rounded-full ${a.bg}`} />
        </div>
        {soldOut ? (
          <span className="btn-ghost mt-6 w-full cursor-not-allowed justify-center border-2 border-slate-300 text-slate-400">
            Sold out
          </span>
        ) : (
          <Link
            href={`/order?box=${product._id}`}
            className={`btn-ghost mt-6 w-full justify-center border-2 ${a.border}/50`}
          >
            Order this
          </Link>
        )}
      </div>
    </article>
  );
}
