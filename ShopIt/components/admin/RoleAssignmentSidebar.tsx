"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserRole } from "@/types/user";
import {
  Briefcase,
  CheckCircle2,
  Database,
  RefreshCw,
  Shield,
  UserCheck,
} from "lucide-react";
import React, { useState } from "react";

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

interface RoleAssignmentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: CombinedUser | null;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
  isLoading: boolean;
}

const ROLE_ICONS = {
  user: UserCheck,
  admin: Shield,
  seller: Database,
  employee: Briefcase,
};

const ROLE_PERMISSIONS = {
  user: [
    "Browse products",
    "Make purchases",
    "Manage profile",
    "View order history",
  ],
  admin: [
    "Full system access",
    "Manage all users",
    "Update user roles",
    "Access analytics",
  ],
  seller: [
    "Manage products",
    "View orders",
    "Update inventory",
    "Access seller dashboard",
  ],
  employee: [
    "Access employee functions",
    "Process orders",
    "Customer support",
    "View reports",
  ],
};

const getRoleDisplayName = (role: UserRole): string => {
  const names = {
    user: "User",
    admin: "Administrator",
    seller: "Seller",
    employee: "Employee",
  };
  return names[role];
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "destructive";
    case "seller":
      return "default";
    case "employee":
      return "secondary";
    case "user":
    default:
      return "outline";
  }
};

export const RoleAssignmentSidebar: React.FC<RoleAssignmentSidebarProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateRole,
  isLoading,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize selected role when user changes or sidebar opens
  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    } else {
      setSelectedRole("user");
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateRole = async () => {
    // Use sanityId if available, otherwise use clerkUserId
    const userIdToUpdate = user.sanityId || user.clerkUserId || user.id;

    if (!userIdToUpdate) {
      console.error("No valid user ID found for role update");
      return;
    }

    setActionLoading(true);
    try {
      await onUpdateRole(userIdToUpdate, selectedRole);
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const RoleIcon = ROLE_ICONS[selectedRole];
  const hasRoleChanged = user.role !== selectedRole;
  const isAnyActionLoading = actionLoading || isLoading;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isAnyActionLoading) {
          onClose();
        }
      }}
    >
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Role Management
          </SheetTitle>
          <SheetDescription>
            Manage user role and permissions for {user.fullName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 p-4">
          {/* User Info Card */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={user.imageUrl}
                alt={user.fullName}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {user.role && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Role:</span>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              )}

              {user.isEmployee && user.employeeRole && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Employee Role:</span>
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {user.employeeRole}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="role-select" className="text-base font-semibold">
              Update User Role
            </Label>

            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {(["user", "admin", "seller", "employee"] as UserRole[]).map(
                  (role) => {
                    const Icon = ROLE_ICONS[role];
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{getRoleDisplayName(role)}</span>
                        </div>
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Role Permissions */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <RoleIcon className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">
                {getRoleDisplayName(selectedRole)} Permissions
              </h4>
            </div>
            <ul className="space-y-2">
              {ROLE_PERMISSIONS[selectedRole].map((permission, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {!user.sanityId ? (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  User must be in Sanity database before updating their role.
                </p>
              </div>
            ) : (
              <>
                {hasRoleChanged && (
                  <Button
                    onClick={handleUpdateRole}
                    disabled={isAnyActionLoading}
                    className="w-full"
                  >
                    {actionLoading || isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    {actionLoading || isLoading
                      ? "Updating..."
                      : `Update to ${getRoleDisplayName(selectedRole)} Role`}
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAnyActionLoading}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
