import Card from "@/components/ui/Card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { FiBook, FiHeart, FiTrendingUp, FiUsers } from "react-icons/fi";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto container-padding py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {t("about.hero.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t("about.hero.subtitle")}
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {t("about.mission.title")}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {t("about.mission.description")}
          </p>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                <FiHeart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                {t("about.features.personalized.title")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("about.features.personalized.description")}
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                <FiBook className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                {t("about.features.wizard.title")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("about.features.wizard.description")}
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                <FiUsers className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                {t("about.features.community.title")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("about.features.community.description")}
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                <FiTrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                {t("about.features.adaptive.title")}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {t("about.features.adaptive.description")}
            </p>
          </Card>
        </div>

        {/* Technology Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {t("about.technology.title")}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t("about.technology.description")}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Next.js 15
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Lightning-fast React framework with server-side rendering
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                PostgreSQL
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Robust database for storing recipes and user data
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Search
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Semantic search and intelligent recipe recommendations
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t("about.cta.title")}
          </h2>
          <p className="text-lg mb-8 opacity-90">
            {t("about.cta.description")}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/auth/signup`}
              className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t("about.cta.startCooking")}
            </Link>
            <Link
              href={`/${locale}/recipes`}
              className="px-8 py-3 bg-primary-700 hover:bg-primary-800 rounded-lg font-semibold transition-colors"
            >
              {t("about.cta.exploreRecipes")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
