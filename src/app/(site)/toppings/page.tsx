import type { Metadata } from "next";
import ToppingsView from "./ToppingsView";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Toppings | The Pufflette.co",
  description: "Add-on toppings priced individually — pick as many as you like at checkout.",
};

export default function ToppingsPage() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Toppings</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Add flavor, <span className="font-script text-brand-royal-gold-dark">for free.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-stone-600">
          Pick extra toppings with every box — no hidden charge, no extra steps.
        </p>
      </div>

      <Reveal className="mt-14 rounded-[3rem] border border-brand-line/30 bg-brand-cream/75 p-8 shadow-2xl shadow-amber-950/10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-lg shadow-amber-950/5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Included toppings</p>
            <h2 className="mt-4 text-3xl font-black text-brand-ink">All add-ons stay free.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Choose your favorites and build the perfect box in one tap.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-brand-cream px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-brand-royal-gold-dark">
                3 toppings included
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-brand-coral-dark">
                No extra fee
              </span>
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-white p-8 shadow-lg shadow-amber-950/5">
            <ToppingsView />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
