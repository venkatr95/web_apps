// Global Map to store order update listeners
const orderUpdateListeners = new Map<string, ReadableStreamDefaultController>();

// Export the listeners map and broadcast function for use in other modules
export { orderUpdateListeners };

// Helper function to send order update to all listeners
export function broadcastOrderUpdate(orderData: any) {
  console.log(
    `🚨🚨🚨 [OrderSSE] Broadcasting order update to ${orderUpdateListeners.size} listeners:`,
    {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
    }
  );

  const message = JSON.stringify({
    type: "order_update",
    data: orderData,
    timestamp: new Date().toISOString(),
  });

  // Send to all connected clients
  orderUpdateListeners.forEach((controller, clientId) => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      console.warn(
        `❌ [OrderSSE] Failed to send to client ${clientId}, removing:`,
        error
      );
      orderUpdateListeners.delete(clientId);
    }
  });
}

// Helper function to add a new SSE listener
export function addOrderUpdateListener(
  clientId: string,
  controller: ReadableStreamDefaultController
) {
  orderUpdateListeners.set(clientId, controller);
  console.log(
    `🚨🚨🚨 [OrderSSE] Added listener ${clientId}, total: ${orderUpdateListeners.size}`
  );
}

// Helper function to remove an SSE listener
export function removeOrderUpdateListener(clientId: string) {
  const removed = orderUpdateListeners.delete(clientId);
  console.log(
    `🚨🚨🚨 [OrderSSE] Removed listener ${clientId}, success: ${removed}, remaining: ${orderUpdateListeners.size}`
  );
  return removed;
}
