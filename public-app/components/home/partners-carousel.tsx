"use client";

import { useEffect, useRef, useState } from "react";

type Partner = { id: string; name: string; logo_url: string | null; website_url: string | null };

const SLOT = 176; // px width of one partner slot (incl. gap)
const INTERVAL = 3500; // each partner is in view 3.5s, then the next
const SLIDE_MS = 600;

function PartnerItem({ partner }: { partner: Partner }) {
  const inner = partner.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={partner.logo_url} alt={partner.name} className="max-h-10 w-auto max-w-[8.5rem] object-contain" />
  ) : (
    <span className="whitespace-nowrap text-sm font-medium text-foreground">{partner.name}</span>
  );
  // Logos sit on a light tile so dark or transparent artwork stays visible in both themes.
  const tile = "flex h-16 w-40 items-center justify-center rounded-lg border border-border bg-white px-4 shadow-sm";
  const style = partner.logo_url ? tile : tile.replace("bg-white", "bg-surface");
  return partner.website_url ? (
    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name} className={style}>
      {inner}
    </a>
  ) : (
    <div aria-label={partner.name} className={style}>{inner}</div>
  );
}

export function PartnersCarousel({ partners }: { partners: Partner[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => ro.disconnect();
  }, []);

  // Only animate when the partners don't all fit on screen.
  const overflowing = width > 0 && partners.length * SLOT > width;
  const running = overflowing && !reduced && !paused;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [running]);

  // After sliding onto the cloned set, jump back to the start with no transition.
  useEffect(() => {
    if (index < partners.length) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, SLIDE_MS + 50);
    return () => clearTimeout(t);
  }, [index, partners.length]);

  useEffect(() => {
    if (!overflowing) {
      setAnimate(false);
      setIndex(0);
    }
  }, [overflowing]);

  const track = overflowing ? [...partners, ...partners] : partners;

  return (
    <div
      ref={wrapRef}
      className="mt-6 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={overflowing ? "flex w-max" : "flex flex-wrap items-center justify-center"}
        style={
          overflowing
            ? {
                transform: `translateX(-${index * SLOT}px)`,
                transition: animate ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
              }
            : undefined
        }
      >
        {track.map((partner, i) => (
          <div key={`${partner.id}-${i}`} className={overflowing ? "shrink-0 px-2" : "px-2 py-2"} style={overflowing ? { width: SLOT } : undefined}>
            <PartnerItem partner={partner} />
          </div>
        ))}
      </div>
    </div>
  );
}
