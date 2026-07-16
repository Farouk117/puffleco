"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { accentForIndex, accentMap } from "@/lib/data";
import EmptyState from "@/components/admin/ui/EmptyState";
import Skeleton from "@/components/admin/ui/Skeleton";
import Reveal from "@/components/Reveal";

export default function ToppingsView() {
  const toppings = useQuery(api.toppings.listActive);

  return (
    <div className="pb-20">
        {toppings === undefined ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : toppings.length === 0 ? (
          <EmptyState title="No toppings yet" description="Check back soon for add-ons." />
        ) : (
          <div className="stagger-grid grid gap-6 sm:grid-cols-3">
            {toppings.map((topping, index) => {
              const a = accentMap[accentForIndex(index)];
              return (
                <div
                  key={topping._id}
                  className={`group overflow-hidden rounded-[2rem] border-2 bg-white/80 text-center shadow-lg shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-xl ${a.border}/40`}
                >
                  <div className={`relative h-40 w-full overflow-hidden ${a.tint}`}>
                    {topping.imageUrl ? (
                      <Image
                        src={topping.imageUrl}
                        alt={topping.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 340px"
                        className="object-cover transition duration-500 group-hover:scale-[1.06]"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-black text-brand-ink">{topping.name}</h2>
                    <span className={`mt-3 inline-flex rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] ${a.badgeBg}`}>
                      Free with every box
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Reveal className="mt-12">
          <div className="gold-panel rounded-[3rem] p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Toppings are included.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-stone-600">
              Choose add-ons freely when you build your box.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn-ghost">View menu</Link>
              <Link href="/order" className="btn-brand">Order now</Link>
            </div>
          </div>
        </Reveal>
    </div>
  );
}
