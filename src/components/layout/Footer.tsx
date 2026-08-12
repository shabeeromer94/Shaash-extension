import Link from "next/link";
import { Container } from "@/components/ui/Container";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/hairstyles", label: "Hairstyle Finder" },
      { href: "/inspiration", label: "Hairstyle Inspiration" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About SHAASH" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl text-charcoal">SHAASH</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-charcoal-soft">
            {/* PLACEHOLDER: replace with the SHAASH Beauty Store brand statement. */}
            Premium synthetic hair extensions and hair accessories, made for effortless everyday
            beauty.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-charcoal">{group.title}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-charcoal-soft hover:text-charcoal">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-sm font-semibold text-charcoal">Contact</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-charcoal-soft">
            {/* PLACEHOLDER: replace with real support email/phone/social links. */}
            <li>hello@shaashbeauty.com</li>
            <li>+91 00000 00000</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-taupe sm:flex-row">
          <p>© {new Date().getFullYear()} SHAASH Beauty Store. All rights reserved.</p>
          <p>Premium hair extensions &amp; accessories.</p>
        </Container>
      </div>
    </footer>
  );
}
