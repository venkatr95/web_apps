import React, { useState } from "react";
import { Experience } from "../../../models/resume";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Calendar, Edit, Plus, Trash2 } from "../../ui/Icons";
import { Input } from "../../ui/Input";

interface ExperienceEditorProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  data = [],
  onChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      description: "",
      achievements: [],
    };
    onChange([...data, newExperience]);
    setEditingIndex(data.length);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteExperience = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
    setEditingIndex(null);
  };

  const addAchievement = (index: number) => {
    const updated = [...data];
    updated[index].achievements.push("");
    onChange(updated);
  };

  const updateAchievement = (
    expIndex: number,
    achIndex: number,
    value: string
  ) => {
    const updated = [...data];
    updated[expIndex].achievements[achIndex] = value;
    onChange(updated);
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const updated = [...data];
    updated[expIndex].achievements.splice(achIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Work Experience
        </h2>
        <Button onClick={addExperience} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((experience, index) => (
          <Card key={experience.id} className="p-4">
            {editingIndex === index ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company"
                    value={experience.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    placeholder="Company Name"
                  />
                  <Input
                    label="Position"
                    value={experience.position}
                    onChange={(e) =>
                      updateExperience(index, "position", e.target.value)
                    }
                    placeholder="Job Title"
                  />
                </div>

                <Input
                  label="Location"
                  value={experience.location}
                  onChange={(e) =>
                    updateExperience(index, "location", e.target.value)
                  }
                  placeholder="City, State"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="month"
                    value={experience.startDate}
                    onChange={(e) =>
                      updateExperience(index, "startDate", e.target.value)
                    }
                  />
                  <div>
                    <Input
                      label="End Date"
                      type="month"
                      value={experience.endDate}
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      disabled={experience.isCurrentRole}
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={experience.isCurrentRole}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "isCurrentRole",
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        I currently work here
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={experience.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of your role and responsibilities..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Key Achievements
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(index)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {experience.achievements.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) =>
                          updateAchievement(index, achIndex, e.target.value)
                        }
                        placeholder="Describe a key achievement or accomplishment..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(index, achIndex)}
                        className="p-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(null)}
                  >
                    Done
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteExperience(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {experience.position || "Position Title"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {experience.company || "Company Name"} •{" "}
                    {experience.location || "Location"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {experience.startDate || "Start"} -{" "}
                    {experience.isCurrentRole
                      ? "Present"
                      : experience.endDate || "End"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingIndex(index)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No work experience added yet.</p>
          <p className="text-sm mt-1">Click "Add Experience" to get started.</p>
        </div>
      )}
    </div>
  );
};
