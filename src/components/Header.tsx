"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/lib/data";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-brand-line/25 bg-brand-paper/82 backdrop-blur-xl print:hidden">
      <span className="header-lines" aria-hidden="true" />
      <span className="header-glow" aria-hidden="true" />
      <nav className="container-page relative flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="flex items-center" aria-label="The Pufflette.co home">
          <Image src="/brand/logo.png" alt="The Pufflette.co" width={172} height={67} priority unoptimized className="h-10 w-auto sm:h-12" />
        </Link>

        <div className="hidden items-center gap-7 text-sm font-bold text-stone-700 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-brand-coral-dark ${active ? "text-brand-coral-dark" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link className="btn-brand hidden sm:inline-flex" href="/order">
            Order Now
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-brand-line/50 text-xl md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-brand-line/25 bg-brand-paper md:hidden">
          <div className="container-page flex flex-col gap-1 py-4 text-sm font-bold text-stone-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 transition hover:bg-brand-cream ${
                  pathname === link.href ? "bg-brand-cream text-brand-coral-dark" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="btn-brand mt-2 justify-center"
            >
              Order Now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
