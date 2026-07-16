import { Suspense } from "react";
import type { Metadata } from "next";
import OrderForm from "./OrderForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Order | The Pufflette.co",
  description: "Order gourmet pancakes and puff puff online, with delivery across Abuja.",
};

export default function OrderPage() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Order online</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Build your box, <span className="font-script text-brand-royal-gold-dark">fast.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          Choose your flavors, add toppings, and pay only when your Pufflette arrives.
        </p>
      </div>

      <div className="mt-14">
        <Reveal className="rounded-[3rem] bg-white/95 p-8 shadow-2xl shadow-amber-950/10">
          <Suspense fallback={null}>
            <OrderForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
