"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks the pointer over the whole room and writes --par-x / --par-y
 * CSS variables (each in the range -1..1) so the scene photo can drift
 * gently against the camera, selling the room as a space you're standing
 * in rather than a flat picture. Values are lerped in a rAF loop so the
 * motion feels like shifting your weight, not a cursor-follow gimmick.
 */
export function useSceneParallax<T extends HTMLElement>() {
  const roomRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let running = false;

    const step = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      room.style.setProperty("--par-x", current.x.toFixed(4));
      room.style.setProperty("--par-y", current.y.toFixed(4));
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
      // Touch drags are for scrolling; only a hovering pointer moves the room.
      if (event.pointerType !== "mouse") return;
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
      kick();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    room.addEventListener("pointermove", onMove);
    room.addEventListener("pointerleave", onLeave);
    return () => {
      room.removeEventListener("pointermove", onMove);
      room.removeEventListener("pointerleave", onLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return roomRef;
}
