import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { ContactIcon, InstagramIcon, LocationIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact | The Pufflette.co",
  description: "Get in touch with The Pufflette.co for orders, questions, or feedback.",
};

const info = [
  { label: "Location", value: "Abuja, Nigeria", icon: LocationIcon },
  { label: "Email", value: "orders@thepufflette.co", href: "mailto:orders@thepufflette.co", icon: ContactIcon },
  { label: "Instagram", value: "@thepufflette.co", href: "https://www.instagram.com/thepufflette.co", icon: InstagramIcon },
];

export default function ContactPage() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Contact us</span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          Questions? <span className="font-script text-brand-royal-gold-dark">We&apos;ve got you.</span>
        </h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">
          For order changes, bulk requests, or anything else, reach us directly or send a message below.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-4">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-4 rounded-[1.75rem] border-2 border-brand-line/40 bg-white/80 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-royal-gold-light/35 text-brand-royal-gold-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-1 block text-lg font-black text-brand-coral-dark">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-lg font-black text-brand-ink">{item.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
