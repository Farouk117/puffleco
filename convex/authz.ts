import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Every admin-only mutation/query must call this first. Convex functions are
 * reachable directly by any client regardless of what the UI shows, so page
 * -level route protection (middleware) is not enough on its own — this is
 * the real authorization boundary.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const admin = await ctx.db
    .query("admins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!admin) throw new Error("Not authorized");

  return admin;
}
