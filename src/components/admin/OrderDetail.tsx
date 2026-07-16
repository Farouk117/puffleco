"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatNaira } from "@/lib/data";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";
import { STATUS_LABELS, STATUS_STYLES } from "./OrdersManager";

const NEXT_ACTIONS: Record<string, { status: string; label: string; tone: "primary" | "danger" }[]> = {
  pending: [
    { status: "accepted", label: "Accept order", tone: "primary" },
    { status: "rejected", label: "Reject order", tone: "danger" },
  ],
  accepted: [{ status: "preparing", label: "Start preparing", tone: "primary" }],
  preparing: [{ status: "out_for_delivery", label: "Send out for delivery", tone: "primary" }],
  out_for_delivery: [{ status: "delivered", label: "Mark delivered", tone: "primary" }],
  delivered: [],
  rejected: [],
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on delivery",
  bank_transfer: "Bank transfer",
};

export default function OrderDetail({ orderId }: { orderId: Id<"orders"> }) {
  const { showToast } = useToast();
  const result = useQuery(api.orders.getForAdmin, { id: orderId });
  const updateStatus = useMutation(api.orders.updateStatus);
  const updatePaymentStatus = useMutation(api.orders.updatePaymentStatus);

  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (result === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (result === null) {
    return <p className="text-sm text-slate-500">Order not found.</p>;
  }

  const { order, items } = result;
  const actions = NEXT_ACTIONS[order.status] ?? [];

  async function handleStatusChange(status: string) {
    setUpdating(status);
    setError(null);
    try {
      await updateStatus({ id: orderId, status: status as never });
      showToast(`Order marked "${STATUS_LABELS[status] ?? status}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setUpdating(null);
    }
  }

  async function handlePaymentToggle() {
    setError(null);
    const next = order.paymentStatus === "paid" ? "unpaid" : "paid";
    try {
      await updatePaymentStatus({ id: orderId, paymentStatus: next });
      showToast(next === "paid" ? "Marked as paid." : "Marked as unpaid.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update payment status.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            ← All orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString("en-NG")} · Last updated{" "}
            {new Date(order.updatedAt).toLocaleString("en-NG")}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${STATUS_STYLES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              onClick={() => handleStatusChange(action.status)}
              disabled={updating !== null}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                action.tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {updating === action.status ? "Updating…" : action.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Items ordered</h2>
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.quantity} × {item.name}
                    </p>
                    {item.toppings.length > 0 ? (
                      <p className="mt-1 text-sm text-slate-500">
                        Toppings: {item.toppings.map((t) => `${t.name} (+${formatNaira(t.price)})`).join(", ")}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-400">Unit price: {formatNaira(item.unitPrice)}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatNaira(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
              {order.discountApplied > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount applied</span>
                  <span>−{formatNaira(order.discountApplied)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>{order.deliveryFee === 0 ? "Set by rider on arrival" : formatNaira(order.deliveryFee)}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
              <span>Grand total</span>
              <span>{formatNaira(order.grandTotal)}</span>
            </div>
          </div>

          {order.notes ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer notes</h2>
              <p className="mt-2 text-sm text-slate-700">{order.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer</h2>
            <p className="mt-2 font-semibold text-slate-900">{order.customerName}</p>
            <p className="text-sm text-slate-600">{order.phone}</p>
            {order.email ? <p className="text-sm text-slate-600">{order.email}</p> : null}
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Delivery address</p>
            <p className="text-sm text-slate-700">{order.address}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Payment</h2>
            <p className="mt-2 text-sm text-slate-700">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            <button
              type="button"
              onClick={handlePaymentToggle}
              className={`mt-3 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid — click to mark unpaid" : "Unpaid — click to mark paid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
