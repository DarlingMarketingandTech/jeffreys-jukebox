"use client";

import { useEffect, useRef } from "react";

interface AudioEmberProps {
  analyserNode?: AnalyserNode | null;
  audioElement?: HTMLAudioElement | null;
  isPlaying?: boolean;
}

export function AudioEmber({ analyserNode = null, audioElement = null, isPlaying = false }: AudioEmberProps) {
  const emberRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ownedContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let analyser = analyserNode;

    if (!analyser && audioElement) {
      try {
        const context = new AudioContext();
        const source = context.createMediaElementSource(audioElement);
        analyser = context.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser).connect(context.destination);
        ownedContextRef.current = context;
      } catch {
        analyser = null;
      }
    }

    if (analyser) analyser.fftSize = 64;
    const frequencyData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const restEmber = () => {
      const ember = emberRef.current;
      if (!ember) return;
      ember.style.transform = "scale(1.000)";
      ember.style.backgroundColor = "#D35400";
      ember.style.boxShadow = "0 0 7px rgba(211, 84, 0, 0.32), 0 0 14px rgba(211, 84, 0, 0.12)";
      ember.dataset.volumeScale = "1.000";
    };

    const drawEmber = () => {
      const ember = emberRef.current;
      if (!ember) return;

      let normalizedLevel = 0;
      if (analyser && frequencyData && isPlaying) {
        analyser.getByteFrequencyData(frequencyData);
        let total = 0;
        for (let index = 0; index < frequencyData.length; index += 1) {
          total += Math.abs(frequencyData[index]);
        }
        normalizedLevel = Math.min(1, total / frequencyData.length / 255);
      }

      const volumeScale = 1 + normalizedLevel * 1.5;
      const glowRadius = 7 + normalizedLevel * 24;
      const glowAlpha = 0.32 + normalizedLevel * 0.68;
      const emberColor = normalizedLevel > 0.2 ? "#FF3B30" : "#D35400";

      ember.style.transform = `scale(${volumeScale.toFixed(3)})`;
      ember.style.backgroundColor = emberColor;
      ember.style.boxShadow = `0 0 ${glowRadius.toFixed(1)}px rgba(255, 59, 48, ${glowAlpha.toFixed(3)}), 0 0 ${(glowRadius * 2).toFixed(1)}px rgba(211, 84, 0, ${(glowAlpha * 0.38).toFixed(3)})`;
      ember.dataset.volumeScale = volumeScale.toFixed(3);

      animationFrameRef.current = requestAnimationFrame(drawEmber);
    };

    if (isPlaying && analyser) {
      animationFrameRef.current = requestAnimationFrame(drawEmber);
    } else {
      restEmber();
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (ownedContextRef.current) {
        void ownedContextRef.current.close();
        ownedContextRef.current = null;
      }
    };
  }, [analyserNode, audioElement, isPlaying]);

  return (
    <aside className="fixed bottom-20 right-5 z-[47] hidden select-none items-center gap-2 sm:flex" aria-label="Audio-reactive joint ember">
      <span className="font-mono text-[7px] font-black uppercase tracking-[0.15em] text-[#89785b]">Audio Ember</span>
      <div className="relative h-5 w-28 rotate-[-8deg] drop-shadow-[0_5px_7px_rgba(0,0,0,0.8)]" aria-hidden="true">
        <span className="absolute right-1 top-1/2 h-[9px] w-24 -translate-y-1/2 rounded-l-full border border-[#a9997a] bg-[linear-gradient(180deg,#e7ddc8,#bcae91_55%,#ded1b7)]" />
        <span className="absolute right-[5px] top-1/2 h-[7px] w-4 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#765f45_0_2px,#aa9474_2px_4px)] opacity-70" />
        <span
          ref={emberRef}
          className="absolute left-[2px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-[#D35400] transition-colors duration-100 will-change-transform"
          data-volume-scale="1.000"
        />
      </div>
    </aside>
  );
}
