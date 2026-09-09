"use client";

import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHeart,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";

export default function Navigation() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to create locale-aware links
  const createLink = (path: string) => {
    return `/${locale}${path}`;
  };

  const navLinks = [
    { href: createLink("/"), label: t("home") },
    { href: createLink("/recipes"), label: t("recipes") },
    { href: createLink("/about"), label: t("about") },
  ];

  const isActive = (href: string) => {
    // For home, check if pathname is exactly the locale root
    if (href === `/${locale}`)
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    // For other paths, check if pathname starts with the href
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={createLink("/")}
            className="flex items-center space-x-2 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600 dark:text-primary-500">
              RecipeHub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-500",
                  isActive(link.href)
                    ? "text-primary-600 dark:text-primary-500"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {session && (
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
            )}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              href={createLink("/recipes?search=true")}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
              aria-label="Search recipes"
            >
              <FiSearch className="h-5 w-5" />
            </Link>
            {status === "loading" ? (
              <div className="h-10 w-20 sm:w-24 bg-gray-200 animate-pulse rounded-md" />
            ) : session ? (
              <>
                <Link
                  href={createLink("/recipes/new")}
                  className="hidden sm:block"
                >
                  <Button size="sm" variant="primary">
                    <FiPlus className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Add Recipe</span>
                    <span className="lg:hidden">Add</span>
                  </Button>
                </Link>

                <div className="hidden sm:block">
                  <NotificationBell />
                </div>

                {/* Favorites quick menu */}
                <div className="relative group hidden sm:block">
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Favorites menu"
                  >
                    <FiHeart className="h-5 w-5 text-red-500" />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href={createLink("/favorites")}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Favorites
                    </Link>
                    <Link
                      href={createLink("/favLists")}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Fav Lists
                    </Link>
                    <Link
                      href={createLink("/favLists/new")}
                      className="block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                    >
                      + New List
                    </Link>
                  </div>
                </div>

                <div className="relative group hidden sm:block">
                  <button
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href={createLink(`/profile/${session.user.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUser className="inline h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href={createLink(`/recipes?author=${session.user.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Recipes
                    </Link>
                    <Link
                      href={createLink("/profile/ai-recipe-generator")}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      AI Recipe Generator
                    </Link>
                    <Link
                      href={createLink("/profile/billing")}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Credits & Purchases
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href={createLink("/admin/pending-recipes")}
                        className="block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                      >
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href={createLink("/favorites")}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Favorites
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => signOut({ callbackUrl: createLink("/") })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={createLink("/auth/signin")}
                  className="hidden sm:block"
                >
                  <Button size="sm" variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href={createLink("/auth/signup")}
                  className="hidden sm:block"
                >
                  <Button size="sm" variant="primary">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1",
                    isActive(link.href)
                      ? "text-primary-600 dark:text-primary-500"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
                {session ? (
                  <>
                    <Link
                      href={createLink("/recipes/new")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1"
                    >
                      <FiPlus className="h-5 w-5" />
                      <span>Add Recipe</span>
                    </Link>
                    <Link
                      href={createLink(`/profile/${session.user.id}`)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1"
                    >
                      <FiUser className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={createLink("/profile/ai-recipe-generator")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1"
                    >
                      <span>AI Recipe Generator</span>
                    </Link>
                    <Link
                      href={createLink("/profile/billing")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1"
                    >
                      <span>Credits & Purchases</span>
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href={createLink("/admin/pending-recipes")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 font-medium"
                      >
                        <span>🛡️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href={createLink("/favorites")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 px-2 py-1"
                    >
                      <span>Favorites</span>
                    </Link>
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        Language
                      </span>
                      <LanguageSwitcher />
                    </div>
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: createLink("/") });
                      }}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 w-full text-left px-2 py-1"
                    >
                      <FiLogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={createLink("/auth/signin")}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button size="sm" variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href={createLink("/auth/signup")}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button size="sm" variant="primary" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
