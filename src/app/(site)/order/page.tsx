import { Suspense } from "react";
import type { Metadata } from "next";
import OrderForm from "./OrderForm";

export const metadata: Metadata = {
  title: "Order | The Pufflette.co",
  description: "Order gourmet pancakes and puff puff online, with delivery across Abuja.",
};

export default function OrderPage() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Order online</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Build your box.
        </h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">
          Pick your boxes, add delivery details, and checkout — right here on the site.
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={null}>
          <OrderForm />
        </Suspense>
      </div>
    </section>
  );
}
