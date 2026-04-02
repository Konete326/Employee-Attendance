"use client"

import {
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ListItem {
  icon: React.ReactNode;
  title: string;
  category: string;
  description: React.ReactNode;
  link?: string;
  onClick?: () => void;
  status?: React.ReactNode;
  children?: React.ReactNode;
}

interface List2Props {
  heading?: string;
  items: ListItem[];
  className?: string;
}

export const List2 = ({
  heading,
  items = [],
  className,
}: List2Props) => {
  return (
    <section className={className}>
      <div className="container mx-auto px-0">
        {heading && (
          <h1 className="mb-6 px-4 text-2xl font-bold md:mb-10 md:text-3xl text-[var(--neu-text)]">
            {heading}
          </h1>
        )}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(129,140,248,0.2)] overflow-hidden">
          <Separator className="bg-white/10" />
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col transition-all hover:bg-white/[0.03]">
                <div className="grid items-center gap-4 px-4 py-4 md:px-6 md:py-6 md:grid-cols-4">
                  <div className="order-1 flex items-center gap-4 md:order-none">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--neu-surface)] shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)] text-[var(--neu-accent)]">
                      {item.icon}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-[var(--neu-text)] tracking-tight line-clamp-1">{item.title}</h3>
                      <p className="text-[10px] md:text-xs font-semibold text-[var(--neu-text-secondary)] uppercase tracking-wider">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="order-2 text-base md:text-lg font-bold md:order-none md:col-span-2 text-[var(--neu-text)]">
                    {item.description}
                  </div>
                  <div className="flex items-center gap-3 ml-auto order-3 md:order-none">
                    {item.status}
                    {(item.link || item.onClick) && (
                      <Button 
                        variant="outline" 
                        asChild={!!item.link}
                        onClick={item.onClick}
                        className="gap-2 h-9 px-4 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold"
                      >
                        {item.link ? (
                          <a href={item.link}>
                            <span>Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <>
                            <span>Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {item.children && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-white/5">
                      {item.children}
                    </div>
                  </div>
                )}
              </div>
              {index < items.length - 1 && <Separator className="bg-white/10" />}
            </React.Fragment>
          ))}
          <Separator className="bg-white/10" />
        </div>
      </div>
    </section>
  );
};
