"use client";

import { useEffect, useState } from "react";
import { highThoughts, soberThoughts } from "@/lib/highThoughts";
import { useMood } from "@/lib/mood";

function nextThoughtIndex(length: number, currentIndex: number) {
  if (length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  return (currentIndex + offset) % length;
}

export function BarPhilosophy() {
  const { isHazeActive, currentView } = useMood();
  const [isOpen, setIsOpen] = useState(false);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const thoughts = isHazeActive ? highThoughts : soberThoughts;

  useEffect(() => {
    setThoughtIndex(0);
  }, [isHazeActive]);

  useEffect(() => {
    if (currentView === "center") setIsOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (currentView === "center") return null;

  const currentThought = thoughts[thoughtIndex % thoughts.length];
  const placement = currentView === "left" ? "right-5 sm:right-10" : "left-5 sm:left-10";

  return (
    <div className={`fixed bottom-20 z-[46] ${placement}`}>
      <button
        type="button"
        className={`group relative grid h-24 w-24 rotate-[7deg] place-items-center rounded-full border-[5px] border-double border-[#553822] bg-[#b58a52] text-center text-[#3d2115] shadow-[0_7px_18px_rgba(0,0,0,0.75)] transition duration-500 hover:rotate-[2deg] hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#d4ad61] ${isHazeActive ? "shadow-[0_0_15px_rgba(0,245,212,0.6)] animate-[coaster-pulse_3.8s_ease-in-out_infinite]" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={isHazeActive ? "Read a high thought from the glowing coaster" : "Read some bar philosophy from the coaster"}
        aria-haspopup="dialog"
      >
        <span className="absolute inset-[7px] rounded-full border border-dashed border-[#6d472a]/70" aria-hidden="true" />
        <span className="relative font-[Georgia,serif] text-[10px] font-black uppercase leading-[1.05] tracking-[0.16em]">
          Alley<br />Cat
          <small className="mt-1 block text-[6px] tracking-[0.1em]">Table Wisdom</small>
        </span>
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={isHazeActive ? "High thought" : "Bar philosophy"}
          className={`torn-napkin fixed left-1/2 top-1/2 z-[64] w-[min(390px,calc(100vw-36px))] -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] bg-[#FAF4E5] px-8 pb-7 pt-9 text-[#281b13] shadow-[0_30px_90px_rgba(0,0,0,0.85)] ${isHazeActive ? "shadow-[0_0_45px_rgba(0,245,212,0.16),0_30px_90px_rgba(0,0,0,0.85)]" : ""}`}
        >
          <button
            type="button"
            className="absolute right-3 top-2 grid h-8 w-8 place-items-center rounded-full border border-[#5a4535]/40 bg-[#d9c9a7]/55 font-mono text-sm font-black hover:bg-[#cbb58c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b3928]"
            onClick={() => setIsOpen(false)}
            aria-label="Close the coaster thought"
          >
            ×
          </button>

          <div className="mb-5 flex items-center justify-between border-b border-[#6d5540]/30 pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#745741]">
            <span>{isHazeActive ? "HIGH THOUGHT No." : "BAR NOTE No."} {String(thoughtIndex + 1).padStart(2, "0")}</span>
            <span>6267 CARROLLTON</span>
          </div>

          <blockquote
            className="min-h-36 content-center text-balance text-center font-['Segoe_Print','Bradley_Hand',cursive] text-[clamp(1.45rem,5vw,2.15rem)] font-semibold leading-[1.28]"
            aria-live="polite"
          >
            “{currentThought}”
          </blockquote>

          <div className="mt-6 flex items-end justify-between gap-4 border-t border-dashed border-[#765b43]/45 pt-4">
            <span className="rotate-[-6deg] font-['Segoe_Print','Bradley_Hand',cursive] text-xs text-[#8a3529]">— somebody at the Cat</span>
            <button
              type="button"
              className="min-h-10 border-2 border-[#4c3020] bg-[#4c211b] px-4 font-mono text-[10px] font-black uppercase tracking-[0.1em] text-[#f3e5c5] shadow-[3px_3px_0_#b79b72] transition hover:-translate-y-0.5 hover:bg-[#6b2b22] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#8a3529]"
              onClick={() => setThoughtIndex((current) => nextThoughtIndex(thoughts.length, current))}
            >
              Think Another One...
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
