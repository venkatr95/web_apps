"use client";

import AdminTopNavigation from "@/components/admin/AdminTopNavigation";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAdminStatus } from "@/lib/useAdminStatus";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading: adminLoading, checkComplete } = useAdminStatus();

  // Redirect non-admin users
  useEffect(() => {
    if (isLoaded && checkComplete && !isAdmin) {
      router.push("/admin/access-denied");
    }
  }, [isLoaded, checkComplete, isAdmin, router]);

  // Show loading while checking authentication
  if (!isLoaded || adminLoading || !checkComplete) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shop_dark_blue"></div>
          <span className="ml-2 text-gray-600">Checking admin access...</span>
        </div>
      </Container>
    );
  }

  // If not admin, don't render anything (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Container className="py-6">
        <div className="flex flex-col gap-6">
          {/* Top Navigation */}
          <AdminTopNavigation currentPath={pathname} user={user} />

          {/* Main Content */}
          <div className="admin-content-push bg-white rounded-2xl shadow-xl border border-shop_light_blue/10 overflow-hidden">
            {children}
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default AdminLayout;
