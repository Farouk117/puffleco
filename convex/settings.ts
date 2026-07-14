import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./authz";

const ORDERING_KEY = "ordering";

export type WeeklySchedule = {
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
};

export type OrderingSettings = {
  manuallyClosed: boolean;
  weeklySchedule: WeeklySchedule;
};

const DEFAULT_SETTINGS: OrderingSettings = {
  manuallyClosed: false,
  weeklySchedule: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true },
};

const WEEKDAY_KEYS: (keyof WeeklySchedule)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function isOrderingOpen(settings: OrderingSettings, now = new Date()): boolean {
  if (settings.manuallyClosed) return false;
  return settings.weeklySchedule[WEEKDAY_KEYS[now.getDay()]];
}

async function readOrderingSettings(ctx: QueryCtx): Promise<OrderingSettings> {
  const doc = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", ORDERING_KEY))
    .unique();
  return (doc?.value as OrderingSettings | undefined) ?? DEFAULT_SETTINGS;
}

export const getOrderingStatus = query({
  args: {},
  handler: async (ctx) => {
    const settings = await readOrderingSettings(ctx);
    return { settings, isOpenNow: isOrderingOpen(settings) };
  },
});

export const updateOrderingSettings = mutation({
  args: {
    manuallyClosed: v.boolean(),
    weeklySchedule: v.object({
      sun: v.boolean(),
      mon: v.boolean(),
      tue: v.boolean(),
      wed: v.boolean(),
      thu: v.boolean(),
      fri: v.boolean(),
      sat: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", ORDERING_KEY))
      .unique();

    const value: OrderingSettings = { manuallyClosed: args.manuallyClosed, weeklySchedule: args.weeklySchedule };
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key: ORDERING_KEY, value });
    }
  },
});

export { readOrderingSettings };
