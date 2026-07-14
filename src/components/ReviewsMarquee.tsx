const reviews = [
  "The puff puff is unbelievably fluffy — better than anything I've had before.",
  "Toppings are so worth it, the lotus drizzle is the move.",
  "Ordered for a birthday party and it was gone in twenty minutes.",
  "Pancakes stayed warm all the way to the office, real gourmet quality.",
  "Loved being able to track my order live instead of waiting on a DM.",
  "Golden, soft, and so fresh, exactly like the pictures.",
  "My go-to for last minute cravings, it never disappoints.",
  "The party box fed everyone with leftovers to spare.",
];

function ReviewCard({ text }: { text: string }) {
  return (
    <figure className="mx-3 w-72 shrink-0 rounded-[1.75rem] border-2 border-brand-line/30 bg-white/85 p-6 shadow-sm">
      <span className="font-display text-3xl leading-none text-brand-royal-gold">&ldquo;</span>
      <blockquote className="mt-1 text-sm leading-6 text-stone-700">{text}</blockquote>
      <figcaption className="mt-4 text-sm tracking-wide text-brand-royal-gold-dark">★★★★★</figcaption>
    </figure>
  );
}

export default function ReviewsMarquee() {
  return (
    <section className="overflow-hidden py-16 sm:py-20">
      <div className="container-page mb-10 text-center">
        <span className="eyebrow">Loved locally</span>
        <h2 className="font-display mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          What people are <span className="font-script text-brand-royal-gold-dark">saying.</span>
        </h2>
      </div>
      <div className="marquee-fade relative">
        <div className="marquee-track">
          {[...reviews, ...reviews].map((text, i) => (
            <ReviewCard key={i} text={text} />
          ))}
        </div>
      </div>
    </section>
  );
}
