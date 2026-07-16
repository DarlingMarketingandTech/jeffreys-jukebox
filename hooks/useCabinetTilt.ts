"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks the pointer over a stage element and writes tilt/glare CSS variables
 * (--tilt-x, --tilt-y, --glare-x, --glare-y) so the cabinet can lean toward
 * the cursor and its glass can catch the light. Values are lerped in a rAF
 * loop so the motion feels like a heavy machine, not a sticker.
 */
export function useCabinetTilt<T extends HTMLElement>() {
  const stageRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let running = false;

    const step = () => {
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      stage.style.setProperty("--tilt-x", `${(current.y * -3.2).toFixed(3)}deg`);
      stage.style.setProperty("--tilt-y", `${(current.x * 6.5).toFixed(3)}deg`);
      stage.style.setProperty("--glare-x", `${(50 + current.x * 36).toFixed(2)}%`);
      stage.style.setProperty("--glare-y", `${(36 + current.y * 24).toFixed(2)}%`);
      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        frameRef.current = requestAnimationFrame(step);
      }
    };

    const onMove = (event: PointerEvent) => {
      // Touch drags are for scrolling; only a hovering pointer steers the cabinet.
      if (event.pointerType !== "mouse") return;
      const rect = stage.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      kick();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return stageRef;
}
