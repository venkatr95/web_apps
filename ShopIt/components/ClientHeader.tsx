"use client";

import { ClerkLoaded, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CartIcon from "./cart/CartIcon";
import ClientOnly from "./ClientOnly";
import Logo from "./common/Logo";
import SearchBar from "./common/SearchBar";
import Container from "./Container";
import FavoriteButton from "./FavoriteButton";
import HeaderMenu from "./layout/HeaderMenu";
import MobileMenu from "./layout/MobileMenu";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import UserDropdown from "./UserDropdown";

const ClientHeader = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Track when component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    if (isSignedIn && user && isMounted && typeof window !== "undefined") {
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo) {
        // Clean up the URL and redirect
        const cleanUrl = decodeURIComponent(redirectTo);
        router.push(cleanUrl);
        // Remove the redirectTo param from current URL
        const currentPath = window.location.pathname;
        router.replace(currentPath);
      }
    }
  }, [isSignedIn, user, searchParams, router, isMounted]);

  const getSignInUrl = () => {
    if (!isMounted || typeof window === "undefined") return "/sign-in";
    const currentPath = window.location.pathname + window.location.search;
    return `/sign-in?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  const getSignUpUrl = () => {
    if (!isMounted || typeof window === "undefined") return "/sign-up";
    const currentPath = window.location.pathname + window.location.search;
    return `/sign-up?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  return (
    <header className="sticky top-0 z-40 py-2 sm:py-3 lg:py-4 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <Container className="h-full">
        <div className="flex items-center h-full min-h-12 sm:min-h-14 lg:min-h-16">
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <MobileMenu />
            <Logo />
          </div>

          {/* Center Section: Navigation Menu (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <HeaderMenu />
          </div>

          {/* Right Section: Search + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">
            {/* Search Bar */}
            <div className="shrink-0">
              <SearchBar />
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <CartIcon />
              <FavoriteButton />
              <NotificationBell />

              <ClientOnly
                fallback={
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                }
              >
                <ClerkLoaded>
                  <SignedIn>
                    <UserDropdown />
                  </SignedIn>

                  <SignedOut>
                    <div className="flex items-center gap-3">
                      <Link
                        href={getSignInUrl()}
                        className="bg-transparent border border-(--shop-primary) hover:bg-(--shop-primary) text-(--shop-primary) hover:text-white px-2 py-1.5 rounded text-xs font-semibold hoverEffect transition-colors duration-300"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={getSignUpUrl()}
                        className="bg-(--shop-primary) border border-(--shop-primary) hover:bg-transparent text-white hover:text-(--shop-primary) px-2 py-1.5 rounded text-xs font-semibold hoverEffect transition-colors duration-300"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </SignedOut>
                </ClerkLoaded>
              </ClientOnly>
            </div>

            {/* Tablet Actions (Medium screens) */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <CartIcon />
              <FavoriteButton />
              <NotificationBell />

              <ClientOnly
                fallback={
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-14 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                }
              >
                <ClerkLoaded>
                  <SignedIn>
                    <UserDropdown />
                  </SignedIn>
                  <SignedOut>
                    <div className="flex items-center gap-2">
                      <Link
                        href={getSignInUrl()}
                        className="text-sm font-semibold hover:text-(--shop-primary-light) hoverEffect px-2 py-1 transition-colors duration-200"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={getSignUpUrl()}
                        className="bg-(--shop-primary) hover:bg-(--shop-primary-light) text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </SignedOut>
                </ClerkLoaded>
              </ClientOnly>
            </div>

            {/* Mobile Actions (Small screens) */}
            <div className="flex md:hidden items-center gap-1">
              <ThemeToggle />
              <ClientOnly
                fallback={
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                }
              >
                <ClerkLoaded>
                  <SignedIn>
                    <UserDropdown />
                  </SignedIn>
                  <SignedOut>
                    <div className="flex items-center gap-1">
                      <Link
                        href={getSignInUrl()}
                        className="bg-transparent border border-(--shop-primary) hover:bg-(--shop-primary) text-(--shop-primary) hover:text-white px-2 py-1.5 rounded text-xs font-semibold hoverEffect transition-colors duration-300"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={getSignUpUrl()}
                        className="bg-(--shop-primary) border border-(--shop-primary) hover:bg-transparent text-white hover:text-(--shop-primary) px-2 py-1.5 rounded text-xs font-semibold hoverEffect transition-colors duration-300"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </SignedOut>
                </ClerkLoaded>
              </ClientOnly>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default ClientHeader;
