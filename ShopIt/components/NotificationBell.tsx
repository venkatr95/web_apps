"use client";

import { useUserData } from "@/contexts/UserDataContext";
import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";

export default function NotificationBell() {
  return (
    <ClientOnly
      fallback={
        // Fallback for SSR - shows a basic bell icon without user-specific data
        <div className="relative">
          <Bell className="text-shop_dark_blue/80 group-hover:text-shop_dark_blue hoverEffect" />
        </div>
      }
    >
      <NotificationBellContent />
    </ClientOnly>
  );
}

function NotificationBellContent() {
  const { isSignedIn } = useUser();
  const { unreadNotifications } = useUserData();

  if (!isSignedIn) {
    return null;
  }

  const displayCount = unreadNotifications > 9 ? "9+" : unreadNotifications;

  return (
    <Link href="/user/notifications" className="relative">
      <Bell className="text-shop_dark_blue/80 group-hover:text-shop_dark_blue hoverEffect" />
      {unreadNotifications > 0 ? (
        <span
          className={`absolute -top-1 -right-1 bg-shop_btn_dark_blue text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-3.5 h-3.5 ${
            unreadNotifications > 9 ? "px-1" : ""
          }`}
        >
          {displayCount}
        </span>
      ) : (
        <span className="absolute -top-1 -right-1 bg-shop_btn_dark_blue text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-3.5 h-3.5">
          0
        </span>
      )}
    </Link>
  );
}
