"use client";

import { useState } from "react";

const slides = [
  {
    title: "Share your experience",
    body: "Redeemed your credit? Tag us on Instagram so we can celebrate with you.",
    cta: "@cursor.my",
    href: "https://www.instagram.com/cursor.my",
  },
  {
    title: "Join the community",
    body: "Connect with other Cursor users in Malaysia.",
    cta: "Cursor Malaysia WhatsApp",
    href: "https://chat.whatsapp.com/CrpAReM8GGYDo96oYO4ERH?mode=gi_t",
  },
  {
    title: "Your workshop host",
    body: "Questions, feedback, or just want to say hi?",
    cta: "rgbk.club/links",
    href: "https://rgbk.club/links",
  },
] as const;

export function CommunitySlides() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section className="w-full max-w-[420px] mt-12">
      <div className="rounded-md border border-border bg-card p-5 min-h-[140px] flex flex-col justify-between">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">
            {index + 1} / {slides.length}
          </p>
          <h2 className="mt-2 text-sm font-medium">{slide.title}</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">{slide.body}</p>
        </div>
        <a
          href={slide.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-accent hover:text-accent-hover transition-colors"
        >
          {slide.cta} →
        </a>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-border/50"
          aria-label="Previous slide"
        >
          Prev
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-border/50"
          aria-label="Next slide"
        >
          Next
        </button>
      </div>
    </section>
  );
}
