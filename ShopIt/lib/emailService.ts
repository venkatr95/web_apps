import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// Type definitions
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  estimatedDelivery?: string;
}

// Email response interface
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send mail parameters interface
export interface SendMailParams {
  email: string;
  subject: string;
  text: string;
  html?: string;
}

// Create transporter based on available configuration
const createTransporter =
  (): Transporter<SMTPTransport.SentMessageInfo> | null => {
    try {
      // Priority 1: Gmail App Password (simpler and more reliable setup)
      if (process.env.GMAIL_APP_PASSWORD) {
        console.log("📧 Using Gmail App Password configuration");
        return nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SENDER_EMAIL_ADDRESS,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
      }

      // Priority 2: Custom SMTP with password
      if (process.env.EMAIL_PASSWORD) {
        console.log("📧 Using custom SMTP configuration");
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SENDER_EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      }

      // Priority 3: OAuth2 configuration (fallback)
      if (
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN
      ) {
        console.log("📧 Using Gmail OAuth2 configuration");
        return nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.SENDER_EMAIL_ADDRESS,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          },
        });
      }

      // No valid email configuration found
      console.log(
        "📧 No email configuration found - will use development mode"
      );
      return null;
    } catch (error) {
      console.error("📧 Failed to create email transporter:", error);
      return null;
    }
  };

// Initialize transporter
const transporter = createTransporter();

// Simple HTML template generator
const generateOrderConfirmationHTML = (data: OrderConfirmationData): string => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${data.orderId}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .order-summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; vertical-align: middle; }
        .items-table th { background: #e9ecef; }
        .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
        .product-image-placeholder { width: 50px; height: 50px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 18px; }
        .item-details { display: flex; align-items: center; gap: 10px; }
        .total-row .end { display: inline-block; justify-content: space-between; margin-left: auto; text-align: right; float: right;}
        .total-final { background: #1e40af; color: white; padding: 15px; border-radius: 8px; font-weight: bold; margin: 15px 0; }
        .footer { background: #333; color: #fff; text-align: center; padding: 15px; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for shopping with ShopIt</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.customerName}!</h2>
            <p>Your order has been confirmed and is being processed.</p>
            
            <div class="order-summary">
                <h3>Order #${data.orderId}</h3>
                <p>Placed on ${data.orderDate}</p>
                
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
                        ${data.items
                          .map(
                            (item) => `
                            <tr>
                                <td>
                                    ${
                                      item.image
                                        ? `<img src="${item.image}" alt="${item.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                         <div class="product-image-placeholder" style="display: none;">📦</div>`
                                        : `<div class="product-image-placeholder">📦</div>`
                                    }
                                </td>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span class="end">${formatCurrency(data.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span class="end">${formatCurrency(data.shipping)}</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span class="end">${formatCurrency(data.tax)}</span>
                </div>
                <div class="total-row total-final">
                    <span>Total:</span>
                    <span class="end">${formatCurrency(data.total)}</span>
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3>📦 Shipping Address</h3>
                <p>
                    <strong>${data.shippingAddress.name}</strong><br>
                    ${data.shippingAddress.street}<br>
                    ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
                    ${data.shippingAddress.country}
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ShopIt</strong></p>
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Send order confirmation email
 */

export const sendOrderConfirmationEmail = async (
  data: OrderConfirmationData
): Promise<EmailResponse> => {
  // Skip email in development if no email config is provided
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.GMAIL_APP_PASSWORD &&
    !process.env.EMAIL_PASSWORD &&
    !process.env.GOOGLE_CLIENT_ID
  ) {
    console.log(
      "📧 Email service not configured - skipping email send in development"
    );
    console.log(`Would have sent order confirmation to: ${data.customerEmail}`);
    console.log(`Order ID: ${data.orderId}`);
    return { success: true, messageId: "dev-skip-" + Date.now() };
  }

  // Check if transporter is available
  if (!transporter) {
    console.log("📧 No email transporter available - skipping email send");
    console.log(`Would have sent order confirmation to: ${data.customerEmail}`);
    console.log(`Order ID: ${data.orderId}`);
    return { success: true, messageId: "no-transporter-" + Date.now() };
  }

  try {
    const htmlContent = generateOrderConfirmationHTML(data);

    const textContent = `
Hi ${data.customerName}!

Thank you for your order!

Order ID: ${data.orderId}
Order Date: ${data.orderDate}
Total: $${data.total.toFixed(2)}

Items:
${data.items.map((item) => `- ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

Shipping Address:
${data.shippingAddress.name}
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

Thank you for choosing ShopIt!`;

    const mailOptions = {
      from: `"ShopIt Ecommerce" <${process.env.SENDER_EMAIL_ADDRESS || ""}>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderId} | Thank you for your purchase!`,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Order confirmation email sent successfully to ${data.customerEmail}`
    );
    console.log(`📧 Message ID: ${result.messageId}`);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Send general email (simple text/HTML email)
 */
export const sendMail = async ({
  email,
  subject,
  text,
  html,
}: SendMailParams): Promise<EmailResponse> => {
  // Skip email in development if no email config is provided
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.GMAIL_APP_PASSWORD &&
    !process.env.EMAIL_PASSWORD &&
    !process.env.GOOGLE_CLIENT_ID
  ) {
    console.log(
      "📧 Email service not configured - skipping email send in development"
    );
    console.log(`Would have sent email to: ${email}`);
    console.log(`Subject: ${subject}`);
    return { success: true, messageId: "dev-skip-" + Date.now() };
  }

  // Check if transporter is available
  if (!transporter) {
    console.log("📧 No email transporter available - skipping email send");
    console.log(`Would have sent email to: ${email}`);
    console.log(`Subject: ${subject}`);
    return { success: true, messageId: "no-transporter-" + Date.now() };
  }

  try {
    const mailOptions = {
      from: `"ShopIt Ecommerce" <${process.env.SENDER_EMAIL_ADDRESS || ""}>`,
      to: email,
      subject,
      text,
      ...(html && { html }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<EmailResponse> => {
  if (!transporter) {
    return {
      success: false,
      error: "No email transporter configured",
    };
  }

  try {
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return { success: true };
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Configuration test failed",
    };
  }
};

// Export types
export type { OrderConfirmationData, OrderItem, ShippingAddress };
