"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type RoomView = "inside" | "outside";

export interface MoodContextType {
  currentView: RoomView;
  setView: (view: RoomView) => void;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<RoomView>("inside");

  const value = useMemo<MoodContextType>(() => ({
    currentView,
    setView: setCurrentView,
  }), [currentView]);

  return <MoodContext value={value}>{children}</MoodContext>;
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider in Jeffrey's Jukebox.");
  }
  return context;
}
