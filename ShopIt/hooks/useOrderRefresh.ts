"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface UseOrderRefreshOptions {
  orderId?: string;
  autoRefreshInterval?: number; // in milliseconds
  onUpdate?: (orderData: any) => void;
}

export function useOrderRefresh(options: UseOrderRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    orderId,
    autoRefreshInterval = 30000, // 30 seconds default
    onUpdate,
  } = options;

  // Manual refresh function
  const refresh = useCallback(
    async (showToast = false) => {
      if (!orderId || isRefreshing) return;

      setIsRefreshing(true);
      try {
        const response = await fetch(
          `/api/orders/${orderId}?timestamp=${Date.now()}`
        );
        if (response.ok) {
          const data = await response.json();
          if (onUpdate) {
            onUpdate(data);
          }
          setLastRefreshTime(new Date());

          if (showToast) {
            toast.success("Order updated!", {
              description: "Latest order status has been fetched",
              duration: 2000,
            });
          }
        } else {
          throw new Error("Failed to fetch order");
        }
      } catch (error) {
        console.error("Error refreshing order:", error);
        if (showToast) {
          toast.error("Failed to refresh order", {
            description: "Please try again or refresh the page",
          });
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [orderId, isRefreshing, onUpdate]
  );

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled || !orderId) return;

    intervalRef.current = setInterval(() => {
      refresh(false); // Don't show toast for auto-refresh
    }, autoRefreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, orderId, autoRefreshInterval, refresh]);

  // Manual refresh with toast
  const manualRefresh = useCallback(() => {
    refresh(true);
  }, [refresh]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => !prev);
  }, []);

  return {
    isRefreshing,
    lastRefreshTime,
    autoRefreshEnabled,
    manualRefresh,
    toggleAutoRefresh,
    refresh, // Silent refresh
  };
}
