import { Suspense } from "react";
import type { Metadata } from "next";
import TrackOrderForm from "./TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order | The Pufflette.co",
  description: "Check the status of your Pufflette pancake or puff puff order.",
};

export default function TrackOrderPage() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Order status</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Track <span className="font-script text-brand-royal-gold-dark">your order.</span>
        </h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">
          Enter the order ID you received at checkout to see where your box is.
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={null}>
          <TrackOrderForm />
        </Suspense>
      </div>
    </section>
  );
}
