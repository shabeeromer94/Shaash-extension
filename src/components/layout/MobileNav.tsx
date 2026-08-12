"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 transition-opacity" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 bg-ivory p-6 shadow-xl focus:outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-xl text-charcoal">Menu</Dialog.Title>
            <Dialog.Close
              className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-beige/60"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-charcoal-soft hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
