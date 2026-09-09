import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useResume } from "../../hooks/useResume";
import { Resume } from "../../models/resume";
import { exportToPDF } from "../../utils/pdfExport";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Download, Eye, EyeOff, Save } from "../ui/Icons";
import { ResumePreview } from "./ResumePreview";
import { EducationEditor } from "./sections/EducationEditor";
import { ExperienceEditor } from "./sections/ExperienceEditor";
import { PersonalInfoEditor } from "./sections/PersonalInfoEditor";
import { SkillsEditor } from "./sections/SkillsEditor";
import { SummaryEditor } from "./sections/SummaryEditor";

interface ResumeEditorProps {
  resumeId?: string;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ resumeId }) => {
  const { resume, saveResume, loading } = useResume(resumeId);
  const [activeSection, setActiveSection] = useState("personal");
  const [previewVisible, setPreviewVisible] = useState(true);
  const [resumeData, setResumeData] = useState<Partial<Resume>>({});

  useEffect(() => {
    if (resume) {
      setResumeData(resume);
    }
  }, [resume]);

  const handleSave = async () => {
    try {
      await saveResume(resumeData);
    } catch (error) {
      // Error handling is done in useResume hook
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        "resume-preview",
        `${resumeData.title || "resume"}.pdf`
      );
      toast.success("Resume exported successfully!");
    } catch (error) {
      toast.error("Failed to export resume");
    }
  };

  const updateResumeData = (section: string, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const sections = [
    { id: "personal", label: "Personal Info", component: PersonalInfoEditor },
    { id: "summary", label: "Summary", component: SummaryEditor },
    { id: "experience", label: "Experience", component: ExperienceEditor },
    { id: "education", label: "Education", component: EducationEditor },
    { id: "skills", label: "Skills", component: SkillsEditor },
  ];

  const ActiveSectionComponent =
    sections.find((s) => s.id === activeSection)?.component ||
    PersonalInfoEditor;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resume Editor
          </h1>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setPreviewVisible(!previewVisible)}
            >
              {previewVisible ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {previewVisible ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button variant="secondary" onClick={handleSave} loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Section Navigation */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Active Section Editor */}
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveSectionComponent
                  data={resumeData[activeSection as keyof Resume]}
                  onChange={(data) => updateResumeData(activeSection, data)}
                />
              </motion.div>
            </Card>
          </div>

          {/* Preview Panel */}
          {previewVisible && (
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Live Preview
                  </h3>
                  <div className="transform scale-75 origin-top-left">
                    <ResumePreview resume={resumeData as Resume} />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
