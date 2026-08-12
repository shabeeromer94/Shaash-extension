import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface TextureGroup {
  label: string;
  image?: string;
}

/** Texture values and their representative image are computed from live product data. */
export function ShopByTexture({ textures }: { textures: TextureGroup[] }) {
  if (textures.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Texture & Type"
          title="Shop by Texture"
          description="Wavy, curly and beyond — browse by the texture that matches your natural hair."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {textures.map((texture) => (
            <Link
              key={texture.label}
              href={`/shop?texture=${encodeURIComponent(texture.label)}`}
              className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-beige/40 p-5"
            >
              {texture.image && (
                <Image
                  src={texture.image}
                  alt={texture.label}
                  fill
                  sizes="(min-width: 1024px) 30vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="relative z-10 rounded-full bg-ivory/90 px-4 py-1.5 font-display text-base text-charcoal">
                {texture.label}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
