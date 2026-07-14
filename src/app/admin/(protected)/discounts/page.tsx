import type { Metadata } from "next";
import DiscountsManager from "@/components/admin/DiscountsManager";

export const metadata: Metadata = {
  title: "Discounts | Admin",
  robots: { index: false, follow: false },
};

export default function AdminDiscountsPage() {
  return <DiscountsManager />;
}
