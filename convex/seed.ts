import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// Fixed, non-secret account identifier — the login screen only asks for a
// password, so this never needs to be entered or shown. Must match
// ADMIN_ACCOUNT_ID in src/components/admin/LoginForm.tsx.
const ADMIN_ACCOUNT_ID = "admin@thepufflette.internal";

/**
 * One-off admin creation, run manually from the CLI:
 *   npx convex run seed:seedAdmin '{"password":"...","name":"..."}'
 *
 * There is no UI or public mutation that calls this — admin accounts are
 * never created through the app itself.
 */
export const seedAdmin = internalAction({
  args: { password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: ADMIN_ACCOUNT_ID, secret: args.password },
      profile: { email: ADMIN_ACCOUNT_ID },
    });
    await ctx.runMutation(internal.admins.createAdminRecord, {
      userId: user._id,
      name: args.name,
    });
    return { userId: user._id };
  },
});
