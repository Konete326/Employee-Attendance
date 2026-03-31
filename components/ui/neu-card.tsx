"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "raised" | "flat" | "inset";

interface NeuCardContextValue {
  variant: CardVariant;
}

const NeuCardContext = React.createContext<NeuCardContextValue>({ variant: "raised" });

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  raised: `
    bg-[var(--neu-surface)]
    border border-[var(--neu-border)]
    shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]
  `,
  flat: `
    bg-[var(--neu-surface)]
    border border-[var(--neu-border)]
  `,
  inset: `
    bg-[var(--neu-surface)]
    border border-[var(--neu-border)]
    shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]
  `,
};

const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  ({ className, variant = "raised", hover = false, children, ...props }, ref) => {
    return (
      <NeuCardContext.Provider value={{ variant }}>
        <div
          ref={ref}
          className={cn(
            "rounded-[var(--neu-radius)] p-6",
            "transition-all duration-200 ease-out",
            variantStyles[variant],
            hover && "hover:-translate-y-1 hover:shadow-[10px_10px_20px_var(--neu-shadow-dark),-10px_-10px_20px_var(--neu-shadow-light)]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </NeuCardContext.Provider>
    );
  }
);

NeuCard.displayName = "NeuCard";

interface NeuCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const NeuCardHeader = React.forwardRef<HTMLDivElement, NeuCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pb-4 mb-4 border-b border-[var(--neu-border)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeuCardHeader.displayName = "NeuCardHeader";

interface NeuCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const NeuCardTitle = React.forwardRef<HTMLHeadingElement, NeuCardTitleProps>(
  ({ className, children, as: Component = "h3", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-lg font-semibold text-[var(--neu-text)]",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NeuCardTitle.displayName = "NeuCardTitle";

interface NeuCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const NeuCardDescription = React.forwardRef<HTMLParagraphElement, NeuCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm text-[var(--neu-text-secondary)] mt-1",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

NeuCardDescription.displayName = "NeuCardDescription";

interface NeuCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const NeuCardContent = React.forwardRef<HTMLDivElement, NeuCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    );
  }
);

NeuCardContent.displayName = "NeuCardContent";

interface NeuCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const NeuCardFooter = React.forwardRef<HTMLDivElement, NeuCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pt-4 mt-4 border-t border-[var(--neu-border)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeuCardFooter.displayName = "NeuCardFooter";

export {
  NeuCard,
  NeuCardHeader,
  NeuCardTitle,
  NeuCardDescription,
  NeuCardContent,
  NeuCardFooter,
  type NeuCardProps,
  type CardVariant,
};
