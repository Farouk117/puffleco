import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { formatNaira } from "@/lib/data";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Receipt | The Pufflette.co",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on delivery",
  bank_transfer: "Bank transfer",
};

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchQuery(api.orders.getByOrderNumber, { orderNumber: id });

  if (!result) {
    return (
      <section className="container-page py-20 text-center">
        <span className="eyebrow">Receipt not found</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em]">
          We couldn&apos;t find that order.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-stone-600">
          Double-check the order number, or track it from the order status page.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/track-order" className="btn-brand">Track an order</Link>
          <Link href="/" className="btn-ghost">Back to menu</Link>
        </div>
      </section>
    );
  }

  const { order, items } = result;

  const placedAt = new Date(order.createdAt).toLocaleString("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <span className="eyebrow">Your receipt</span>
          <div className="flex gap-3">
            <PrintButton />
            <Link href={`/track-order?id=${order.orderNumber}`} className="btn-ghost">Track this order</Link>
          </div>
        </div>

        <div className="mt-6 rounded-[2.5rem] border-2 border-brand-line/40 bg-white p-8 shadow-2xl shadow-amber-950/10 print:rounded-none print:border-none print:shadow-none sm:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-dashed border-brand-line/60 pb-6">
            <Image src="/brand/logo.png" alt="The Pufflette.co" width={172} height={67} unoptimized className="h-12 w-auto" />
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Receipt</p>
              <p className="font-display text-2xl font-black text-brand-coral-dark">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-stone-500">{placedAt}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 border-b border-dashed border-brand-line/60 pb-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Billed to</p>
              <p className="mt-2 font-black text-brand-ink">{order.customerName}</p>
              <p className="text-sm text-stone-600">{order.phone}</p>
              {order.email ? <p className="text-sm text-stone-600">{order.email}</p> : null}
              <p className="mt-2 text-sm text-stone-600">
                {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} ·{" "}
                <span className={order.paymentStatus === "paid" ? "font-bold text-brand-royal-gold-dark" : "font-bold text-amber-700"}>
                  {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Deliver to</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{order.address}</p>
              {order.notes ? (
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  <span className="font-bold text-stone-600">Notes:</span> {order.notes}
                </p>
              ) : null}
            </div>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-[0.15em] text-stone-500">
                <th className="pb-2">Item</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-brand-line/30">
                  <td className="py-3 font-bold text-brand-ink">
                    {item.name}
                    {item.toppings.length > 0 ? (
                      <p className="mt-0.5 text-xs font-medium text-stone-500">
                        + {item.toppings.map((t) => t.name).join(", ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 text-center text-stone-600">{item.quantity}</td>
                  <td className="font-price py-3 text-right text-stone-600">{formatNaira(item.unitPrice)}</td>
                  <td className="font-price py-3 text-right font-bold text-brand-ink">{formatNaira(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-2 border-t border-dashed border-brand-line/60 pt-4 text-sm font-bold text-stone-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-price">{formatNaira(order.subtotal)}</span></div>
            {order.discountApplied > 0 ? (
              <div className="flex justify-between text-brand-royal-gold-dark">
                <span>Discount saved</span>
                <span className="font-price">−{formatNaira(order.discountApplied)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-price">
                {order.deliveryFee === 0 ? "Pay rider on arrival" : formatNaira(order.deliveryFee)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-brand-line/40 pt-3 text-xl font-black text-brand-ink">
            <span>Total</span>
            <span className="font-price">{formatNaira(order.grandTotal)}</span>
          </div>

          <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
            Thank you for ordering from The Pufflette.co
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <Link href="/" className="btn-ghost">Order again</Link>
          <Link href="/contact" className="btn-ghost">Need help?</Link>
        </div>
      </div>
    </section>
  );
}
