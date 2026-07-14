import { v } from "convex/values";
import { requireAdmin } from "./authz";
import { mutation, query } from "./_generated/server";
import { computeEffectivePrice } from "./products";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const discounts = await ctx.db.query("discounts").collect();
    const now = Date.now();

    return Promise.all(
      discounts.map(async (discount) => {
        const product = await ctx.db.get(discount.productId);
        const { active, price } = computeEffectivePrice(product?.basePrice ?? 0, discount, now);

        let status: "active" | "scheduled" | "expired" | "disabled";
        if (!discount.enabled) status = "disabled";
        else if (now < discount.startDate) status = "scheduled";
        else if (now > discount.endDate) status = "expired";
        else status = "active";

        return {
          ...discount,
          productName: product?.name ?? "Deleted product",
          basePrice: product?.basePrice ?? 0,
          effectivePrice: price,
          isCurrentlyActive: active,
          status,
        };
      }),
    );
  },
});

export const setEnabled = mutation({
  args: { id: v.id("discounts"), enabled: v.boolean() },
  handler: async (ctx, { id, enabled }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { enabled });
  },
});
