import {
  addOrderUpdateListener,
  orderUpdateListeners,
  removeOrderUpdateListener,
} from "@/lib/orderSSE";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = `client_${Date.now()}_${Math.random()}`;
  console.log(`🚨🚨🚨 [OrderSSE] New client connected: ${clientId}`);

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this client
      addOrderUpdateListener(clientId, controller);

      // Send initial connection message
      const initialMessage = JSON.stringify({
        type: "connection",
        message: "Connected to order updates stream",
        clientId,
        timestamp: new Date().toISOString(),
      });

      controller.enqueue(`data: ${initialMessage}\n\n`);

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMessage = JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(`data: ${heartbeatMessage}\n\n`);
        } catch (error) {
          console.warn(
            `❌ [OrderSSE] Heartbeat failed for client ${clientId}:`,
            error
          );
          clearInterval(heartbeat);
          removeOrderUpdateListener(clientId);
        }
      }, 30000); // 30 seconds heartbeat

      // Store heartbeat interval for cleanup
      (controller as any).heartbeatInterval = heartbeat;
    },

    cancel() {
      console.log(`🚨🚨🚨 [OrderSSE] Client disconnected: ${clientId}`);

      // Clean up heartbeat interval
      const controller = orderUpdateListeners.get(clientId);
      if (controller && (controller as any).heartbeatInterval) {
        clearInterval((controller as any).heartbeatInterval);
      }

      // Remove client from listeners
      removeOrderUpdateListener(clientId);
    },
  });

  // Return the stream with proper SSE headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
