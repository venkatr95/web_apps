"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FiFacebook, FiShare2, FiTwitter } from "react-icons/fi";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function ShareButtons({
  url,
  title,
  description,
  imageUrl: _imageUrl,
}: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = async (platform?: string) => {
    // Use native share API if available (mobile)
    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
      return;
    }

    // Open share link in new window
    if (platform && shareLinks[platform as keyof typeof shareLinks]) {
      window.open(
        shareLinks[platform as keyof typeof shareLinks],
        "_blank",
        "width=600,height=400"
      );
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-2 sm:gap-3 social-share">
      <span className="hidden sm:inline text-sm font-medium text-gray-700">
        Share:
      </span>

      <button
        onClick={() => handleShare("twitter")}
        className="p-3 sm:p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <FiTwitter className="h-6 w-6 sm:h-5 sm:w-5" />
      </button>

      <button
        onClick={() => handleShare("facebook")}
        className="p-3 sm:p-2 text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FiFacebook className="h-6 w-6 sm:h-5 sm:w-5" />
      </button>

      {/* <button
        onClick={() => handleShare("pinterest")}
        className="p-3 sm:p-2 text-gray-600 hover:text-[#E60023] hover:bg-red-50 rounded-full transition-colors"
        aria-label="Share on Pinterest"
        title="Share on Pinterest"
      >
        <FaPinterest className="h-6 w-6 sm:h-5 sm:w-5" />
      </button> */}

      <button
        onClick={() => handleShare("whatsapp")}
        className="p-3 sm:p-2 text-gray-600 hover:text-[#25D366] hover:bg-green-50 rounded-full transition-colors"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <FaWhatsapp className="h-6 w-6 sm:h-5 sm:w-5" />
      </button>

      {/* Native share button (mobile) */}
      {typeof navigator !== "undefined" &&
        typeof navigator.share !== "undefined" && (
          <button
            onClick={() => handleShare()}
            className="p-3 sm:p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            aria-label="Share"
            title="Share"
          >
            <FiShare2 className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
        )}
    </div>
  );
}
