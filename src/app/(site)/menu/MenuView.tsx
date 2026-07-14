"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import PriceCard, { type MenuProduct } from "@/components/PriceCard";
import { accentForIndex, formatNaira } from "@/lib/data";
import EmptyState from "@/components/admin/ui/EmptyState";
import Skeleton from "@/components/admin/ui/Skeleton";

export default function MenuView() {
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
      <section className="container-page py-14 text-center sm:py-20">
        <span className="eyebrow">The full menu</span>
        <h1 className="font-display mt-5 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Every dish. Every price. <span className="font-script text-brand-royal-gold-dark">One menu.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          Real photos, live pricing, and instant ordering — pick something below to get started.
        </p>
      </section>

      <section className="container-page space-y-16 pb-16">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : categories!.length === 0 ? (
          <EmptyState title="Menu coming soon" description="Check back shortly — we're setting up the menu." />
        ) : (
          categories!.map((category, index) => {
            const items = productsByCategory.get(category._id) ?? [];
            const accent = accentForIndex(index);
            if (items.length === 0) return null;
            return (
              <div key={category._id}>
                <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">{category.name}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <PriceCard key={product._id} product={product} accent={accent} featured={product.featured} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {!loading && toppings && toppings.length > 0 ? (
        <section className="container-page pb-20">
          <div className="gold-panel rounded-[3rem] p-6 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Toppings</span>
                <h2 className="font-display mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  Dress it up.
                </h2>
              </div>
              <Link href="/toppings" className="btn-ghost">See all toppings</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {toppings.map((t) => (
                <span
                  key={t._id}
                  className="flex items-center gap-2 rounded-full border-2 border-brand-line/40 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-bold text-brand-ink"
                >
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-cream">
                    {t.imageUrl ? <Image src={t.imageUrl} alt="" fill sizes="32px" className="object-cover" /> : null}
                  </span>
                  {t.name} <span className="text-brand-primary-dark">+{formatNaira(t.price)}</span>
                </span>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/order" className="btn-brand">Start your order</Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
