import type { Metadata } from "next";
import OrderDetail from "@/components/admin/OrderDetail";
import type { Id } from "@convex/_generated/dataModel";

export const metadata: Metadata = {
  title: "Order | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id as Id<"orders">} />;
}
