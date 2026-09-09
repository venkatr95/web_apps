import { createClient } from "@sanity/client";

// Admin client with write permissions for role management
export const adminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: "2024-01-01",
  // Use the token with write permissions - this should be a token with Editor role
  token: process.env.SANITY_API_TOKEN,
  ignoreBrowserTokenWarning: true,
});

// Verify token permissions
if (!process.env.SANITY_API_TOKEN) {
  console.warn("⚠️ SANITY_API_TOKEN is not set - role updates will fail");
} else {
  console.log("✅ Admin client initialized with token");
}
