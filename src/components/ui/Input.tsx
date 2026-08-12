import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const fieldClasses =
  "rounded-lg border border-line bg-white px-4 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-charcoal-soft">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(fieldClasses, "h-12", error && "border-red-400 focus:border-red-500 focus:ring-red-500", className)}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-charcoal-soft">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(fieldClasses, "min-h-24 py-3", error && "border-red-400 focus:border-red-500 focus:ring-red-500", className)}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
