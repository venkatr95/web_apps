"use client";
import {
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
} from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface Props {
  images?: Array<{
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
    _key: string;
  }>;
  isStock?: number;
}

const ImageView = ({ images = [], isStock }: Props) => {
  // Filter out images with invalid asset references
  const validImages = images.filter(
    (img) => img?.asset?._ref && img.asset._ref.trim() !== ""
  );
  const [active, setActive] = useState(validImages[0]);
  return (
    <div className="w-full space-y-2 md:space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={active?._key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-h-[550px] min-h-[450px] border border-dark-color/10 rounded-md group overflow-hidden"
        >
          {active?.asset?._ref && active.asset._ref.trim() !== "" ? (
            <Image
              src={urlFor(active).url()}
              alt="productImage"
              width={700}
              height={700}
              priority
              className={`w-full h-96 max-h-[550px] min-h-[500px] object-contain group-hover:scale-110 hoverEffect rounded-md ${
                isStock === 0 ? "opacity-50" : ""
              }`}
            />
          ) : (
            <div className="w-full h-96 max-h-[550px] min-h-[500px] bg-gray-100 flex items-center justify-center rounded-md">
              <div className="text-center text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <p className="text-sm">No Image Available</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {validImages.length > 0 && (
        <div className="grid grid-cols-6 gap-2 h-20 md:h-24">
          {validImages.map((image) => (
            <button
              key={image._key}
              onClick={() => setActive(image)}
              className={`border rounded-md overflow-hidden ${
                active?._key === image._key ? "ring-1 ring-dark-color" : ""
              }`}
            >
              {image?.asset?._ref && image.asset._ref.trim() !== "" ? (
                <Image
                  src={urlFor(image).url()}
                  alt={`Thumbnail ${image._key}`}
                  width={100}
                  height={100}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="w-full h-20 md:h-24 bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageView;
