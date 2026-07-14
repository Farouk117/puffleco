import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_12%_4%,_#ffe1a0,_transparent_32%),radial-gradient(circle_at_90%_10%,_#fff,_transparent_24%),linear-gradient(180deg,_#fffaf1_0%,_#fffdf8_48%,_#fff3d8_100%)] text-brand-ink">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
