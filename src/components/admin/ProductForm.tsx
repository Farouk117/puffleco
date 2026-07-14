"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";

type DiscountType = "percentage" | "fixed";

type ExistingProduct = {
  name: string;
  description: string;
  categoryId: Id<"categories">;
  basePrice: number;
  prepTimeMinutes: number;
  status: "available" | "sold_out";
  featured: boolean;
  toppingIds: Id<"toppings">[];
  imageStorageId?: Id<"_storage">;
  imageUrl: string | null;
  discount: {
    name?: string;
    enabled: boolean;
    type: DiscountType;
    value: number;
    startDate: number;
    endDate: number;
  } | null;
};

function toDateInputValue(ms: number | undefined): string {
  if (!ms) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function startOfDayMs(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getTime();
}

function endOfDayMs(dateStr: string): number {
  return new Date(`${dateStr}T23:59:59`).getTime();
}

export default function ProductForm({ productId }: { productId?: Id<"products"> }) {
  const existing = useQuery(api.products.get, productId ? { id: productId } : "skip");

  if (productId && existing === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <ProductFormFields productId={productId} initial={existing ?? undefined} />;
}

function ProductFormFields({
  productId,
  initial,
}: {
  productId?: Id<"products">;
  initial?: ExistingProduct;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const categories = useQuery(api.categories.list);
  const toppings = useQuery(api.toppings.listAll);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">(initial?.categoryId ?? "");
  const [basePrice, setBasePrice] = useState(initial ? String(initial.basePrice) : "");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initial ? String(initial.prepTimeMinutes) : "");
  const [status, setStatus] = useState<"available" | "sold_out">(initial?.status ?? "available");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [selectedToppingIds, setSelectedToppingIds] = useState<Id<"toppings">[]>(initial?.toppingIds ?? []);

  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | undefined>(initial?.imageStorageId);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const [discountName, setDiscountName] = useState(initial?.discount?.name ?? "");
  const [discountEnabled, setDiscountEnabled] = useState(initial?.discount?.enabled ?? false);
  const [discountType, setDiscountType] = useState<DiscountType>(initial?.discount?.type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(initial?.discount ? String(initial.discount.value) : "");
  const [discountStart, setDiscountStart] = useState(toDateInputValue(initial?.discount?.startDate));
  const [discountEnd, setDiscountEnd] = useState(toDateInputValue(initial?.discount?.endDate));

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      setImageStorageId(storageId);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function toggleTopping(id: Id<"toppings">) {
    setSelectedToppingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(basePrice);
    const prepNum = Number(prepTimeMinutes);

    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Choose a category.");
    if (Number.isNaN(priceNum) || priceNum < 0) return setError("Enter a valid base price.");
    if (Number.isNaN(prepNum) || prepNum < 0) return setError("Enter a valid prep time.");
    if (uploading) return setError("Wait for the image to finish uploading.");

    let discount:
      | { name?: string; enabled: boolean; type: DiscountType; value: number; startDate: number; endDate: number }
      | undefined;

    if (discountEnabled) {
      const value = Number(discountValue);
      if (Number.isNaN(value) || value < 0) return setError("Enter a valid discount value.");
      if (!discountStart || !discountEnd) return setError("Set a start and end date for the discount.");
      const startDate = startOfDayMs(discountStart);
      const endDate = endOfDayMs(discountEnd);
      if (endDate < startDate) return setError("Discount end date must be after the start date.");
      discount = {
        name: discountName.trim() || undefined,
        enabled: true,
        type: discountType,
        value,
        startDate,
        endDate,
      };
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        categoryId: categoryId as Id<"categories">,
        imageStorageId,
        basePrice: priceNum,
        toppingIds: selectedToppingIds,
        status,
        prepTimeMinutes: prepNum,
        featured,
        discount,
      };

      if (productId) {
        await updateProduct({ id: productId, ...payload });
        showToast("Product updated.");
      } else {
        await createProduct(payload);
        showToast("Product created.");
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-600 sm:col-span-2">
          Product name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            placeholder="Classic Burger"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-600 sm:col-span-2">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            placeholder="What makes this dish worth ordering?"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-600">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as Id<"categories">)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-600">
          Base price (₦)
          <input
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            placeholder="6500"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-600">
          Preparation time (minutes)
          <input
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            placeholder="20"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-600">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "available" | "sold_out")}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="available">Available</option>
            <option value="sold_out">Sold out</option>
          </select>
        </label>

        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-semibold text-slate-600">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured product
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-600">Image</p>
        <div className="mt-2 flex items-center gap-4">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="" className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">
              No image
            </div>
          )}
          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
            {uploading ? <p className="mt-1 text-xs font-medium text-slate-500">Uploading…</p> : null}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-600">Available toppings</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {toppings?.map((t) => (
            <label
              key={t._id}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                selectedToppingIds.includes(t._id)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedToppingIds.includes(t._id)}
                onChange={() => toggleTopping(t._id)}
              />
              {t.name}
            </label>
          ))}
          {toppings?.length === 0 ? <p className="text-sm text-slate-400">No toppings yet.</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <input type="checkbox" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} />
          Enable discount
        </label>

        {discountEnabled ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-600 sm:col-span-2">
              Discount name
              <input
                value={discountName}
                onChange={(e) => setDiscountName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
                placeholder="e.g. Black Friday, Christmas Special"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Discount type
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Value {discountType === "percentage" ? "(%)" : "(₦)"}
              <input
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
                placeholder={discountType === "percentage" ? "25" : "2000"}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Start date
              <input
                type="date"
                value={discountStart}
                onChange={(e) => setDiscountStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              End date
              <input
                type="date"
                value={discountEnd}
                onChange={(e) => setDiscountEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </label>
            {basePrice && discountValue ? (
              <p className="text-sm font-semibold text-emerald-700 sm:col-span-2">
                Preview: ₦{basePrice} →{" "}
                {discountType === "percentage"
                  ? Math.max(0, Math.round(Number(basePrice) - (Number(basePrice) * Number(discountValue)) / 100))
                  : Math.max(0, Number(basePrice) - Number(discountValue))}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
