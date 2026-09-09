import React from "react";
import toast from "react-hot-toast";
import { exportToPDF } from "../../utils/pdfExport";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CheckCircle, Download, Eye, Sparkles } from "../ui/Icons";

interface OptimizedResumePreviewProps {
  optimizedResume: any;
  originalResume?: any;
}

export const OptimizedResumePreview: React.FC<OptimizedResumePreviewProps> = ({
  optimizedResume,
  originalResume,
}) => {
  const handleDownload = async () => {
    try {
      await exportToPDF("optimized-resume-preview", "optimized-resume.pdf");
      toast.success("Optimized resume downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download resume");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Optimized Resume
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhanced based on job requirements
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Optimization Notes */}
        {optimizedResume.optimizationNotes && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Applied Optimizations
            </h3>
            <ul className="space-y-1">
              {optimizedResume.optimizationNotes.map(
                (note: string, index: number) => (
                  <li
                    key={index}
                    className="text-sm text-blue-800 dark:text-blue-200 flex items-center"
                  >
                    <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                    {note}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Card>

      {/* Resume Preview */}
      <Card className="p-6">
        <div
          id="optimized-resume-preview"
          className="bg-white p-8 shadow-lg rounded-lg min-h-[800px] text-gray-900"
        >
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {optimizedResume.personalInfo?.firstName}{" "}
              {optimizedResume.personalInfo?.lastName}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {optimizedResume.personalInfo?.email && (
                <div className="flex items-center">
                  <span>📧</span>
                  <span className="ml-1">
                    {optimizedResume.personalInfo.email}
                  </span>
                </div>
              )}
              {optimizedResume.personalInfo?.phone && (
                <div className="flex items-center">
                  <span>📞</span>
                  <span className="ml-1">
                    {optimizedResume.personalInfo.phone}
                  </span>
                </div>
              )}
              {optimizedResume.personalInfo?.location && (
                <div className="flex items-center">
                  <span>📍</span>
                  <span className="ml-1">
                    {optimizedResume.personalInfo.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Summary */}
          {optimizedResume.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {optimizedResume.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {optimizedResume.experience &&
            optimizedResume.experience.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {optimizedResume.experience.map((exp: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exp.position}
                          </h3>
                          <p className="text-gray-700 font-medium">
                            {exp.company}
                          </p>
                          <p className="text-sm text-gray-600">
                            {exp.location}
                          </p>
                        </div>
                        <div className="text-sm text-gray-600">
                          {exp.startDate} -{" "}
                          {exp.isCurrentRole ? "Present" : exp.endDate}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 mb-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                          {exp.achievements.map(
                            (achievement: string, achIndex: number) => (
                              <li key={achIndex}>{achievement}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Skills */}
          {optimizedResume.skills && optimizedResume.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Technical", "Soft", "Language", "Other"].map((category) => {
                  const categorySkills = optimizedResume.skills.filter(
                    (skill: any) => skill.category === category
                  );
                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill: any, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
