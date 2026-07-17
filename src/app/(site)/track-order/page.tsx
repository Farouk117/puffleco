import { Suspense } from "react";
import type { Metadata } from "next";
import TrackOrderForm from "./TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order | The Pufflette.co",
  description: "Check the status of your Pufflette pancake or puff puff order.",
};

export default function TrackOrderPage() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Order status</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Track <span className="font-script text-brand-royal-gold-dark">your order.</span>
        </h1>
      </div>

      <div className="glass-panel mt-14 rounded-[3rem] p-8 shadow-2xl shadow-amber-950/10 sm:p-10">
        <Suspense fallback={null}>
          <TrackOrderForm />
        </Suspense>
      </div>
    </section>
  );
}
