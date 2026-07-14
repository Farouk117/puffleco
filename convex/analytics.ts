import { query } from "./_generated/server";
import { requireAdmin } from "./authz";

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function startOfWeek(): number {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.getTime();
}

function startOfMonth(): number {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.getTime();
}

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [orders, products, discounts, orderItems] = await Promise.all([
      ctx.db.query("orders").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("discounts").collect(),
      ctx.db.query("orderItems").collect(),
    ]);

    const statusCounts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      rejected: 0,
    };
    for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

    const revenueOrders = orders.filter((o) => o.status !== "rejected");
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const todayStart = startOfToday();
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    const todayRevenue = revenueOrders.filter((o) => o.createdAt >= todayStart).reduce((s, o) => s + o.grandTotal, 0);
    const weekRevenue = revenueOrders.filter((o) => o.createdAt >= weekStart).reduce((s, o) => s + o.grandTotal, 0);
    const monthRevenue = revenueOrders.filter((o) => o.createdAt >= monthStart).reduce((s, o) => s + o.grandTotal, 0);

    const averageOrderValue = revenueOrders.length > 0 ? Math.round(totalRevenue / revenueOrders.length) : 0;

    const now = Date.now();
    const activeDiscounts = discounts.filter((d) => d.enabled && now >= d.startDate && now <= d.endDate).length;

    const revenueOrderIds = new Set(revenueOrders.map((o) => o._id));
    const validOrderItems = orderItems.filter((item) => revenueOrderIds.has(item.orderId));

    const productSales = new Map<string, { name: string; quantity: number }>();
    const toppingSales = new Map<string, { name: string; quantity: number }>();
    for (const item of validOrderItems) {
      const p = productSales.get(item.productId) ?? { name: item.name, quantity: 0 };
      p.quantity += item.quantity;
      productSales.set(item.productId, p);

      for (const topping of item.toppings) {
        const t = toppingSales.get(topping.toppingId) ?? { name: topping.name, quantity: 0 };
        t.quantity += item.quantity;
        toppingSales.set(topping.toppingId, t);
      }
    }

    const bestSellingProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    const mostOrderedToppings = Array.from(toppingSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

    return {
      totalOrders: orders.length,
      statusCounts,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      averageOrderValue,
      totalProducts: products.length,
      activeDiscounts,
      bestSellingProducts,
      mostOrderedToppings,
      recentOrders,
    };
  },
});
