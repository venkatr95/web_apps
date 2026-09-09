import React, { useState } from "react";
import { Education } from "../../../models/resume";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Calendar, Edit, Plus, Trash2 } from "../../ui/Icons";
import { Input } from "../../ui/Input";

interface EducationEditorProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  data = [],
  onChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      achievements: [],
    };
    onChange([...data, newEducation]);
    setEditingIndex(data.length);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: any
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const deleteEducation = (index: number) => {
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
    eduIndex: number,
    achIndex: number,
    value: string
  ) => {
    const updated = [...data];
    updated[eduIndex].achievements[achIndex] = value;
    onChange(updated);
  };

  const removeAchievement = (eduIndex: number, achIndex: number) => {
    const updated = [...data];
    updated[eduIndex].achievements.splice(achIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Education
        </h2>
        <Button onClick={addEducation} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((education, index) => (
          <Card key={education.id} className="p-4">
            {editingIndex === index ? (
              <div className="space-y-4">
                <Input
                  label="Institution"
                  value={education.institution}
                  onChange={(e) =>
                    updateEducation(index, "institution", e.target.value)
                  }
                  placeholder="University Name"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Degree"
                    value={education.degree}
                    onChange={(e) =>
                      updateEducation(index, "degree", e.target.value)
                    }
                    placeholder="Bachelor of Science"
                  />
                  <Input
                    label="Field of Study"
                    value={education.field}
                    onChange={(e) =>
                      updateEducation(index, "field", e.target.value)
                    }
                    placeholder="Computer Science"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Start Date"
                    type="month"
                    value={education.startDate}
                    onChange={(e) =>
                      updateEducation(index, "startDate", e.target.value)
                    }
                  />
                  <Input
                    label="End Date"
                    type="month"
                    value={education.endDate}
                    onChange={(e) =>
                      updateEducation(index, "endDate", e.target.value)
                    }
                  />
                  <Input
                    label="GPA (Optional)"
                    value={education.gpa || ""}
                    onChange={(e) =>
                      updateEducation(index, "gpa", e.target.value)
                    }
                    placeholder="3.8"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Achievements & Activities
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
                  {education.achievements.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) =>
                          updateAchievement(index, achIndex, e.target.value)
                        }
                        placeholder="Dean's List, Relevant coursework, extracurricular activities..."
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
                    onClick={() => deleteEducation(index)}
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
                    {education.degree || "Degree"} in{" "}
                    {education.field || "Field of Study"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {education.institution || "Institution Name"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {education.startDate || "Start"} -{" "}
                    {education.endDate || "End"}
                    {education.gpa && (
                      <span className="ml-2">• GPA: {education.gpa}</span>
                    )}
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
          <p>No education added yet.</p>
          <p className="text-sm mt-1">Click "Add Education" to get started.</p>
        </div>
      )}
    </div>
  );
};
