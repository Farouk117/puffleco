import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import AdminShell from "@/components/admin/AdminShell";
import ToastProvider from "@/components/admin/ui/ToastProvider";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const token = await convexAuthNextjsToken();
  const admin = token ? await fetchQuery(api.admins.currentAdmin, {}, { token }) : null;

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <AdminShell admin={admin}>{children}</AdminShell>
    </ToastProvider>
  );
}
