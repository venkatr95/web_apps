"use client";
import { trackAddToCart } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Product } from "@/sanity.types";
import useCartStore from "@/store";
import { ShoppingBag } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import PriceFormatter from "./PriceFormatter";
import QuantityButtons from "./QuantityButtons";
import { Button } from "./ui/button";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = memo(({ product, className }: Props) => {
  const { addItem, getItemCount } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // All hooks must be called before any conditional logic
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  // Use useEffect to set isClient to true after component mounts
  // This ensures that the component only renders on the client-side
  // Preventing hydration errors due to server/client mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product?.name} added to cart!`, {
        description: `Current quantity: ${itemCount + 1}`,
        duration: 3000,
      });
      // Firebase Analytics event
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: itemCount + 1,
      });
    } else {
      toast.error("Stock limit reached", {
        description: "Cannot add more than available stock",
        duration: 4000,
      });
    }
  }, [product, itemCount, addItem]);

  // Early return after all hooks have been called - this is crucial for Rules of Hooks
  if (!isClient) {
    return (
      <div className="w-full h-12 flex items-center">
        <Button
          disabled
          className={cn(
            "w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-none border border-gray-300 dark:border-gray-600",
            className
          )}
        >
          <ShoppingBag /> Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop_dark_blue/80 text-light-bg shadow-none border border-shop_dark_blue/80 font-semibold tracking-wide hover:text-white hover:bg-shop_dark_blue hover:border-shop_dark_blue hoverEffect",
            className
          )}
        >
          <ShoppingBag /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
});

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;
