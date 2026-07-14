import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * Authorization for the whole admin dashboard boils down to: is there an
 * `admins` row for the currently authenticated user? There is no public
 * sign-up flow, so the only way a row exists is via the one-off seed script
 * (convex/seed.ts) — customers can never become admins.
 */
export const currentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!admin) return null;

    return { name: admin.name };
  },
});

export const createAdminRecord = internalMutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, { userId, name }) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("admins", { userId, name, createdAt: Date.now() });
  },
});
