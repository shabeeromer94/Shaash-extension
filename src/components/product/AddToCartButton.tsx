"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
  productCode: string;
  name: string;
  image: string;
  price: number;
  maxQuantity: number;
  /** Present only for products sold with size/price options — see ProductPurchasePanel. */
  variantId?: string;
  variantLabel?: string;
}

/**
 * Purely the quantity stepper + Add to Cart / Buy Now buttons. Which
 * product/variant/price this adds to the cart is decided by the caller
 * (ProductPurchasePanel) — this component doesn't read stock or pricing
 * itself, so it stays correct whether or not the product has variants.
 */
export function AddToCartButton({ productCode, name, image, price, maxQuantity, variantId, variantLabel }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = { productCode, name, price, image, maxQuantity, variantId, variantLabel };

  const handleAdd = () => {
    addItem(cartItem, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(cartItem, quantity);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-12 w-fit items-center rounded-full border border-line">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-full w-11 items-center justify-center text-charcoal"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          className="flex h-full w-11 items-center justify-center text-charcoal"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" variant="outline" onClick={handleAdd} className="flex-1">
          {justAdded ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button size="lg" onClick={handleBuyNow} className="flex-1">
          Buy Now
        </Button>
      </div>
    </div>
  );
}
