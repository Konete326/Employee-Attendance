"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

interface NeuAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

// Generate a consistent color from a name
const getColorFromName = (name: string): string => {
  const colors = [
    "bg-[#6366f1]", // indigo-500
    "bg-[#8b5cf6]", // violet-500
    "bg-[#ec4899]", // pink-500
    "bg-[#14b8a6]", // teal-500
    "bg-[#f97316]", // orange-500
    "bg-[#06b6d4]", // cyan-500
    "bg-[#84cc16]", // lime-500
    "bg-[#f43f5e]", // rose-500
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const NeuAvatar = React.forwardRef<HTMLDivElement, NeuAvatarProps>(
  ({ className, name, src, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    const showImage = src && !imageError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-full overflow-hidden",
          "border-2 border-[var(--neu-border)]",
          "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
          "flex items-center justify-center",
          sizeStyles[size],
          !showImage && bgColor,
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-semibold text-white select-none">
            {initials}
          </span>
        )}
      </div>
    );
  }
);

NeuAvatar.displayName = "NeuAvatar";

export { NeuAvatar, type NeuAvatarProps, type AvatarSize };
