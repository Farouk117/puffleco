import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { formatNaira } from "../src/lib/data";

const ADMIN_ORDER_URL = "https://puffleco.vercel.app/admin/orders";

export const sendNewOrderEmail = internalAction({
  args: {
    orderId: v.id("orders"),
    orderNumber: v.string(),
    customerName: v.string(),
    phone: v.string(),
    address: v.string(),
    grandTotal: v.number(),
    itemSummary: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;
    if (!apiKey || !notifyEmail) {
      console.warn("Skipping order email: RESEND_API_KEY or NOTIFY_EMAIL not set.");
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6b4f00;">New order: ${args.orderNumber}</h2>
        <p><strong>${args.customerName}</strong> · ${args.phone}</p>
        <p>${args.address}</p>
        <p style="white-space: pre-line;">${args.itemSummary}</p>
        <p style="font-size: 1.2em; font-weight: bold;">Total: ${formatNaira(args.grandTotal)}</p>
        <a href="${ADMIN_ORDER_URL}/${args.orderId}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #15110b; color: #fff6e4; text-decoration: none; border-radius: 999px;">
          View order
        </a>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Pufflette.co <onboarding@resend.dev>",
        to: notifyEmail,
        subject: `New order ${args.orderNumber} — ${formatNaira(args.grandTotal)}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Failed to send order notification email:", await res.text());
    }
  },
});
