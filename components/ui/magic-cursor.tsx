"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { createRoot } from "react-dom/client";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface MagicCursorProps {
  /** Duration of the sparkle animation in milliseconds */
  starAnimationDuration?: number;
  /** Minimum time between sparkle spawns in milliseconds */
  minimumTimeBetweenStars?: number;
  /** Minimum distance between sparkle spawns in pixels */
  minimumDistanceBetweenStars?: number;
  /** Duration of the glow trail in milliseconds */
  glowDuration?: number;
  /** Max spacing between glow points in pixels */
  maximumGlowPointSpacing?: number;
  /** Colors in "R G B" format matching theme */
  colors?: string[];
  /** Sizes for sparkles */
  sizes?: string[];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectRandom<T>(items: T[]): T {
  return items[rand(0, items.length - 1)];
}

function calcDistance(a: Point, b: Point) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

// Theme accent colors: --neu-accent: #818cf8 (indigo), purple-400, white
const THEME_COLORS = [
  "129 140 248", // #818cf8 — main accent indigo
  "192 132 252", // #c084fc — purple-400
  "226 232 240", // #e2e8f0 — text light (white-ish)
  "99 102 241",  // #6366f1 — accent hover deeper
];

const ANIMATIONS = ["fall-1", "fall-2", "fall-3"];

export function MagicCursor({
  starAnimationDuration = 1200,
  minimumTimeBetweenStars = 200,
  minimumDistanceBetweenStars = 65,
  glowDuration = 80,
  maximumGlowPointSpacing = 8,
  colors = THEME_COLORS,
  sizes = ["1.2rem", "0.9rem", "0.55rem"],
}: MagicCursorProps) {
  const config = React.useRef({
    starAnimationDuration,
    minimumTimeBetweenStars,
    minimumDistanceBetweenStars,
    glowDuration,
    maximumGlowPointSpacing,
    colors,
    sizes,
  });

  const last = React.useRef({
    starTimestamp: Date.now(),
    starPosition: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
  });

  let count = React.useRef(0);

  const createStar = React.useCallback(
    (position: Point) => {
      const wrapper = document.createElement("div");
      const color = selectRandom(config.current.colors);
      const size = selectRandom(config.current.sizes);
      const anim = ANIMATIONS[count.current++ % 3];

      wrapper.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 99999;
        left: ${position.x}px;
        top: ${position.y}px;
        font-size: ${size};
        color: rgb(${color});
        text-shadow: 0 0 1rem rgb(${color} / 0.6);
        animation-name: ${anim};
        animation-duration: ${config.current.starAnimationDuration}ms;
        animation-timing-function: ease-out;
        animation-fill-mode: forwards;
        will-change: transform, opacity;
      `;

      document.body.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(<Sparkles className="h-full w-full" />);

      setTimeout(() => {
        try {
          root.unmount();
          if (document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
          }
        } catch {
          // already removed — ignore
        }
      }, config.current.starAnimationDuration + 50);
    },
    []
  );

  const createGlowPoint = React.useCallback((position: Point) => {
    const glow = document.createElement("div");
    glow.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 99998;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgb(129 140 248 / 0.55), transparent 70%);
      will-change: opacity;
    `;

    document.body.appendChild(glow);
    setTimeout(() => {
      try {
        if (document.body.contains(glow)) document.body.removeChild(glow);
      } catch { /* ignore */ }
    }, config.current.glowDuration);
  }, []);

  const createGlow = React.useCallback(
    (lastPos: Point, current: Point) => {
      const distance = calcDistance(lastPos, current);
      const quantity = Math.max(
        Math.floor(distance / config.current.maximumGlowPointSpacing),
        1
      );
      const dx = (current.x - lastPos.x) / quantity;
      const dy = (current.y - lastPos.y) / quantity;

      for (let i = 0; i < quantity; i++) {
        createGlowPoint({ x: lastPos.x + dx * i, y: lastPos.y + dy * i });
      }
    },
    [createGlowPoint]
  );

  const handleMove = React.useCallback(
    (e: { clientX: number; clientY: number }) => {
      const pos = { x: e.clientX, y: e.clientY };

      if (last.current.mousePosition.x === 0 && last.current.mousePosition.y === 0) {
        last.current.mousePosition = pos;
      }

      const now = Date.now();
      const farEnough =
        calcDistance(last.current.starPosition, pos) >=
        config.current.minimumDistanceBetweenStars;
      const longEnough =
        now - last.current.starTimestamp > config.current.minimumTimeBetweenStars;

      if (farEnough || longEnough) {
        createStar(pos);
        last.current.starTimestamp = now;
        last.current.starPosition = pos;
      }

      createGlow(last.current.mousePosition, pos);
      last.current.mousePosition = pos;
    },
    [createStar, createGlow]
  );

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => handleMove(e);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0]);
    };
    const onLeave = () => {
      last.current.mousePosition = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    document.body.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      document.body.removeEventListener("mouseleave", onLeave);
    };
  }, [handleMove]);

  // Renders nothing — purely imperative DOM side-effects
  return null;
}
