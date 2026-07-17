import type { ReactNode } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col bg-[linear-gradient(180deg,_#fffaf1_0%,_#fffdf8_48%,_#fff3d8_100%)] text-brand-ink">
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-blob h-[38rem] w-[38rem] bg-brand-royal-gold-light/45" style={{ left: "-10%", top: "-14%" }} />
        <span className="aurora-blob h-[30rem] w-[30rem] bg-brand-coral-light/40" style={{ right: "-8%", top: "6%", animationDelay: "-8s" }} />
        <span className="aurora-blob h-[34rem] w-[34rem] bg-brand-primary-light/35" style={{ left: "18%", bottom: "-16%", animationDelay: "-16s" }} />
        <span className="aurora-blob h-[26rem] w-[26rem] bg-brand-royal-gold/25" style={{ right: "10%", bottom: "-10%", animationDelay: "-4s" }} />

        <div className="bg-food-decor absolute -left-28 top-[6%] h-[26rem] w-[26rem] -rotate-[10deg] overflow-hidden rounded-[3.5rem]">
          <Image src="/brand/photos/pancake-hero.jpg" alt="" fill sizes="416px" className="object-cover" priority={false} />
        </div>
        <div className="bg-food-decor absolute -right-24 top-[38%] h-[22rem] w-[22rem] rotate-[9deg] overflow-hidden rounded-[3.5rem]">
          <Image src="/brand/photos/puff-hero.jpg" alt="" fill sizes="352px" className="object-cover" priority={false} />
        </div>
        <div className="bg-food-decor absolute bottom-[-4%] left-[22%] h-[20rem] w-[20rem] rotate-[6deg] overflow-hidden rounded-[3.5rem]">
          <Image src="/brand/photos/pancake-party.jpg" alt="" fill sizes="320px" className="object-cover" priority={false} />
        </div>
      </div>
      <div className="relative z-[1] flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
