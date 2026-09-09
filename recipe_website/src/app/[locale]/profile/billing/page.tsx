"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface UsageEntry {
  date: string;
  concept: string;
  amount: number;
  balance: number;
}

export default function BillingPage() {
  useTranslations();
  const { data: session } = useSession();
  const [credits, setCredits] = useState(3);
  const [tab, setTab] = useState<"usage" | "invoices">("usage");
  const [packageAmount, setPackageAmount] = useState("100");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [search, setSearch] = useState("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const usage: UsageEntry[] = [
    {
      date: new Date().toLocaleString(),
      concept: "New menu",
      amount: 1,
      balance: credits,
    },
    {
      date: new Date(Date.now() - 10 * 60 * 1000).toLocaleString(),
      concept: "New recipe",
      amount: 1,
      balance: credits + 1,
    },
  ];

  const filteredUsage = usage.filter(
    (u) =>
      u.concept.toLowerCase().includes(search.toLowerCase()) ||
      u.date.toLowerCase().includes(search.toLowerCase())
  );

  const startCheckout = async () => {
    try {
      setIsCreatingCheckout(true);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: packageAmount === "100" ? 100 : 225,
          currency: "usd",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to initialize payment");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing");
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleRedeem = () => {
    if (!promoCode.trim()) return;
    setCredits((c) => c + 5);
    setPromoCode("");
    alert("Promo applied: +5 credits.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 lg:py-12">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Credits panel */}
          <Card className="md:col-span-2 lg:col-span-3 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2">
              My Credits
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your available credits are shown below. Need more? You can
              purchase additional credits using the options on the right.
            </p>

            <div className="inline-flex items-center px-4 py-2 rounded-md bg-gray-900 text-white dark:bg-gray-800 font-semibold">
              {credits} CREDITS
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold">
                    BASIC quality
                  </span>
                  <span>Menu or Recipe</span>
                </div>
                <span className="px-2 py-1 rounded-md bg-green-100 text-green-700">
                  1 CREDIT
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold">
                    PLUS quality
                  </span>
                  <span>Menu or Recipe</span>
                </div>
                <span className="px-2 py-1 rounded-md bg-green-100 text-green-700">
                  3 CREDITS
                </span>
              </div>
            </div>

            {/* Tabs: Usage / Invoices */}
            <div className="mt-10">
              <div className="flex gap-3 mb-4">
                <Button
                  variant={tab === "usage" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setTab("usage")}
                >
                  Usage
                </Button>
                <Button
                  variant={tab === "invoices" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setTab("invoices")}
                >
                  Invoices
                </Button>
              </div>

              {tab === "usage" ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span>Show</span>
                      <Select
                        className="w-20"
                        defaultValue="10"
                        options={[
                          { value: "10", label: "10" },
                          { value: "25", label: "25" },
                          { value: "50", label: "50" },
                        ]}
                      />
                      <span>entries</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm">Search:</span>
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-56"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="text-left px-2 sm:px-4 py-3">Date</th>
                          <th className="text-left px-2 sm:px-4 py-3">
                            Concept
                          </th>
                          <th className="text-left px-2 sm:px-4 py-3">
                            Amount
                          </th>
                          <th className="text-left px-2 sm:px-4 py-3">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsage.map((u, i) => (
                          <tr
                            key={i}
                            className="border-t border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-2 sm:px-4 py-3">{u.date}</td>
                            <td className="px-2 sm:px-4 py-3">{u.concept}</td>
                            <td className="px-2 sm:px-4 py-3">
                              {u.amount} CREDITS
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              {u.balance} CREDITS
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                      Showing {filteredUsage.length} of {usage.length} entries
                    </span>
                    <div className="inline-flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        Previous
                      </Button>
                      <Button size="sm" variant="ghost">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm">
                  <p>No invoices yet.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Purchase & bonus */}
          <div className="space-y-8 lg:space-y-10">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-heading font-bold mb-4">
                Purchase Credits
              </h3>
              <div className="space-y-4">
                <Select
                  label="Select your package:"
                  value={packageAmount}
                  onChange={(e) => setPackageAmount(e.target.value)}
                  options={[
                    { value: "100", label: "$5 = 100 CREDITS" },
                    { value: "225", label: "$10 = 225 CREDITS" },
                  ]}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Choose a payment method:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={paymentMethod === "card" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPaymentMethod("card")}
                    >
                      CREDIT CARD
                    </Button>
                    <Button
                      variant={paymentMethod === "upi" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPaymentMethod("upi")}
                    >
                      UPI
                    </Button>
                  </div>
                </div>
                {session?.user ? (
                  <Button
                    onClick={startCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    isLoading={isCreatingCheckout}
                    disabled={isCreatingCheckout}
                  >
                    Buy
                  </Button>
                ) : (
                  <div className="text-sm text-gray-600">
                    Please sign in to purchase credits.
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-heading font-bold mb-4">
                Bonus Credits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Enter a promo code to get free bonus credits. Check our social
                media for the latest codes.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full sm:flex-1"
                />
                <Button onClick={handleRedeem} className="w-full sm:w-auto">
                  REDEEM
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto container-padding pb-12">
        <div
          data-ad-slot="billing-bottom"
          data-ad-network="twitter-ads"
          className="mt-8"
        >
          <div className="w-full h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
            Ad Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
