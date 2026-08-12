import {
  getAllProducts,
  getFeaturedProducts,
  getFilterOptions,
  getProductByCode,
} from "@/lib/queries/products";
import { getAllHairstyles } from "@/lib/queries/hairstyles";
import { Hero } from "@/components/home/Hero";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { ShopByHairstyle } from "@/components/home/ShopByHairstyle";
import { ShopByTexture } from "@/components/home/ShopByTexture";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TrustSection } from "@/components/home/TrustSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, allProducts, hairstyles, filterOptions, heroProduct] = await Promise.all([
    getFeaturedProducts(8),
    getAllProducts(),
    getAllHairstyles(),
    getFilterOptions(),
    getProductByCode("204"),
  ]);

  // The hero is a single gallery sourced from product 204's img-1, always shown full crop.
  const heroImageRecord = heroProduct?.images?.find((img) => img.image_url.includes("img-1"));
  const heroImage =
    heroImageRecord && heroProduct
      ? { src: heroImageRecord.image_url, alt: heroImageRecord.alt_text ?? heroProduct.name }
      : undefined;

  const featuredForGrid = featured.slice(0, 4);
  const recommended = allProducts.filter((p) => !p.featured).slice(0, 4);

  const textureGroups = filterOptions.textures.map((texture) => {
    const match = allProducts.find((p) => p.texture === texture);
    const image = match?.images?.find((img) => img.is_primary) ?? match?.images?.[0];
    return { label: texture, image: image?.image_url };
  });

  return (
    <>
      <Hero image={heroImage} />
      <ProductShowcase
        eyebrow="Best Sellers"
        title="Featured Hair Extensions"
        description="A first look at our most-loved styles — updated as new favourites arrive."
        products={featuredForGrid}
        ctaHref="/shop"
        ctaLabel="View All Products"
      />
      <ShopByHairstyle hairstyles={hairstyles} />
      <ShopByTexture textures={textureGroups} />
      <WhyChooseUs />
      <ProductShowcase
        eyebrow="Recommended"
        title="More to Explore"
        description="A few more styles worth a look, picked from across the collection."
        products={recommended}
        tone="cream"
        ctaHref="/shop"
        ctaLabel="Browse Full Shop"
      />
      <TrustSection />
      <FinalCTA />
    </>
  );
}
