"use client";

import { useWizardState } from "@/lib/wizardState";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import Button from "./ui/Button";

export default function ResumeJourneyButton() {
  const router = useRouter();
  const { wizardState, hasActiveJourney } = useWizardState();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if there's an active journey to resume
    setShowButton(hasActiveJourney());
  }, [hasActiveJourney]);

  // Only show if user has an active journey
  if (!showButton) {
    return null;
  }

  const handleResumeJourney = () => {
    // Navigate back to home where the wizard will resume from saved state
    router.push("/?wizard=open");
  };

  const getJourneyInfo = () => {
    const parts = [];
    if (wizardState.dishPrompt) {
      parts.push(`"${wizardState.dishPrompt.substring(0, 30)}..."`);
    }
    if (wizardState.selectedIngredients?.length) {
      parts.push(`${wizardState.selectedIngredients.length} ingredients`);
    }
    return parts.length > 0 ? parts.join(", ") : "Continue your search";
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleResumeJourney}
        className="flex items-center gap-2"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Resume Journey</span>
        <span className="sm:hidden">Resume</span>
      </Button>
      {wizardState.journeyTimestamp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {getJourneyInfo()}
        </p>
      )}
    </div>
  );
}
