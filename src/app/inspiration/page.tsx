import type { Metadata } from "next";
import { getAllInspiration } from "@/lib/queries/inspiration";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hairstyle Inspiration",
  description:
    "Bridal looks, everyday curls and more — browse hairstyle inspiration and shop the extensions that create each look.",
};

export default async function InspirationPage() {
  const items = await getAllInspiration();

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Inspiration"
          title="Hairstyle Inspiration"
          description="Ideas to bring to your next hair appointment — or recreate yourself with the right extension."
        />
        <div className="mt-12">
          <InspirationGrid items={items} />
        </div>
      </Container>
    </div>
  );
}
