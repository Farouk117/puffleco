"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { toCsv, downloadCsv } from "@/lib/csv";
import { formatNaira } from "@/lib/data";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
] as const;

const RANGE_OPTIONS = [
  { value: "", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
};

export default function OrdersManager() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("");

  const orders = useQuery(api.orders.listForAdmin, {
    status: status ? (status as "pending" | "accepted" | "preparing" | "out_for_delivery" | "delivered" | "rejected") : undefined,
    dateRange: dateRange ? (dateRange as "today" | "week" | "month") : undefined,
    search: search || undefined,
  });

  function handleExport() {
    if (!orders || orders.length === 0) return;
    const headers = [
      "Order number",
      "Placed at",
      "Customer name",
      "Phone",
      "Email",
      "Address",
      "Payment method",
      "Payment status",
      "Status",
      "Subtotal",
      "Discount applied",
      "Delivery fee",
      "Grand total",
    ];
    const rows = orders.map((order) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString("en-NG"),
      order.customerName,
      order.phone,
      order.email ?? "",
      order.address,
      order.paymentMethod === "cash_on_delivery" ? "Cash on delivery" : "Bank transfer",
      order.paymentStatus,
      STATUS_LABELS[order.status],
      order.subtotal,
      order.discountApplied,
      order.deliveryFee,
      order.grandTotal,
    ]);
    const csv = toCsv(headers, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`pufflette-orders-${stamp}.csv`, csv);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Every order placed on the site, updated live.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!orders || orders.length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export report (CSV)
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, name, phone, or email"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
        >
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {orders === undefined ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No orders found" description="Try a different search or filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order._id}`} className="font-bold text-slate-900 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="font-semibold text-slate-800">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatNaira(order.grandTotal)}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(order.createdAt).toLocaleString("en-NG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
