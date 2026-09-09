"use server";

import { isUserAdmin } from "@/lib/adminUtils";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { UserForRoleManagement, UserRole } from "@/types/user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Types for server actions
interface CreateUserData {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AddToCartData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface UpdateCartItemData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CreateAddressData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

// User Management Actions
export async function createOrUpdateUser(userData: CreateUserData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userData.clerkUserId }
    );

    if (existingUser) {
      // Update existing user
      await client
        .patch(existingUser._id)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return existingUser._id;
    } else {
      // Create new user
      const newUser = await client.create({
        _type: "user",
        clerkUserId: userData.clerkUserId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        preferences: {
          newsletter: false,
          emailNotifications: true,
          smsNotifications: false,
          preferredCurrency: "USD",
          preferredLanguage: "en",
        },
        cart: [],
        wishlist: [],
        addresses: [],
        orders: [],
        loyaltyPoints: 0,
        totalSpent: 0,
        role: "user", // Default role assignment
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return newUser._id;
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw new Error("Failed to create or update user");
  }
}

// Cart Management Actions
export async function addToCart(data: AddToCartData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user document
    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Check if item already exists in cart
    const existingCartItem = user.cart?.find(
      (item: any) =>
        item.product._ref === data.productId &&
        item.size === data.size &&
        item.color === data.color
    );

    if (existingCartItem) {
      // Update existing item quantity
      const updatedCart = user.cart.map((item: any) =>
        item.product._ref === data.productId &&
        item.size === data.size &&
        item.color === data.color
          ? { ...item, quantity: item.quantity + data.quantity }
          : item
      );

      await client
        .patch(user._id)
        .set({
          cart: updatedCart,
          updatedAt: new Date().toISOString(),
        })
        .commit();
    } else {
      // Add new item to cart
      const newCartItem = {
        product: {
          _type: "reference",
          _ref: data.productId,
        },
        quantity: data.quantity,
        size: data.size,
        color: data.color,
        addedAt: new Date().toISOString(),
      };

      await client
        .patch(user._id)
        .setIfMissing({ cart: [] })
        .append("cart", [newCartItem])
        .set({ updatedAt: new Date().toISOString() })
        .commit();
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
}

export async function updateCartItem(data: UpdateCartItemData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    const updatedCart = user.cart.map((item: any) =>
      item.product._ref === data.productId &&
      item.size === data.size &&
      item.color === data.color
        ? { ...item, quantity: data.quantity }
        : item
    );

    await client
      .patch(user._id)
      .set({
        cart: updatedCart,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error("Failed to update cart item");
  }
}

export async function removeFromCart(
  productId: string,
  size?: string,
  color?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    const updatedCart = user.cart.filter(
      (item: any) =>
        !(
          item.product._ref === productId &&
          item.size === size &&
          item.color === color
        )
    );

    await client
      .patch(user._id)
      .set({
        cart: updatedCart,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error("Failed to remove item from cart");
  }
}

export async function clearCart() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    await client
      .patch(user._id)
      .set({
        cart: [],
        updatedAt: new Date().toISOString(),
      })
      .commit();

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}

// Wishlist Management Actions
export async function addToWishlist(productId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Check if product is already in wishlist
    const isInWishlist = user.wishlist?.some(
      (item: any) => item._ref === productId
    );

    if (!isInWishlist) {
      await client
        .patch(user._id)
        .setIfMissing({ wishlist: [] })
        .append("wishlist", [{ _type: "reference", _ref: productId }])
        .set({ updatedAt: new Date().toISOString() })
        .commit();
    }

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw new Error("Failed to add item to wishlist");
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    const updatedWishlist =
      user.wishlist?.filter((item: any) => item._ref !== productId) || [];

    await client
      .patch(user._id)
      .set({
        wishlist: updatedWishlist,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw new Error("Failed to remove item from wishlist");
  }
}

// Address Management Actions
export async function createAddress(addressData: CreateAddressData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // If this is set as default, unset all other default addresses
    if (addressData.isDefault) {
      const userAddresses = await client.fetch(
        `*[_type == "address" && user._ref == $userId]`,
        { userId: user._id }
      );

      for (const address of userAddresses) {
        await client.patch(address._id).set({ default: false }).commit();
      }
    }

    // Create new address
    const newAddress = await client.create({
      _type: "address",
      name: addressData.name,
      email: user.email,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state.toUpperCase(),
      zip: addressData.zip,
      default: addressData.isDefault || false,
      user: {
        _type: "reference",
        _ref: user._id,
      },
      createdAt: new Date().toISOString(),
    });

    // Add address reference to user
    await client
      .patch(user._id)
      .setIfMissing({ addresses: [] })
      .append("addresses", [{ _type: "reference", _ref: newAddress._id }])
      .set({ updatedAt: new Date().toISOString() })
      .commit();

    revalidatePath("/cart");
    return { success: true, addressId: newAddress._id };
  } catch (error) {
    console.error("Error creating address:", error);
    throw new Error("Failed to create address");
  }
}

export async function updateAddress(
  addressId: string,
  addressData: CreateAddressData
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // If this is set as default, unset all other default addresses
    if (addressData.isDefault) {
      const user = await client.fetch(
        `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
        { clerkUserId: userId }
      );

      if (user) {
        const userAddresses = await client.fetch(
          `*[_type == "address" && user._ref == $userId && _id != $addressId]`,
          { userId: user._id, addressId }
        );

        for (const address of userAddresses) {
          await client.patch(address._id).set({ default: false }).commit();
        }
      }
    }

    await client
      .patch(addressId)
      .set({
        name: addressData.name,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state.toUpperCase(),
        zip: addressData.zip,
        default: addressData.isDefault || false,
      })
      .commit();

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    throw new Error("Failed to update address");
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Remove address reference from user
    const updatedAddresses =
      user.addresses?.filter((addr: any) => addr._ref !== addressId) || [];

    await client
      .patch(user._id)
      .set({
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Delete the address document
    await client.delete(addressId);

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Failed to delete address");
  }
}

// Role Management Actions
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(currentUserId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin via environment variable
    if (!userEmail || !isUserAdmin(userEmail)) {
      // Fallback: check if user exists in Sanity and has admin role
      const currentUser = await client.fetch(
        `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
        { clerkUserId: currentUserId }
      );

      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only admins can change user roles");
      }
    }

    // Update the user's role using admin client with elevated permissions
    try {
      await adminClient
        .patch(userId)
        .set({
          role: newRole,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      revalidatePath("/admin/employees");
      return { success: true };
    } catch (sanityError: any) {
      console.error("Sanity update error:", sanityError);
      if (sanityError.statusCode === 403) {
        throw new Error(
          "Insufficient permissions to update user roles in Sanity. The SANITY_API_TOKEN needs Editor permissions."
        );
      }
      throw sanityError;
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error(
      `Failed to update user role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function getAllUsersForRoleManagement(): Promise<{
  users?: UserForRoleManagement[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "User not authenticated" };
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(userId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin via environment variable
    if (!userEmail || !isUserAdmin(userEmail)) {
      // Fallback: check if user exists in Sanity and has admin role
      const currentUser = await client.fetch(
        `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
        { clerkUserId: userId }
      );

      if (!currentUser || currentUser.role !== "admin") {
        return { error: "Only admins can view user roles" };
      }
    }
    const users = await client.fetch(
      `*[_type == "user"] | order(_createdAt desc) {
        _id,
        firstName,
        lastName,
        email,
        role,
        _createdAt,
        isActive,
        employeeStatus
      }`
    );

    // Ensure all users have a role - set default "user" role if missing
    const usersWithRoles = users.map((user: any) => ({
      ...user,
      role: user.role || "user", // Default to "user" if role is missing
    }));

    console.log(`Found ${usersWithRoles.length} users`);
    return { users: usersWithRoles };
  } catch (error) {
    console.error("Error fetching users for role management:", error);
    return {
      error: `Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function getCurrentUserRole(): Promise<{
  role?: UserRole;
  isAdmin?: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "User not authenticated" };
    }

    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        role,
        isAdmin
      }`,
      { clerkUserId: userId }
    );

    if (!user) {
      return { error: "User not found" };
    }

    return { role: user.role, isAdmin: user.isAdmin };
  } catch (error) {
    console.error("Error fetching current user role:", error);
    return { error: "Failed to fetch user role" };
  }
}

// Migration function to add default roles to existing users
export async function migrateUsersWithDefaultRoles() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if current user is admin
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only admins can perform this migration");
    }

    // Find users without roles
    const usersWithoutRoles = await client.fetch(
      `*[_type == "user" && !defined(role)]`
    );

    console.log(`Found ${usersWithoutRoles.length} users without roles`);

    // Update users in batches
    const updates: Array<{
      id: string;
      patch: { set: { role: string; updatedAt: string } };
    }> = usersWithoutRoles.map((user: any) => ({
      id: user._id,
      patch: {
        set: {
          role: "user", // Default role
          updatedAt: new Date().toISOString(),
        },
      },
    }));

    // Execute updates
    const transaction = client.transaction();
    updates.forEach(
      ({
        id,
        patch,
      }: {
        id: string;
        patch: { set: { role: string; updatedAt: string } };
      }) => {
        transaction.patch(id, patch);
      }
    );

    const result = await transaction.commit();

    revalidatePath("/admin/employees");
    return {
      success: true,
      message: `Updated ${usersWithoutRoles.length} users with default roles`,
      updated: usersWithoutRoles.length,
    };
  } catch (error) {
    console.error("Error migrating user roles:", error);
    throw new Error("Failed to migrate user roles");
  }
}
