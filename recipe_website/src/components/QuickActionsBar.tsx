"use client";

import { useState } from "react";
import {
  FiFileText,
  FiMail,
  FiShare2,
  FiShoppingCart,
  FiYoutube,
} from "react-icons/fi";
import { SiSwiggy, SiUbereats } from "react-icons/si";

interface QuickActionsBarProps {
  recipeTitle: string;
  recipeSlug: string;
  recipeImageUrl: string;
}

export default function QuickActionsBar({
  recipeTitle,
  recipeSlug,
  recipeImageUrl,
}: QuickActionsBarProps) {
  const [showGroceryMenu, setShowGroceryMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleYouTubeSearch = () => {
    const searchQuery = encodeURIComponent(recipeTitle);
    window.open(
      `https://www.youtube.com/results?search_query=${searchQuery}+recipe`,
      "_blank"
    );
  };

  const handleGroceryOrder = async (
    platform: "swiggy" | "blinkit" | "ubereats"
  ) => {
    try {
      const response = await fetch(
        `/api/recipes/${recipeSlug}/grocery-link?platform=${platform}`
      );
      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error generating grocery link:", error);
      // Fallback to search
      const searchQuery = encodeURIComponent(`${recipeTitle} ingredients`);
      if (platform === "swiggy") {
        window.open(
          `https://www.swiggy.com/instamart/search?query=${searchQuery}`,
          "_blank"
        );
      } else if (platform === "blinkit") {
        window.open(`https://blinkit.com/s/?q=${searchQuery}`, "_blank");
      } else if (platform === "ubereats") {
        window.open(
          `https://www.ubereats.com/search?q=${searchQuery}`,
          "_blank"
        );
      }
    }
    setShowGroceryMenu(false);
  };

  const handleUberEatsRestaurant = () => {
    const searchQuery = encodeURIComponent(recipeTitle);
    window.open(`https://www.ubereats.com/search?q=${searchQuery}`, "_blank");
  };

  const handleDownloadPDF = async () => {
    setIsPDFGenerating(true);
    try {
      const response = await fetch(`/api/recipes/${recipeSlug}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recipeSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsPDFGenerating(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/recipes/${recipeSlug}`;
    const text = `Check out this recipe: ${recipeTitle}`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "pinterest":
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            url
          )}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(
            recipeImageUrl
          )}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "email":
        setShowEmailModal(true);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-y border-orange-200 py-4 px-6 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {/* YouTube Search */}
          <button
            onClick={handleYouTubeSearch}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FiYoutube className="text-lg" />
            <span className="text-sm font-medium">Find on YouTube</span>
          </button>

          {/* Order Ingredients */}
          <div className="relative">
            <button
              onClick={() => setShowGroceryMenu(!showGroceryMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FiShoppingCart className="text-lg" />
              <span className="text-sm font-medium">Order Ingredients</span>
            </button>
            {showGroceryMenu && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                <button
                  onClick={() => handleGroceryOrder("swiggy")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <SiSwiggy className="text-orange-500" />
                  <span className="text-sm">Swiggy Instamart</span>
                </button>
                <button
                  onClick={() => handleGroceryOrder("blinkit")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiShoppingCart className="text-yellow-600" />
                  <span className="text-sm">Blinkit</span>
                </button>
                <button
                  onClick={() => handleGroceryOrder("ubereats")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <SiUbereats className="text-green-600" />
                  <span className="text-sm">Uber Eats</span>
                </button>
              </div>
            )}
          </div>

          {/* Order on Uber Eats */}
          <button
            onClick={handleUberEatsRestaurant}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <SiUbereats className="text-lg" />
            <span className="text-sm font-medium">Order on Uber Eats</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isPDFGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiFileText className="text-lg" />
            <span className="text-sm font-medium">
              {isPDFGenerating ? "Generating..." : "Download PDF"}
            </span>
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <FiShare2 className="text-lg" />
              <span className="text-sm font-medium">Share</span>
            </button>
            {showShareMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[180px]">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare("pinterest")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  Pinterest
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  Telegram
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => handleShare("email")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <FiMail className="text-sm" />
                  Email with PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailRecipeModal
          recipeSlug={recipeSlug}
          recipeTitle={recipeTitle}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}

// Email Modal Component
function EmailRecipeModal({
  recipeSlug,
  recipeTitle,
  onClose,
}: {
  recipeSlug: string;
  recipeTitle: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [includePDF, setIncludePDF] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/recipes/${recipeSlug}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, includePDF }),
      });

      if (response.ok) {
        alert("Recipe sent successfully!");
        onClose();
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Email Recipe: {recipeTitle}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="friend@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Thought you'd love this recipe!"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includePDF"
              checked={includePDF}
              onChange={(e) => setIncludePDF(e.target.checked)}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="includePDF" className="text-sm text-gray-700">
              Attach PDF version
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
