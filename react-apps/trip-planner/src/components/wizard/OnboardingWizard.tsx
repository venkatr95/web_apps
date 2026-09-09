import React, { useState } from "react";
import {
  MapPin,
  Users,
  Calendar,
  Briefcase,
  ArrowRight,
  Check,
} from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { TravelItinerary } from "../../types";
import { useApp } from "../../contexts/AppContext";
import { v4 as uuidv4 } from "uuid";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editItinerary?: TravelItinerary;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  editItinerary,
}) => {
  const { addItinerary, updateItinerary, setActiveItinerary } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TravelItinerary>>(
    editItinerary || {
      id: uuidv4(),
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      numberOfPeople: 1,
      travelType: "leisure",
      activities: [],
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const newItinerary = {
      ...formData,
      activities: formData.activities || [],
    } as TravelItinerary;

    if (editItinerary) {
      updateItinerary(newItinerary);
    } else {
      addItinerary(newItinerary);
    }

    setActiveItinerary(newItinerary);
    onClose();

    // Reset form if not editing
    if (!editItinerary) {
      setFormData({
        id: uuidv4(),
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        numberOfPeople: 1,
        travelType: "leisure",
        activities: [],
      });
      setStep(1);
    }
  };

  const calculateDurationDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // Include both start and end days
    }
    return 0;
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!formData.destination;
      case 2:
        return !!formData.startDate && !!formData.endDate;
      case 3:
        return formData.numberOfPeople >= 1;
      case 4:
        return !!formData.title && !!formData.travelType;
      default:
        return false;
    }
  };

  const duration = calculateDurationDays();

  // Calculate progress percentage
  const progress = ((step - 1) / 3) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="text-teal-500" />
              <h3 className="text-lg font-semibold">Where are you going?</h3>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="destination"
                className="block text-sm font-medium"
              >
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="text-teal-500" />
              <h3 className="text-lg font-semibold">When are you traveling?</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {duration > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Trip duration: {duration} day{duration !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="text-teal-500" />
              <h3 className="text-lg font-semibold">Who's traveling?</h3>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="numberOfPeople"
                className="block text-sm font-medium"
              >
                Number of travelers
              </label>
              <input
                type="number"
                id="numberOfPeople"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleNumberChange}
                min={1}
                max={20}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <Briefcase className="text-teal-500" />
              <h3 className="text-lg font-semibold">Trip details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Trip Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Vacation, Business Trip"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="travelType"
                  className="block text-sm font-medium"
                >
                  Trip Type
                </label>
                <select
                  id="travelType"
                  name="travelType"
                  value={formData.travelType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="leisure">Leisure</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const footerContent = (
    <>
      {step > 1 && (
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}

      <Button
        onClick={handleNext}
        disabled={!isStepValid()}
        icon={step < 4 ? <ArrowRight size={16} /> : <Check size={16} />}
        iconPosition="right"
      >
        {step < 4
          ? "Continue"
          : editItinerary
          ? "Update Itinerary"
          : "Create Itinerary"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItinerary ? "Edit Itinerary" : "Create New Itinerary"}
      footer={footerContent}
    >
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className={step >= 1 ? "text-teal-500 font-medium" : ""}>
            Destination
          </span>
          <span className={step >= 2 ? "text-teal-500 font-medium" : ""}>
            Dates
          </span>
          <span className={step >= 3 ? "text-teal-500 font-medium" : ""}>
            Travelers
          </span>
          <span className={step >= 4 ? "text-teal-500 font-medium" : ""}>
            Details
          </span>
        </div>
      </div>

      {renderStep()}
    </Modal>
  );
};

export default OnboardingWizard;
