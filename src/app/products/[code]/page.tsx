import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductByCode, getRelatedProducts } from "@/lib/queries/products";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { formatINR } from "@/lib/utils/format";
import { isPurchasable } from "@/lib/utils/stock";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ code: product.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const product = await getProductByCode(code);
  if (!product) return {};

  const title = product.seo_title || `${product.name} (#${product.code})`;
  const description =
    product.seo_description ||
    product.description ||
    `Shop the ${product.name} — ${formatINR(product.price_inr)} at SHAASH Beauty Store.`;
  const image = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image.image_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = await getProductByCode(code);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.code,
    description: product.description ?? undefined,
    image: product.images?.map((img) => img.image_url),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price_inr,
      availability: isPurchasable(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images ?? []} productName={product.name} />
          <ProductInfo product={product} />
        </div>
        <div className="mt-20">
          <RelatedProducts products={related} />
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
