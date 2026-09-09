"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CheckCircle,
  ClipboardCheck,
  Clock,
  DollarSign,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TimelineEvent {
  title: string;
  description?: string;
  date?: string;
  status: "completed" | "pending" | "current";
  icon: React.ReactNode;
  employee?: string;
}

interface OrderTimelineProps {
  order: {
    _id?: string;
    orderDate: string;
    addressConfirmedAt?: string;
    addressConfirmedBy?: string;
    orderConfirmedAt?: string;
    orderConfirmedBy?: string;
    packedAt?: string;
    packedBy?: string;
    paymentCompletedAt?: string;
    paymentStatus: string;
    cashCollectedAt?: string;
    deliveredAt?: string;
    deliveredBy?: string;
    assignedDeliverymanName?: string;
    dispatchedAt?: string;
    status: string;
    cancelledAt?: string;
    cancelledBy?: string;
  };
  onRefresh?: () => void | Promise<void>;
  isAutoRefreshEnabled?: boolean;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  onRefresh,
  isAutoRefreshEnabled = false,
}) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousOrderState, setPreviousOrderState] = useState(order);
  const [changedEventIndex, setChangedEventIndex] = useState<number | null>(
    null
  );

  // Force component to re-render when order object reference changes
  const [orderKey, setOrderKey] = useState(0);

  useEffect(() => {
    setOrderKey((prev) => prev + 1);
  }, [order]);

  useEffect(() => {
    // Reset animation when order status changes
    setVisibleItems(0);

    // Animate timeline items on mount or status change
    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        const events = getTimelineEvents();
        if (prev < events.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [
    order.status,
    order.addressConfirmedAt,
    order.orderConfirmedAt,
    order.packedAt,
    order.dispatchedAt,
    order.deliveredAt,
    order.cancelledAt,
  ]);

  // Detect order status changes and trigger animations
  useEffect(() => {
    if (previousOrderState && order) {
      const hasStatusChanged =
        previousOrderState.status !== order.status ||
        previousOrderState.addressConfirmedAt !== order.addressConfirmedAt ||
        previousOrderState.orderConfirmedAt !== order.orderConfirmedAt ||
        previousOrderState.packedAt !== order.packedAt ||
        previousOrderState.dispatchedAt !== order.dispatchedAt ||
        previousOrderState.deliveredAt !== order.deliveredAt ||
        previousOrderState.cancelledAt !== order.cancelledAt ||
        previousOrderState.paymentCompletedAt !== order.paymentCompletedAt ||
        previousOrderState.cashCollectedAt !== order.cashCollectedAt;

      if (hasStatusChanged) {
        console.log("Order status changed:", {
          from: previousOrderState.status,
          to: order.status,
          orderData: order,
        });

        // Find the current step index based on order status
        const events = getTimelineEvents();
        const currentEventIndex = events.findIndex(
          (e) => e.status === "current"
        );
        setChangedEventIndex(
          currentEventIndex >= 0
            ? currentEventIndex
            : events.filter((e) => e.status === "completed").length - 1
        );

        // Show animation feedback
        setTimeout(() => setChangedEventIndex(null), 2000);

        // Show detailed toast for status change
        const statusMessages = {
          pending: "Order received and pending processing",
          address_confirmed: "Address has been verified",
          order_confirmed: "Order has been confirmed",
          packed: "Order has been packed",
          ready_for_delivery: "Order is ready for delivery",
          out_for_delivery: "Order is out for delivery",
          delivered: "Order has been delivered",
          completed: "Order completed successfully",
          cancelled: "Order has been cancelled",
        };

        toast.success("Order status updated!", {
          description:
            statusMessages[order.status as keyof typeof statusMessages] ||
            `Order status: ${order.status}`,
          duration: 3000,
        });
      }
    }

    // Always update previous state to current order
    setPreviousOrderState(order);
  }, [order]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Timeline updated!", {
        description: "Order status has been refreshed",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error refreshing timeline:", error);
      toast.error("Failed to refresh timeline");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Check if order is cancelled
    const isCancelled = order.status === "cancelled";

    // Map order status to timeline states with precise step mapping
    const statusMap = {
      pending: 0,
      address_confirmed: 1,
      order_confirmed: 2,
      packed: 3,
      ready_for_delivery: 4,
      out_for_delivery: 4,
      delivered: 5,
      completed: 5,
      cancelled: -1,
    };

    const currentStatusLevel =
      statusMap[order.status.toLowerCase() as keyof typeof statusMap] ?? 0;

    // Debug logging
    console.log("OrderTimeline - Current order status:", {
      status: order.status,
      statusLevel: currentStatusLevel,
      timestamps: {
        addressConfirmedAt: order.addressConfirmedAt,
        orderConfirmedAt: order.orderConfirmedAt,
        packedAt: order.packedAt,
        dispatchedAt: order.dispatchedAt,
        deliveredAt: order.deliveredAt,
      },
    });

    // Determine timeline step states based on both timestamps and order status
    const isAddressConfirmed =
      !!order.addressConfirmedAt || currentStatusLevel >= 1;
    const isOrderConfirmed =
      !!order.orderConfirmedAt || currentStatusLevel >= 2;
    const isPacked = !!order.packedAt || currentStatusLevel >= 3;
    const isDispatched =
      !!(order.dispatchedAt || order.assignedDeliverymanName) ||
      currentStatusLevel >= 4;
    const isCashCollected = !!order.cashCollectedAt;
    const isDelivered = !!order.deliveredAt || currentStatusLevel >= 5;
    const isCOD = order.paymentStatus === "pending";

    // Helper function to determine exact step status
    const getStepStatus = (
      stepLevel: number
    ): "completed" | "current" | "pending" => {
      // For delivered/completed orders, all steps should be completed
      if (["delivered", "completed"].includes(order.status)) {
        return "completed";
      }

      if (currentStatusLevel > stepLevel) return "completed";
      if (currentStatusLevel === stepLevel) return "current";
      return "pending";
    };

    // 1. Order Placed - Always completed
    events.push({
      title: "Order Placed",
      description: "Your order has been received",
      date: order.orderDate,
      status: "completed",
      icon: <ClipboardCheck className="w-5 h-5" />,
    });

    // If order is cancelled, show cancellation and stop
    if (isCancelled) {
      events.push({
        title: "Order Cancelled",
        description: "This order has been cancelled",
        date: order.cancelledAt,
        status: "completed",
        icon: <XCircle className="w-5 h-5" />,
      });
      return events; // Return early to stop showing further timeline steps
    }

    // 2. Address Confirmation - Step 1
    const addressStatus = getStepStatus(1);
    events.push({
      title: isAddressConfirmed ? "Address Confirmed" : "Address Confirmation",
      description: isAddressConfirmed
        ? order.addressConfirmedBy
          ? `Confirmed by ${order.addressConfirmedBy}`
          : "Delivery address verified"
        : order.status === "pending"
          ? "Waiting for address verification"
          : "Address verification required",
      date: order.addressConfirmedAt,
      status: addressStatus,
      icon: <MapPin className="w-5 h-5" />,
      employee: order.addressConfirmedBy,
    });

    // 3. Order Confirmation - Step 2
    const orderConfirmStatus = getStepStatus(2);
    events.push({
      title: isOrderConfirmed ? "Order Confirmed" : "Order Confirmation",
      description: isOrderConfirmed
        ? order.orderConfirmedBy
          ? `Confirmed by ${order.orderConfirmedBy}`
          : "Order has been confirmed"
        : order.status === "address_confirmed"
          ? "Ready for order confirmation"
          : "Pending order confirmation",
      date: order.orderConfirmedAt,
      status: orderConfirmStatus,
      icon: <CheckCircle className="w-5 h-5" />,
      employee: order.orderConfirmedBy,
    });

    // 4. Packing - Step 3
    const packingStatus = getStepStatus(3);
    events.push({
      title: isPacked ? "Order Packed" : "Order Packing",
      description: isPacked
        ? order.packedBy
          ? `Packed by ${order.packedBy}`
          : "Your order has been packed"
        : order.status === "order_confirmed"
          ? "Ready for packing"
          : "Your order will be packed soon",
      date: order.packedAt,
      status: packingStatus,
      icon: <PackageCheck className="w-5 h-5" />,
      employee: order.packedBy,
    });

    // 5. Out for Delivery - Step 4
    const dispatchStatus = getStepStatus(4);
    events.push({
      title: isDispatched ? "Out for Delivery" : "Ready for Delivery",
      description: isDispatched
        ? order.assignedDeliverymanName
          ? `Assigned to ${order.assignedDeliverymanName}`
          : "Order is out for delivery"
        : ["packed", "ready_for_delivery"].includes(order.status)
          ? "Preparing for delivery"
          : "Your order will be dispatched for delivery",
      date: order.dispatchedAt,
      status: dispatchStatus,
      icon: <Truck className="w-5 h-5" />,
      employee: order.assignedDeliverymanName,
    });

    // 6. Payment Collection (for COD only) - Show when applicable
    if (isCOD) {
      if (isCashCollected) {
        events.push({
          title: "Payment Collected",
          description: "Cash on delivery payment received",
          date: order.cashCollectedAt,
          status: "completed",
          icon: <DollarSign className="w-5 h-5" />,
        });
      } else {
        events.push({
          title: "Payment Collection",
          description: "Cash payment will be collected on delivery",
          status: isDispatched ? "current" : "pending",
          icon: <DollarSign className="w-5 h-5" />,
        });
      }
    } else if (order.paymentCompletedAt && !isCashCollected) {
      // Online payment already completed
      events.push({
        title: "Payment Received",
        description: "Payment completed online",
        date: order.paymentCompletedAt,
        status: "completed",
        icon: <DollarSign className="w-5 h-5" />,
      });
    }

    // 7. Delivered - Step 5 (Final Step)
    const deliveredStatus = getStepStatus(5);

    // For COD orders, delivery is only complete when payment is collected
    const actualDeliveredStatus =
      isCOD && !isCashCollected && currentStatusLevel === 5
        ? "current"
        : deliveredStatus;

    events.push({
      title: "Delivered",
      description: isDelivered
        ? order.deliveredBy
          ? `Delivered by ${order.deliveredBy}`
          : "Order has been delivered successfully"
        : order.status === "out_for_delivery"
          ? "Out for delivery to your address"
          : "Your order will be delivered to your address",
      date: order.deliveredAt,
      status: actualDeliveredStatus,
      icon: <Package className="w-5 h-5" />,
      employee: order.deliveredBy,
    });

    return events;
  };

  const events = getTimelineEvents();

  return (
    <Card
      key={`timeline-${orderKey}-${order.status}`}
      className={cn(
        "overflow-hidden transition-all duration-300",
        changedEventIndex !== null && "ring-2 ring-shop_dark_blue/20 shadow-lg"
      )}
    >
      <CardHeader className="bg-linear-to-r from-shop_light_pink to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-shop_dark_blue">
            <Clock
              className={cn(
                "w-5 h-5 transition-all duration-300",
                changedEventIndex !== null && "animate-pulse text-shop_orange",
                isAutoRefreshEnabled && "animate-pulse text-blue-500"
              )}
            />
            Order Timeline
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
              {order.status.replace(/_/g, " ")}
            </span>
            {isAutoRefreshEnabled && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full ml-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
            {changedEventIndex !== null && (
              <span className="text-xs bg-shop_orange/10 text-shop_orange px-2 py-1 rounded-full animate-pulse ml-2">
                Updated!
              </span>
            )}
          </CardTitle>
          {onRefresh && (
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="ghost"
              className="h-8 px-3"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {events.map((event, index) => (
            <div
              key={`${event.title}-${event.status}-${index}`}
              className={cn(
                "relative pb-8 last:pb-0 transition-all duration-500 ease-in-out",
                index < visibleItems
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-6"
              )}
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
            >
              {/* Vertical Line with animated growth */}
              {index !== events.length - 1 && (
                <div className="absolute left-[18px] top-9 w-0.5 h-full bg-gray-200">
                  <div
                    className={cn(
                      "w-full transition-all duration-1000 ease-out origin-top",
                      event.status === "completed"
                        ? "bg-shop_dark_blue h-full"
                        : event.status === "current"
                          ? "bg-linear-to-b from-shop_dark_blue to-shop_orange h-3/4"
                          : "bg-transparent h-0",
                      // Add glow effect for active lines
                      event.status === "completed" &&
                        changedEventIndex === index &&
                        "shadow-lg shadow-shop_dark_blue/20"
                    )}
                    style={{
                      transitionDelay: `${index * 150 + 200}ms`,
                    }}
                  />

                  {/* Animated dots for current status line */}
                  {event.status === "current" && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <div
                        className="w-1 h-1 bg-shop_orange rounded-full animate-pulse"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-1 h-1 bg-shop_orange rounded-full animate-pulse mt-2"
                        style={{ animationDelay: "200ms" }}
                      />
                      <div
                        className="w-1 h-1 bg-shop_orange rounded-full animate-pulse mt-2"
                        style={{ animationDelay: "400ms" }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon with pulse animation for current and pending */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-700 transform",
                    event.status === "completed" &&
                      event.title === "Order Cancelled" &&
                      "bg-red-500 text-white shadow-lg scale-100",
                    event.status === "completed" &&
                      event.title !== "Order Cancelled" &&
                      "bg-shop_dark_blue text-white shadow-lg scale-100",
                    event.status === "current" &&
                      "bg-shop_orange text-white ring-4 ring-shop_orange/20 animate-pulse-slow scale-110",
                    event.status === "pending" &&
                      "bg-gray-100 text-gray-400 scale-95",
                    index < visibleItems && "scale-100",
                    // Add special animation for recently changed events
                    changedEventIndex === index && "animate-bounce"
                  )}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {event.icon}

                  {/* Ripple effect for current status */}
                  {event.status === "current" && (
                    <span className="absolute inset-0 rounded-full bg-shop_orange animate-ping opacity-20" />
                  )}

                  {/* Enhanced animation for status change */}
                  {changedEventIndex === index && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-shop_dark_blue animate-ping opacity-40" />
                      <span className="absolute inset-0 rounded-full bg-white animate-pulse opacity-30" />
                    </>
                  )}

                  {/* Checkmark overlay for completed */}
                  {event.status === "completed" && (
                    <span className="absolute inset-0 rounded-full bg-shop_dark_blue/10 animate-scale-in" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-semibold text-sm sm:text-base transition-colors duration-300",
                          event.status === "completed" &&
                            event.title === "Order Cancelled" &&
                            "text-red-600",
                          event.status === "completed" &&
                            event.title !== "Order Cancelled" &&
                            "text-shop_dark_blue",
                          event.status === "current" && "text-shop_orange",
                          event.status === "pending" && "text-gray-500"
                        )}
                      >
                        {event.title}
                      </h4>
                      {event.description && (
                        <p
                          className={cn(
                            "text-xs sm:text-sm mt-1 transition-colors duration-300",
                            event.status === "completed" && "text-gray-700",
                            event.status === "current" &&
                              "text-gray-800 font-medium",
                            event.status === "pending" && "text-gray-400"
                          )}
                        >
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.date && (
                      <div className="shrink-0 animate-fade-in">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs border transition-all duration-300",
                            event.status === "completed" &&
                              event.title === "Order Cancelled" &&
                              "border-red-300 bg-red-50 text-red-600",
                            event.status === "completed" &&
                              event.title !== "Order Cancelled" &&
                              "border-shop_dark_blue/30 bg-shop_dark_blue/5 text-shop_dark_blue",
                            event.status === "current" &&
                              "border-shop_orange/30 bg-shop_orange/5 text-shop_orange",
                            event.status === "pending" &&
                              "border-gray-200 bg-gray-50 text-gray-500"
                          )}
                        >
                          {format(new Date(event.date), "MMM dd, HH:mm")}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Enhanced current status indicator with animation */}
                  {event.status === "current" && (
                    <div className="mt-3 animate-slide-in-bottom">
                      <div className="flex items-center gap-2 px-3 py-2 bg-shop_orange/10 rounded-lg border border-shop_orange/20 backdrop-blur-sm">
                        <div className="relative flex items-center justify-center">
                          <div className="w-2 h-2 bg-shop_orange rounded-full animate-pulse" />
                          <div className="absolute w-2 h-2 bg-shop_orange rounded-full animate-ping" />
                          <div
                            className="absolute w-3 h-3 border border-shop_orange/30 rounded-full animate-ping"
                            style={{ animationDelay: "0.5s" }}
                          />
                        </div>
                        <span className="text-xs text-shop_orange font-semibold tracking-wide animate-pulse">
                          IN PROGRESS
                        </span>
                        {/* Progress dots */}
                        <div className="flex items-center gap-1 ml-2">
                          <div
                            className="w-1 h-1 bg-shop_orange/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-1 h-1 bg-shop_orange/60 rounded-full animate-bounce"
                            style={{ animationDelay: "100ms" }}
                          />
                          <div
                            className="w-1 h-1 bg-shop_orange/60 rounded-full animate-bounce"
                            style={{ animationDelay: "200ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed checkmark animation */}
                  {event.status === "completed" &&
                    index === visibleItems - 1 && (
                      <div className="mt-2 flex items-center gap-2 text-shop_dark_blue text-xs font-medium animate-fade-in">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Progress indicator - Only show for non-completed orders */}
        {!["delivered", "completed"].includes(order.status) && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
              <span className="font-medium">Order Progress</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-shop_dark_blue">
                  {events.filter((e) => e.status === "completed").length} of{" "}
                  {events.length} completed
                </span>
                {/* Status indicator */}
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    order.status === "cancelled" && "bg-red-100 text-red-700",
                    "bg-blue-100 text-blue-700"
                  )}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </div>
              </div>
            </div>

            {/* Multi-segment progress bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              {/* Main progress */}
              <div
                className={cn(
                  "h-full transition-all duration-1500 ease-out rounded-full",
                  order.status === "cancelled"
                    ? "bg-linear-to-r from-red-400 to-red-500"
                    : "bg-linear-to-r from-shop_dark_blue to-shop_light_blue"
                )}
                style={{
                  width: `${
                    order.status === "cancelled"
                      ? 100
                      : (events.filter((e) => e.status === "completed").length /
                          events.length) *
                        100
                  }%`,
                }}
              />

              {/* Current step indicator */}
              {events.some((e) => e.status === "current") && (
                <div
                  className="absolute top-0 h-full w-1 bg-shop_orange animate-pulse rounded-full"
                  style={{
                    left: `${
                      ((events.filter((e) => e.status === "completed").length +
                        0.5) /
                        events.length) *
                      100
                    }%`,
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </div>

            {/* Status-specific message */}
            <div className="mt-2 text-xs text-center">
              {order.status === "cancelled" && (
                <span className="text-red-600 font-medium">
                  Order has been cancelled
                </span>
              )}
              {order.status !== "cancelled" && (
                <span className="text-blue-600">Order is being processed</span>
              )}
            </div>
          </div>
        )}

        {/* Completion message for delivered/completed orders */}
        {["delivered", "completed"].includes(order.status) && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <span className="text-green-600 font-medium text-sm">
                🎉 Order completed successfully!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
