"use client";

import { useEffect, useState } from "react";
import { highThoughts, soberThoughts } from "@/lib/highThoughts";

function nextThoughtIndex(length: number, currentIndex: number) {
  if (length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  return (currentIndex + offset) % length;
}

interface BarPhilosophyProps {}

export function BarPhilosophy({}: BarPhilosophyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const thoughts = soberThoughts;
  const visible = true;

  useEffect(() => {
    setThoughtIndex(0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const currentThought = thoughts[thoughtIndex % thoughts.length];

  return (
    <div className="coaster-anchor coaster-anchor-right">
      <button
        type="button"
        className="coaster-button"
        onClick={() => setIsOpen(true)}
        aria-label="Read some bar philosophy from the coaster"
        aria-haspopup="dialog"
      >
        <span className="coaster-button-ring" aria-hidden="true" />
        <span className="coaster-button-label">
          Alley<br />Cat
          <small>Table Wisdom</small>
        </span>
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Bar philosophy"
          className="coaster-dialog torn-napkin"
        >
          <button
            type="button"
            className="coaster-dialog-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close the coaster thought"
          >
            ×
          </button>

          <div className="coaster-dialog-header">
            <span>BAR NOTE No. {String(thoughtIndex + 1).padStart(2, "0")}</span>
            <span>6267 CARROLLTON</span>
          </div>

          <blockquote className="coaster-dialog-quote" aria-live="polite">
            &ldquo;{currentThought}&rdquo;
          </blockquote>

          <div className="coaster-dialog-footer">
            <span className="coaster-dialog-attribution">— somebody at the Cat</span>
            <button
              type="button"
              className="coaster-dialog-next"
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
