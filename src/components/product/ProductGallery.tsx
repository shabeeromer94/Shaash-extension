"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/lib/types";

/**
 * Main image + thumbnail rail + lightbox. Deliberately makes no assumption
 * about how many images exist — works with zero (placeholder), one, or many.
 */
export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-beige/40 text-sm text-taupe sm:aspect-[4/5]">
        Product images coming soon
      </div>
    );
  }

  const active = images[activeIndex];
  const goTo = (delta: number) =>
    setActiveIndex((current) => (current + delta + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">
      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-beige/40 sm:aspect-[4/5]">
          <Image
            src={active.image_url}
            alt={active.alt_text ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <Dialog.Trigger
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-charcoal shadow-sm transition-colors hover:bg-ivory"
            aria-label="View larger image"
          >
            <Expand className="h-5 w-5" />
          </Dialog.Trigger>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/90" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
            <Dialog.Title className="sr-only">{productName} — enlarged image</Dialog.Title>
            <div className="relative h-full max-h-[85vh] w-full max-w-3xl">
              <Image
                src={active.image_url}
                alt={active.alt_text ?? productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <Dialog.Close
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-24 sm:w-20",
                index === activeIndex ? "border-charcoal" : "border-transparent"
              )}
              aria-label={`Show image ${index + 1}`}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text ?? productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
