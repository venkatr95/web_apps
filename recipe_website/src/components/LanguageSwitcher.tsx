"use client";

import { localeNames, locales, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiGlobe } from "react-icons/fi";

export default function LanguageSwitcher() {
  const initialLocale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(
    initialLocale as Locale
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update current locale when pathname changes
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const pathLocale = segments[0];
    if (locales.includes(pathLocale as Locale)) {
      setCurrentLocale(pathLocale as Locale);
    }
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Get the current path without the locale prefix
    const segments = pathname.split("/").filter(Boolean);
    const pathLocale = segments[0];

    // Check if the first segment is a locale
    const isLocaleInPath = locales.includes(pathLocale as Locale);

    // Remove current locale if present
    if (isLocaleInPath) {
      segments.shift();
    }

    // Build new path with new locale
    const pathWithoutLocale = segments.join("/");
    const newPathname = `/${newLocale}${
      pathWithoutLocale ? `/${pathWithoutLocale}` : ""
    }`;

    // Update state and navigate
    setCurrentLocale(newLocale);
    setIsOpen(false);

    // Use window.location for full page reload to ensure translations update
    window.location.href = newPathname;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select language"
      >
        <FiGlobe className="w-5 h-5" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                loc === currentLocale
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
