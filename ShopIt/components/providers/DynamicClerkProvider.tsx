"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface DynamicClerkProviderProps {
  children: ReactNode;
}

export default function DynamicClerkProvider({
  children,
}: DynamicClerkProviderProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
