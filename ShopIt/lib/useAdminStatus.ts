"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { isUserAdmin } from "./adminUtils";

interface UseAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
  checkComplete: boolean;
  refreshAdminStatus: () => void;
}

export const useAdminStatus = (): UseAdminResult => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkComplete, setCheckComplete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        setCheckComplete(true);
        return;
      }

      const userEmail = user.primaryEmailAddress?.emailAddress;

      // Quick check: environment variable
      if (userEmail && isUserAdmin(userEmail)) {
        setIsAdmin(true);
        setIsLoading(false);
        setCheckComplete(true);
        return;
      }

      // Check Sanity role via API with cache busting
      try {
        const response = await fetch(
          `/api/admin/check-status?_t=${Date.now()}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Admin status check result:", data);
          setIsAdmin(data.isAdmin || false);
        } else {
          console.error("Admin status check failed:", response.status);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
        setCheckComplete(true);
      }
    };

    checkAdminStatus();
  }, [user, isLoaded, refreshTrigger]);

  // Listen for manual refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("refreshAdminStatus", handleRefresh);
      return () =>
        window.removeEventListener("refreshAdminStatus", handleRefresh);
    }
  }, []);

  const refreshAdminStatus = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    isAdmin,
    isLoading,
    checkComplete,
    refreshAdminStatus,
  };
};
