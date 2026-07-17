import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./authz";
import { computeEffectivePrice } from "./products";
import { orderStatus } from "./schema";
import { isOrderingOpen, readOrderingSettings } from "./settings";

function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `PUF-${code}`;
}

async function uniqueOrderNumber(ctx: MutationCtx): Promise<string> {
  let orderNumber = generateOrderNumber();
  while (
    await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique()
  ) {
    orderNumber = generateOrderNumber();
  }
  return orderNumber;
}

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        toppingIds: v.array(v.id("toppings")),
      }),
    ),
    customerName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
    notes: v.optional(v.string()),
    paymentMethod: v.union(v.literal("cash_on_delivery"), v.literal("bank_transfer")),
  },
  handler: async (ctx, args) => {
    const orderingSettings = await readOrderingSettings(ctx);
    if (!isOrderingOpen(orderingSettings)) {
      throw new Error("We're not accepting orders right now. Please check back later.");
    }

    if (!args.customerName.trim() || !args.phone.trim() || !args.address.trim()) {
      throw new Error("Name, phone, and delivery address are required.");
    }

    const now = Date.now();
    const lineItems: {
      productId: Id<"products">;
      name: string;
      unitPrice: number;
      quantity: number;
      toppings: { toppingId: Id<"toppings">; name: string; price: number }[];
      lineTotal: number;
    }[] = [];

    let subtotal = 0;
    let baseTotal = 0;

    for (const item of args.items) {
      if (item.quantity < 1) continue;
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "available") continue;

      const discount = await ctx.db
        .query("discounts")
        .withIndex("by_product", (q) => q.eq("productId", product._id))
        .unique();
      const { price } = computeEffectivePrice(product.basePrice, discount, now);

      const toppings: { toppingId: Id<"toppings">; name: string; price: number }[] = [];
      let toppingsTotal = 0;
      for (const toppingId of item.toppingIds) {
        const topping = await ctx.db.get(toppingId);
        if (!topping || !topping.active) continue;
        toppings.push({ toppingId: topping._id, name: topping.name, price: topping.price });
        toppingsTotal += topping.price;
      }

      const unitPrice = price + toppingsTotal;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      baseTotal += (product.basePrice + toppingsTotal) * item.quantity;

      lineItems.push({
        productId: product._id,
        name: product.name,
        unitPrice,
        quantity: item.quantity,
        toppings,
        lineTotal,
      });
    }

    if (lineItems.length === 0) {
      throw new Error("Your order is empty, or the selected items are no longer available.");
    }

    // Delivery fee depends on distance and is set by the rider on arrival, not collected online.
    const deliveryFee = 0;
    const discountApplied = Math.max(0, baseTotal - subtotal);
    const grandTotal = subtotal + deliveryFee;
    const orderNumber = await uniqueOrderNumber(ctx);

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      customerName: args.customerName.trim(),
      phone: args.phone.trim(),
      email: args.email?.trim() || undefined,
      address: args.address.trim(),
      notes: args.notes?.trim() || undefined,
      subtotal,
      deliveryFee,
      discountApplied,
      grandTotal,
      paymentMethod: args.paymentMethod,
      paymentStatus: "unpaid",
      status: "pending",
      statusHistory: [{ status: "pending", at: now }],
      createdAt: now,
      updatedAt: now,
    });

    await Promise.all(lineItems.map((item) => ctx.db.insert("orderItems", { orderId, ...item })));

    const itemSummary = lineItems
      .map((item) => `${item.quantity} × ${item.name}${item.toppings.length ? ` (+ ${item.toppings.map((t) => t.name).join(", ")})` : ""}`)
      .join("\n");
    await ctx.scheduler.runAfter(0, internal.notifications.sendNewOrderEmail, {
      orderId,
      orderNumber,
      customerName: args.customerName.trim(),
      phone: args.phone.trim(),
      address: args.address.trim(),
      grandTotal,
      itemSummary,
    });

    return { orderNumber, grandTotal };
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber.trim().toUpperCase()))
      .unique();
    if (!order) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();

    return { order, items };
  },
});

const DATE_RANGE = v.optional(v.union(v.literal("today"), v.literal("week"), v.literal("month")));

function rangeStart(range: "today" | "week" | "month" | undefined): number | null {
  if (!range) return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  if (range === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start.getTime();
  }
  const start = new Date(now);
  start.setMonth(start.getMonth() - 1);
  return start.getTime();
}

export const listForAdmin = query({
  args: {
    status: v.optional(orderStatus),
    dateRange: DATE_RANGE,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { status, dateRange, search }) => {
    await requireAdmin(ctx);

    let orders: Doc<"orders">[];
    if (status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db.query("orders").withIndex("by_created_at").order("desc").collect();
    }

    const since = rangeStart(dateRange);
    if (since !== null) {
      orders = orders.filter((o) => o.createdAt >= since);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.phone.toLowerCase().includes(term) ||
          (o.email ?? "").toLowerCase().includes(term),
      );
    }

    return orders;
  },
});

export const getForAdmin = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(id);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", id))
      .collect();
    return { order, items };
  },
});

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ["accepted", "rejected"],
  accepted: ["preparing"],
  preparing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  rejected: [],
};

// TODO: notify(order, previousStatus) — plug in email/SMS/push here once a
// provider is chosen. Every status change already flows through this single
// mutation, so no other code needs to change when notifications are added.
async function notify(_order: Doc<"orders">, _previousStatus: string) {
  // Intentionally a no-op for now.
}

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found.");

    const allowed = NEXT_STATUSES[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new Error(`Can't move an order from "${order.status}" to "${status}".`);
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      status,
      statusHistory: [...order.statusHistory, { status, at: now }],
      updatedAt: now,
    });

    await notify({ ...order, status }, order.status);
  },
});

export const updatePaymentStatus = mutation({
  args: { id: v.id("orders"), paymentStatus: v.union(v.literal("unpaid"), v.literal("paid")) },
  handler: async (ctx, { id, paymentStatus }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { paymentStatus, updatedAt: Date.now() });
  },
});

