"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type RoomView = "center" | "left" | "right";

export interface MoodContextType {
  isHazeActive: boolean;
  smokeDensity: number;
  currentView: RoomView;
  toggleHaze: () => void;
  setView: (view: RoomView) => void;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [isHazeActive, setIsHazeActive] = useState(false);
  const [smokeDensity, setSmokeDensity] = useState(0);
  const [currentView, setCurrentView] = useState<RoomView>("center");
  const densityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const target = isHazeActive ? 1 : 0;
    const step = isHazeActive ? 0.02 : 0.01;

    const animateDensity = () => {
      const current = densityRef.current;
      const next = target > current
        ? Math.min(target, current + step)
        : Math.max(target, current - step);

      densityRef.current = next;
      setSmokeDensity(next);

      if (next !== target) {
        animationFrameRef.current = requestAnimationFrame(animateDensity);
      } else {
        animationFrameRef.current = null;
      }
    };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateDensity);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isHazeActive]);

  const value = useMemo<MoodContextType>(() => ({
    isHazeActive,
    smokeDensity,
    currentView,
    toggleHaze: () => setIsHazeActive((active) => !active),
    setView: setCurrentView,
  }), [currentView, isHazeActive, smokeDensity]);

  return <MoodContext value={value}>{children}</MoodContext>;
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider in Jeffrey's Jukebox.");
  }
  return context;
}
