"use client";

import { useEffect, useState } from "react";
import { highThoughts, soberThoughts } from "@/lib/highThoughts";

function nextThoughtIndex(length: number, currentIndex: number) {
  if (length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (length - 1));
  return (currentIndex + offset) % length;
}

interface BarPhilosophyProps {
  look: "left" | "center" | "right";
  isOutside: boolean;
}

export function BarPhilosophy({ look, isOutside }: BarPhilosophyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const thoughts = isOutside ? highThoughts : soberThoughts;
  const visible = isOutside || look !== "center";

  useEffect(() => {
    setThoughtIndex(0);
  }, [isOutside]);

  useEffect(() => {
    if (!visible) setIsOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (!visible) return null;

  const currentThought = thoughts[thoughtIndex % thoughts.length];
  const anchorClass = look === "left" ? "coaster-anchor-left" : "coaster-anchor-right";

  return (
    <div className={`coaster-anchor ${anchorClass}`}>
      <button
        type="button"
        className={`coaster-button ${isOutside ? "coaster-button-outside" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={isOutside ? "Read an alley thought from the glowing coaster" : "Read some bar philosophy from the coaster"}
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
          aria-label={isOutside ? "Alley thought" : "Bar philosophy"}
          className={`coaster-dialog torn-napkin ${isOutside ? "coaster-dialog-outside" : ""}`}
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
            <span>{isOutside ? "ALLEY THOUGHT No." : "BAR NOTE No."} {String(thoughtIndex + 1).padStart(2, "0")}</span>
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
