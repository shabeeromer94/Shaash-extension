import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface CategoryTile {
  slug: string;
  name: string;
  image?: string;
}

/** Two big tiles linking straight into /shop's category filter — extensions or accessories. */
export function ShopByCategory({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Extensions or accessories — find exactly what you're looking for."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative flex aspect-[16/9] items-end overflow-hidden rounded-2xl bg-beige/40 p-6"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="relative z-10 rounded-full bg-ivory/90 px-5 py-2 font-display text-lg text-charcoal">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
