import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter Subscriptions - Admin Panel",
  description: "Manage newsletter subscriptions",
};

export default function SubscriptionsPage() {
  return <AdminSubscriptions />;
}
