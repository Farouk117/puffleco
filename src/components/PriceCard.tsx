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

const GLOW_CLASS: Record<Accent, string> = {
  coral: "glow-coral",
  royal: "glow-royal",
  gold: "glow-gold",
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
      className={`group relative overflow-hidden rounded-[1.75rem] border-2 transition ${
        soldOut ? "" : `hover:-translate-y-1.5 ${GLOW_CLASS[accent]}`
      } ${
        featured ? `${a.border} bg-gradient-to-br from-white to-white ${a.tint}` : "border-brand-line/40 bg-white/85"
      } ${soldOut ? "opacity-70" : ""}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-cream">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {soldOut ? (
          <span className="sticker absolute left-3 top-3 bg-slate-900 text-white">Sold out</span>
        ) : product.isDiscountActive ? (
          <span className={`sticker absolute left-3 top-3 ${a.badgeBg}`}>★ On sale</span>
        ) : null}

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-black leading-tight text-white drop-shadow-sm">{product.name}</h3>
            <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/80">
              {product.prepTimeMinutes} min prep
            </span>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-right backdrop-blur-md">
            {product.isDiscountActive ? (
              <>
                <p className="text-[0.65rem] font-bold text-white/60 line-through">{formatNaira(product.basePrice)}</p>
                <p className="font-price text-lg leading-none text-white">{formatNaira(product.effectivePrice)}</p>
              </>
            ) : (
              <p className="font-price text-lg leading-none text-white">{formatNaira(product.basePrice)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-stone-600">{product.description}</p>
        {soldOut ? (
          <span className="btn-ghost mt-4 w-full cursor-not-allowed justify-center border-2 border-slate-300 text-slate-400">
            Sold out
          </span>
        ) : (
          <Link
            href={`/order?box=${product._id}`}
            className={`btn-ghost mt-4 w-full justify-center border-2 ${a.border}/50`}
          >
            Order this
          </Link>
        )}
      </div>
    </article>
  );
}
