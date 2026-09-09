"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import {
  pinLoginSchema,
  signInSchema,
  type PinLoginInput,
  type SignInInput,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignInPage() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">(
    "password"
  );

  const passwordForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const pinForm = useForm<PinLoginInput>({
    resolver: zodResolver(pinLoginSchema),
  });

  const onPasswordSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPinSubmit = async (data: PinLoginInput) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("pin", {
        email: data.email,
        pin: data.pin,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
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
            {t("auth.signIn.title")}
          </h1>
          <p className="text-gray-600">{t("auth.signIn.title")}</p>
        </div>

        <Card className="p-8">
          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "password"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("pin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "pin"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              4-Digit PIN
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Password Login Form */}
          {loginMethod === "password" && (
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <Input
                label={t("auth.signIn.email")}
                type="email"
                placeholder="you@example.com"
                error={passwordForm.formState.errors.email?.message}
                {...passwordForm.register("email")}
              />

              <Input
                label={t("auth.signIn.password")}
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.password?.message}
                {...passwordForm.register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                {t("auth.signIn.submit")}
              </Button>
            </form>
          )}

          {/* PIN Login Form */}
          {loginMethod === "pin" && (
            <form
              onSubmit={pinForm.handleSubmit(onPinSubmit)}
              className="space-y-6"
            >
              <Input
                label={t("auth.signIn.email")}
                type="email"
                placeholder="you@example.com"
                error={pinForm.formState.errors.email?.message}
                {...pinForm.register("email")}
              />

              <Input
                label="4-Digit PIN"
                type="password"
                placeholder="••••"
                maxLength={4}
                error={pinForm.formState.errors.pin?.message}
                {...pinForm.register("pin")}
                inputMode="numeric"
                pattern="\d{4}"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                {t("auth.signIn.submit")}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {t("auth.signIn.noAccount")}{" "}
              <Link
                href="/auth/signup"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                {t("auth.signIn.signUpLink")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
