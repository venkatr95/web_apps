import { sendMail } from "@/lib/emailService";
import { sendOrderStatusNotification } from "@/lib/notificationService";

export interface OrderEmailData {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  clerkUserId: string;
  orderDate: string;
  totalPrice: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  paymentMethod?: string;
  status: string;
  products: Array<{
    quantity: number;
    product: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
  }>;
  address: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  assignedDeliverymanName?: string;
  estimatedDelivery?: string;
}

/**
 * Get email subject and template customization based on order status
 */
const getEmailCustomization = (status: string, orderNumber: string) => {
  switch (status.toLowerCase()) {
    case "address_confirmed":
      return {
        subject: `Address Confirmed - Order #${orderNumber}`,
        headerTitle: "📍 Address Confirmed!",
        headerMessage: "Your delivery address has been verified",
        statusMessage:
          "We've confirmed your delivery address and are now processing your order.",
      };

    case "order_confirmed":
      return {
        subject: `Order Confirmed - #${orderNumber}`,
        headerTitle: "✅ Order Confirmed!",
        headerMessage: "Your order has been confirmed and will be packed soon",
        statusMessage:
          "Great! We've confirmed all details and your order is now in our packing queue.",
      };

    case "packed":
      return {
        subject: `Order Packed - #${orderNumber}`,
        headerTitle: "📦 Order Packed!",
        headerMessage: "Your order has been carefully packed",
        statusMessage:
          "Your items have been packed with care and will be dispatched for delivery soon.",
      };

    case "out_for_delivery":
      return {
        subject: `Out for Delivery - Order #${orderNumber}`,
        headerTitle: "🚚 Out for Delivery!",
        headerMessage: "Your order is on its way to you",
        statusMessage:
          "Your order is now out for delivery and should arrive today. Please be available to receive it.",
      };

    case "delivered":
      return {
        subject: `Order Delivered - #${orderNumber}`,
        headerTitle: "🎉 Order Delivered!",
        headerMessage: "Your order has been successfully delivered",
        statusMessage:
          "Thank you for your purchase! We hope you enjoy your items. Please consider leaving a review.",
      };

    default:
      return {
        subject: `Order Update - #${orderNumber}`,
        headerTitle: "📋 Order Updated",
        headerMessage: "Your order status has been updated",
        statusMessage: `Your order status has been updated to: ${status.replace(/_/g, " ")}.`,
      };
  }
};

// Note: Removed transformOrderDataForEmail function as we now use direct SMTP with status-specific templates

/**
 * Send comprehensive order status email notification
 */
