"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatNaira } from "@/lib/data";
import ConfirmDialog from "./ui/ConfirmDialog";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";

export default function ProductsManager() {
  const { showToast } = useToast();
  const products = useQuery(api.products.listAll);
  const categories = useQuery(api.categories.list);
  const setStatus = useMutation(api.products.setStatus);
  const setFeatured = useMutation(api.products.setFeatured);
  const remove = useMutation(api.products.remove);

  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"products">; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<Id<"products"> | null>(null);

  const categoryName = (id: Id<"categories">) => categories?.find((c) => c._id === id)?.name ?? "—";

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove({ id: deleteTarget.id });
      setDeleteTarget(null);
      showToast("Product deleted.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete product.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusToggle(id: Id<"products">, nextStatus: "available" | "sold_out") {
    setTogglingId(id);
    try {
      await setStatus({ id, status: nextStatus });
      showToast(nextStatus === "sold_out" ? "Marked sold out." : "Marked available.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update status.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the menu, pricing, availability, and discounts.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {products === undefined ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No products yet" description="Add your first product to start building the menu." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-[10px] text-slate-400">
                            No image
                          </div>
                        )}
                        <span className="font-semibold text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoryName(product.categoryId)}</td>
                    <td className="px-4 py-3">
                      {product.isDiscountActive ? (
                        <span className="flex items-center gap-2">
                          <span className="text-slate-400 line-through">{formatNaira(product.basePrice)}</span>
                          <span className="font-bold text-emerald-700">{formatNaira(product.effectivePrice)}</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">{formatNaira(product.basePrice)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusToggle(product._id, product.status === "available" ? "sold_out" : "available")
                        }
                        disabled={togglingId === product._id}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
                          product.status === "available"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {product.status === "available" ? "Available" : "Sold out"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={product.featured}
                        onChange={(e) => setFeatured({ id: product._id, featured: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget({ id: product._id, name: product.name });
                            setDeleteError(null);
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone. Past orders keep their own record, so this won't affect order history."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {deleteError ? <p className="mt-3 text-sm font-medium text-red-600">{deleteError}</p> : null}
    </div>
  );
}
