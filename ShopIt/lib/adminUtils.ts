// Admin utility functions
export const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmailsEnv) return [];

  try {
    // Handle array format: [email1,email2] or just comma-separated: email1,email2
    const cleanEmails = adminEmailsEnv
      .replace(/[\[\]]/g, "") // Remove brackets if present
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    return cleanEmails;
  } catch (error) {
    console.error("Error parsing admin emails:", error);
    return [];
  }
};

export const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(userEmail.toLowerCase());
};

/**
 * Comprehensive admin check that considers database isAdmin field, role field, and environment variable
 * @param user - User object with email, isAdmin, and role fields
 * @returns true if user is admin based on any of the criteria
 */
export const isAdmin = (
  user:
    | { email?: string | null; isAdmin?: boolean; role?: string }
    | null
    | undefined
): boolean => {
  if (!user) return false;

  // Check if user has admin role set in database
  if (user.role === "admin") return true;

  // Check if user has isAdmin flag set in database (legacy)
  if (user.isAdmin === true) return true;

  // Fallback to environment variable check
  if (user.email) {
    return isUserAdmin(user.email);
  }

  return false;
};

export const useIsAdmin = (userEmail: string | null | undefined): boolean => {
  return isUserAdmin(userEmail);
};

/**
 * Comprehensive admin check that includes both environment variable and Sanity role
 * This is async and should be used in server components or API routes
 */
export const isUserAdminComprehensive = async (
  clerkUserId: string,
  userEmail: string | null | undefined
): Promise<boolean> => {
  // First check environment variable (fastest)
  if (userEmail && isUserAdmin(userEmail)) {
    return true;
  }

  // Check Sanity database for role
  try {
    const { client } = await import("@/sanity/lib/client");
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId }
    );
    return sanityUser?.role === "admin" || sanityUser?.isAdmin === true;
  } catch (error) {
    console.error("Error checking Sanity admin status:", error);
    return false;
  }
};
