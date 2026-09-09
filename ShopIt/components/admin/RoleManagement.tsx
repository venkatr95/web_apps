"use client";

import {
  getAllUsersForRoleManagement,
  migrateUsersWithDefaultRoles,
  updateUserRole,
} from "@/actions/userActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserForRoleManagement, UserRole } from "@/types/user";
import { Briefcase, Shield, Store, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const roleColors: Record<UserRole, string> = {
  user: "bg-blue-100 text-blue-800 border-blue-200",
  admin: "bg-red-100 text-red-800 border-red-200",
  seller: "bg-green-100 text-green-800 border-green-200",
  employee: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const roleIcons: Record<UserRole, typeof User> = {
  user: User,
  admin: Shield,
  seller: Store,
  employee: Briefcase,
};

const roleLabels: Record<UserRole, string> = {
  user: "User",
  admin: "Admin",
  seller: "Seller",
  employee: "Employee",
};

export default function RoleManagement() {
  const [users, setUsers] = useState<UserForRoleManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsersForRoleManagement();
      if (result.error) {
        toast.error(result.error);
      } else if (result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success("User role updated successfully");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getStatusBadge = (user: UserForRoleManagement) => {
    if (!user.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (user.employeeStatus === "suspended") {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.employeeStatus === "inactive") {
      return <Badge variant="outline">Employee Inactive</Badge>;
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Active
      </Badge>
    );
  };

  const handleMigration = async () => {
    setMigrating(true);
    try {
      const result = await migrateUsersWithDefaultRoles();
      toast.success(result.message);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast.error(error.message || "Failed to migrate user roles");
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage user roles and permissions. Only admins can modify user
              roles.
            </p>
          </div>
          <Button
            onClick={handleMigration}
            disabled={migrating}
            variant="outline"
            size="sm"
          >
            {migrating ? "Migrating..." : "Fix Missing Roles"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => {
            const IconComponent = roleIcons[user.role];
            return (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                    {getStatusBadge(user)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Joined: {new Date(user._createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={user.role}
                    onValueChange={(newRole: UserRole) =>
                      handleRoleUpdate(user._id, newRole)
                    }
                    disabled={updatingUserId === user._id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
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
                          <Store className="h-4 w-4" />
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
                  {updatingUserId === user._id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
