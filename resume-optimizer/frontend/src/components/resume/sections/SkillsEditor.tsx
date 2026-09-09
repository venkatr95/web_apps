import React, { useState } from "react";
import { Skill } from "../../../models/resume";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Plus, X } from "../../ui/Icons";
import { Input } from "../../ui/Input";

interface SkillsEditorProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  data = [],
  onChange,
}) => {
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Technical" as Skill["category"],
    level: "Intermediate" as Skill["level"],
  });

  const addSkill = () => {
    if (!newSkill.name.trim()) return;

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name.trim(),
      category: newSkill.category,
      level: newSkill.level,
    };

    onChange([...data, skill]);
    setNewSkill({ name: "", category: "Technical", level: "Intermediate" });
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((skill) => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    const updated = data.map((skill) =>
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    onChange(updated);
  };

  const categories = ["Technical", "Soft", "Language", "Other"] as const;
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

  const skillsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = data.filter((skill) => skill.category === category);
      return acc;
    },
    {} as Record<Skill["category"], Skill[]>
  );

  const getLevelColor = (level: Skill["level"]) => {
    switch (level) {
      case "Beginner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Advanced":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Skills
      </h2>

      {/* Add New Skill */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add New Skill
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Skill Name"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            placeholder="JavaScript, Leadership, etc."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={newSkill.category}
              onChange={(e) =>
                setNewSkill({
                  ...newSkill,
                  category: e.target.value as Skill["category"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level
            </label>
            <select
              value={newSkill.level}
              onChange={(e) =>
                setNewSkill({
                  ...newSkill,
                  level: e.target.value as Skill["level"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={addSkill} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Skills by Category */}
      {categories.map((category) => {
        const categorySkills = skillsByCategory[category];
        if (categorySkills.length === 0) return null;

        return (
          <Card key={category} className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {category} Skills
            </h3>
            <div className="space-y-3">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}
                    >
                      {skill.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={skill.level}
                      onChange={(e) =>
                        updateSkill(skill.id, "level", e.target.value)
                      }
                      className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                 dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="p-1 text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No skills added yet.</p>
          <p className="text-sm mt-1">
            Add your first skill above to get started.
          </p>
        </div>
      )}
    </div>
  );
};
