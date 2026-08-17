import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger";
type BadgeSize = "sm" | "md";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-beige text-charcoal-soft",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[9px]",
  md: "px-3 py-1 text-xs",
};

export function Badge({
  tone = "neutral",
  size = "md",
  children,
  className,
}: {
  tone?: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", tones[tone], sizes[size], className)}>
      {children}
    </span>
  );
}
