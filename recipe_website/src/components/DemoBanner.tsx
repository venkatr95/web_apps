"use client";

import { useEffect, useState } from "react";
import { FiInfo, FiX } from "react-icons/fi";

export default function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check if running in demo mode by making a test API call
    fetch("/api/recipes?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data._demoMode) {
          setIsDemoMode(true);
          // Check if user has dismissed the banner
          const dismissed = localStorage.getItem("demoBannerDismissed");
          setIsVisible(!dismissed);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("demoBannerDismissed", "true");
  };

  // Prevent hydration mismatch by not rendering on server
  if (!isMounted || !isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <FiInfo className="text-2xl flex-shrink-0" />
          <div className="text-sm md:text-base">
            <strong className="font-semibold">Demo Mode:</strong> You're viewing
            the recipe website without a database.
            <span className="hidden md:inline">
              {" "}
              Sign in with <strong>demo@example.com</strong> (any password) to
              explore features!
            </span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
}
