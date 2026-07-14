"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { formatNaira } from "@/lib/data";
import { useToast } from "./ui/ToastProvider";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired: "bg-slate-100 text-slate-500",
  disabled: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  disabled: "Disabled",
};

export default function DiscountsManager() {
  const { showToast } = useToast();
  const discounts = useQuery(api.discounts.listAll);
  const setEnabled = useMutation(api.discounts.setEnabled);

  async function toggle(id: Parameters<typeof setEnabled>[0]["id"], next: boolean) {
    try {
      await setEnabled({ id, enabled: next });
      showToast(next ? "Discount enabled." : "Discount disabled.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update discount.", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every discount lives on its product — add or edit one from that product&apos;s page.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to products
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {discounts === undefined ? (
          <div className="space-y-3 p-4">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : discounts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No discounts yet"
              description="Open a product and turn on 'Enable discount' to create one."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Window</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((d) => (
                  <tr key={d._id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{d.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.productName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {d.type === "percentage" ? `${d.value}%` : formatNaira(d.value)} off
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-400 line-through">{formatNaira(d.basePrice)}</span>{" "}
                      <span className="font-bold text-slate-900">{formatNaira(d.effectivePrice)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(d.startDate).toLocaleDateString("en-NG")} –{" "}
                      {new Date(d.endDate).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[d.status]}`}>
                        {STATUS_LABELS[d.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggle(d._id, !d.enabled)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          {d.enabled ? "Disable" : "Enable"}
                        </button>
                        <Link
                          href={`/admin/products/${d.productId}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
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
