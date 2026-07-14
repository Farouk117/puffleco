import type { Metadata } from "next";
import ToppingsManager from "@/components/admin/ToppingsManager";

export const metadata: Metadata = {
  title: "Toppings | Admin",
  robots: { index: false, follow: false },
};

export default function AdminToppingsPage() {
  return <ToppingsManager />;
}
