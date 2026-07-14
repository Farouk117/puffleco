import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authz";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").withIndex("by_order").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    await requireAdmin(ctx);

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Category name is required.");

    const slug = slugify(trimmed);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("A category with this name already exists.");

    const all = await ctx.db.query("categories").collect();
    const nextOrder = all.reduce((max, c) => Math.max(max, c.order), -1) + 1;

    return await ctx.db.insert("categories", {
      name: trimmed,
      slug,
      order: nextOrder,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("categories"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    await requireAdmin(ctx);

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Category name is required.");

    const slug = slugify(trimmed);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing && existing._id !== id) {
      throw new Error("A category with this name already exists.");
    }

    await ctx.db.patch(id, { name: trimmed, slug });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const productInCategory = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .first();
    if (productInCategory) {
      throw new Error("Move or delete the products in this category first.");
    }

    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("categories")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);
    await Promise.all(orderedIds.map((id, index) => ctx.db.patch(id, { order: index })));
  },
});
