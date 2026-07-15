"use client";

import { useEffect, useRef } from "react";

interface SmokeCanvasProps {
  smokeDensity: number;
}

interface CursorPosition {
  x: number;
  y: number;
  active: boolean;
}

class SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  seed: number;

  constructor(width: number, height: number, randomizeX = true) {
    this.x = randomizeX ? Math.random() * width : -300;
    this.y = Math.random() * (height + 300);
    this.vx = 0.08 + Math.random() * 0.18;
    this.vy = -(0.06 + Math.random() * 0.14);
    this.radius = 110 + Math.random() * 90;
    this.opacity = 0.035 + Math.random() * 0.035;
    this.seed = Math.random() * Math.PI * 2;
  }

  reset(width: number, height: number) {
    this.x = -this.radius;
    this.y = height * 0.35 + Math.random() * height * 0.8;
    this.vx = 0.08 + Math.random() * 0.18;
    this.vy = -(0.06 + Math.random() * 0.14);
    this.radius = 110 + Math.random() * 90;
    this.opacity = 0.035 + Math.random() * 0.035;
    this.seed = Math.random() * Math.PI * 2;
  }
}

export function SmokeCanvas({ smokeDensity }: SmokeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const drawFrameRef = useRef<() => void>(() => undefined);
  const densityRef = useRef(smokeDensity);
  const particlesRef = useRef<SmokeParticle[]>([]);
  const cursorRef = useRef<CursorPosition>({ x: 0, y: 0, active: false });

  useEffect(() => {
    densityRef.current = smokeDensity;
    if (smokeDensity > 0 && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(drawFrameRef.current);
    }
  }, [smokeDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let cssWidth = 0;
    let cssHeight = 0;
    let elapsedFrames = 0;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = Math.max(1, bounds.width);
      cssHeight = Math.max(1, bounds.height);
      canvas.width = Math.round(cssWidth * pixelRatio);
      canvas.height = Math.round(cssHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: 10 }, () => new SmokeParticle(cssWidth, cssHeight));
      }
    };

    const trackCursor = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const inside = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom;
      cursorRef.current = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        active: inside,
      };
    };

    const drawFrame = () => {
      animationFrameRef.current = null;
      const density = densityRef.current;

      if (density === 0) {
        context.clearRect(0, 0, cssWidth, cssHeight);
        return;
      }

      context.clearRect(0, 0, cssWidth, cssHeight);
      elapsedFrames += 1;

      for (const particle of particlesRef.current) {
        const cursor = cursorRef.current;
        if (cursor.active) {
          const deltaX = particle.x - cursor.x;
          const deltaY = particle.y - cursor.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (deltaX / distance) * force * 0.055;
            particle.vy += (deltaY / distance) * force * 0.055;
          }
        }

        particle.vx = Math.max(-0.35, Math.min(0.52, particle.vx * 0.996 + 0.0007));
        particle.vy = Math.max(-0.42, Math.min(0.32, particle.vy * 0.997 - 0.0003));
        particle.x += particle.vx + Math.sin(elapsedFrames * 0.007 + particle.seed) * 0.16;
        particle.y += particle.vy + Math.cos(elapsedFrames * 0.005 + particle.seed) * 0.1;

        if (particle.x - particle.radius > cssWidth || particle.y + particle.radius < -120) {
          particle.reset(cssWidth, cssHeight);
        }

        const alpha = particle.opacity * density * 0.85;
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius,
        );
        gradient.addColorStop(0, `rgba(215, 210, 195, ${alpha})`);
        gradient.addColorStop(0.45, `rgba(215, 210, 195, ${alpha * 0.58})`);
        gradient.addColorStop(1, "rgba(215, 210, 195, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrameRef.current = drawFrame;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", trackCursor, { passive: true });

    if (densityRef.current > 0) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", trackCursor);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="smoke-canvas absolute inset-0 h-full w-full pointer-events-none"
      data-smoke-density={smokeDensity.toFixed(2)}
      aria-hidden="true"
    />
  );
}
