import { DataManagement } from "@/components/admin/data/DataManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Management - Admin Panel",
  description: "Manage all Sanity CMS data - view, edit, and delete content",
};

export default function DataManagementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all Sanity CMS content including products, categories, blogs,
          users, and more.
        </p>
      </div>

      <DataManagement />
    </div>
  );
}
