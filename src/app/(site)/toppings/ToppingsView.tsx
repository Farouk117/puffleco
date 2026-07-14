"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { accentForIndex, accentMap, formatNaira } from "@/lib/data";
import EmptyState from "@/components/admin/ui/EmptyState";
import Skeleton from "@/components/admin/ui/Skeleton";

export default function ToppingsView() {
  const toppings = useQuery(api.toppings.listActive);

  return (
    <>
      <section className="container-page py-14 text-center sm:py-20">
        <span className="eyebrow">Toppings</span>
        <h1 className="font-display mt-5 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Dress up <span className="font-script text-brand-royal-gold-dark">your order.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          Add any of these to your box at checkout — priced individually, added straight to your total.
        </p>
      </section>

      <section className="container-page pb-20">
        {toppings === undefined ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : toppings.length === 0 ? (
          <EmptyState title="No toppings yet" description="Check back soon for add-ons." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {toppings.map((topping, index) => {
              const a = accentMap[accentForIndex(index)];
              return (
                <div
                  key={topping._id}
                  className={`overflow-hidden rounded-[2rem] border-2 bg-white/80 text-center shadow-lg shadow-amber-950/5 ${a.border}/40`}
                >
                  <div className={`relative h-40 w-full ${a.tint}`}>
                    {topping.imageUrl ? (
                      <Image src={topping.imageUrl} alt={topping.name} fill sizes="(max-width: 1024px) 100vw, 340px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-black text-brand-ink">{topping.name}</h2>
                    <p className={`font-price mt-3 text-3xl ${a.text}`}>+{formatNaira(topping.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="gold-panel mt-12 rounded-[3rem] p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            Pick as many as you like.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-stone-600">
            Toppings are added per box at checkout — mix and match however you want.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/menu" className="btn-ghost">View the menu</Link>
            <Link href="/order" className="btn-brand">Start your order</Link>
          </div>
        </div>
      </section>
    </>
  );
}
