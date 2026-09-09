"use client";
import { useOutsideClick } from "@/hooks";
import { Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { Clock, Loader2, Search, Star, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AddToCartButton from "../AddToCartButton";
import PriceView from "../PriceView";
import { Input } from "../ui/input";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState([]);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useOutsideClick<HTMLDivElement>(() => setShowSearch(false));

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const query = `*[_type == "product" && isFeatured == true] | order(name asc)`;
      const response = await client.fetch(query);
      setFeaturedProduct(response);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  }, []);

  useEffect(() => {
    if (showSearch === true) {
      fetchFeaturedProducts();
      // Focus input when modal opens
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [showSearch, fetchFeaturedProducts]);

  // Handle escape key to close modal and Ctrl+K to open modal
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Handle Escape key to close modal
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        return;
      }

      // Handle Ctrl+K (or Cmd+K on Mac) to open search modal
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); // Prevent browser's default search behavior
        setShowSearch(true);
        return;
      }
    };

    // Always listen for global keyboard shortcuts
    document.addEventListener("keydown", handleKeydown);

    // Handle body scroll lock only when modal is open
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
    };
  }, [showSearch]);

  // Fetch products from Sanity based on search input
  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const query = `*[_type == "product" && name match $search] | order(name asc)`;
      const params = { search: `${search}*` };
      const response = await client.fetch(query, params);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce input changes to reduce API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300); // Delay of 300ms

    return () => clearTimeout(debounceTimer); // Cleanup the timer
  }, [fetchProducts]);
  return (
    <>
      {/* Search Trigger Button - Modern Input Style */}
      <div className="flex">
        {/* Desktop Version - Full Input Style */}
        <button
          onClick={() => setShowSearch(true)}
          className="group hidden sm:flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-shop_light_blue rounded-lg px-3 py-2 transition-all duration-200 min-w-[200px] md:min-w-[240px]"
          aria-label={`Open search (${isMac ? "Cmd" : "Ctrl"}+K)`}
        >
          {/* Search Icon */}
          <Search className="w-4 h-4 text-gray-400 group-hover:text-shop_dark_blue transition-colors duration-200 flex-shrink-0" />

          {/* Placeholder Text */}
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200 flex-1 text-left">
            Search products...
          </span>

          {/* Keyboard Shortcut Badge */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 group-hover:border-gray-300 px-2 py-1 rounded text-xs text-gray-500 font-mono flex-shrink-0 transition-colors duration-200">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span>K</span>
          </div>
        </button>

        {/* Mobile Version - Icon Only */}
        <button
          onClick={() => setShowSearch(true)}
          className="group flex sm:hidden items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-shop_btn_dark_blue rounded-lg hoverEffect"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-shop_dark_blue transition-colors duration-200" />
        </button>
      </div>

      {/* Search Modal Overlay */}
      {showSearch && (
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 search-modal-overlay ${
            showSearch ? "animate-fadeIn" : "animate-fadeOut"
          }`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 w-full h-screen bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            ref={modalRef}
            className={`relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden search-modal-content ${
              showSearch ? "animate-scaleIn" : "animate-scaleOut"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-shop_dark_blue to-shop_light_blue p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Search Products</h2>
                    <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md border border-white/20">
                      <span className="text-xs font-mono">
                        {isMac ? "Cmd" : "Ctrl"}
                      </span>
                      <span className="text-xs">+</span>
                      <span className="text-xs font-mono">K</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  aria-label="Close search (Escape)"
                  title="Close (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    placeholder="Search your favorite products..."
                    className="w-full pl-12 pr-16 py-4 text-lg bg-white/10 border-white/20 placeholder:text-white/70 text-white focus:bg-white/20 focus:border-white/40 rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-white/70 hover:text-white" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2.5 rounded-lg transition-all duration-200"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] min-h-[50vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-shop_dark_blue">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-lg font-semibold">Searching products...</p>
                  <p className="text-sm text-gray-500">Please wait a moment</p>
                </div>
              ) : products?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {products.map((product: Product) => (
                    <div
                      key={product?._id}
                      className="p-4 hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/product/${product?.slug?.current}`}
                          onClick={() => setShowSearch(false)}
                          className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 group-hover:border-shop_light_blue transition-colors duration-200"
                        >
                          {product?.images && (
                            <Image
                              width={80}
                              height={80}
                              src={urlFor(product?.images[0]).url()}
                              alt={product.name || "Product"}
                              className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ${
                                product?.stock === 0
                                  ? "opacity-50 grayscale"
                                  : ""
                              }`}
                            />
                          )}
                          {product?.discount && product.discount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              -{product.discount}%
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${product?.slug?.current}`}
                            onClick={() => setShowSearch(false)}
                            className="block group-hover:text-shop_dark_blue transition-colors duration-200"
                          >
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1 mb-1">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-between">
                            <PriceView
                              price={product?.price}
                              discount={product?.discount}
                              className="text-sm sm:text-base"
                            />

                            <div className="flex items-center gap-2">
                              {product?.stock === 0 ? (
                                <span className="text-red-500 text-sm font-medium">
                                  Out of Stock
                                </span>
                              ) : (
                                <AddToCartButton
                                  product={product}
                                  className="px-3 py-1.5 text-sm"
                                />
                              )}
                            </div>
                          </div>

                          {/* Product Status Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            {product?.status === "hot" && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                <TrendingUp className="w-3 h-3" />
                                Hot Deal
                              </span>
                            )}
                            {product?.status === "new" && (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                <Clock className="w-3 h-3" />
                                New Arrival
                              </span>
                            )}
                            {product?.isFeatured && (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  {search === "" ? (
                    <div className="px-6">
                      <div className="mb-6 text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-gradient-to-br from-shop_dark_blue to-shop_light_blue p-3 rounded-full">
                            <Search className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          Discover Amazing Products
                        </h3>
                        <p className="text-gray-600">
                          Search and explore thousands of products
                        </p>
                      </div>

                      {/* Popular Search Products - Full Width Grid */}
                      {featuredProduct?.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              Popular Products
                            </h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                          </div>

                          {/* Product Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredProduct
                              .slice(0, 6)
                              .map((item: Product) => (
                                <Link
                                  key={item?._id}
                                  href={`/product/${item?.slug?.current}`}
                                  onClick={() => setShowSearch(false)}
                                  className="group bg-gradient-to-br from-gray-50 to-white hover:from-shop_light_blue/5 hover:to-shop_dark_blue/5 border border-gray-200 hover:border-shop_light_blue rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                >
                                  <div className="flex gap-3">
                                    {/* Product Image */}
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 group-hover:border-shop_light_blue transition-colors duration-300">
                                      {item?.images && (
                                        <Image
                                          width={80}
                                          height={80}
                                          src={urlFor(item?.images[0]).url()}
                                          alt={item.name || "Product"}
                                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                        />
                                      )}
                                      {item?.discount && item.discount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-md">
                                          -{item.discount}%
                                        </div>
                                      )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-semibold text-sm text-gray-800 group-hover:text-shop_dark_blue line-clamp-2 mb-1 transition-colors duration-200">
                                          {item?.name}
                                        </h5>
                                        <PriceView
                                          price={item?.price}
                                          discount={item?.discount}
                                          className="text-xs"
                                        />
                                      </div>

                                      {/* Status Badges */}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {item?.status === "hot" && (
                                          <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            <TrendingUp className="w-2.5 h-2.5" />
                                            Hot
                                          </span>
                                        )}
                                        {item?.status === "new" && (
                                          <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            <Clock className="w-2.5 h-2.5" />
                                            New
                                          </span>
                                        )}
                                        {item?.isFeatured && (
                                          <span className="inline-flex items-center gap-0.5 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            <Star className="w-2.5 h-2.5" />
                                            Featured
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Hover Arrow Indicator */}
                                  <div className="mt-3 pt-3 border-t border-gray-100 group-hover:border-shop_light_blue/30 transition-colors duration-200">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500 group-hover:text-shop_dark_blue font-medium transition-colors duration-200">
                                        View Details
                                      </span>
                                      <svg
                                        className="w-4 h-4 text-gray-400 group-hover:text-shop_dark_blue group-hover:translate-x-1 transition-all duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                          </div>

                          {/* Quick Search Chips */}
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">
                              Quick search:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {featuredProduct
                                .slice(0, 8)
                                .map((item: Product) => (
                                  <button
                                    key={item?._id}
                                    onClick={() =>
                                      setSearch(item?.name as string)
                                    }
                                    className="inline-flex items-center gap-1.5 bg-white hover:bg-shop_dark_blue border border-gray-200 hover:border-shop_dark_blue px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                  >
                                    <Search className="w-3 h-3" />
                                    <span className="line-clamp-1 max-w-[150px]">
                                      {item?.name}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-red-50 rounded-2xl p-8 mx-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-red-100 p-3 rounded-full">
                            <X className="w-8 h-8 text-red-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          No Results Found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Sorry, we couldn&apos;t find any products matching{" "}
                          <span className="font-semibold text-red-600">
                            &quot;{search}&quot;
                          </span>
                        </p>
                        <button
                          onClick={() => setSearch("")}
                          className="bg-shop_dark_blue hover:bg-shop_light_blue text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
                        >
                          Clear Search
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
