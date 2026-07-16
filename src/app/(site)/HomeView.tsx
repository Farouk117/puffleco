"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Image from "next/image";
import type { MenuProduct } from "@/components/PriceCard";
import { ClockIcon, DeliveryIcon, ToppingIcon } from "@/components/icons";
import { accentForIndex, accentMap, formatNaira } from "@/lib/data";
import EmptyState from "@/components/admin/ui/EmptyState";
import Skeleton from "@/components/admin/ui/Skeleton";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import Reveal from "@/components/Reveal";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Sparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M12 0c.6 5.6 1.8 8 7.2 9-5.4 1-6.6 3.4-7.2 9-.6-5.6-1.8-8-7.2-9 5.4-1 6.6-3.4 7.2-9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block" aria-hidden="true">
      <span className="dot bob h-4 w-4 bg-brand-coral" style={{ left: "6%", top: "22%", animationDelay: "0.2s" }} />
      <span className="dot bob h-3 w-3 bg-brand-royal-gold" style={{ left: "90%", top: "24%", animationDelay: "1.1s" }} />
      <Sparkle className="wiggle absolute h-7 w-7 text-brand-coral" style={{ left: "8%", top: "62%" }} />
      <Sparkle className="wiggle absolute h-6 w-6 text-brand-royal-gold" style={{ left: "92%", top: "66%" }} />
    </div>
  );
}

export default function HomeView() {
  const categories = useQuery(api.categories.list);
  const products = useQuery(api.products.listAll);
  const toppings = useQuery(api.toppings.listActive);

  const loading = categories === undefined || products === undefined;

  const productsByCategory = new Map<Id<"categories">, MenuProduct[]>();
  products?.forEach((p) => {
    const list = productsByCategory.get(p.categoryId) ?? [];
    list.push(p);
    productsByCategory.set(p.categoryId, list);
  });

  return (
    <>
      <section className="mesh-hero relative overflow-hidden py-16 sm:py-24">
        <HeroDecor />
        <div className="container-page hero-enter relative text-center">
          <span className="eyebrow">Fresh today · Abuja</span>
          <h1 className="font-display mt-5 text-[2.6rem] font-black leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            Puff puff &amp; pancakes,<br className="hidden sm:block" />{" "}
            <span className="font-script font-medium text-brand-royal-gold-dark">delivered fresh.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
            Pick a box below — most orders are confirmed within minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!loading && categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category._id}
                  href={`/order?category=${category.slug || slugify(category.name)}`}
                  className={`btn-sleek ${index === 0 ? "btn-brand" : "btn-ghost"}`}
                >
                  Shop {category.name} <span className="btn-arrow">→</span>
                </Link>
              ))
            ) : (
              <Link className="btn-sleek btn-brand" href="/order">Start your order <span className="btn-arrow">→</span></Link>
            )}
          </div>
        </div>
      </section>

      {!loading && toppings && toppings.length > 0 ? (
        <Reveal className="container-page -mt-2 mb-10">
          <div className="glass-panel flex flex-wrap items-center justify-center gap-2 rounded-2xl px-6 py-4 text-center text-sm shadow-lg shadow-amber-950/5 sm:text-base">
            <span className="text-brand-ink/80">
              Every box includes your pick of <strong className="text-brand-royal-gold-dark">3 free toppings</strong> —{" "}
              {toppings.map((t) => t.name).join(", ")}.
            </span>
          </div>
        </Reveal>
      ) : null}

      <Reveal className="container-page pb-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">The menu</span>
          <h2 className="font-display mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            Two menus, <span className="font-script text-brand-royal-gold-dark">every size.</span>
          </h2>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : categories!.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Menu coming soon" description="Check back shortly — we're setting up the menu." />
          </div>
        ) : (
          <div className="stagger-grid mt-8 grid gap-5 sm:grid-cols-2">
            {categories!.map((category, index) => {
              const items = productsByCategory.get(category._id) ?? [];
              if (items.length === 0) return null;
              const accent = accentForIndex(index);
              const a = accentMap[accent];
              const cover = items.find((p) => p.featured)?.imageUrl ?? items[0]?.imageUrl;
              const fromPrice = Math.min(...items.map((p) => p.effectivePrice));
              const slug = category.slug || slugify(category.name);
              return (
                <Link
                  key={category._id}
                  href={`/order?category=${slug}`}
                  className="sheen-on-hover group relative block overflow-hidden rounded-[2rem] shadow-lg shadow-amber-950/10 ring-1 ring-black/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-950/25"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream sm:aspect-[5/4]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.12]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
                  </div>

                  <span className="absolute left-4 top-4 z-[2] inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-white ring-1 ring-white/25 backdrop-blur-md">
                    {items.length} sizes
                  </span>

                  <div className="absolute inset-x-4 bottom-4 z-[2] flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-black leading-none text-white drop-shadow-sm sm:text-3xl">
                        {category.name}
                      </h3>
                      <p className="mt-1.5 text-sm font-bold text-white/85">
                        from <span className="font-price text-brand-royal-gold-light">{formatNaira(fromPrice)}</span>
                      </p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-black shadow-lg transition-all group-hover:gap-2.5 ${a.text}`}>
                      Order <span className="btn-arrow">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Reveal>

      <section className="container-page py-10">
        <div className="stagger-grid grid gap-4 sm:grid-cols-3">
          <div className="group glass-panel flex items-center gap-4 rounded-[1.75rem] p-5 shadow-lg shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-xl">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-royal-gold-light/40 text-brand-royal-gold-dark transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <DeliveryIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-black text-brand-ink">Delivery fee set by distance</p>
              <p className="text-sm text-stone-500">Your rider confirms it on arrival</p>
            </div>
          </div>
          <div className="group glass-panel flex items-center gap-4 rounded-[1.75rem] p-5 shadow-lg shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-xl">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-coral-light/45 text-brand-coral-dark transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <ClockIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-black text-brand-ink">Live order tracking</p>
              <p className="text-sm text-stone-500">Know exactly when it&apos;s on the way</p>
            </div>
          </div>
          <div className="group glass-panel flex items-center gap-4 rounded-[1.75rem] p-5 shadow-lg shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-xl">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-primary-light/45 text-brand-primary-dark transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <ToppingIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-black text-brand-ink">3 toppings, always included</p>
              <p className="text-sm text-stone-500">No extra charge, ever</p>
            </div>
          </div>
        </div>
      </section>

      <ReviewsMarquee />

      <Reveal className="container-page pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-ink p-8 text-center text-white sm:p-12">
          <div
            className="animated-bg pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(40% 60% at 15% 20%, rgba(232,199,102,0.35), transparent 70%), radial-gradient(45% 65% at 88% 90%, rgba(255,90,78,0.28), transparent 72%)",
              backgroundSize: "180% 180%",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Ready when you are, <span className="font-script font-medium text-brand-royal-gold-light">yk.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-white/70">No browsing required — everything we make is right above.</p>
            <Link href="/order" className="btn-sleek btn-brand mt-6 inline-flex bg-white text-brand-ink hover:bg-white">
              Start your order <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
