import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("preparing"),
  v.literal("out_for_delivery"),
  v.literal("delivered"),
  v.literal("rejected"),
);

export const discountType = v.union(v.literal("percentage"), v.literal("fixed"));

export const toppingRef = v.object({
  toppingId: v.id("toppings"),
  name: v.string(),
  price: v.number(),
});

export default defineSchema({
  ...authTables,

  admins: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_slug", ["slug"]),

  toppings: defineTable({
    name: v.string(),
    price: v.number(),
    active: v.boolean(),
    order: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_active_order", ["active", "order"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    imageStorageId: v.optional(v.id("_storage")),
    basePrice: v.number(),
    toppingIds: v.array(v.id("toppings")),
    status: v.union(v.literal("available"), v.literal("sold_out")),
    prepTimeMinutes: v.number(),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"]),

  discounts: defineTable({
    productId: v.id("products"),
    name: v.optional(v.string()),
    enabled: v.boolean(),
    type: discountType,
    value: v.number(),
    startDate: v.number(),
    endDate: v.number(),
  }).index("by_product", ["productId"]),

  orders: defineTable({
    orderNumber: v.string(),
    customerName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    deliveryFee: v.number(),
    discountApplied: v.number(),
    grandTotal: v.number(),
    paymentMethod: v.union(v.literal("cash_on_delivery"), v.literal("bank_transfer")),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid")),
    status: orderStatus,
    statusHistory: v.array(v.object({ status: orderStatus, at: v.number() })),
    estimatedDeliveryAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_order_number", ["orderNumber"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    name: v.string(),
    unitPrice: v.number(),
    quantity: v.number(),
    toppings: v.array(toppingRef),
    lineTotal: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_product", ["productId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});
