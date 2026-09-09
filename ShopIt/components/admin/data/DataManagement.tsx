"use client";

import { DataEditor } from "@/components/admin/data/DataEditor";
import { DataTypeSelector } from "@/components/admin/data/DataTypeSelector";
import { DataViewer } from "@/components/admin/data/DataViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Database,
  Download,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev?: string;
  [key: string]: any;
}

export const DataManagement = () => {
  const [selectedType, setSelectedType] = useState<string>("product");
  const [documents, setDocuments] = useState<SanityDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<SanityDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 20;

  // Available Sanity document types
  const documentTypes = [
    { value: "product", label: "Products", icon: "📦" },
    { value: "category", label: "Categories", icon: "📂" },
    { value: "brand", label: "Brands", icon: "🏷️" },
    { value: "banner", label: "Banners", icon: "🖼️" },
    { value: "blog", label: "Blog Posts", icon: "📝" },
    { value: "blogCategory", label: "Blog Categories", icon: "📚" },
    { value: "user", label: "Users", icon: "👤" },
    { value: "order", label: "Orders", icon: "🛒" },
    { value: "review", label: "Reviews", icon: "⭐" },
    { value: "subscription", label: "Subscriptions", icon: "📧" },
    { value: "userAccessRequest", label: "Access Requests", icon: "🔑" },
    { value: "sentNotification", label: "Notifications", icon: "🔔" },
    { value: "contact", label: "Contact Messages", icon: "💬" },
    { value: "author", label: "Authors", icon: "✍️" },
    { value: "address", label: "Addresses", icon: "📍" },
  ];

  // Fetch documents from Sanity
  const fetchDocuments = async (
    type: string,
    page: number = 0,
    search: string = ""
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/data?type=${type}&page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents);
      setTotalCount(data.total);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Load documents when type or search changes
  useEffect(() => {
    fetchDocuments(selectedType, currentPage, searchTerm);
  }, [selectedType, currentPage, searchTerm]);

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/data/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      toast.success("Document deleted successfully");
      fetchDocuments(selectedType, currentPage, searchTerm);
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Handle document update
  const handleUpdate = async (documentId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/data/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update document");
      }

      toast.success("Document updated successfully");
      fetchDocuments(selectedType, currentPage, searchTerm);
      setEditorOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };

  // Handle document creation
  const handleCreate = async (documentData: any) => {
    try {
      const response = await fetch("/api/admin/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...documentData,
          _type: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      toast.success("Document created successfully");
      fetchDocuments(selectedType, currentPage, searchTerm);
      setEditorOpen(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
    }
  };

  // Export data as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(documents, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedType}_data_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const selectedTypeInfo = documentTypes.find((t) => t.value === selectedType);
  const filteredDocuments = documents.filter((doc) =>
    JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sanity Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Selector */}
            <div className="flex-1">
              <DataTypeSelector
                documentTypes={documentTypes}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSelectedDocument(null);
                setIsCreating(true);
                setEditorOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                fetchDocuments(selectedType, currentPage, searchTerm)
              }
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={documents.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>{selectedTypeInfo?.icon}</span>
              {selectedTypeInfo?.label}
              <Badge variant="secondary">{totalCount} items</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading documents...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title/Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No {selectedTypeInfo?.label.toLowerCase()} found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc._id}>
                          <TableCell className="font-mono text-sm">
                            {doc._id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {doc.title || doc.name || doc.email || doc._id}
                          </TableCell>
                          <TableCell>
                            {new Date(doc._createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(doc._updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setViewerOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsCreating(false);
                                  setEditorOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalCount > itemsPerPage && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {currentPage * itemsPerPage + 1} to{" "}
                    {Math.min((currentPage + 1) * itemsPerPage, totalCount)} of{" "}
                    {totalCount} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={(currentPage + 1) * itemsPerPage >= totalCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      {selectedDocument && (
        <DataViewer
          document={selectedDocument}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}

      {/* Document Editor Dialog */}
      {(selectedDocument || isCreating) && (
        <DataEditor
          document={isCreating ? null : selectedDocument}
          documentType={selectedType}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSave={isCreating ? handleCreate : handleUpdate}
          isCreating={isCreating}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
              <br />
              <br />
              <strong>Document ID:</strong> {selectedDocument?._id}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDocument && handleDelete(selectedDocument._id)
              }
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
