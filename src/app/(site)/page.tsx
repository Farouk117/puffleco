import Image from "next/image";
import Link from "next/link";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import { ContactIcon, FlameIcon, PancakeIcon, ToppingIcon, TrackIcon } from "@/components/icons";
import { accentMap } from "@/lib/data";

const quickLinks = [
  { href: "/menu", icon: PancakeIcon, title: "Menu", copy: "Every dish, every size, live pricing.", accent: "coral" as const },
  { href: "/toppings", icon: ToppingIcon, title: "Toppings", copy: "Add-ons priced individually — pick as many as you like.", accent: "royal" as const },
  { href: "/track-order", icon: TrackIcon, title: "Track Order", copy: "Enter your order number to see its status.", accent: "gold" as const },
  { href: "/contact", icon: ContactIcon, title: "Contact", copy: "Questions or bulk requests? Reach us directly.", accent: "coral" as const },
];

const steps = [
  {
    title: "Choose your box",
    copy: "Pick from the menu and mix in extra toppings if you want them.",
    accent: "gold" as const,
  },
  {
    title: "Checkout on the site",
    copy: "Add your address and delivery time — no DMs needed.",
    accent: "coral" as const,
  },
  {
    title: "We confirm and prepare",
    copy: "Your order status updates live, right on this site.",
    accent: "royal" as const,
  },
  {
    title: "Delivered fresh",
    copy: "Enjoy a warm, glossy box packed for sharing and photos.",
    accent: "gold" as const,
  },
];

function Sparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M12 0c.6 5.6 1.8 8 7.2 9-5.4 1-6.6 3.4-7.2 9-.6-5.6-1.8-8-7.2-9 5.4-1 6.6-3.4 7.2-9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block" aria-hidden="true">
      <span className="dot bob h-4 w-4 bg-brand-coral" style={{ left: "6%", top: "22%", animationDelay: "0.2s" }} />
      <span className="dot bob h-3 w-3 bg-brand-royal-gold" style={{ left: "12%", top: "68%", animationDelay: "1.1s" }} />
      <span className="dot bob h-5 w-5 bg-brand-primary" style={{ left: "3%", top: "45%", animationDelay: "0.6s" }} />
      <Sparkle className="wiggle absolute h-8 w-8 text-brand-coral" style={{ left: "8%", top: "10%" }} />
      <Sparkle className="wiggle absolute h-6 w-6 text-brand-royal-gold" style={{ left: "14%", top: "85%" }} />
    </div>
  );
}

