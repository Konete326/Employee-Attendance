"use client";

import { useEffect, useRef, useCallback } from "react";

interface Vector2D {
  x: number;
  y: number;
}

// ── Theme palette matching --neu-accent + supporting colors ──
const THEME_COLORS = [
  { r: 129, g: 140, b: 248 }, // #818cf8 — indigo accent
  { r: 192, g: 132, b: 252 }, // #c084fc — purple-400
  { r: 99,  g: 102, b: 241 }, // #6366f1 — indigo-500
  { r: 52,  g: 211, b: 153 }, // #34d399 — emerald (success)
  { r: 226, g: 232, b: 240 }, // #e2e8f0 — slate-200 (near white)
  { r: 165, g: 180, b: 252 }, // #a5b4fc — indigo-300
];

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };

  closeEnoughTarget = 100;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;

  startColor = { r: 129, g: 140, b: 248 };
  targetColor = { r: 129, g: 140, b: 248 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move() {
    let proximityMult = 1;
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
        Math.pow(this.pos.y - this.target.y, 2)
    );
    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };
    const mag = Math.sqrt(
      towardsTarget.x ** 2 + towardsTarget.y ** 2
    );
    if (mag > 0) {
      towardsTarget.x = (towardsTarget.x / mag) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / mag) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };
    const steerMag = Math.sqrt(steer.x ** 2 + steer.y ** 2);
    if (steerMag > 0) {
      steer.x = (steer.x / steerMag) * this.maxForce;
      steer.y = (steer.y / steerMag) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }
    const c = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    };

    ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
    if (drawAsPoints) {
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const randomPos = randomOffscreen(width / 2, height / 2, (width + height) / 2);
      this.target.x = randomPos.x;
      this.target.y = randomPos.y;
      this.startColor = blendColor(this.startColor, this.targetColor, this.colorWeight);
      this.targetColor = { r: 26, g: 26, b: 46 }; // match --neu-bg
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

function blendColor(
  from: { r: number; g: number; b: number },
  to: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: Math.round(from.r + (to.r - from.r) * t),
    g: Math.round(from.g + (to.g - from.g) * t),
    b: Math.round(from.b + (to.b - from.b) * t),
  };
}

function randomOffscreen(cx: number, cy: number, mag: number): Vector2D {
  const rx = Math.random() * 1000;
  const ry = Math.random() * 400;
  const dx = rx - cx;
  const dy = ry - cy;
  const m = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: cx + (dx / m) * mag, y: cy + (dy / m) * mag };
}

// ── AttendEase project words ──────────────────────────────────────
const DEFAULT_WORDS = [
  "AttendEase",
  "GPS Check-In",
  "Payroll Engine",
  "Manage Leaves",
  "Role Access",
  "HR Platform",
  "Track Hours",
  "Admin Panel",
];

