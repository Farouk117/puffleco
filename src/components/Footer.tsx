import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-brand-line/40 bg-brand-paper print:hidden">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <Image src="/brand/logo.png" alt="The Pufflette.co" width={172} height={67} unoptimized className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-600">
            Gourmet pancakes and puff puff, made fresh with premium toppings and delivered across Abuja.
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-stone-600">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="w-fit hover:text-brand-coral-dark">
                {link.label}
              </Link>
            ))}
            <Link href="/order" className="w-fit hover:text-brand-coral-dark">
              Order Now
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Get in touch</p>
          <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-stone-600">
            <span>Abuja</span>
            <a href="mailto:orders@thepufflette.co" className="w-fit hover:text-brand-coral-dark">
              orders@thepufflette.co
            </a>
            <a
              href="https://www.instagram.com/thepufflette.co"
              className="w-fit hover:text-brand-coral-dark"
              target="_blank"
              rel="noreferrer"
            >
              @thepufflette.co
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-line/25">
        <div className="container-page py-5 text-[0.7rem] font-bold text-stone-500">
          © 2026 The Pufflette.co · Gourmet Pancakes & Puff Puff · powered by Faroukandco eng
        </div>
      </div>
    </footer>
  );
}