function PhotoTile({
  src,
  alt,
  accent,
  rotate,
  sticker,
}: {
  src: string;
  alt: string;
  accent: "coral" | "royal";
  rotate?: "left" | "right";
  sticker?: string;
}) {
  const a = accentMap[accent];
  const tilt = rotate === "left" ? "-rotate-2" : rotate === "right" ? "rotate-2" : "";
  return (
    <div
      className={`relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl shadow-lg ring-1 ${a.tint} ${tilt} transform transition duration-300 hover:rotate-0 hover:scale-105`}
    >
      <div className="relative aspect-[4/5] w-full bg-gray-50">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 92vw, 420px" className="object-cover" />
      </div>
      {sticker ? (
        <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${a.badgeBg}`}>
          {sticker}
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="animated-bg relative overflow-hidden bg-gradient-to-br from-brand-cream via-brand-royal-gold-light/35 to-brand-coral-light/40 bg-[length:200%_200%] py-14 sm:py-20 lg:py-24">
        <HeroDecor />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">Limited time offer · Abuja</span>
              <span className="sticker wiggle bg-brand-coral text-white">
                <FlameIcon className="h-3.5 w-3.5" /> Hot right now
              </span>
            </div>
            <p className="font-script mt-4 text-3xl text-brand-royal-gold-dark sm:text-4xl">Golden. Soft. Freshly made.</p>
            <h1 className="font-display mt-3 max-w-xl text-[2.75rem] font-semibold leading-[1] tracking-[-0.03em] text-brand-ink sm:text-6xl lg:text-[4rem] xl:text-[4.6rem]">
              Golden puff puff <span className="text-brand-coral">&amp;</span> fluffy pancakes made to steal the table.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-stone-700">
              Fresh gourmet boxes, real product photography, toppings priced individually, and ordering that happens
              right here on the site — no DMs required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-brand" href="/order">Start your order</Link>
              <Link className="btn-ghost" href="/menu">See full menu</Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["2", "signature menus", "gold"],
                ["6", "box sizes", "coral"],
                ["3", "premium toppings", "royal"],
              ].map(([value, label, accent]) => (
                <div
                  key={label}
                  className={`rounded-3xl border-2 bg-white/70 p-4 shadow-sm ${accentMap[accent as keyof typeof accentMap].border}`}
                >
                  <p className={`font-price text-3xl ${accentMap[accent as keyof typeof accentMap].text}`}>{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-10 top-4 hidden h-64 w-64 rounded-full bg-brand-coral-light/40 blur-3xl lg:block" />
            <div className="absolute -left-6 bottom-0 hidden h-52 w-52 rounded-full bg-brand-royal-gold-light/50 blur-3xl lg:block" />
            <div className="relative grid grid-cols-[1fr_0.72fr] gap-3 sm:gap-4 lg:items-end">
              <div className="shine">
                <PhotoTile
                  src="/brand/photos/pancake-hero.jpg"
                  alt="Stack of pancakes with berries and syrup"
                  accent="coral"
                  rotate="left"
                  sticker="★ Fluffy"
                />
              </div>
              <div className="grid gap-4">
                <PhotoTile
                  src="/brand/photos/puff-hero.jpg"
                  alt="Bowl of puff puff with chocolate drizzle"
                  accent="royal"
                  rotate="right"
                  sticker="★ Golden"
                />
                <div className="rounded-[2rem] bg-brand-ink p-5 text-white shadow-xl shadow-amber-950/20">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary-light">Free delivery</p>
                  <p className="font-price mt-2 text-2xl text-brand-royal-gold-light">Over ₦20,000</p>
                  <p className="mt-1 text-sm text-white/70">Pancakes, puff puff, or both.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Explore</span>
          <h2 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Everything in <span className="font-script text-brand-royal-gold-dark">one place.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const a = accentMap[link.accent];
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group rounded-[2rem] border-2 bg-white/80 p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/10 ${a.border}/30`}
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${a.tint} ${a.text}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-xl font-black text-brand-ink">{link.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{link.copy}</p>
                <span className={`mt-4 inline-flex text-sm font-black ${a.text}`}>
                  Go <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <ReviewsMarquee />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-ink p-8 text-white md:col-span-2">
            <span className="sticker wiggle absolute right-6 top-6 bg-brand-coral text-white">
              <FlameIcon className="h-3.5 w-3.5" /> Trending
            </span>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary-light">Fast. Fresh. Delivered.</p>
            <h2 className="font-display mt-4 max-w-lg text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Made fresh, packed with care, <span className="font-script font-medium text-brand-royal-gold-light">delivered to your doorstep.</span>
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/70">
              Free delivery when the order is above ₦20,000. Order directly on the site and track it from checkout
              to your door.
            </p>
          </div>
          <div className="rounded-[2rem] border-2 border-brand-royal-gold/30 bg-white/80 p-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-royal-gold-dark">Location</p>
            <h3 className="mt-4 text-3xl font-black">Abuja</h3>
            <p className="mt-4 leading-7 text-stone-600">
              Add your exact area and delivery time at checkout — we&apos;ll confirm before it&apos;s on the way.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="rounded-[3rem] bg-white p-6 shadow-2xl shadow-amber-950/10 ring-1 ring-brand-line/40 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <span className="eyebrow">How to order</span>
              <h2 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Simple enough for <span className="font-script text-brand-royal-gold-dark">cravings.</span>
              </h2>
              <p className="mt-5 leading-8 text-stone-600">
                Choose your box, checkout on the site, and track your order the whole way — no DMs, no waiting on a reply.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-brand" href="/order">Start your order</Link>
                <Link className="btn-ghost" href="/contact">Contact us</Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => {
                const a = accentMap[step.accent];
                return (
                  <div key={step.title} className="rounded-[2rem] bg-brand-cream p-6 ring-1 ring-brand-line/35">
                    <span className={`grid h-11 w-11 place-items-center rounded-full text-lg font-black text-white ${a.bg}`}>
                      {index + 1}
                    </span>
                    <h3 className="mt-5 text-2xl font-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{step.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