interface ParticleTextEffectProps {
  words?: string[];
  /** Canvas internal width (scales down via CSS on mobile) */
  canvasWidth?: number;
  canvasHeight?: number;
  /** ms between word transitions */
  intervalMs?: number;
}

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  canvasWidth = 1000,
  canvasHeight = 300,
  intervalMs = 3000,
}: ParticleTextEffectProps) {
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const animationRef      = useRef<number>(0);
  const particlesRef      = useRef<Particle[]>([]);
  const frameCountRef     = useRef(0);
  const wordIndexRef      = useRef(0);
  const intervalFramesRef = useRef(0);
  const mouseRef          = useRef({ x: 0, y: 0, isPressed: false, isRight: false });

  const PIXEL_STEPS  = 5;
  const DRAW_POINTS  = true;
  // Convert ms to approximate frames at 60fps
  const FRAME_INTERVAL = Math.round((intervalMs / 1000) * 60);

  const nextWord = useCallback(
    (word: string, canvas: HTMLCanvasElement) => {
      const off = document.createElement("canvas");
      off.width  = canvas.width;
      off.height = canvas.height;
      const offCtx = off.getContext("2d")!;

      // Responsive font size based on canvas width
      const fontSize = Math.max(Math.floor(canvas.width / 8), 40);
      offCtx.fillStyle    = "white";
      offCtx.font         = `bold ${fontSize}px Inter, Arial, sans-serif`;
      offCtx.textAlign    = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(word, canvas.width / 2, canvas.height / 2);

      const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels    = imageData.data;

      // Pick a theme color for this word
      const newColor = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
      const particles = particlesRef.current;
      let pIdx = 0;

      // Collect & shuffle pixel positions for fluid motion
      const coords: number[] = [];
      for (let i = 0; i < pixels.length; i += PIXEL_STEPS * 4) coords.push(i);
      for (let i = coords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coords[i], coords[j]] = [coords[j], coords[i]];
      }

      for (const idx of coords) {
        if (pixels[idx + 3] === 0) continue;
        const x = (idx / 4) % canvas.width;
        const y = Math.floor(idx / 4 / canvas.width);

        let p: Particle;
        if (pIdx < particles.length) {
          p = particles[pIdx];
          p.isKilled = false;
          pIdx++;
        } else {
          p = new Particle();
          const rp = randomOffscreen(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
          p.pos.x         = rp.x;
          p.pos.y         = rp.y;
          p.maxSpeed      = Math.random() * 6 + 4;
          p.maxForce      = p.maxSpeed * 0.05;
          p.particleSize  = Math.random() * 5 + 4;
          p.colorBlendRate = Math.random() * 0.025 + 0.003;
          particles.push(p);
        }

        p.startColor   = blendColor(p.startColor, p.targetColor, p.colorWeight);
        p.targetColor  = newColor;
        p.colorWeight  = 0;
        p.target.x     = x;
        p.target.y     = y;
      }

      for (let i = pIdx; i < particles.length; i++) {
        particles[i].kill(canvas.width, canvas.height);
      }
    },
    [PIXEL_STEPS]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx       = canvas.getContext("2d")!;
    const particles = particlesRef.current;

    // Background fade — matches --neu-bg (#1a1a2e) with low opacity for trails
    ctx.fillStyle = "rgba(26, 26, 46, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.move();
      p.draw(ctx, DRAW_POINTS);
      if (p.isKilled && (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height)) {
        particles.splice(i, 1);
      }
    }

    // Right-click destroy
    if (mouseRef.current.isPressed && mouseRef.current.isRight) {
      for (const p of particles) {
        const d = Math.sqrt((p.pos.x - mouseRef.current.x) ** 2 + (p.pos.y - mouseRef.current.y) ** 2);
        if (d < 60) p.kill(canvas.width, canvas.height);
      }
    }

    frameCountRef.current++;
    intervalFramesRef.current++;
    if (intervalFramesRef.current >= FRAME_INTERVAL) {
      intervalFramesRef.current = 0;
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
      nextWord(words[wordIndexRef.current], canvas);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [words, FRAME_INTERVAL, nextWord, DRAW_POINTS]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;

    // Fill canvas background immediately so there's no white flash
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgb(26, 26, 46)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    nextWord(words[0], canvas);
    animate();

    const onDown  = (e: MouseEvent) => {
      mouseRef.current.isPressed = true;
      mouseRef.current.isRight   = e.button === 2;
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / r.width;
      const scaleY = canvas.height / r.height;
      mouseRef.current.x = (e.clientX - r.left) * scaleX;
      mouseRef.current.y = (e.clientY - r.top)  * scaleY;
    };
    const onUp    = () => { mouseRef.current.isPressed = false; mouseRef.current.isRight = false; };
    const onMove  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / r.width;
      const scaleY = canvas.height / r.height;
      mouseRef.current.x = (e.clientX - r.left) * scaleX;
      mouseRef.current.y = (e.clientY - r.top)  * scaleY;
    };
    const noCtx   = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener("mousedown",   onDown);
    canvas.addEventListener("mouseup",     onUp);
    canvas.addEventListener("mousemove",   onMove);
    canvas.addEventListener("contextmenu", noCtx);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("mousedown",   onDown);
      canvas.removeEventListener("mouseup",     onUp);
      canvas.removeEventListener("mousemove",   onMove);
      canvas.removeEventListener("contextmenu", noCtx);
    };
  }, []);  // only on mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        width:     "100%",
        height:    "auto",
        display:   "block",
        borderRadius: "1rem",
        background: "rgb(26,26,46)",
      }}
    />
  );
}
