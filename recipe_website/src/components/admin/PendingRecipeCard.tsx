"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PendingRecipeCardProps {
  recipe: {
    id: string;
    slug: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: string;
    cookingTime: number;
    servings: number;
    author: {
      id: string;
      name: string;
      image?: string;
    };
  };
}

export default function PendingRecipeCard({ recipe }: PendingRecipeCardProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    if (isApproving) return;

    setIsApproving(true);
    try {
      const response = await fetch(`/api/recipes/${recipe.slug}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve recipe");
      }
    } catch (error) {
      console.error("Error approving recipe:", error);
      alert("Failed to approve recipe");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (isRejecting || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    try {
      const response = await fetch(`/api/recipes/${recipe.slug}/approve`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject recipe");
      }
    } catch (error) {
      console.error("Error rejecting recipe:", error);
      alert("Failed to reject recipe");
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
      setRejectReason("");
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
          {/* Recipe Image */}
          <div className="relative aspect-video md:aspect-square rounded-lg overflow-hidden bg-muted">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl">
                🍳
              </div>
            )}
          </div>

          {/* Recipe Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="text-2xl font-bold hover:text-primary transition-colors"
                  >
                    {recipe.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("pendingRecipes.submittedOn")}{" "}
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-3">
                {recipe.description}
              </p>

              {/* Recipe Meta */}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>
                    {recipe.cookingTime} {t("pendingRecipes.minutes")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>
                    {recipe.servings} {t("pendingRecipes.servings")}
                  </span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                  {recipe.author.image ? (
                    <Image
                      src={recipe.author.image}
                      alt={recipe.author.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">
                      👤
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{recipe.author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("pendingRecipes.author")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isApproving
                  ? t("pendingRecipes.approving")
                  : "✓ " + t("pendingRecipes.approve")}
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={isApproving || isRejecting}
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                ✗ {t("pendingRecipes.reject")}
              </Button>
              <Link href={`/recipes/${recipe.slug}`}>
                <Button variant="outline">👁️ {t("pendingRecipes.view")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {t("pendingRecipes.rejectDialog.title")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("pendingRecipes.rejectDialog.description")}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("pendingRecipes.rejectDialog.placeholder")}
              className="w-full min-h-[100px] p-3 border rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isRejecting
                  ? t("pendingRecipes.rejecting")
                  : t("pendingRecipes.confirmReject")}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
                variant="outline"
                className="flex-1"
              >
                {t("pendingRecipes.cancel")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
