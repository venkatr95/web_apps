import React, { useState } from "react";
import { Palmtree as PalmTree, Plus } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import Button from "../components/common/Button";
import OnboardingWizard from "../components/wizard/OnboardingWizard";
import ItineraryCard from "../components/itinerary/ItineraryCard";
import ItineraryDetail from "../components/itinerary/ItineraryDetail";
import { TravelItinerary } from "../types";
import { downloadPDF } from "../utils/pdfGenerator";

const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    itineraries,
    activeItinerary,
    setActiveItinerary,
    deleteItinerary,
    updateItinerary,
  } = useApp();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<
    TravelItinerary | undefined
  >(undefined);

  const handleCreateItinerary = () => {
    setEditingItinerary(undefined);
    setWizardOpen(true);
  };

  const handleEditItinerary = (itinerary: TravelItinerary) => {
    setEditingItinerary(itinerary);
    setWizardOpen(true);
  };

  const handleDeleteItinerary = (id: string) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      deleteItinerary(id);
      if (activeItinerary?.id === id) {
        setActiveItinerary(null);
      }
    }
  };

  const handleDownloadItinerary = async (itinerary: TravelItinerary) => {
    try {
      await downloadPDF(itinerary, "itinerary");
    } catch (error) {
      console.error("Error downloading itinerary:", error);
      alert("Failed to download itinerary. Please try again.");
    }
  };

  const handleShareToChat = (itinerary: TravelItinerary) => {
    // In a real implementation, this would open the chat interface
    // with the itinerary pre-populated to share
    console.log("Sharing itinerary to chat:", itinerary);
    alert("Sharing to chat is not implemented in this demo.");
  };

  return (
    <>
      <OnboardingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editItinerary={editingItinerary}
      />

      <div className="space-y-8">
        {!activeItinerary ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Your Travel Itineraries
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan, organize, and share your travel experiences
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={handleCreateItinerary}
              >
                New Itinerary
              </Button>
            </div>

            {itineraries.length === 0 ? (
              <div
                className={`text-center py-16 px-6 rounded-xl ${
                  theme === "dark"
                    ? "bg-gray-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <PalmTree className="w-16 h-16 mx-auto mb-4 text-teal-500" />
                <h2 className="text-xl font-semibold mb-2">
                  No itineraries yet
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first travel itinerary to get started planning
                  your next adventure!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((itinerary) => (
                  <ItineraryCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    onView={() => setActiveItinerary(itinerary)}
                    onEdit={() => handleEditItinerary(itinerary)}
                    onDelete={() => handleDeleteItinerary(itinerary.id)}
                    onShare={() => handleShareToChat(itinerary)}
                    onDownload={() => handleDownloadItinerary(itinerary)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <button
              onClick={() => setActiveItinerary(null)}
              className={`mb-6 px-4 py-2 rounded-lg text-sm ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              ← Back to all itineraries
            </button>

            <ItineraryDetail
              itinerary={activeItinerary}
              onEdit={() => handleEditItinerary(activeItinerary)}
              onDelete={() => handleDeleteItinerary(activeItinerary.id)}
              onShare={(activityId) => {
                console.log("Sharing activity to chat:", activityId);
                handleShareToChat(activeItinerary);
              }}
              onDownload={() => handleDownloadItinerary(activeItinerary)}
              onUpdateItinerary={updateItinerary}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LandingPage;
