import nodemailer from "nodemailer";

// Create reusable transporter
export const createEmailTransporter = () => {
  // Check if SMTP credentials are provided
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn(
      "SMTP credentials not configured. Email functionality will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || "587"),
    secure: parseInt(smtpPort || "587") === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const transporter = createEmailTransporter();

  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "RecipeHub"}" <${
      process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    }>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">RecipeHub</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Verify Your Email Address</h2>
          
          <p style="font-size: 16px; color: #4b5563;">
            Thank you for signing up for RecipeHub! Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #3b82f6; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">
            This verification link will expire in 24 hours. If you didn't create an account with RecipeHub, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} RecipeHub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email Address
    
    Thank you for signing up for RecipeHub!
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with RecipeHub, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - RecipeHub",
    html,
    text,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">RecipeHub</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
          
          <p style="font-size: 16px; color: #4b5563;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #3b82f6; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} RecipeHub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password
    
    We received a request to reset your password.
    
    Click the link below to create a new password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - RecipeHub",
    html,
    text,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RecipeHub</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">RecipeHub</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Welcome to RecipeHub, ${name}!</h2>
          
          <p style="font-size: 16px; color: #4b5563;">
            Your email has been verified successfully. You're now ready to discover and share amazing recipes!
          </p>
          
          <div style="background: white; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #111827;">Get Started</h3>
            <ul style="color: #4b5563; padding-left: 20px;">
              <li>Browse thousands of recipes</li>
              <li>Share your own culinary creations</li>
              <li>Save your favorite recipes</li>
              <li>Connect with fellow food lovers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" 
               style="background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Start Exploring
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} RecipeHub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to RecipeHub, ${name}!
    
    Your email has been verified successfully. You're now ready to discover and share amazing recipes!
    
    Get Started:
    - Browse thousands of recipes
    - Share your own culinary creations
    - Save your favorite recipes
    - Connect with fellow food lovers
    
    Visit: ${process.env.NEXTAUTH_URL}
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to RecipeHub!",
    html,
    text,
  });
}
