"use client";

import {
  assignEmployeeRole,
  removeEmployeeRole,
} from "@/actions/employeeActions";
import {
  getAllUsersForRoleManagement,
  updateUserRole,
} from "@/actions/userActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmployeeRole } from "@/types/employee";
import { UserRole } from "@/types/user";
import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  Database,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EmployeeAssignmentSidebar } from "./EmployeeAssignmentSidebar";
import { RoleAssignmentSidebar } from "./RoleAssignmentSidebar";
import { UsersSkeleton } from "./SkeletonLoaders";
import { UserActionModal } from "./UserActionModal";
import { UserDetailsSidebar } from "./UserDetailsSidebar";
import { handleApiError, safeApiCall } from "./apiHelpers";

interface CombinedUser {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt?: number;
  emailVerified: boolean;
  banned: boolean;
  locked: boolean;
  // Sanity-specific fields
  isActive: boolean;
  activatedAt?: string;
  activatedBy?: string;
  sanityId?: string;
  inSanity: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  notificationCount: number;
  // Employee fields
  isEmployee?: boolean;
  employeeRole?: string;
  employeeStatus?: string;
  // Role field
  role?: UserRole;
}

const AdminUsers: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [sanityUsersCount, setSanityUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activatingUsers, setActivatingUsers] = useState<Set<string>>(
    new Set()
  );
  const [tableLoading, setTableLoading] = useState(false);

  // Modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    user: CombinedUser | null;
    action: "activate" | "deactivate" | "delete" | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  // Sidebar state
  const [sidebarState, setSidebarState] = useState<{
    isOpen: boolean;
    user: CombinedUser | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Employee assignment sidebar state
  const [employeeSidebarState, setEmployeeSidebarState] = useState<{
    isOpen: boolean;
    user: CombinedUser | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Role assignment sidebar state
  const [roleSidebarState, setRoleSidebarState] = useState<{
    isOpen: boolean;
    user: CombinedUser | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Role management dialog state
  const [roleManagementState, setRoleManagementState] = useState<{
    isOpen: boolean;
    users: Array<{
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role: UserRole;
    }>;
    updatingUserId: string | null;
  }>({
    isOpen: false,
    users: [],
    updatingUserId: null,
  });

  const perPageOptions = [20, 30, 40, 50, 100];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search changes or per page changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(0);
    }
  }, [debouncedSearchTerm, searchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [perPage]);

  // Utility functions
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Modal handlers
  const openActionModal = (
    user: CombinedUser,
    action: "activate" | "deactivate" | "delete"
  ) => {
    setActionModal({
      isOpen: true,
      user,
      action,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      user: null,
      action: null,
    });
  };

  // Sidebar handlers
  const openSidebar = (user: CombinedUser) => {
    setSidebarState({
      isOpen: true,
      user,
    });
  };

  const closeSidebar = () => {
    setSidebarState({
      isOpen: false,
      user: null,
    });
  };

  // User activation functions
  const handleUserActivation = async (userId: string, activate: boolean) => {
    setActivatingUsers((prev) => new Set(prev).add(userId));

    try {
      const action = activate ? "activate" : "deactivate";
      await safeApiCall(`/api/admin/users/${userId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      // Immediately fetch fresh data
      await fetchUsers(currentPage, true);
    } catch (error) {
      handleApiError(error, `User ${activate ? "activation" : "deactivation"}`);
    } finally {
      setActivatingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Handle user update for instant feedback
  const handleUserUpdate = (updatedUser: CombinedUser) => {
    // Update the user in the users list
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );

    // Update the sidebar state with the new user data
    setSidebarState((prev) => ({
      ...prev,
      user: updatedUser,
    }));

    // Update counts
    setSanityUsersCount((prev) => prev + 1);
    setActiveUsersCount((prev) => prev + 1);
  };

  // User deletion from Sanity
  const handleUserDeletion = async (userId: string) => {
    setActivatingUsers((prev) => new Set(prev).add(userId));

    try {
      await safeApiCall(`/api/admin/users/${userId}/delete-sanity`, {
        method: "DELETE",
      });

      // Immediately fetch fresh data
      await fetchUsers(currentPage, true);
    } catch (error) {
      handleApiError(error, "User deletion from Sanity");
    } finally {
      setActivatingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Confirm action handler
  const handleConfirmAction = async () => {
    if (!actionModal.user || !actionModal.action) return;

    const { user, action } = actionModal;
    closeActionModal();

    switch (action) {
      case "activate":
        await handleUserActivation(user.id, true);
        break;
      case "deactivate":
        await handleUserActivation(user.id, false);
        break;
      case "delete":
        await handleUserDeletion(user.id);
        break;
    }
  };

  // Open employee assignment dialog
  const openEmployeeDialog = (user: CombinedUser) => {
    setEmployeeSidebarState({
      isOpen: true,
      user,
    });
  };

  // Close employee assignment dialog
  const closeEmployeeDialog = () => {
    setEmployeeSidebarState({
      isOpen: false,
      user: null,
    });
  };

  // Open role assignment dialog
  const openRoleSidebar = (user: CombinedUser) => {
    setRoleSidebarState({
      isOpen: true,
      user,
    });
  };

  // Close role assignment dialog
  const closeRoleSidebar = () => {
    setRoleSidebarState({
      isOpen: false,
      user: null,
    });
  };

  // Handle employee role assignment
  const handleAssignEmployee = async (sanityId: string, role: EmployeeRole) => {
    try {
      const result = await assignEmployeeRole(sanityId, role);

      if (result.success) {
        toast.success(result.message);
        // Immediately fetch fresh data
        await fetchUsers(currentPage, true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error assigning employee role:", error);
      toast.error("Failed to assign employee role");
    }
  };

  // Handle employee role removal
  const handleRemoveEmployee = async (sanityId: string, userName: string) => {
    try {
      const result = await removeEmployeeRole(sanityId);

      if (result.success) {
        toast.success(result.message);
        // Immediately fetch fresh data and close sidebar
        await fetchUsers(currentPage, true);
        closeEmployeeDialog();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error removing employee role:", error);
      toast.error("Failed to remove employee role");
    }
  };

  // Handle user role update
  const handleUserRoleUpdate = async (userId: string, newRole: UserRole) => {
    console.log("🔄 Starting role update:", { userId, newRole });

    try {
      const requestBody = {
        userId,
        newRole,
      };

      console.log("📤 Sending request:", requestBody);

      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);

      const result = await response.json();
      console.log("📥 Response body:", result);

      if (!response.ok) {
        console.error("❌ API Error:", { status: response.status, result });
        throw new Error(result.error || "Failed to update user role");
      }

      if (result.success) {
        console.log("✅ Role update successful");
        toast.success("User role updated successfully");

        // Check if we updated the current user's role
        const updatedUser = users.find((u) => u.sanityId === userId);
        const currentUserClerkId = user?.id;

        if (
          updatedUser &&
          updatedUser.clerkUserId === currentUserClerkId &&
          newRole === "admin"
        ) {
          toast.success(
            "Admin role granted! Admin panel is now available. Click 'Admin Panel' in your user menu.",
            {
              duration: 5000,
            }
          );
          // Force a page reload to refresh admin status
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }

        // Immediately fetch fresh data and close sidebar
        console.log("🔄 Refreshing users list after role update...");
        await fetchUsers(currentPage, true);
        console.log("📋 Users list refreshed, closing sidebar...");
        closeRoleSidebar();

        // Also refresh admin status for all users if needed
        if (typeof window !== "undefined") {
          // Clear any cached admin status
          console.log("🔄 Dispatching admin status refresh event...");
          window.dispatchEvent(new CustomEvent("refreshAdminStatus"));
        }
      }
    } catch (error: any) {
      console.error("❌ Frontend error updating user role:", {
        error,
        message: error.message,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to update user role");
    }
  };

  // Fetch users
  const fetchUsers = useCallback(
    async (page = 0, forceFresh = false) => {
      setTableLoading(true);
      try {
        // Add cache-busting parameter for fresh data
        const cacheBuster = forceFresh ? `&_t=${Date.now()}` : "";
        const apiUrl = `/api/admin/users/combined?limit=${perPage}&offset=${
          page * perPage
        }&query=${debouncedSearchTerm}${cacheBuster}`;

        console.log("📡 Fetching users:", { page, forceFresh, apiUrl });

        const data = await safeApiCall(apiUrl);

        console.log("📋 Users data received:", {
          userCount: data.users?.length,
          totalCount: data.totalCount,
          firstUserRoles: data.users
            ?.slice(0, 3)
            .map((u: { sanityId: any; role: any }) => ({
              id: u.sanityId,
              role: u.role,
            })),
          allUserRoles: data.users?.map(
            (u: {
              sanityId: any;
              email: any;
              role: any;
              inSanity: any;
              isActive: any;
            }) => ({
              id: u.sanityId,
              email: u.email,
              role: u.role,
              inSanity: u.inSanity,
              isActive: u.isActive,
            })
          ),
        });

        setUsers(data.users);
        setTotalUsersCount(data.totalCount);
        setSanityUsersCount(data.sanityUsersCount || 0);
        setActiveUsersCount(data.activeUsersCount || 0);
      } catch (error) {
        handleApiError(error, "Users fetch");
      } finally {
        setTableLoading(false);
      }
    },
    [debouncedSearchTerm, perPage]
  );

  // Selection functions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  // Delete functions
  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUsers = async () => {
    setIsDeleting(true);
    try {
      await safeApiCall("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      fetchUsers(currentPage);
      setSelectedUsers([]);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      handleApiError(error, "Users delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Role management functions
  const openRoleManagementForUser = (user: CombinedUser) => {
    if (!user.sanityId) {
      toast.error("User must be in Sanity to manage roles");
      return;
    }

    const roleUser = {
      _id: user.sanityId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || ("user" as UserRole),
    };

    setRoleManagementState({
      isOpen: true,
      users: [roleUser],
      updatingUserId: null,
    });
  };

  const openRoleManagementDialog = async () => {
    try {
      const result = await getAllUsersForRoleManagement();
      if (result.users) {
        setRoleManagementState({
          isOpen: true,
          users: result.users,
          updatingUserId: null,
        });
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to load users for role management");
    }
  };

  const closeRoleManagementDialog = () => {
    setRoleManagementState({
      isOpen: false,
      users: [],
      updatingUserId: null,
    });
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setRoleManagementState((prev) => ({
      ...prev,
      updatingUserId: userId,
    }));

    try {
      // First try using server action
      try {
        const result = await updateUserRole(userId, newRole);

        if (result && result.success) {
          toast.success("User role updated successfully");
          // Update the role in the dialog state
          setRoleManagementState((prev) => ({
            ...prev,
            users: prev.users.map((user) =>
              user._id === userId ? { ...user, role: newRole } : user
            ),
            updatingUserId: null,
          }));
          // Refresh the main users list
          await fetchUsers(currentPage, true);
          return;
        }
      } catch (serverActionError) {
        console.warn(
          "Server action failed, trying API route:",
          serverActionError
        );

        // Fallback to API route
        const response = await fetch("/api/admin/users/role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            newRole,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update user role");
        }

        if (result.success) {
          toast.success("User role updated successfully");
          // Update the role in the dialog state
          setRoleManagementState((prev) => ({
            ...prev,
            users: prev.users.map((user) =>
              user._id === userId ? { ...user, role: newRole } : user
            ),
            updatingUserId: null,
          }));
          // Refresh the main users list
          await fetchUsers(currentPage, true);
          return;
        }
      }

      // If we reach here, both attempts failed
      throw new Error("Failed to update user role");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
      setRoleManagementState((prev) => ({
        ...prev,
        updatingUserId: null,
      }));
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-lg font-semibold">Users Management</h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
                Total: {totalUsersCount}
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
                <Database className="h-3 w-3 inline mr-1" />
                Sanity: {sanityUsersCount}
              </div>
              <div className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
                <UserCheck className="h-3 w-3 inline mr-1" />
                Active: {activeUsersCount}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Show:
              </span>
              <Select
                value={perPage.toString()}
                onValueChange={(value) => setPerPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button
                onClick={() => fetchUsers(currentPage)}
                size="sm"
                className="shrink-0"
                disabled={tableLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", tableLoading && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </div>

        {(loading && users.length === 0) || tableLoading ? (
          <UsersSkeleton />
        ) : (
          <>
            {selectedUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 bg-blue-50 p-3 rounded-lg border">
                <span className="text-sm font-medium text-center sm:text-left">
                  {selectedUsers.length} user
                  {selectedUsers.length > 1 ? "s" : ""} selected
                </span>
                <Button
                  onClick={openDeleteDialog}
                  variant="destructive"
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            )}

            <Card className="relative">
              {tableLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              )}
              <div className="hidden md:block responsive-table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedUsers.length === users.length &&
                            users.length > 0
                          }
                          onCheckedChange={selectAllUsers}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">User</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[200px]">
                        Email
                      </TableHead>
                      <TableHead className="hidden xl:table-cell min-w-[120px]">
                        Joined
                      </TableHead>
                      <TableHead className="hidden xl:table-cell min-w-[120px]">
                        Last Sign In
                      </TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[100px]">Role</TableHead>
                      <TableHead className="min-w-[140px]">
                        Sanity Status
                      </TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found.{" "}
                          {totalUsersCount > 0
                            ? `Total users: ${totalUsersCount}`
                            : "No users in database."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() =>
                                toggleUserSelection(user.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={user.imageUrl}
                                alt={user.fullName}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="font-medium">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500 lg:hidden">
                                  {user.email}
                                </div>
                                {user.inSanity && (
                                  <div className="text-xs text-muted-foreground">
                                    Points: {user.loyaltyPoints} | Spent: $
                                    {user.totalSpent}
                                  </div>
                                )}
                                {user.inSanity && !user.lastSignInAt && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    Sanity Only
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {user.lastSignInAt
                              ? formatDate(user.lastSignInAt)
                              : "Never"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex gap-1">
                              <Badge
                                variant={
                                  user.emailVerified ? "default" : "secondary"
                                }
                              >
                                {user.emailVerified ? "Verified" : "Unverified"}
                              </Badge>
                              {user.banned && (
                                <Badge variant="destructive">Banned</Badge>
                              )}
                              {user.locked && (
                                <Badge variant="outline">Locked</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.role ? (
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "destructive"
                                    : user.role === "seller"
                                      ? "default"
                                      : user.role === "employee"
                                        ? "secondary"
                                        : "outline"
                                }
                                className="text-xs"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No Role
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.inSanity ? (
                                <Badge
                                  variant={
                                    user.isActive ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  <Database className="h-3 w-3 mr-1" />
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Not in Sanity
                                </Badge>
                              )}

                              {user.isEmployee && user.employeeRole && (
                                <Badge variant="secondary" className="text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {user.employeeRole}
                                </Badge>
                              )}
                              {!user.isEmployee &&
                                user.notificationCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs hidden lg:inline-flex"
                                  >
                                    {user.notificationCount} notifications
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {!user.inSanity ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => openSidebar(user)}
                                  disabled={activatingUsers.has(user.id)}
                                  className="h-8 px-3"
                                >
                                  {activatingUsers.has(user.id) ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-3 w-3" />
                                  )}
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openRoleSidebar(user)}
                                    className="h-8 px-3"
                                    title="Manage User Role"
                                  >
                                    <Shield className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant={
                                      user.isEmployee ? "outline" : "secondary"
                                    }
                                    size="sm"
                                    onClick={() => openEmployeeDialog(user)}
                                    className="h-8 px-3"
                                    title={
                                      user.isEmployee
                                        ? "Manage Employee Role"
                                        : "Assign Employee Role"
                                    }
                                  >
                                    <Briefcase className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant={
                                      user.isActive ? "destructive" : "default"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      openActionModal(
                                        user,
                                        user.isActive
                                          ? "deactivate"
                                          : "activate"
                                      )
                                    }
                                    disabled={activatingUsers.has(user.id)}
                                    className="h-8 px-3"
                                  >
                                    {activatingUsers.has(user.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : user.isActive ? (
                                      <UserX className="h-3 w-3" />
                                    ) : (
                                      <UserCheck className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openActionModal(user, "delete")
                                    }
                                    disabled={activatingUsers.has(user.id)}
                                    className="h-8 px-3"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found.{" "}
                    {totalUsersCount > 0
                      ? `Total users: ${totalUsersCount}`
                      : "No users in database."}
                  </div>
                ) : (
                  users.map((user, index) => (
                    <Card
                      key={user.id}
                      className="mobile-user-card p-3"
                      style={{ "--card-index": index } as React.CSSProperties}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                          <img
                            src={user.imageUrl}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Joined: {formatDate(user.createdAt)}
                            </div>
                            {user.inSanity && (
                              <div className="text-xs text-muted-foreground">
                                Points: {user.loyaltyPoints} | Spent: $
                                {user.totalSpent}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant={
                              user.emailVerified ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                          {user.banned && (
                            <Badge variant="destructive" className="text-xs">
                              Banned
                            </Badge>
                          )}
                          {user.locked && (
                            <Badge variant="outline" className="text-xs">
                              Locked
                            </Badge>
                          )}
                          {user.inSanity ? (
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              <Database className="h-3 w-3 mr-1" />
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Not in Sanity
                            </Badge>
                          )}
                          {user.role && (
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "seller"
                                    ? "default"
                                    : user.role === "employee"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                          )}
                          {user.isEmployee && user.employeeRole && (
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {user.employeeRole}
                            </Badge>
                          )}
                          {user.notificationCount > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {user.notificationCount} notifications
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <div className="text-xs text-muted-foreground">
                            Last:{" "}
                            {user.lastSignInAt
                              ? formatDate(user.lastSignInAt)
                              : "Never"}
                          </div>
                          <div className="flex items-center gap-1">
                            {!user.inSanity ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openSidebar(user)}
                                disabled={activatingUsers.has(user.id)}
                                className="h-7 px-2 text-xs"
                              >
                                {activatingUsers.has(user.id) ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRoleSidebar(user)}
                                  className="h-7 px-1 text-xs"
                                  title="Manage Role"
                                >
                                  <Shield className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant={
                                    user.isEmployee ? "outline" : "secondary"
                                  }
                                  size="sm"
                                  onClick={() => openEmployeeDialog(user)}
                                  className="h-7 px-1 text-xs"
                                  title={
                                    user.isEmployee
                                      ? "Manage Employee"
                                      : "Assign Employee"
                                  }
                                >
                                  <Briefcase className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant={
                                    user.isActive ? "destructive" : "default"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    openActionModal(
                                      user,
                                      user.isActive ? "deactivate" : "activate"
                                    )
                                  }
                                  disabled={activatingUsers.has(user.id)}
                                  className="h-7 px-1 text-xs"
                                  title={
                                    user.isActive ? "Deactivate" : "Activate"
                                  }
                                >
                                  {activatingUsers.has(user.id) ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : user.isActive ? (
                                    <UserX className="h-3 w-3" />
                                  ) : (
                                    <UserCheck className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openActionModal(user, "delete")
                                  }
                                  disabled={activatingUsers.has(user.id)}
                                  className="h-7 px-1 text-xs"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {Math.min(currentPage * perPage + 1, totalUsersCount)}{" "}
                to {Math.min((currentPage + 1) * perPage, totalUsersCount)} of{" "}
                {totalUsersCount} users
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || tableLoading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2 whitespace-nowrap">
                  Page {currentPage + 1} of{" "}
                  {Math.max(1, Math.ceil(totalUsersCount / perPage))}
                </span>
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    (currentPage + 1) * perPage >= totalUsersCount ||
                    tableLoading ||
                    totalUsersCount <= perPage
                  }
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUsers}
        title="Delete Users"
        description={`Are you sure you want to delete ${
          selectedUsers.length
        } user${
          selectedUsers.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        itemCount={selectedUsers.length}
        isLoading={isDeleting}
      />

      {/* User Action Confirmation Modal */}
      <UserActionModal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        onConfirm={handleConfirmAction}
        user={
          actionModal.user
            ? {
                firstName: actionModal.user.firstName,
                lastName: actionModal.user.lastName,
                email: actionModal.user.email,
                isActive: actionModal.user.isActive,
                inSanity: actionModal.user.inSanity,
                notificationCount: actionModal.user.notificationCount,
              }
            : null
        }
        action={actionModal.action}
        isLoading={activatingUsers.has(actionModal.user?.id || "")}
      />

      {/* User Details Sidebar */}
      <UserDetailsSidebar
        isOpen={sidebarState.isOpen}
        onClose={closeSidebar}
        user={sidebarState.user}
        onActivate={handleUserActivation}
        onDelete={handleUserDeletion}
        onUserUpdate={handleUserUpdate}
        isLoading={activatingUsers.has(sidebarState.user?.id || "")}
      />

      {/* Employee Assignment Sidebar */}
      <EmployeeAssignmentSidebar
        isOpen={employeeSidebarState.isOpen}
        onClose={closeEmployeeDialog}
        user={employeeSidebarState.user}
        onAssignRole={handleAssignEmployee}
        onRemoveRole={handleRemoveEmployee}
        isLoading={activatingUsers.has(employeeSidebarState.user?.id || "")}
      />

      {/* Role Assignment Sidebar */}
      <RoleAssignmentSidebar
        isOpen={roleSidebarState.isOpen}
        onClose={closeRoleSidebar}
        user={roleSidebarState.user}
        onUpdateRole={handleUserRoleUpdate}
        isLoading={activatingUsers.has(roleSidebarState.user?.id || "")}
      />

      {/* Role Management Dialog */}
      {roleManagementState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    {roleManagementState.users.length === 1
                      ? "User Role Management"
                      : "Bulk Role Management"}
                  </h3>
                </div>
                <Button
                  onClick={closeRoleManagementDialog}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Manage user roles and permissions. Only admins can modify user
                roles.
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {roleManagementState.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <div>
                            <h3 className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "seller"
                                ? "default"
                                : user.role === "employee"
                                  ? "secondary"
                                  : "outline"
                          }
                          className="ml-2"
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) =>
                          handleRoleUpdate(user._id, newRole)
                        }
                        disabled={
                          roleManagementState.updatingUserId === user._id
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              User
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="seller">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Seller
                            </div>
                          </SelectItem>
                          <SelectItem value="employee">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Employee
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {roleManagementState.updatingUserId === user._id && (
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
                {roleManagementState.users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found for role management.
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button onClick={closeRoleManagementDialog} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
