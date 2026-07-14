import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./authz";

async function withImageUrl(ctx: QueryCtx, topping: Doc<"toppings">) {
  const imageUrl = topping.imageStorageId ? await ctx.storage.getUrl(topping.imageStorageId) : null;
  return { ...topping, imageUrl };
}

/** All toppings, for the admin table (includes inactive). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const toppings = await ctx.db.query("toppings").withIndex("by_active_order").order("asc").collect();
    return Promise.all(toppings.map((t) => withImageUrl(ctx, t)));
  },
});

/** Active toppings only, for the public menu/order flow. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const toppings = await ctx.db
      .query("toppings")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .order("asc")
      .collect();
    return Promise.all(toppings.map((t) => withImageUrl(ctx, t)));
  },
});

export const create = mutation({
  args: { name: v.string(), price: v.number(), imageStorageId: v.optional(v.id("_storage")) },
  handler: async (ctx, { name, price, imageStorageId }) => {
    await requireAdmin(ctx);

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Topping name is required.");
    if (price < 0) throw new Error("Price cannot be negative.");

    const all = await ctx.db.query("toppings").collect();
    const nextOrder = all.reduce((max, t) => Math.max(max, t.order), -1) + 1;

    return await ctx.db.insert("toppings", {
      name: trimmed,
      price,
      active: true,
      order: nextOrder,
      imageStorageId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("toppings"),
    name: v.string(),
    price: v.number(),
    active: v.boolean(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { id, name, price, active, imageStorageId }) => {
    await requireAdmin(ctx);

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Topping name is required.");
    if (price < 0) throw new Error("Price cannot be negative.");

    const existing = await ctx.db.get(id);
    if (existing?.imageStorageId && imageStorageId && existing.imageStorageId !== imageStorageId) {
      await ctx.storage.delete(existing.imageStorageId);
    }

    await ctx.db.patch(id, { name: trimmed, price, active, imageStorageId });
  },
});

export const remove = mutation({
  args: { id: v.id("toppings") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const products = await ctx.db.query("products").collect();
    const inUse = products.some((p) => p.toppingIds.includes(id));
    if (inUse) {
      throw new Error("Remove this topping from all products before deleting it.");
    }

    const topping = await ctx.db.get(id);
    if (topping?.imageStorageId) await ctx.storage.delete(topping.imageStorageId);

    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("toppings")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);
    await Promise.all(orderedIds.map((id, index) => ctx.db.patch(id, { order: index })));
  },
});
