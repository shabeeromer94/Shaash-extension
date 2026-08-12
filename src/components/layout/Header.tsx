import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CartIcon } from "@/components/layout/CartIcon";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/hairstyles", label: "Hairstyle Finder" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="font-display text-2xl tracking-wide text-charcoal sm:text-3xl">
          SHAASH
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal-soft transition-colors hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <CartIcon />
          <MobileNav links={NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
