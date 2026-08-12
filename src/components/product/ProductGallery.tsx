"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/lib/types";

const ZOOM_SCALE = 2.2;

/**
 * The catalog's "main view" photo (always named img-1) is a fixed studio
 * template: a front pose on the left, a ruler chart + length badge in the
 * middle, and a back pose on the right, all baked into one file. We only want
 * to lead with the front — the narrow aspect ratio below, combined with
 * object-position "left", crops object-fit:cover to roughly that left third
 * for every product without touching the source images.
 */
function isFrontBackComposite(image: ProductImage) {
  return image.image_url.includes("img-1");
}

/**
 * Main image + thumbnail rail + lightbox. Deliberately makes no assumption
 * about how many images exist — works with zero (placeholder), one, or many.
 */
export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-beige/40 text-sm text-taupe sm:aspect-[4/5]">
        Product images coming soon
      </div>
    );
  }

  const active = images[activeIndex];
  const isComposite = isFrontBackComposite(active);
  const goTo = (delta: number) =>
    setActiveIndex((current) => (current + delta + images.length) % images.length);

  // Zooming just scales the already-cropped content around the cursor — since
  // object-position already excludes the ruler/back, panning can never reveal it.
  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <div
          ref={frameRef}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-beige/40",
            isComposite ? "aspect-[11/24]" : "aspect-square sm:aspect-[4/5]"
          )}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={active.image_url}
            alt={active.alt_text ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className={cn("object-cover transition-transform duration-300 ease-out", zoomed && "cursor-zoom-in")}
            style={{
              objectPosition: isComposite ? "left center" : "center",
              transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
          {!zoomed && (
            <div className="pointer-events-none absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-charcoal shadow-sm">
              <ZoomIn className="h-4 w-4" />
            </div>
          )}
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
