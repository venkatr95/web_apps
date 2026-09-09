"use client";

import Button from "@/components/ui/Button";
import Card, {
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import {
  FiEdit3,
  FiImage,
  FiInfo,
  FiLoader,
  FiSliders,
  FiZap,
} from "react-icons/fi";

export default function AIRecipeGeneratorPage() {
  const t = useTranslations("aiGenerator");
  const tr = useTranslations("recipes");
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"recipe" | "menu">("recipe");
  const [method, setMethod] = useState<
    "random" | "text" | "parameters" | "image"
  >("random");
  const [quality, setQuality] = useState<"basic" | "plus">("basic");

  // Text mode state
  const [textPrompt, setTextPrompt] = useState("");
  // Parameters mode state
  const [typeOfFood, setTypeOfFood] = useState("any");
  const [cuisine, setCuisine] = useState("any");
  const [extraLabel, setExtraLabel] = useState("any");
  const [ingredients, setIngredients] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<
    Array<{
      title: string;
      slug: string;
      description: string;
      imageUrl: string;
    }>
  >([]);

  const MethodButton = ({
    value,
    icon,
    tooltip,
    disabled,
  }: {
    value: "random" | "text" | "parameters" | "image";
    icon: React.ReactNode;
    tooltip: string;
    disabled?: boolean;
  }) => {
    const isActive = method === value;
    return (
      <div className="relative group">
        <Button
          variant={isActive ? "primary" : "ghost"}
          size="sm"
          disabled={disabled}
          onClick={() => setMethod(value)}
          className={isActive ? "rounded-full px-3" : "rounded-full px-3"}
          aria-label={tooltip}
          title={tooltip}
        >
          {icon}
        </Button>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap">
          {tooltip}
        </div>
      </div>
    );
  };

  const ActionLabel =
    activeTab === "recipe"
      ? t("actions.generateRecipe")
      : t("actions.generateMenu");

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setResults([]);
    const makeItem = (
      title: string,
      slug: string,
      description: string,
      imageUrl: string
    ) => ({ title, slug, description, imageUrl });
    setTimeout(() => {
      if (activeTab === "recipe") {
        setResults([
          makeItem(
            "Herb-Crusted Turkey Breast with Roasted Vegetables",
            "herb-crusted-turkey-breast",
            "A flavorful and juicy herb-crusted turkey breast served with a side of roasted seasonal vegetables.",
            "/images/demo/herb-turkey.jpg"
          ),
        ]);
      } else {
        setResults([
          makeItem(
            "Spiced Lentil Soup",
            "spiced-lentil-soup",
            "Comforting lentil soup with warm spices and fresh herbs.",
            "/images/demo/lentil-soup.jpg"
          ),
          makeItem(
            "Garlic Butter Naan",
            "garlic-butter-naan",
            "Soft and fluffy naan brushed with garlic butter.",
            "/images/demo/naan.jpg"
          ),
          makeItem(
            "Crisp Garden Salad",
            "crisp-garden-salad",
            "Fresh greens with seasonal vegetables and a light dressing.",
            "/images/demo/salad.jpg"
          ),
        ]);
      }
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto container-padding py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="p-0">
          <CardHeader className="p-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">
              {t("title")}
            </h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "recipe" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("recipe")}
                className="rounded-full"
              >
                {t("tabs.recipe")}
              </Button>
              <Button
                variant={activeTab === "menu" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("menu")}
                className="rounded-full"
              >
                {t("tabs.menu")}
              </Button>
              {activeTab === "menu" && (
                <div className="ml-auto inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
                  <FiInfo className="mr-1" />
                  {t("notes.menuCost")}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("methodTitle")}
              </h3>
              <div className="flex items-center gap-2">
                <MethodButton
                  value="random"
                  icon={<FiZap className="w-4 h-4" />}
                  tooltip={t("tooltips.random")}
                />
                <MethodButton
                  value="text"
                  icon={<FiEdit3 className="w-4 h-4" />}
                  tooltip={t("tooltips.text")}
                />
                <MethodButton
                  value="parameters"
                  icon={<FiSliders className="w-4 h-4" />}
                  tooltip={t("tooltips.parameters")}
                />
                <MethodButton
                  value="image"
                  icon={<FiImage className="w-4 h-4" />}
                  tooltip={t("tooltips.image")}
                  disabled
                />
                <span className="text-xs text-gray-500">
                  ( {t("premium")} )
                </span>
              </div>
            </div>

            {method === "text" && (
              <div>
                <Input
                  placeholder={t("textPlaceholder")}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                />
              </div>
            )}

            {method === "parameters" && (
              <div className="space-y-4">
                <Select
                  label={t("parameters.typeOfFood")}
                  value={typeOfFood}
                  onChange={(e) => setTypeOfFood(e.target.value)}
                  options={[
                    { value: "any", label: "Anything" },
                    { value: "veg", label: "Vegetarian" },
                    { value: "nonveg", label: "Non‑Vegetarian" },
                    { value: "snack", label: "Snack" },
                    { value: "dessert", label: "Dessert" },
                  ]}
                />
                <Select
                  label={t("parameters.cuisine")}
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  options={[
                    { value: "any", label: "Anything" },
                    { value: "indian", label: "Indian" },
                    { value: "italian", label: "Italian" },
                    { value: "mexican", label: "Mexican" },
                    { value: "chinese", label: "Chinese" },
                  ]}
                />
                <Select
                  label={t("parameters.extraLabel")}
                  value={extraLabel}
                  onChange={(e) => setExtraLabel(e.target.value)}
                  options={[
                    { value: "any", label: "Anything" },
                    { value: "healthy", label: "Healthy" },
                    { value: "quick", label: "Quick" },
                    { value: "kidFriendly", label: "Kid‑friendly" },
                    { value: "spicy", label: "Spicy" },
                  ]}
                />
                <Input
                  label={t("parameters.ingredients")}
                  placeholder="e.g., tomato, onion, paneer"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
                <p className="text-xs text-gray-500">{t("parameters.note")}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Select the quality:
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={quality === "basic" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setQuality("basic")}
                  className="rounded-full"
                >
                  {t("quality.basic")}
                </Button>
                <Button
                  variant={quality === "plus" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setQuality("plus")}
                  disabled
                  className="rounded-full"
                >
                  {t("quality.plus")} ({t("premium")})
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {session?.user ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleGenerate}
                disabled={isGenerating}
                isLoading={isGenerating}
              >
                {ActionLabel}
              </Button>
            ) : (
              <div className="w-full text-sm text-gray-600">
                Please sign in to generate recipes or menus.
              </div>
            )}
            <div className="w-full flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {t("notes.publicRecipes")}
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              {t("actions.purchaseCredits")}
            </Button>
          </CardFooter>
        </Card>

        <Card className="p-6">
          {isGenerating ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((r) => (
                <div
                  key={r.slug}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={r.imageUrl}
                        alt={r.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {r.description}
                      </p>
                      <div className="mt-3">
                        <a
                          href={`/${activeTab}/view/${r.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {tr("viewRecipe")}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div
                data-ad-slot="ai-results"
                data-ad-network="taboola"
                className="mt-4"
              >
                <div className="w-full h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
                  Ad Placeholder
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {activeTab === "recipe" ? t("empty.recipes") : t("empty.menus")}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
