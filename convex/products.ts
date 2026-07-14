import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./authz";
import { discountType } from "./schema";

const discountArgs = v.optional(
  v.object({
    name: v.optional(v.string()),
    enabled: v.boolean(),
    type: discountType,
    value: v.number(),
    startDate: v.number(),
    endDate: v.number(),
  }),
);

type DiscountInput = {
  name?: string;
  enabled: boolean;
  type: "percentage" | "fixed";
  value: number;
  startDate: number;
  endDate: number;
};

const productFields = {
  name: v.string(),
  description: v.string(),
  categoryId: v.id("categories"),
  imageStorageId: v.optional(v.id("_storage")),
  basePrice: v.number(),
  toppingIds: v.array(v.id("toppings")),
  status: v.union(v.literal("available"), v.literal("sold_out")),
  prepTimeMinutes: v.number(),
  featured: v.boolean(),
};

export function computeEffectivePrice(
  basePrice: number,
  discount: Doc<"discounts"> | null,
  now: number,
): { active: boolean; price: number } {
  if (!discount || !discount.enabled) return { active: false, price: basePrice };
  if (now < discount.startDate || now > discount.endDate) return { active: false, price: basePrice };

  const raw =
    discount.type === "percentage"
      ? basePrice - (basePrice * discount.value) / 100
      : basePrice - discount.value;

  return { active: true, price: Math.max(0, Math.round(raw)) };
}

async function enrichProduct(ctx: QueryCtx, product: Doc<"products">) {
  const discount = await ctx.db
    .query("discounts")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .unique();
  const imageUrl = product.imageStorageId ? await ctx.storage.getUrl(product.imageStorageId) : null;
  const { active, price } = computeEffectivePrice(product.basePrice, discount, Date.now());

  return {
    ...product,
    imageUrl,
    discount,
    isDiscountActive: active,
    effectivePrice: price,
  };
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").order("desc").collect();
    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();
    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;
    return enrichProduct(ctx, product);
  },
});

async function upsertDiscount(
  ctx: MutationCtx,
  productId: Id<"products">,
  discount: DiscountInput | undefined,
) {
  const existing = await ctx.db
    .query("discounts")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .unique();

  if (!discount) {
    if (existing) await ctx.db.delete(existing._id);
    return;
  }

  if (existing) {
    await ctx.db.patch(existing._id, discount);
  } else {
    await ctx.db.insert("discounts", { productId, ...discount });
  }
}

export const create = mutation({
  args: { ...productFields, discount: discountArgs },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { discount, ...fields } = args;

    if (!fields.name.trim()) throw new Error("Product name is required.");
    if (fields.basePrice < 0) throw new Error("Base price cannot be negative.");
    if (fields.prepTimeMinutes < 0) throw new Error("Prep time cannot be negative.");

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      ...fields,
      name: fields.name.trim(),
      description: fields.description.trim(),
      createdAt: now,
      updatedAt: now,
    });

    await upsertDiscount(ctx, productId, discount);
    return productId;
  },
});

export const update = mutation({
  args: { id: v.id("products"), ...productFields, discount: discountArgs },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, discount, ...fields } = args;

    if (!fields.name.trim()) throw new Error("Product name is required.");
    if (fields.basePrice < 0) throw new Error("Base price cannot be negative.");
    if (fields.prepTimeMinutes < 0) throw new Error("Prep time cannot be negative.");

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Product not found.");

    if (existing.imageStorageId && fields.imageStorageId && existing.imageStorageId !== fields.imageStorageId) {
      await ctx.storage.delete(existing.imageStorageId);
    }

    await ctx.db.patch(id, {
      ...fields,
      name: fields.name.trim(),
      description: fields.description.trim(),
      updatedAt: Date.now(),
    });

    await upsertDiscount(ctx, id, discount);
  },
});

export const setStatus = mutation({
  args: { id: v.id("products"), status: v.union(v.literal("available"), v.literal("sold_out")) },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const setFeatured = mutation({
  args: { id: v.id("products"), featured: v.boolean() },
  handler: async (ctx, { id, featured }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { featured, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(id);
    if (!product) return;

    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .unique();
    if (discount) await ctx.db.delete(discount._id);

    if (product.imageStorageId) await ctx.storage.delete(product.imageStorageId);

    await ctx.db.delete(id);
  },
});
