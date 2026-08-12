import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-label text-gold">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 leading-relaxed text-charcoal-soft">{description}</p>}
    </div>
  );
}
