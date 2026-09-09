import { Product } from "@/sanity.types";
import { image } from "@/sanity/image";
import { StarIcon } from "@sanity/icons";
import { Flame } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import AddToCartButton from "./AddToCartButton";
import PriceView from "./PriceView";
import ProductSideMenu from "./ProductSideMenu";
import Title from "./Title";

const ProductCard = memo(({ product }: { product: Product }) => {
  return (
    <div className="text-sm border rounded-md border-border group bg-card transition-colors duration-300">
      <div className="relative group overflow-hidden bg-(--shop-surface)">
        {product?.images &&
        product.images.length > 0 &&
        product.images[0]?.asset?._ref ? (
          <Link href={`/product/${product?.slug?.current}`}>
            <img
              src={image(product.images[0]).size(900, 880).url()}
              className={`w-full h-64 object-contain overflow-hidden transition-transform bg-(--shop-surface) duration-500 
                ${
                  product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"
                }`}
              alt="productImage"
              loading="lazy"
            />
            {/* <Image
              src={urlFor(product.images[0]).url()}
              alt="productImage"
              width={500}
              height={500}
              priority
              className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg duration-500 
              ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            /> */}
          </Link>
        ) : (
          <Link href={`/product/${product?.slug?.current}`}>
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          </Link>
        )}
        <ProductSideMenu product={product} />
        {product?.status === "sale" ? (
          <p className="absolute top-2 left-2 z-10 text-xs border border-foreground/50 px-2 rounded-full group-hover:border-(--shop-primary-light) hover:text-(--shop-primary) hoverEffect transition-colors duration-300">
            Sale!
          </p>
        ) : (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 border border-(--shop-accent)/50 p-1 rounded-full group-hover:border-(--shop-accent) hover:text-(--shop-primary) hoverEffect transition-colors duration-300"
          >
            <Flame
              size={18}
              className="text-(--shop-accent)/50 group-hover:text-(--shop-accent) hoverEffect transition-colors duration-300"
            />
          </Link>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        {product?.categories && (
          <p className="uppercase line-clamp-1 text-xs font-medium text-(--shop-text-light)">
            {product.categories
              .map((cat) => (cat as any)?.title || (cat as any)?.name || "")
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
        <Title className="text-sm line-clamp-1">{product?.name}</Title>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                className={
                  index < Math.round(product?.averageRating || 0)
                    ? "text-(--shop-primary-light)"
                    : "text-(--shop-text-light)"
                }
                fill={
                  index < Math.round(product?.averageRating || 0)
                    ? "currentColor"
                    : "currentColor"
                }
              />
            ))}
          </div>
          <p className="text-(--shop-text-light) text-xs tracking-wide">
            {product?.totalReviews
              ? `${product.totalReviews} ${
                  product.totalReviews === 1 ? "Review" : "Reviews"
                }`
              : "No Reviews"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <p className="font-medium">In Stock</p>
          <p
            className={`${
              product?.stock === 0
                ? "text-destructive"
                : "text-(--shop-primary)/80 font-semibold"
            }`}
          >
            {(product?.stock as number) > 0 ? product?.stock : "unavailable"}
          </p>
        </div>

        <PriceView
          price={product?.price}
          discount={product?.discount}
          className="text-sm"
        />
        <AddToCartButton product={product} className="w-36 rounded-full" />
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
