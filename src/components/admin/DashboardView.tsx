"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { formatNaira } from "@/lib/data";
import { STATUS_LABELS, STATUS_STYLES } from "./OrdersManager";
import Skeleton from "./ui/Skeleton";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardView() {
  const stats = useQuery(api.analytics.getDashboardStats);

  if (stats === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">A live snapshot of orders, revenue, and the menu.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard label="Total orders" value={stats.totalOrders} />
        <StatCard label="Pending" value={stats.statusCounts.pending} />
        <StatCard label="Preparing" value={stats.statusCounts.preparing} />
        <StatCard label="Out for delivery" value={stats.statusCounts.out_for_delivery} />
        <StatCard label="Delivered" value={stats.statusCounts.delivered} />
        <StatCard label="Rejected" value={stats.statusCounts.rejected} />
        <StatCard label="Total revenue" value={formatNaira(stats.totalRevenue)} />
        <StatCard label="Active discounts" value={stats.activeDiscounts} />
        <StatCard label="Total products" value={stats.totalProducts} />
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-slate-500">Revenue</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Today" value={formatNaira(stats.todayRevenue)} />
        <StatCard label="This week" value={formatNaira(stats.weekRevenue)} />
        <StatCard label="This month" value={formatNaira(stats.monthRevenue)} />
        <StatCard label="Avg. order value" value={formatNaira(stats.averageOrderValue)} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Recent orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.customerName}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <p className="font-semibold text-slate-900">{formatNaira(order.grandTotal)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Best selling products</h2>
            {stats.bestSellingProducts.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No sales yet.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {stats.bestSellingProducts.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="text-slate-500">{p.quantity} sold</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Most ordered toppings</h2>
            {stats.mostOrderedToppings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No topping orders yet.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {stats.mostOrderedToppings.map((t, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <span className="text-slate-500">{t.quantity}×</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Add product
          </Link>
          <Link href="/admin/orders" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            View orders
          </Link>
          <Link href="/admin/categories" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Manage categories
          </Link>
          <Link href="/admin/toppings" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Manage toppings
          </Link>
          <Link href="/admin/discounts" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Manage discounts
          </Link>
        </div>
      </div>
    </div>
  );
}
