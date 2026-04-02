"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Theme-matched deep card background (indigo navy to pure dark)
const CARD_BG = "linear-gradient(145deg, #1a2547 0%, #0a0e1a 100%)";

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain-attend {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
  }

  .attend-bg-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(129,140,248,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(129,140,248,0.06) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .attend-text-3d {
    color: var(--neu-text, #e2e8f0);
    text-shadow:
      0 10px 30px rgba(129,140,248,0.25),
      0 2px 4px rgba(0,0,0,0.3);
  }

  .attend-text-gradient {
    background: linear-gradient(180deg, #e2e8f0 0%, #818cf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 8px 20px rgba(129,140,248,0.3))
      drop-shadow(0px 2px 4px rgba(0,0,0,0.4));
  }

  .attend-card-text {
    background: linear-gradient(180deg, #FFFFFF 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 8px 20px rgba(0,0,0,0.7))
      drop-shadow(0px 3px 6px rgba(0,0,0,0.5));
  }

  .attend-depth-card {
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.95),
      0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(129,140,248,0.15),
      inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(129,140,248,0.08);
    position: relative;
  }

  .attend-card-sheen {
    position: absolute; inset: 0; border-radius: inherit;
    pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(129,140,248,0.07) 0%, transparent 40%);
    mix-blend-mode: screen;
    transition: opacity 0.3s ease;
  }

  .attend-phone-bezel {
    background-color: #0d1117;
    box-shadow:
      inset 0 0 0 2px #334155,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.95),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .attend-hardware-btn {
    background: linear-gradient(90deg, #334155 0%, #1e293b 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(129,140,248,0.1),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(129,140,248,0.05);
  }

  .attend-screen-glare {
    background: linear-gradient(110deg, rgba(129,140,248,0.06) 0%, rgba(255,255,255,0) 40%);
  }

  .attend-widget {
    background: linear-gradient(180deg, rgba(129,140,248,0.05) 0%, rgba(129,140,248,0.01) 100%);
    box-shadow:
      0 8px 16px rgba(0,0,0,0.35),
      inset 0 1px 1px rgba(129,140,248,0.08),
      inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(129,140,248,0.07);
  }

  .attend-float-badge {
    background: linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(129,140,248,0.02) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(129,140,248,0.15),
      0 25px 50px -12px rgba(0,0,0,0.8),
      inset 0 1px 1px rgba(129,140,248,0.15),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .attend-btn-primary {
    background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
    color: #ffffff;
    box-shadow:
      0 0 0 1px rgba(129,140,248,0.3),
      0 2px 4px rgba(0,0,0,0.5),
      0 12px 24px -4px rgba(99,102,241,0.5),
      inset 0 1px 1px rgba(255,255,255,0.25),
      inset 0 -3px 6px rgba(0,0,0,0.3);
    transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .attend-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow:
      0 0 0 1px rgba(129,140,248,0.4),
      0 6px 12px rgba(0,0,0,0.4),
      0 20px 32px -6px rgba(99,102,241,0.6),
      inset 0 1px 1px rgba(255,255,255,0.3),
      inset 0 -3px 6px rgba(0,0,0,0.2);
  }
  .attend-btn-primary:active { transform: translateY(1px); }

  .attend-btn-ghost {
    background: linear-gradient(180deg, rgba(129,140,248,0.12) 0%, rgba(99,102,241,0.06) 100%);
    color: #a5b4fc;
    box-shadow:
      0 0 0 1px rgba(129,140,248,0.2),
      0 2px 8px rgba(0,0,0,0.4),
      inset 0 1px 1px rgba(129,140,248,0.1);
    backdrop-filter: blur(12px);
    transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .attend-btn-ghost:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, rgba(129,140,248,0.2) 0%, rgba(99,102,241,0.12) 100%);
    color: #e2e8f0;
    box-shadow:
      0 0 0 1px rgba(129,140,248,0.35),
      0 8px 20px rgba(0,0,0,0.4),
      inset 0 1px 1px rgba(129,140,248,0.15);
  }
  .attend-btn-ghost:active { transform: translateY(1px); }

  .attend-progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }

  @keyframes attend-ping {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  .attend-ping { animation: attend-ping 1.8s ease-out infinite; }
`;

export interface AttendCinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  tagline1?: string;
  tagline2?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

export function AttendCinematicHero({
  tagline1 = "Manage your team,",
  tagline2 = "effortlessly.",
  ctaHeading = "Ready to get started?",
  ctaDescription = "Join AttendEase today — track attendance, manage leaves, and process payroll all in one place.",
  className,
  ...props
}: AttendCinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef  = useRef<HTMLDivElement>(null);
  const mockupRef    = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);

  // Mouse parallax + card sheen
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        const xVal = (e.clientX / window.innerWidth  - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, { rotationY: xVal * 10, rotationX: -yVal * 10, ease: "power3.out", duration: 1.2 });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  // Refresh ScrollTrigger after full page render so positions are calculated correctly
  // (necessary because the hero is below other sections that affect total page height)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Cinematic scroll timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(".attend-text-track",  { autoAlpha: 0, y: 60, scale: 0.87, filter: "blur(18px)", rotationX: -18 });
      gsap.set(".attend-text-slide",  { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".attend-main-card",   { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".attend-card-left", ".attend-card-right", ".attend-mockup-wrap", ".attend-badge", ".attend-ph-widget"], { autoAlpha: 0 });
      gsap.set(".attend-cta-wrap",    { autoAlpha: 0, scale: 0.8, filter: "blur(28px)" });

      // Intro animation
      gsap.timeline({ delay: 0.2 })
        .to(".attend-text-track", { duration: 1.7, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".attend-text-slide", { duration: 1.3, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      // Scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          pinType: "transform",   // ← required: body has overflow-x:hidden which breaks position:fixed pins
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl
        .to([".attend-hero-text", ".attend-bg-grid"], { scale: 1.12, filter: "blur(18px)", opacity: 0.15, ease: "power2.inOut", duration: 2 }, 0)
        .to(".attend-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".attend-main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".attend-mockup-wrap",
          { y: 280, z: -500, rotationX: 48, rotationY: -28, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8")
        .fromTo(".attend-ph-widget", { y: 38, autoAlpha: 0, scale: 0.94 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.14, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".attend-progress-ring", { strokeDashoffset: 55, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".attend-counter", { innerHTML: 98, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".attend-badge", { y: 90, autoAlpha: 0, scale: 0.72, rotationZ: -8 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".attend-card-left",  { x: -48, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".attend-card-right", { x: 48, autoAlpha: 0, scale: 0.82 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".attend-hero-text", { autoAlpha: 0 })
        .set(".attend-cta-wrap",  { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".attend-mockup-wrap", ".attend-badge", ".attend-card-left", ".attend-card-right"],
          { scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05 })
        .to(".attend-main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "28px" : "36px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback")
        .to(".attend-cta-wrap", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".attend-main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-screen h-screen overflow-hidden flex items-center justify-center",
        "bg-[var(--neu-bg,#1a1a2e)] text-[var(--neu-text,#e2e8f0)] font-sans antialiased",
        className
      )}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain-attend" aria-hidden="true" />
      <div className="attend-bg-grid attend-bg-grid absolute inset-0 z-0 pointer-events-none opacity-60" aria-hidden="true" />

      {/* ── Hero text layer ── */}
      <div className="attend-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4">
        <h1 className="attend-text-track gsap-reveal attend-text-3d text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2">
          {tagline1}
        </h1>
        <h1 className="attend-text-slide gsap-reveal attend-text-gradient text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter">
          {tagline2}
        </h1>
      </div>

      {/* ── CTA layer ── */}
      <div className="attend-cta-wrap absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 pointer-events-auto">
        <h2 className="attend-text-gradient text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          {ctaHeading}
        </h2>
        <p className="text-[var(--neu-text-secondary,#94a3b8)] text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="attend-btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:ring-offset-2 focus:ring-offset-[#1a1a2e]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>
          <Link
            href="/register"
            className="attend-btn-ghost flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:ring-offset-2 focus:ring-offset-[#1a1a2e]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register Account
          </Link>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="attend-main-card attend-depth-card gsap-reveal relative overflow-hidden flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[28px] md:rounded-[36px]"
          style={{ background: CARD_BG }}
        >
          <div className="attend-card-sheen" aria-hidden="true" />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* RIGHT (desktop) / TOP (mobile): Brand word */}
            <div className="attend-card-right gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <div className="text-center lg:text-right">
                <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter attend-card-text leading-none">
                  Attend
                </h2>
                <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter leading-none"
                  style={{ background: "linear-gradient(180deg,#818cf8 0%,#6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Ease
                </h2>
              </div>
            </div>

            {/* CENTER: Phone mockup */}
            <div className="attend-mockup-wrap order-2 relative w-full h-[360px] lg:h-[600px] flex items-center justify-center" style={{ perspective: "1000px" }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.62] md:scale-[0.85] lg:scale-100">
                <div ref={mockupRef} className="relative w-[272px] h-[568px] rounded-[3rem] attend-phone-bezel flex flex-col will-change-transform">
                  {/* Hardware buttons */}
                  <div className="absolute top-[115px] -left-[3px] w-[3px] h-[24px] attend-hardware-btn rounded-l-md" aria-hidden="true" />
                  <div className="absolute top-[152px] -left-[3px] w-[3px] h-[44px] attend-hardware-btn rounded-l-md" aria-hidden="true" />
                  <div className="absolute top-[208px] -left-[3px] w-[3px] h-[44px] attend-hardware-btn rounded-l-md" aria-hidden="true" />
                  <div className="absolute top-[165px] -right-[3px] w-[3px] h-[68px] attend-hardware-btn rounded-r-md" aria-hidden="true" />

                  {/* Screen */}
                  <div className="absolute inset-[7px] bg-[#050914] rounded-[2.5rem] overflow-hidden text-white z-10">
                    <div className="absolute inset-0 attend-screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[95px] h-[27px] bg-black rounded-full z-50 flex items-center justify-end px-3">
                      <div className="relative w-1.5 h-1.5">
                        <div className="attend-ping absolute inset-0 rounded-full bg-emerald-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    </div>

                    {/* App UI */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      {/* Header */}
                      <div className="attend-ph-widget flex justify-between items-center mb-6">
                        <div>
                          <p className="text-[9px] text-[#64748b] uppercase tracking-widest font-bold mb-0.5">AttendEase</p>
                          <p className="text-base font-bold text-white">Good Morning 👋</p>
                        </div>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border border-[#818cf8]/30 shadow-lg"
                          style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)" }}>
                          A
                        </div>
                      </div>

                      {/* Ring metric — Attendance Rate */}
                      <div className="attend-ph-widget relative w-40 h-40 mx-auto flex items-center justify-center mb-6">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
                          <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(129,140,248,0.08)" strokeWidth="12" />
                          <circle className="attend-progress-ring" cx="80" cy="80" r="64" fill="none" stroke="#818cf8" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10">
                          <span className="attend-counter text-4xl font-extrabold tracking-tighter text-white">0</span>
                          <span className="text-xs text-[#818cf8] font-bold">%</span>
                          <p className="text-[8px] text-[#64748b] uppercase tracking-widest font-bold mt-0.5">Attendance</p>
                        </div>
                      </div>

                      {/* Widgets */}
                      <div className="space-y-2.5">
                        <div className="attend-ph-widget attend-widget rounded-2xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#818cf8]/20"
                            style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.18),rgba(99,102,241,0.05))" }}>
                            <svg className="w-4 h-4 text-[#818cf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-white font-semibold">Check-In</p>
                            <p className="text-[9px] text-[#64748b]">09:02 AM — On Time ✓</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>

                        <div className="attend-ph-widget attend-widget rounded-2xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-400/20"
                            style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.15),rgba(52,211,153,0.03))" }}>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-white font-semibold">Leave Approved</p>
                            <p className="text-[9px] text-[#64748b]">Annual — Apr 5-7</p>
                          </div>
                          <span className="text-[8px] text-emerald-400 font-bold">✓</span>
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-white/15 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="attend-badge absolute top-8 lg:top-12 left-[-10px] lg:left-[-75px] attend-float-badge rounded-xl lg:rounded-2xl p-3 lg:p-3.5 flex items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center border border-[#818cf8]/25"
                    style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.2),rgba(99,102,241,0.05))" }}>
                    <span className="text-sm lg:text-base" aria-hidden="true">🔥</span>
                  </div>
                  <div>
                    <p className="text-white text-[11px] lg:text-xs font-bold">22-Day Streak</p>
                    <p className="text-[#818cf8]/60 text-[9px] lg:text-[10px]">Perfect attendance</p>
                  </div>
                </div>

                <div className="attend-badge absolute bottom-14 lg:bottom-20 right-[-10px] lg:right-[-75px] attend-float-badge rounded-xl lg:rounded-2xl p-3 lg:p-3.5 flex items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center border border-[#34d399]/25"
                    style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.04))" }}>
                    <span className="text-sm lg:text-base" aria-hidden="true">💸</span>
                  </div>
                  <div>
                    <p className="text-white text-[11px] lg:text-xs font-bold">Payslip Ready</p>
                    <p className="text-[#34d399]/70 text-[9px] lg:text-[10px]">March 2026 finalized</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LEFT (desktop) / BOTTOM (mobile): Description */}
            <div className="attend-card-left gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-2 lg:px-0">
              <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-0 lg:mb-4 tracking-tight">
                HR management,{" "}
                <span style={{ background: "linear-gradient(90deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  redefined.
                </span>
              </h3>
              <p className="hidden md:block text-[#94a3b8] text-sm lg:text-base leading-relaxed max-w-xs lg:max-w-none mx-auto lg:mx-0">
                <span className="text-white font-semibold">AttendEase</span> gives your team a complete attendance solution — from daily check-ins and leave requests to payroll generation and role-based dashboards.
              </p>
              {/* Mini stat pills */}
              <div className="hidden md:flex flex-wrap gap-2 mt-5">
                {["30+ API Routes","JWT Auth","Leave Mgmt","Payroll Engine","Excel Export"].map((t) => (
                  <span key={t} className="px-2.5 py-1 text-[10px] font-medium rounded-full border border-[#818cf8]/20 text-[#818cf8]/80"
                    style={{ background: "rgba(129,140,248,0.07)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
