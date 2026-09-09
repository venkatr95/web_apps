"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Eye, Package, RefreshCw, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { handleApiError, safeApiCall } from "./apiHelpers";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import OrderDetailsSidebar from "./OrderDetailsSidebar";
import { OrdersSkeleton } from "./SkeletonLoaders";
import { Order } from "./types";

const AdminOrders: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [orderStatus, setOrderStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    hasNextPage: false,
    totalPages: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
  const [isConnectedSSE, setIsConnectedSSE] = useState(false);

  const limit = perPage;

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800";
      case "ready_for_delivery":
        return "bg-cyan-100 text-cyan-800";
      case "packed":
        return "bg-purple-100 text-purple-800";
      case "order_confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "address_confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "failed_delivery":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch orders
  const fetchOrders = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const statusParam = orderStatus === "all" ? "" : orderStatus;
        const timestamp = Date.now(); // Add timestamp to bust cache
        const url = `/api/admin/orders?limit=${limit}&offset=${
          page * limit
        }&status=${statusParam}&_t=${timestamp}`;

        const data = await safeApiCall(url);

        setOrders(data.orders);
        setPagination({
          totalCount: data.totalCount,
          hasNextPage: data.hasNextPage,
          totalPages: data.pagination.totalPages,
        });
        setLastRefreshTime(new Date());
      } catch (error) {
        console.error("Error in fetchOrders:", error);
        handleApiError(error, "Orders fetch");
      } finally {
        setLoading(false);
      }
    },
    [orderStatus, limit]
  );

  // Selection functions
  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order._id));
    }
  }, [selectedOrders.length, orders]);

  // Order details functions
  const handleShowOrderDetails = async (order: Order) => {
    setIsSidebarOpen(true);
    setIsLoadingOrderDetails(true);
    setSelectedOrder(null); // Clear previous order

    try {
      // Fetch complete order details from the individual order API
      const response = await fetch(`/api/admin/orders/${order._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setSelectedOrder(data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      handleApiError(error, "Order details fetch");
      // Fall back to the basic order data from the list
      setSelectedOrder(order);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedOrder(null);
    setIsLoadingOrderDetails(false);
    // Fetch latest orders when sidebar closes to reflect any updates
    fetchOrders(currentPage);
  };

  const handleOrderUpdate = async (updatedOrderId?: string) => {
    setIsRefreshing(true);
    try {
      // Small delay to ensure Sanity has processed the update
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Refresh orders list from server to ensure consistency
      await fetchOrders(currentPage);

      // Also refresh the selected order details if sidebar is still open
      if (selectedOrder && isSidebarOpen && updatedOrderId) {
        try {
          const timestamp = Date.now();
          const updatedOrderData = await safeApiCall(
            `/api/admin/orders/${updatedOrderId}?_t=${timestamp}`
          );
          if (updatedOrderData?.order) {
            setSelectedOrder(updatedOrderData.order);
          }
        } catch (error) {
          console.error("Error refreshing order details:", error);
        }
      }
    } catch (error) {
      console.error("Error updating orders:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedOrders([]); // Clear selections when changing page
  };

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(parseInt(newPerPage));
    setCurrentPage(0); // Reset to first page
    setSelectedOrders([]);
  };

  // Delete functions
  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrders = async () => {
    setIsDeleting(true);
    try {
      const timestamp = Date.now();
      await safeApiCall(`/api/admin/orders?_t=${timestamp}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      // Close dialog and clear selections first
      setIsDeleteDialogOpen(false);
      setSelectedOrders([]);

      // Immediately update local state to remove deleted orders
      setOrders((prevOrders) =>
        prevOrders.filter((order) => !selectedOrders.includes(order._id))
      );

      // Update pagination count
      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - selectedOrders.length),
      }));

      // If all orders on current page were deleted, go back to page 0
      const willBeEmpty = selectedOrders.length === orders.length;
      const pageToFetch = willBeEmpty && currentPage > 0 ? 0 : currentPage;

      if (pageToFetch !== currentPage) {
        setCurrentPage(0);
      }

      // Wait a moment for Sanity to propagate changes
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Refresh the orders list to ensure consistency
      await fetchOrders(pageToFetch);
    } catch (error) {
      handleApiError(error, "Orders delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders(currentPage);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, currentPage]);

  // Real-time SSE connection for instant updates
  useEffect(() => {
    if (!autoRefreshEnabled) {
      // If auto-refresh is disabled, also disconnect SSE
      if (sseConnection) {
        console.log(
          "🚨🚨🚨 [AdminOrders] Closing SSE connection (auto-refresh disabled)"
        );
        sseConnection.close();
        setSseConnection(null);
        setIsConnectedSSE(false);
      }
      return;
    }

    // Establish SSE connection
    console.log(
      "🚨🚨🚨 [AdminOrders] Establishing SSE connection for real-time updates..."
    );

    const eventSource = new EventSource("/api/admin/orders/sse");

    eventSource.onopen = () => {
      console.log("🚨🚨🚨 [AdminOrders] SSE connection established");
      setIsConnectedSSE(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🚨🚨🚨 [AdminOrders] Received SSE message:", data);

        if (data.type === "order_update") {
          console.log(
            "🚨🚨🚨 [AdminOrders] Processing order update:",
            data.data.orderNumber
          );

          // Update the specific order in the current orders list
          setOrders((prevOrders) => {
            const updatedOrders = prevOrders.map((order) => {
              if (order._id === data.data._id) {
                console.log(
                  `🚨🚨🚨 [AdminOrders] Updating order ${order.orderNumber} status from ${order.status} to ${data.data.status}`
                );
                return {
                  ...order,
                  status: data.data.status,
                  totalPrice: data.data.totalPrice || order.totalPrice,
                  _updatedAt: data.data.updatedAt,
                };
              }
              return order;
            });

            // Check if the updated order exists in current list
            const orderExists = prevOrders.some(
              (order) => order._id === data.data._id
            );
            if (!orderExists) {
              console.log(
                "🚨🚨🚨 [AdminOrders] Order not in current list, refreshing..."
              );
              // If order is not in current view, refresh to get latest data
              fetchOrders(currentPage);
            }

            return updatedOrders;
          });

          // Update last refresh time to show when the update came through
          setLastRefreshTime(new Date());

          // If the sidebar is open and showing this order, refresh it
          if (selectedOrder && selectedOrder._id === data.data._id) {
            handleOrderUpdate(data.data._id);
          }
        }
      } catch (error) {
        console.error("❌ [AdminOrders] Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ [AdminOrders] SSE connection error:", error);
      setIsConnectedSSE(false);

      // Try to reconnect after a delay
      setTimeout(() => {
        if (autoRefreshEnabled) {
          console.log("🚨🚨🚨 [AdminOrders] Attempting to reconnect SSE...");
          eventSource.close();
        }
      }, 5000);
    };

    setSseConnection(eventSource);

    return () => {
      console.log("🚨🚨🚨 [AdminOrders] Cleaning up SSE connection");
      eventSource.close();
      setIsConnectedSSE(false);
    };
  }, [autoRefreshEnabled, currentPage, fetchOrders, selectedOrder]);

  // Fallback auto-refresh for active orders (reduced frequency when SSE is active)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(
      () => {
        // Only auto-refresh if SSE is not connected or there are orders that might have status updates
        const hasActiveOrders = orders.some(
          (order) =>
            !["delivered", "completed", "cancelled"].includes(
              order.status?.toLowerCase() || ""
            )
        );

        if (hasActiveOrders && !isConnectedSSE) {
          console.log(
            "🚨🚨🚨 [AdminOrders] Fallback refresh (SSE not connected)"
          );
          fetchOrders(currentPage);
        }
      },
      isConnectedSSE ? 120000 : 45000
    ); // 2 minutes if SSE connected, 45 seconds if not

    return () => clearInterval(interval);
  }, [orders, autoRefreshEnabled, fetchOrders, currentPage, isConnectedSSE]);

  // Effects - Combined to avoid multiple re-renders
  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  // Reset page when filters change - Combined effect
  useEffect(() => {
    setCurrentPage(0);
    setSelectedOrders([]);
  }, [orderStatus, perPage]);

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Orders Management</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnectedSSE ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs">
                  {isConnectedSSE ? "Live Updates" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="address_confirmed">
                  Address Confirmed
                </SelectItem>
                <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="ready_for_delivery">
                  Ready for Delivery
                </SelectItem>
                <SelectItem value="out_for_delivery">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="failed_delivery">Failed Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={
                autoRefreshEnabled
                  ? "border-blue-500 text-blue-700"
                  : "border-gray-300"
              }
              title={
                autoRefreshEnabled
                  ? isConnectedSSE
                    ? "Real-time updates active"
                    : "Auto-refresh enabled"
                  : "Auto-refresh disabled"
              }
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  autoRefreshEnabled
                    ? isConnectedSSE
                      ? "bg-green-500 animate-pulse"
                      : "bg-blue-500"
                    : "bg-gray-400"
                }`}
              />
              {autoRefreshEnabled
                ? isConnectedSSE
                  ? "Live"
                  : "Auto ON"
                : "Auto OFF"}
            </Button>
            <Button
              onClick={handleRefresh}
              size="sm"
              disabled={loading || isRefreshing}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${
                  loading || isRefreshing ? "animate-spin" : ""
                }`}
              />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
          </div>
        </div>

        {loading ? (
          <OrdersSkeleton />
        ) : (
          <>
            {selectedOrders.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border">
                <span className="text-sm font-medium">
                  {selectedOrders.length} order
                  {selectedOrders.length > 1 ? "s" : ""} selected
                </span>
                <Button
                  onClick={openDeleteDialog}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedOrders.length === orders.length &&
                          orders.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-12 w-12 text-gray-400" />
                          <p className="text-lg font-medium text-gray-900">
                            No orders found
                          </p>
                          <p className="text-sm text-gray-500">
                            {orderStatus !== "all"
                              ? `No orders with status "${orderStatus}". Try selecting "All Status".`
                              : "There are no orders in the system yet."}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Total orders in database: {pagination.totalCount}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order._id)}
                            onCheckedChange={() =>
                              toggleOrderSelection(order._id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            {(order as any).cancellationRequested && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                ⏳ Cancellation Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {order.paymentMethod}
                        </TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowOrderDetails(order)}
                              title="Show Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {orders.length} of {pagination.totalCount} orders
                {currentPage > 0 &&
                  ` (Page ${currentPage + 1} of ${pagination.totalPages})`}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteOrders}
        title="Delete Orders"
        description={`Are you sure you want to delete ${
          selectedOrders.length
        } order${
          selectedOrders.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        itemCount={selectedOrders.length}
        isLoading={isDeleting}
      />

      {/* Order Details Sidebar */}
      <OrderDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
        isLoading={isLoadingOrderDetails}
      />
    </>
  );
};

export default AdminOrders;
