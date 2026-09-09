"use client";

import Container from "@/components/Container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Check, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSetupPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    if (!userId) {
      setError("Please sign in first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        setError(data.error || "Setup failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (!userId) {
    return (
      <Container className="py-10">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700">Admin Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Please sign in to set up admin access.
              </p>
              <Button
                onClick={() => router.push("/sign-in")}
                className="w-full"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-blue-700">Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-semibold">
                  Admin access setup successful!
                </p>
                <p className="text-gray-600">Redirecting to admin panel...</p>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  Initialize your admin access to manage the application. This
                  will create your admin profile in the database.
                </p>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    <strong>Note:</strong> Only users specified in the
                    NEXT_PUBLIC_ADMIN_EMAIL environment variable can use this
                    setup.
                  </p>
                </div>

                <Button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Setup Admin Access
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
