"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { formatNaira } from "@/lib/data";

const STAGES: { status: string; label: string }[] = [
  { status: "pending", label: "Order received" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on delivery",
  bank_transfer: "Bank transfer",
};

export default function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get("id") ?? "");
  const [submitted, setSubmitted] = useState(searchParams.get("id") ?? "");

  const result = useQuery(api.orders.getByOrderNumber, submitted ? { orderNumber: submitted } : "skip");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;
    setSubmitted(orderNumberInput.trim());
  }

  const stageIndex = result?.order ? STAGES.findIndex((s) => s.status === result.order.status) : -1;
  const isRejected = result?.order.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={orderNumberInput}
          onChange={(e) => setOrderNumberInput(e.target.value)}
          placeholder="e.g. PUF-7K2M9Q"
          className="flex-1 rounded-2xl border-2 border-brand-line/40 bg-white p-4 font-bold uppercase tracking-wide text-brand-ink outline-none focus:border-brand-coral"
        />
        <button type="submit" disabled={!orderNumberInput.trim()} className="btn-brand justify-center disabled:opacity-60">
          Track order
        </button>
      </form>

      {submitted && result === undefined ? (
        <p className="mt-6 text-center text-sm font-bold text-stone-500">Searching…</p>
      ) : null}

      {submitted && result === null ? (
        <p className="mt-4 text-center text-sm font-bold text-brand-coral-dark">
          We couldn&apos;t find an order with that number.
        </p>
      ) : null}

      {result ? (
        <div className="mt-10 rounded-[2.5rem] border-2 border-brand-line/40 bg-white/90 p-6 shadow-xl shadow-amber-950/10 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Order</p>
              <p className="font-display text-2xl font-black">{result.order.orderNumber}</p>
            </div>
            <p className="text-sm font-bold text-stone-500">
              Placed {new Date(result.order.createdAt).toLocaleString("en-NG")}
            </p>
          </div>

          {isRejected ? (
            <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center">
              <p className="text-lg font-black text-red-700">Your order has been rejected.</p>
              <p className="mt-2 text-sm text-red-600">
                Contact us if you have questions about this order.
              </p>
              <Link href="/contact" className="btn-ghost mt-4 inline-flex border-red-200 text-red-700">
                Contact us
              </Link>
            </div>
          ) : (
            <ol className="mt-8 grid gap-4 sm:grid-cols-5">
              {STAGES.map((stage, i) => {
                const active = i <= stageIndex;
                return (
                  <li key={stage.status} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black ${
                        active ? "bg-brand-coral text-white" : "bg-brand-cream text-stone-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${active ? "text-brand-ink" : "text-stone-400"}`}>
                      {stage.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="mt-6 text-center text-xs font-bold uppercase tracking-wide text-stone-400">
            Last updated {new Date(result.order.updatedAt).toLocaleString("en-NG")}
          </p>

          <div className="mt-8 space-y-2 border-t border-brand-line/30 pt-6 text-sm font-bold text-stone-600">
            {result.items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                  {item.toppings.length > 0 ? (
                    <span className="block text-xs font-medium text-stone-500">
                      + {item.toppings.map((t) => t.name).join(", ")}
                    </span>
                  ) : null}
                </span>
                <span className="font-price">{formatNaira(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-brand-line/30 pt-3 text-lg font-black">
            <span>Total</span>
            <span className="font-price text-xl">{formatNaira(result.order.grandTotal)}</span>
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-stone-500">
            <span>
              Delivering to <span className="font-bold text-stone-700">{result.order.address}</span>
            </span>
            <span>
              {PAYMENT_METHOD_LABEL[result.order.paymentMethod] ?? result.order.paymentMethod} ·{" "}
              <span className={result.order.paymentStatus === "paid" ? "font-bold text-brand-royal-gold-dark" : "font-bold text-amber-700"}>
                {result.order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </span>
            </span>
          </div>

          <Link href={`/receipt/${result.order.orderNumber}`} className="btn-ghost mt-6 w-full justify-center">
            View full receipt
          </Link>
        </div>
      ) : null}
    </div>
  );
}
