import type { Product } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ProductShowcaseProps {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  ctaHref?: string;
  ctaLabel?: string;
  tone?: "ivory" | "cream";
}

/** Shared by "Featured Products" and "Product Recommendations" on the homepage. */
export function ProductShowcase({
  eyebrow,
  title,
  description,
  products,
  ctaHref,
  ctaLabel,
  tone = "ivory",
}: ProductShowcaseProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn("py-16 sm:py-20", tone === "cream" && "bg-cream")}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
        {ctaHref && ctaLabel && (
          <div className="mt-10 flex justify-center">
            <Button href={ctaHref} variant="outline" size="lg">
              {ctaLabel}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
