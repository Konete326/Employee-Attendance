"use client";

import * as React from "react";

interface ChipLoaderProps {
  /** Full-page overlay mode — centers in viewport */
  fullPage?: boolean;
  /** Text to show inside the chip (default: "Loading") */
  label?: string;
  /** Size preset: "sm" | "md" | "lg" */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-[260px]",
  md: "max-w-[400px]",
  lg: "max-w-[600px]",
};

export function ChipLoader({ fullPage = false, label = "Loading", size = "md" }: ChipLoaderProps) {
  const wrapper = fullPage
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--neu-bg)]/80 backdrop-blur-sm"
    : "flex items-center justify-center w-full h-full min-h-[200px]";

  return (
    <div className={wrapper}>
      <div className={`w-full ${sizeMap[size]} px-4`}>
        <style>{`
          .chip-trace-bg {
            stroke: #252525;
            stroke-width: 1.8;
            fill: none;
          }
          .chip-trace-flow {
            stroke-width: 1.8;
            fill: none;
            stroke-dasharray: 40 400;
            stroke-dashoffset: 438;
            filter: drop-shadow(0 0 6px currentColor);
            animation: chip-flow 3s cubic-bezier(0.5, 0, 0.9, 1) infinite;
          }
          .chip-trace-accent {
            stroke: var(--neu-accent, #818cf8);
            color: var(--neu-accent, #818cf8);
          }
          @keyframes chip-flow {
            to { stroke-dashoffset: 0; }
          }
        `}</style>

        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <defs>
            <linearGradient id="chipBodyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d2d2d" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
            <linearGradient id="chipTextGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eeeeee" />
              <stop offset="100%" stopColor="#888888" />
            </linearGradient>
            <linearGradient id="chipPinGradient" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#bbbbbb" />
              <stop offset="50%" stopColor="#888888" />
              <stop offset="100%" stopColor="#555555" />
            </linearGradient>
          </defs>

          {/* PCB Traces */}
          <g>
            <path d="M100 100 H200 V210 H326" className="chip-trace-bg" />
            <path d="M100 100 H200 V210 H326" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "0s" }} />

            <path d="M80 180 H180 V230 H326" className="chip-trace-bg" />
            <path d="M80 180 H180 V230 H326" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "0.4s" }} />

            <path d="M60 260 H150 V250 H326" className="chip-trace-bg" />
            <path d="M60 260 H150 V250 H326" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "0.8s" }} />

            <path d="M100 350 H200 V270 H326" className="chip-trace-bg" />
            <path d="M100 350 H200 V270 H326" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "1.2s" }} />

            <path d="M700 90 H560 V210 H474" className="chip-trace-bg" />
            <path d="M700 90 H560 V210 H474" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "0.2s" }} />

            <path d="M740 160 H580 V230 H474" className="chip-trace-bg" />
            <path d="M740 160 H580 V230 H474" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "0.6s" }} />

            <path d="M720 250 H590 V250 H474" className="chip-trace-bg" />
            <path d="M720 250 H590 V250 H474" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "1.0s" }} />

            <path d="M680 340 H570 V270 H474" className="chip-trace-bg" />
            <path d="M680 340 H570 V270 H474" className="chip-trace-flow chip-trace-accent" style={{ animationDelay: "1.4s" }} />
          </g>

          {/* Chip body */}
          <rect
            x="330" y="190" width="140" height="100"
            rx="20" ry="20"
            fill="url(#chipBodyGradient)"
            stroke="#222" strokeWidth="3"
            filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"
          />

          {/* Left pins */}
          <g>
            {[205, 225, 245, 265].map((y, i) => (
              <rect key={i} x="322" y={y} width="8" height="10" fill="url(#chipPinGradient)" rx="2" />
            ))}
          </g>

          {/* Right pins */}
          <g>
            {[205, 225, 245, 265].map((y, i) => (
              <rect key={i} x="470" y={y} width="8" height="10" fill="url(#chipPinGradient)" rx="2" />
            ))}
          </g>

          {/* Chip label */}
          <text
            x="400" y="240"
            fontFamily="Arial, sans-serif"
            fontSize="22"
            fill="url(#chipTextGradient)"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
            letterSpacing="1"
          >
            {label}
          </text>

          {/* Endpoint dots */}
          {[
            [100, 100], [80, 180], [60, 260], [100, 350],
            [700, 90], [740, 160], [720, 250], [680, 340],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="black" />
          ))}
        </svg>
      </div>
    </div>
  );
}
