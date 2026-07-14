import type { Metadata } from "next";
import SettingsManager from "@/components/admin/SettingsManager";

export const metadata: Metadata = {
  title: "Settings | Admin",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
