import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-charcoal-soft">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-line bg-white px-4 pr-10 text-sm text-charcoal focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
      </div>
    </div>
  );
}
