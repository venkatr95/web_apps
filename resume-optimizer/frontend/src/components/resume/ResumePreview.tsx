import React from "react";
import { Resume } from "../../models/resume";
import {
  Calendar,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "../ui/Icons";

interface ResumePreviewProps {
  resume: Resume;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  if (!resume) {
    return (
      <div className="bg-white p-8 shadow-lg rounded-lg min-h-[800px] flex items-center justify-center">
        <p className="text-gray-500">Start editing to see preview</p>
      </div>
    );
  }

  const { personalInfo, summary, experience, education, skills } = resume;

  return (
    <div
      id="resume-preview"
      className="bg-white p-8 shadow-lg rounded-lg min-h-[800px] text-gray-900"
    >
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo?.firstName} {personalInfo?.lastName}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo?.email && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo?.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {personalInfo.location}
            </div>
          )}
          {personalInfo?.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              <a
                href={personalInfo.website}
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
          )}
          {personalInfo?.linkedin && (
            <div className="flex items-center">
              <Linkedin className="w-4 h-4 mr-1" />
              <a
                href={personalInfo.linkedin}
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}
          {personalInfo?.github && (
            <div className="flex items-center">
              <Github className="w-4 h-4 mr-1" />
              <a
                href={personalInfo.github}
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.position}
                    </h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.location}</p>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {exp.startDate} -{" "}
                    {exp.isCurrentRole ? "Present" : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 mb-2">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-1 space-y-1">
                    {edu.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Technical", "Soft", "Language", "Other"].map((category) => {
              const categorySkills = skills.filter(
                (skill) => skill.category === category
              );
              if (categorySkills.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
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
  );
};
