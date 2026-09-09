"use client";

import ResponsiveOrdersComponent from "@/components/ResponsiveOrdersComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import { Clock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface OrdersClientProps {
  initialOrders: MY_ORDERS_QUERYResult;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function OrdersClient({
  initialOrders,
  totalPages,
  currentPage,
  hasNextPage,
  hasPrevPage,
}: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const router = useRouter();

  // Set initial load to false after first render
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `/api/user/orders?page=${currentPage}&timestamp=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setLastRefreshTime(new Date());
        toast.success("Orders updated successfully!", {
          description: "Latest order status has been fetched",
          duration: 2000,
        });
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders", {
        description: "Please try again or refresh the page",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [currentPage]);

  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Only auto-refresh if there are orders that might have status updates
      const hasActiveOrders = orders.some(
        (order) =>
          order.status &&
          !["delivered", "completed", "cancelled"].includes(
            order.status.toLowerCase()
          )
      );

      if (hasActiveOrders) {
        handleRefresh();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [orders, autoRefreshEnabled, handleRefresh]);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 10;

    if (showEllipsis) {
      if (currentPage <= 4) {
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
          items.push(i);
        }
        if (totalPages > 5) {
          items.push("ellipsis");
          items.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    }

    return items;
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`/user/orders?page=${page}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">My Orders</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={
              autoRefreshEnabled
                ? "border-blue-500 text-blue-700"
                : "border-gray-300"
            }
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${autoRefreshEnabled ? "bg-blue-500" : "bg-gray-400"}`}
            />
            Auto-refresh {autoRefreshEnabled ? "ON" : "OFF"}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isPending}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Main Orders Content */}
      <div>
        {isPending && !isInitialLoad ? (
          // Show only orders skeleton for pagination loading
          <Card className="overflow-hidden">
            <div className="p-4 space-y-6">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Skeleton className="w-16 h-16 rounded" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Skeleton className="w-16 h-16 rounded" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-3 w-1/3" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-1/3 space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-10 w-full rounded" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ) : orders && orders.length > 0 ? (
          <Card className="overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <ResponsiveOrdersComponent
                  orders={orders}
                  onOrderUpdate={handleRefresh}
                />
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No orders found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Start shopping to see your orders here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Right Aligned Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasPrevPage && !isPending)
                      handlePageChange(currentPage - 1);
                  }}
                  className={
                    !hasPrevPage || isPending
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent"
                  }
                />
              </PaginationItem>

              {generatePaginationItems().map((item, index) => (
                <PaginationItem key={index}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === item}
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        if (typeof item === "number" && !isPending)
                          handlePageChange(item);
                      }}
                      className={
                        currentPage === item
                          ? "bg-primary text-primary-foreground hover:bg-primary/80" +
                            (isPending ? " opacity-50" : "")
                          : "hover:bg-accent" +
                            (isPending ? " opacity-50 pointer-events-none" : "")
                      }
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasNextPage && !isPending)
                      handlePageChange(currentPage + 1);
                  }}
                  className={
                    !hasNextPage || isPending
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
