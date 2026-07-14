import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 py-16">
      <section className="max-w-2xl rounded-[3rem] border border-brand-line/40 bg-white/80 p-8 text-center shadow-2xl shadow-amber-950/10 sm:p-12">
        <span className="eyebrow">404 · Missing box</span>
        <h1 className="font-display mt-6 text-6xl font-black tracking-[-0.06em] sm:text-7xl">
          This treat is <span className="font-script text-brand-royal-gold-dark">not on the tray.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-stone-600">
          The page you opened may have moved, but the pancakes and puff puff are still fresh.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-brand" href="/">Back home</Link>
          <Link className="btn-ghost" href="/menu">View menu</Link>
        </div>
      </section>
    </div>
  );
}
