"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignUpPage() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          pin: data.pin,
          confirmPin: data.confirmPin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "An error occurred");
        return;
      }

      // Show success message if email verification is required
      if (result.requiresVerification) {
        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );
      } else {
        router.push("/auth/signin?registered=true");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center container-padding py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            {t("auth.signUp.title")}
          </h1>
          <p className="text-gray-600">{t("auth.signUp.title")}</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium mb-2">
                  {success}
                </p>
                <p className="text-xs text-green-600">
                  Didn't receive the email? Check your spam folder or{" "}
                  <Link
                    href="/auth/resend-verification"
                    className="underline hover:text-green-800"
                  >
                    resend verification email
                  </Link>
                  .
                </p>
              </div>
            )}

            <Input
              label={t("auth.signUp.name")}
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label={t("auth.signUp.email")}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label={t("auth.signUp.password")}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label={t("auth.signUp.confirmPassword")}
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Create a 4-digit PIN for quick login
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="PIN"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  error={errors.pin?.message}
                  {...register("pin")}
                  inputMode="numeric"
                  pattern="\d{4}"
                />

                <Input
                  label="Confirm PIN"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  error={errors.confirmPin?.message}
                  {...register("confirmPin")}
                  inputMode="numeric"
                  pattern="\d{4}"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {t("auth.signUp.submit")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {t("auth.signUp.haveAccount")}{" "}
              <Link
                href="/auth/signin"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                {t("auth.signUp.signInLink")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
