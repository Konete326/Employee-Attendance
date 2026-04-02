"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neuButtonVariants = cva(
  "group relative flex flex-col items-center justify-center decoration-0 transition-transform active:scale-95 cursor-pointer outline-none font-medium overflow-hidden shrink-0",
  {
    variants: {
      variant: {
        default: "text-white",
        accent: "text-[var(--neu-accent)]",
        ghost: "text-[var(--neu-text-secondary)] hover:text-white",
        danger: "text-red-400",
        outline: "text-[var(--neu-text)] border border-[var(--neu-accent)]/10 hover:border-[var(--neu-accent)]/40",
      },
      size: {
        md: "w-[180px] h-[50px] rounded-xl text-[15px]",
        sm: "w-[140px] h-[40px] rounded-lg text-sm",
        lg: "w-[220px] h-[60px] rounded-2xl text-xl",
        icon: "w-[44px] h-[44px] rounded-xl p-0",
        full: "w-full h-[50px] rounded-xl text-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(neuButtonVariants({ variant, size, className }), (loading || disabled) && "opacity-80 pointer-events-none grayscale-[0.2]")}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }}
        disabled={disabled || loading}
        {...props}
      >
        <span className="relative w-full h-full flex items-center justify-center">
          {/* Glow Layer */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity ease-in-out duration-[1200ms] opacity-100 group-hover:opacity-0"
            style={{
              background: "radial-gradient(15% 50% at 50% 100%, rgb(129, 140, 248) 0%, rgba(129, 140, 248, 0) 100%)",
              borderRadius: "inherit",
              filter: "blur(15px)",
            }}
          />

          {/* Glow Hover Layer */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity ease-in-out duration-[1200ms] opacity-0 group-hover:opacity-100"
            style={{
              background: "radial-gradient(60.6% 50% at 50% 100%, rgb(129, 140, 248) 0%, rgba(129, 140, 248, 0) 100%)",
              borderRadius: "inherit",
              filter: "blur(18px)",
            }}
          />

          {/* Stroke Layer */}
          <div
            className="absolute inset-0 pointer-events-none will-change-auto transition-opacity ease-in-out duration-[1200ms] opacity-100 group-hover:opacity-0"
            style={{
              background: "radial-gradient(10.7% 50% at 50% 100%, rgb(129, 140, 248) 0%, rgba(129, 140, 248, 0) 100%)",
              borderRadius: "inherit",
            }}
          />

          {/* Stroke Hover Layer */}
          <div
            className="absolute inset-0 pointer-events-none will-change-auto transition-opacity ease-in-out duration-[1200ms] opacity-0 group-hover:opacity-100"
            style={{
              background: "radial-gradient(60.1% 50% at 50% 100%, rgb(129, 140, 248) 0%, rgba(129, 140, 248, 0) 100%)",
              borderRadius: "inherit",
            }}
          />

          {/* Fill Layer */}
          <div
            className="absolute inset-[1px] pointer-events-none z-10 rounded-[inherit]"
            style={{
              backgroundColor: "rgb(0, 0, 0)",
              opacity: 1,
              filter: "brightness(1.1)",
            }}
          />

          {/* Text Content */}
          <div className="relative z-20 flex items-center justify-center opacity-100 gap-2 shrink-0 px-4">
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-[var(--neu-accent)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span
              className="tracking-wide"
              style={{
                WebkitFontSmoothing: "antialiased",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {children}
            </span>
          </div>
        </span>
      </Comp>
    );
  }
);

NeuButton.displayName = "NeuButton";

export { NeuButton };
