import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About SHAASH Beauty Store",
  description:
    "The story behind SHAASH Beauty Store — from bridal hairstyling to a growing hair extension brand, founded by Shabeer & Ashika.",
};

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-charcoal py-1 pl-4 font-display text-lg italic leading-snug text-charcoal">
      {children}
    </blockquote>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-lg text-charcoal">{children}</h3>;
}

export default function AboutPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="About" title="About SHAASH Beauty Store" align="left" />

        <div className="mt-14 flex flex-col gap-16">
          {/* ------------------------------------------------------------------ */}
          {/* Our Story */}
          {/* ------------------------------------------------------------------ */}
          <section className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Our Story"
              title="From the Bridal Chair to SHAASH Beauty Store"
              align="left"
            />

            <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
              <p>SHAASH Beauty Store was born from our journey in the beauty and bridal industry.</p>
              <p>
                For years, while creating bridal hairstyles and working with different hair types, we kept
                seeing the same challenge — getting the right length and volume to create the hairstyles our
                clients dreamed of.
              </p>
              <p>
                Hair extensions were already an important part of our professional work, but finding
                extensions that gave us the right texture, volume, length and finish was not always easy.
              </p>
              <p>That experience became the starting point for SHAASH.</p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>We Started With a Need</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  What began as something we used professionally for our own bridal hairstyles slowly became
                  something we wanted to make accessible to other women, hairstylists and beauty
                  professionals.
                </p>
                <p>
                  We started by sourcing and working with different styles of extensions, understanding how
                  each texture behaved, which lengths worked best, and which designs could actually help
                  create beautiful hairstyles.
                </p>
                <p>
                  Over time, we developed our own collection of carefully selected synthetic hair extensions
                  — from soft waves and curls to longer, fuller styles.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>And SHAASH Evolved</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  What started as an extension used behind the scenes in our beauty work gradually became a
                  brand of its own.
                </p>
                <p>
                  We began building our collection code by code, giving every style its own identity and
                  making it easier for customers and professionals to choose the right extension for their
                  desired hairstyle.
                </p>
                <p>
                  Today, SHAASH Beauty Store offers a growing collection of synthetic hair extensions and
                  hair accessories, serving customers beyond our own studio and shipping across India.
                </p>
                <p>
                  But our journey is still closely connected to where we started — the beauty and bridal
                  industry.
                </p>
                <p>Every extension we offer is selected with one question in mind:</p>
              </div>
              <Quote>&ldquo;What kind of beautiful hairstyle can we create with this?&rdquo;</Quote>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Where We Are Today</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  Today, SHAASH Beauty Store is growing from a product collection into a complete
                  hair-styling destination.
                </p>
                <p>
                  Our goal is simple — to make it easier for you to discover the right extension for the
                  hairstyle you have in mind.
                </p>
                <p>
                  Whether you&apos;re looking for soft curls, volume, length, waves or a bridal hairstyle,
                  SHAASH is being built to help you find the right product and turn that inspiration into
                  reality.
                </p>
                <p className="font-display text-lg text-charcoal">And this is only the beginning.</p>
                <p>
                  From creating hairstyles for our brides to creating possibilities for women across India —
                  this is the SHAASH story.
                </p>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* The Founders */}
          {/* ------------------------------------------------------------------ */}
          <section className="flex flex-col gap-6">
            <SectionHeading eyebrow="About Us" title="The People Behind SHAASH" align="left" />

            <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
              <p>
                SHAASH Beauty Store is more than a hair extension brand. It is an extension of our journey
                in the beauty industry.
              </p>
              <p>
                We are Shabeer and Ashika, a husband-and-wife duo and the founders behind{" "}
                <span className="text-charcoal">The Couple Artistry by Shaash</span>.
              </p>
              <p>
                Our journey began with our passion for beauty — Shabeer as a makeup artist and Ashika as a
                hairstylist. Over the years, working closely with brides and creating countless bridal looks
                taught us something very important:
              </p>
            </div>
            <Quote>The right hair can completely transform a hairstyle.</Quote>

            <div className="flex flex-col gap-3">
              <SubHeading>Our Journey</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  As bridal beauty artists, we have worked with women with different hair lengths, textures
                  and volumes. We often found ourselves using hair extensions to create the fullness, length
                  and structure needed for the hairstyle our brides wanted.
                </p>
                <p>But finding the right extension wasn&apos;t always easy.</p>
                <p>
                  We wanted extensions that were not only beautiful to look at, but also practical for
                  hairstyling, consistent in quality and suitable for the kind of looks we create
                  professionally.
                </p>
                <p>So we started exploring, testing and working with different extensions ourselves.</p>
                <p>
                  What began as a tool we used for our brides gradually became an idea for something bigger.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>From Our Work to Our Brand</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  With our experience behind the bridal chair, we started building our own collection of
                  hair extensions.
                </p>
                <p>
                  We studied different textures, lengths, colours and styles and began selecting products
                  based on how they actually perform when creating hairstyles — not simply how they look in
                  a product photograph.
                </p>
                <p>Every product code in our collection comes from that experience.</p>
                <p>
                  Our aim has always been to make it easier for a woman, bride or hairstylist to look at a
                  hairstyle and think:
                </p>
              </div>
              <Quote>&ldquo;I want to create this look.&rdquo;</Quote>
              <p className="leading-relaxed text-charcoal-soft">
                …and then find the right extension to make it possible.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Why SHAASH?</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  For us, SHAASH represents the combination of beauty, creativity and experience that we
                  have built together over the years.
                </p>
                <p>
                  Ashika brings her expertise and understanding of hair styling, while Shabeer brings his
                  experience from the beauty and bridal side of the industry.
                </p>
                <p>
                  Together, we understand both sides — how an extension looks as a product and, more
                  importantly, how it works when creating a real hairstyle.
                </p>
                <p>
                  Today, SHAASH Beauty Store is growing beyond our own studio and reaching women and beauty
                  professionals across India.
                </p>
                <p>But the heart of the brand remains the same:</p>
              </div>
              <Quote>
                We started by creating beautiful hairstyles for our brides.
                <br />
                Now, we want to help you create yours.
              </Quote>
              <p className="font-display text-lg text-charcoal">Welcome to SHAASH Beauty Store.</p>
            </div>

            <div className="mt-2 border-t border-line pt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-label text-gold">
                Founded by Shabeer &amp; Ashika
              </p>
              <p className="mt-2 text-sm italic text-charcoal-soft">
                Beauty professionals. Hairstyling enthusiasts. Husband &amp; wife.
                <br />
                And the people behind SHAASH.
              </p>
            </div>
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* Our Approach to Hair */}
          {/* ------------------------------------------------------------------ */}
          <section className="flex flex-col gap-6">
            <h2 className="font-display text-xl text-charcoal">Our Approach to Hair</h2>
            <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
              <p>
                At SHAASH, our approach to hair comes from where we started — behind the bridal chair,
                creating real hairstyles for real women.
              </p>
              <p>
                We don&apos;t choose extensions simply because they look beautiful in a product photograph.
                We look at how they perform when creating an actual hairstyle.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>We Focus on What Matters</SubHeading>
              <ul className="flex flex-col gap-3 leading-relaxed text-charcoal-soft">
                <li>
                  <strong className="text-charcoal">Texture</strong> — The extension should blend naturally
                  with the hairstyle and create the desired finish.
                </li>
                <li>
                  <strong className="text-charcoal">Volume</strong> — The right amount of volume can
                  completely change the structure and appearance of a hairstyle.
                </li>
                <li>
                  <strong className="text-charcoal">Length</strong> — Different hairstyles require different
                  lengths, so we curate extensions that give you the flexibility to create everything from
                  subtle looks to dramatic bridal styles.
                </li>
                <li>
                  <strong className="text-charcoal">Versatility</strong> — We select styles that can be used
                  to create multiple hairstyles, giving you more possibilities from a single extension.
                </li>
                <li>
                  <strong className="text-charcoal">Ease of Styling</strong> — Our experience as beauty
                  professionals helps us understand what works when you&apos;re actually styling the hair,
                  not just looking at it.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Chosen With a Hairstylist&apos;s Eye</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>Every SHAASH extension is selected with our professional hairstyling experience in mind.</p>
                <p>
                  We&apos;ve seen firsthand how the right extension can turn a simple hairstyle into
                  something completely different — more volume, more length, more movement and more
                  confidence.
                </p>
                <p>That&apos;s why our approach is simple:</p>
              </div>
              <Quote>Don&apos;t just choose an extension. Choose the possibilities it gives you.</Quote>
            </div>

            <p className="border-t border-line pt-6 text-center font-display text-lg text-charcoal">
              SHAASH Beauty Store — Created by hairstylists, inspired by brides, made for your hair dreams.
            </p>
          </section>

          {/* ------------------------------------------------------------------ */}
          {/* Our Quality */}
          {/* ------------------------------------------------------------------ */}
          <section className="flex flex-col gap-6">
            <h2 className="font-display text-xl text-charcoal">Our Quality</h2>
            <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
              <p>At SHAASH Beauty Store, quality starts with how the hair performs in a real hairstyle.</p>
              <p>
                Our extensions are selected with the experience of professional hairstyling behind them. We
                look beyond appearance alone — focusing on the texture, finish, length, volume and overall
                look an extension can create.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Selected With Experience</SubHeading>
              <p className="leading-relaxed text-charcoal-soft">
                Every style in our collection is chosen with practical hairstyling in mind. We consider how
                the extension blends into a hairstyle, how it contributes to volume and length, and how
                naturally it complements the final look.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Consistency You Can Rely On</SubHeading>
              <p className="leading-relaxed text-charcoal-soft">
                We carefully maintain our product collection by style and code, making it easier for you to
                identify and reorder the extension you love.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Made for Beautiful Results</SubHeading>
              <div className="flex flex-col gap-4 leading-relaxed text-charcoal-soft">
                <p>
                  Whether you&apos;re creating a bridal hairstyle, getting ready for a special occasion, or
                  experimenting with a new look, our goal is to provide extensions that help you achieve a
                  beautiful, polished finish.
                </p>
                <p>Because for us, quality isn&apos;t just about how the extension looks on its own.</p>
              </div>
            </div>

            <p className="text-center font-display text-lg text-charcoal">
              It&apos;s about how beautiful your final hairstyle looks.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
