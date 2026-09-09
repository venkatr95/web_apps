import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { redirect } from "next/navigation";

export default async function EmployeeDebugPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/");
  }

  // Fetch user data
  const user = await backendClient.fetch(
    `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
    { clerkUserId }
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Employee Debug Info</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Clerk User ID:</h2>
        <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
          {clerkUserId}
        </pre>

        <h2 className="font-semibold mb-2 mt-4">User Data from Sanity:</h2>
        <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>

        <div className="mt-4 space-y-2">
          <div>
            <strong>Email:</strong> {user?.email || "Not found"}
          </div>
          <div>
            <strong>Is Employee:</strong>{" "}
            {user?.isEmployee ? "✅ Yes" : "❌ No"}
          </div>
          <div>
            <strong>Employee Role:</strong> {user?.employeeRole || "Not set"}
          </div>
          <div>
            <strong>Employee Status:</strong>{" "}
            {user?.employeeStatus || "Not set"}
          </div>
        </div>

        {!user?.isEmployee && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Issue:</strong> This user is not marked as an employee in
            Sanity. Please set `isEmployee: true` and `employeeRole` in the user
            document.
          </div>
        )}

        {user?.isEmployee && !user?.employeeRole && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <strong>Issue:</strong> Employee role is not set. Please set
            `employeeRole` to one of: callcenter, packer, warehouse,
            deliveryman, incharge, or accounts.
          </div>
        )}
      </div>
    </div>
  );
}
