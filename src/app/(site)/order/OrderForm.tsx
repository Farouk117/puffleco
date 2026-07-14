"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { accentForIndex, accentMap, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatNaira } from "@/lib/data";
import Skeleton from "@/components/admin/ui/Skeleton";
import type { MenuProduct } from "@/components/PriceCard";

type CartEntry = { quantity: number; toppingIds: Id<"toppings">[] };
type PaymentMethod = "cash_on_delivery" | "bank_transfer";

function Stepper({
  quantity,
  onChange,
  disabled,
}: {
  quantity: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, quantity - 1))}
        disabled={disabled || quantity === 0}
        className="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-line/50 text-lg font-black text-brand-ink transition disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-black">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled}
        className="grid h-9 w-9 place-items-center rounded-full bg-brand-ink text-lg font-black text-white transition disabled:opacity-30"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function ProductRow({
  product,
  entry,
  onQuantityChange,
  onToggleTopping,
  toppings,
}: {
  product: MenuProduct;
  entry: CartEntry;
  onQuantityChange: (next: number) => void;
  onToggleTopping: (toppingId: Id<"toppings">) => void;
  toppings: { _id: Id<"toppings">; name: string; price: number }[];
}) {
  const soldOut = product.status === "sold_out";

  return (
    <div className="rounded-[1.5rem] border-2 border-brand-line/30 bg-white/80 p-3 sm:p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-cream sm:h-20 sm:w-20">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="80px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-brand-ink">{product.name}</p>
          {soldOut ? (
            <p className="text-sm font-bold text-red-500">Sold out</p>
          ) : product.isDiscountActive ? (
            <p className="text-sm font-bold text-stone-500">
              <span className="mr-1.5 line-through">{formatNaira(product.basePrice)}</span>
              <span className="font-price text-brand-royal-gold-dark">{formatNaira(product.effectivePrice)}</span>
            </p>
          ) : (
            <p className="font-price text-sm text-stone-500">{formatNaira(product.basePrice)}</p>
          )}
        </div>
        <Stepper quantity={entry.quantity} onChange={onQuantityChange} disabled={soldOut} />
      </div>

      {entry.quantity > 0 && toppings.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-brand-line/20 pt-3">
          {toppings.map((t) => (
            <label
              key={t._id}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition ${
                entry.toppingIds.includes(t._id)
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-brand-line/50 text-stone-600 hover:bg-brand-cream"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={entry.toppingIds.includes(t._id)}
                onChange={() => onToggleTopping(t._id)}
              />
              {t.name} +{formatNaira(t.price)}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function OrderForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("box");

  const categories = useQuery(api.categories.list);
  const products = useQuery(api.products.listAll);
  const toppings = useQuery(api.toppings.listActive);
  const orderingStatus = useQuery(api.settings.getOrderingStatus);
  const createOrder = useMutation(api.orders.create);

  const [cart, setCart] = useState<Record<string, CartEntry>>(() =>
    preselected ? { [preselected]: { quantity: 1, toppingIds: [] } } : {},
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; grandTotal: number } | null>(null);

  const loading = categories === undefined || products === undefined || toppings === undefined;

  function setQuantity(productId: string, quantity: number) {
    setCart((prev) => ({
      ...prev,
      [productId]: { quantity, toppingIds: prev[productId]?.toppingIds ?? [] },
    }));
  }

  function toggleTopping(productId: string, toppingId: Id<"toppings">) {
    setCart((prev) => {
      const entry = prev[productId] ?? { quantity: 0, toppingIds: [] };
      const toppingIds = entry.toppingIds.includes(toppingId)
        ? entry.toppingIds.filter((t) => t !== toppingId)
        : [...entry.toppingIds, toppingId];
      return { ...prev, [productId]: { ...entry, toppingIds } };
    });
  }

  const productsById = new Map((products ?? []).map((p) => [p._id, p]));
  const toppingsById = new Map((toppings ?? []).map((t) => [t._id, t]));

  const cartLines = Object.entries(cart)
    .filter(([, entry]) => entry.quantity > 0)
    .map(([productId, entry]) => {
      const product = productsById.get(productId as Id<"products">);
      if (!product) return null;
      const selectedToppings = entry.toppingIds.map((id) => toppingsById.get(id)).filter(Boolean) as {
        _id: Id<"toppings">;
        name: string;
        price: number;
      }[];
      const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
      const unitPrice = product.effectivePrice + toppingsTotal;
      return { productId, product, entry, selectedToppings, unitPrice, lineTotal: unitPrice * entry.quantity };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null && line.product.status === "available");

  const itemCount = cartLines.reduce((sum, l) => sum + l.entry.quantity, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (orderingStatus && !orderingStatus.isOpenNow) {
      setError("We're not accepting orders right now. Please check back later.");
      return;
    }
    if (itemCount === 0) {
      setError("Add at least one item to your order.");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Name, phone, and delivery address are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("A valid email is required so we can send your receipt.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        items: cartLines.map((l) => ({
          productId: l.product._id,
          quantity: l.entry.quantity,
          toppingIds: l.entry.toppingIds,
        })),
        customerName: name,
        phone,
        email,
        address,
        notes: notes || undefined,
        paymentMethod,
      });
      setPlacedOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong placing your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-xl rounded-[2.5rem] border-2 border-brand-royal-gold/30 bg-white/90 p-8 text-center shadow-2xl shadow-amber-950/10 sm:p-12">
        <span className="sticker bg-brand-royal-gold text-white">Order placed</span>
        <h1 className="font-display mt-6 text-4xl font-black tracking-[-0.03em]">Thank you!</h1>
        <p className="mt-4 text-lg leading-7 text-stone-600">Your order number is</p>
        <p className="font-display mt-2 text-3xl font-black tracking-[-0.02em] text-brand-coral-dark">
          {placedOrder.orderNumber}
        </p>
        <p className="mt-4 text-stone-600">
          Total: <span className="font-price text-brand-ink">{formatNaira(placedOrder.grandTotal)}</span>
        </p>
        <p className="mt-1 text-sm text-stone-500">Save this number — it&apos;s on your receipt and works to track your order.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/receipt/${placedOrder.orderNumber}`} className="btn-brand">View receipt</Link>
          <Link href={`/track-order?id=${placedOrder.orderNumber}`} className="btn-ghost">Track your order</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const productsByCategory = new Map<string, MenuProduct[]>();
  products!.forEach((p) => {
    const list = productsByCategory.get(p.categoryId) ?? [];
    list.push(p);
    productsByCategory.set(p.categoryId, list);
  });

  const closed = orderingStatus !== undefined && !orderingStatus.isOpenNow;

  return (
    <>
      {closed ? (
        <div className="mb-8 rounded-2xl border-2 border-brand-coral/40 bg-brand-coral-light/30 p-5 text-center">
          <p className="font-black text-brand-coral-dark">We&apos;re not taking orders right now.</p>
          <p className="mt-1 text-sm text-stone-600">Please check back soon — you can still browse the menu below.</p>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
      <div className="space-y-8">
        {categories!.map((category, index) => {
          const items = productsByCategory.get(category._id) ?? [];
          if (items.length === 0) return null;
          const accent = accentForIndex(index);
          return (
            <div key={category._id}>
              <h2 className={`text-sm font-black uppercase tracking-[0.22em] ${accentMap[accent].text}`}>
                {category.name}
              </h2>
              <div className="mt-4 grid gap-3">
                {items.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    entry={cart[product._id] ?? { quantity: 0, toppingIds: [] }}
                    onQuantityChange={(next) => setQuantity(product._id, next)}
                    onToggleTopping={(toppingId) => toggleTopping(product._id, toppingId)}
                    toppings={toppings ?? []}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary-dark">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-stone-600 sm:col-span-1">
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
                placeholder="Ada Obi"
              />
            </label>
            <label className="text-sm font-bold text-stone-600 sm:col-span-1">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
                placeholder="080..."
              />
            </label>
            <label className="text-sm font-bold text-stone-600 sm:col-span-2">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
                placeholder="you@example.com"
              />
            </label>
            <label className="text-sm font-bold text-stone-600 sm:col-span-2">
              Delivery address
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
                placeholder="Street, area, Abuja"
              />
            </label>
            <label className="text-sm font-bold text-stone-600 sm:col-span-2">
              Payment method
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
              >
                <option value="cash_on_delivery">Cash on delivery</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </label>
            <label className="text-sm font-bold text-stone-600 sm:col-span-2">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
                placeholder="Preferred delivery time, ring the gate, etc."
              />
            </label>
          </div>
        </div>
      </div>

      <div className="h-fit rounded-[2rem] border-2 border-brand-line/40 bg-white/90 p-6 shadow-xl shadow-amber-950/10 lg:sticky lg:top-28">
        <h2 className="text-xl font-black">Order summary</h2>
        {cartLines.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Your box is empty — add items from the menu on the left.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {cartLines.map((l) => (
              <div key={l.productId} className="text-sm font-bold text-stone-700">
                <div className="flex items-center justify-between">
                  <span>{l.entry.quantity} × {l.product.name}</span>
                  <span className="font-price">{formatNaira(l.lineTotal)}</span>
                </div>
                {l.selectedToppings.length > 0 ? (
                  <p className="text-xs font-medium text-stone-500">
                    + {l.selectedToppings.map((t) => t.name).join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 space-y-2 border-t border-brand-line/30 pt-4 text-sm font-bold text-stone-600">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-price">{formatNaira(subtotal)}</span></div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="font-price">{deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-brand-line/30 pt-3 text-lg font-black text-brand-ink">
          <span>Total</span>
          <span className="font-price text-xl">{formatNaira(total)}</span>
        </div>
        {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? (
          <p className="mt-3 text-xs font-bold text-brand-coral-dark">
            Add {formatNaira(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
          </p>
        ) : null}

        {error ? <p className="mt-4 text-sm font-bold text-brand-coral-dark">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || closed}
          className="btn-brand mt-6 w-full justify-center disabled:opacity-60"
        >
          {submitting ? "Placing order…" : closed ? "Ordering closed" : "Place order"}
        </button>
      </div>
      </form>
    </>
  );
}