export const sendOrderStatusEmail = async (
  order: OrderEmailData,
  previousStatus?: string
): Promise<{ success: boolean; error?: string }> => {
  console.log(`🚨🚨🚨 ORDER EMAIL SERVICE CALLED 🚨🚨🚨`);
  console.log(
    `📧 [OrderEmailService] Starting sendOrderStatusEmail for order ${order.orderNumber}`
  );
  console.log(
    `📧 [OrderEmailService] Customer: ${order.customerName} (${order.email})`
  );
  console.log(`📧 [OrderEmailService] Status: ${order.status}`);
  console.log(`🔥 PROCESSING EMAIL FOR STATUS: ${order.status}`);

  try {
    // Get status-specific customization
    const customization = getEmailCustomization(
      order.status,
      order.orderNumber
    );
    console.log(`📧 [OrderEmailService] Status customization:`, {
      subject: customization.subject,
      headerTitle: customization.headerTitle,
      statusMessage: customization.statusMessage,
    });

    // Create status-specific HTML email content
    const htmlContent = generateOrderStatusHTML(order, customization);

    // Create text email content
    const textContent = generateOrderStatusText(order, customization);

    console.log(`🚀🚀🚀 SENDING STATUS-SPECIFIC EMAIL VIA SMTP 🚀🚀🚀`);
    console.log(`📧 [OrderEmailService] To: ${order.email}`);
    console.log(`📧 [OrderEmailService] Subject: ${customization.subject}`);

    // Send email via SMTP using the sendMail function
    const emailResult = await sendMail({
      email: order.email,
      subject: customization.subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`📧 [OrderEmailService] SMTP Email result:`, emailResult);
    console.log(
      `🔥 FINAL EMAIL RESULT:`,
      emailResult.success ? "✅ EMAIL SENT VIA SMTP!" : "❌ SMTP EMAIL FAILED!"
    );

    if (!emailResult.success) {
      console.error(
        `❌ [OrderEmailService] Failed to send SMTP email for order ${order.orderNumber}:`,
        emailResult.error
      );
    } else {
      console.log(
        `✅ [OrderEmailService] SMTP email sent successfully for order ${order.orderNumber}`
      );
    }

    // Send in-app notification (optional - don't let it affect email success)
    console.log(`📱 [OrderEmailService] Sending in-app notification...`);
    let notificationResult: { success: boolean; error?: string } = {
      success: true,
    };

    try {
      const notificationResponse = await sendOrderStatusNotification({
        clerkUserId: order.clerkUserId,
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: order.status,
        previousStatus,
      });

      // Map notification response to our expected structure
      notificationResult = {
        success: notificationResponse.success,
        error: notificationResponse.error,
      };

      console.log(
        `📱 [OrderEmailService] Notification result:`,
        notificationResult
      );

      if (!notificationResult.success) {
        console.error(
          `❌ [OrderEmailService] Failed to send notification for order ${order.orderNumber}:`,
          notificationResult.error
        );
        console.log(
          `⚠️ [OrderEmailService] Notification failed but email can still succeed`
        );
      } else {
        console.log(
          `✅ [OrderEmailService] Notification sent successfully for order ${order.orderNumber}`
        );
      }
    } catch (notificationError) {
      console.error(
        `❌ [OrderEmailService] Notification error (non-blocking):`,
        notificationError
      );
      notificationResult = {
        success: false,
        error: `Notification failed: ${notificationError instanceof Error ? notificationError.message : String(notificationError)}`,
      };
    }

    // Email success is independent of notification success
    const finalResult = {
      success: emailResult.success, // Only depend on email success
      error: emailResult.error, // Only show email errors as primary
      notificationResult: notificationResult, // Include notification result for debugging
    };

    console.log(
      `📧 [OrderEmailService] Final result for order ${order.orderNumber}:`,
      finalResult
    );
    return finalResult;
  } catch (error) {
    console.error(
      `❌ [OrderEmailService] Error sending order status email for ${order.orderNumber}:`,
      error
    );
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    console.log(
      `📧 [OrderEmailService] Error result for order ${order.orderNumber}:`,
      errorResult
    );
    return errorResult;
  }
};

/**
 * Generate HTML email content for order status updates
 */
const generateOrderStatusHTML = (
  order: OrderEmailData,
  customization: any
): string => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${customization.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .status-message { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1e40af; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; vertical-align: middle; }
        .items-table th { background: #e9ecef; }
        .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
        .product-image-placeholder { width: 50px; height: 50px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 18px; }
        .total-section { background: #1e40af; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { background: #333; color: #fff; text-align: center; padding: 15px; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${customization.headerTitle}</h1>
            <p>${customization.headerMessage}</p>
        </div>
        
        <div class="content">
            <h2>Hi ${order.customerName}!</h2>
            
            <div class="status-message">
                <h3>Order Status Update</h3>
                <p>${customization.statusMessage}</p>
            </div>
            
            <div class="order-details">
                <h3>Order #${order.orderNumber}</h3>
                <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status.replace(/_/g, " ").toUpperCase()}</p>
                ${order.assignedDeliverymanName ? `<p><strong>Delivery Person:</strong> ${order.assignedDeliverymanName}</p>` : ""}
                ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>` : ""}
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.products
                          .map(
                            (item) => `
                            <tr>
                                <td>
                                    ${
                                      item.product.image
                                        ? `<img src="${item.product.image}" alt="${item.product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                         <div class="product-image-placeholder" style="display: none;">📦</div>`
                                        : `<div class="product-image-placeholder">📦</div>`
                                    }
                                </td>
                                <td>${item.product.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">${formatCurrency(item.product.price * item.quantity)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <strong>Order Total: ${formatCurrency(order.totalPrice)}</strong>
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3>📦 Delivery Address</h3>
                <p>
                    <strong>${order.address.fullName}</strong><br>
                    ${order.address.address}<br>
                    ${order.address.city}, ${order.address.state} ${order.address.postalCode}<br>
                    ${order.address.country}
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ShopIt</strong></p>
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Generate text email content for order status updates
 */
const generateOrderStatusText = (
  order: OrderEmailData,
  customization: any
): string => {
  return `
${customization.headerTitle}

Hi ${order.customerName}!

Order Status Update:
${customization.statusMessage}

Order Details:
- Order Number: ${order.orderNumber}
- Order Date: ${new Date(order.orderDate).toLocaleDateString()}
- Status: ${order.status.replace(/_/g, " ").toUpperCase()}
- Total: $${order.totalPrice.toFixed(2)}

Items:
${order.products.map((item) => `- ${item.product.name} (${item.quantity}x) - $${(item.product.price * item.quantity).toFixed(2)}`).join("\n")}

Delivery Address:
${order.address.fullName}
${order.address.address}
${order.address.city}, ${order.address.state} ${order.address.postalCode}
${order.address.country}

${order.assignedDeliverymanName ? `Delivery Person: ${order.assignedDeliverymanName}\n` : ""}${order.estimatedDelivery ? `Estimated Delivery: ${order.estimatedDelivery}\n` : ""}
Thank you for choosing ShopIt!
`;
};

/**
 * Send invoice generation notification
 */
export const sendInvoiceGeneratedNotification = async (
  order: OrderEmailData,
  invoiceUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Send in-app notification about invoice generation
    const notificationResult = await sendOrderStatusNotification({
      clerkUserId: order.clerkUserId,
      orderNumber: order.orderNumber,
      orderId: order._id,
      status: "invoice_generated",
    });

    // Note: You could also send a separate email template specifically for invoice generation
    // For now, we're just using the in-app notification

    return notificationResult;
  } catch (error) {
    console.error(
      `Error sending invoice notification for ${order.orderNumber}:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Utility function to fetch order data from Sanity for email notifications
 */
export const fetchOrderForEmail = async (
  orderId: string,
  backendClient: any
): Promise<OrderEmailData | null> => {
  try {
    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        customerName,
        email,
        clerkUserId,
        orderDate,
        totalPrice,
        subtotal,
        tax,
        shipping,
        currency,
        paymentMethod,
        status,
        products[]{
          quantity,
          product->{
            _id,
            name,
            price,
            "image": image.asset->url
          }
        },
        address,
        assignedDeliverymanName,
        estimatedDelivery
      }`,
      { orderId }
    );

    return order;
  } catch (error) {
    console.error(`Error fetching order ${orderId} for email:`, error);
    return null;
  }
};

/**
 * Bulk send order status emails (for batch processing)
 */
export const sendBulkOrderStatusEmails = async (
  orders: OrderEmailData[]
): Promise<{
  success: number;
  failed: number;
  results: Array<{ orderId: string; success: boolean; error?: string }>;
}> => {
  const results = await Promise.allSettled(
    orders.map(async (order) => ({
      orderId: order._id,
      ...(await sendOrderStatusEmail(order)),
    }))
  );

  const processedResults = results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { orderId: "unknown", success: false, error: "Promise rejected" }
  );

  const successful = processedResults.filter((r) => r.success).length;
  const failed = processedResults.filter((r) => !r.success).length;

  return {
    success: successful,
    failed: failed,
    results: processedResults,
  };
};

export default {
  sendOrderStatusEmail,
  sendInvoiceGeneratedNotification,
  fetchOrderForEmail,
  sendBulkOrderStatusEmails,
};
