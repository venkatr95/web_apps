"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Save, X } from "lucide-react";
import { useState } from "react";

interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev?: string;
  [key: string]: any;
}

interface DataEditorProps {
  document: SanityDocument | null;
  documentType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (documentId: string, data: any) => void;
  isCreating: boolean;
}

export const DataEditor = ({
  document,
  documentType,
  open,
  onOpenChange,
  onSave,
  isCreating,
}: DataEditorProps) => {
  const [formData, setFormData] = useState<any>(document || {});
  const [loading, setSaving] = useState(false);

  // Handle form field changes
  const handleFieldChange = (path: string, value: any) => {
    const keys = path.split(".");
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setFormData(newData);
  };

  // Get value from nested path
  const getFieldValue = (path: string) => {
    const keys = path.split(".");
    let current = formData;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return "";
      }
    }
    return current || "";
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreating) {
        await onSave("", formData);
      } else {
        await onSave(document!._id, formData);
      }
    } finally {
      setSaving(false);
    }
  };

  // Add array item
  const addArrayItem = (path: string) => {
    const currentArray = getFieldValue(path) || [];
    handleFieldChange(path, [...currentArray, ""]);
  };

  // Remove array item
  const removeArrayItem = (path: string, index: number) => {
    const currentArray = getFieldValue(path) || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleFieldChange(path, newArray);
  };

  // Update array item
  const updateArrayItem = (path: string, index: number, value: any) => {
    const currentArray = getFieldValue(path) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleFieldChange(path, newArray);
  };

  // Render field based on type
  const renderField = (key: string, value: any, path: string = key) => {
    if (key.startsWith("_") && !isCreating) {
      // System fields - read only
      return (
        <div key={path} className="space-y-2">
          <Label className="text-xs font-medium text-gray-500">{key}</Label>
          <Input value={value || ""} disabled className="bg-gray-50" />
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div key={path} className="flex items-center space-x-2">
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleFieldChange(path, checked)}
          />
          <Label>{key}</Label>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={path} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{key}</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addArrayItem(path)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={typeof item === "object" ? JSON.stringify(item) : item}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateArrayItem(path, index, parsed);
                  } catch {
                    updateArrayItem(path, index, e.target.value);
                  }
                }}
                placeholder={`${key}[${index}]`}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeArrayItem(path, index)}
              >
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div key={path} className="space-y-2">
          <Label className="font-medium">{key}</Label>
          <div className="pl-4 border-l-2 border-gray-200 space-y-3">
            {Object.entries(value).map(([subKey, subValue]) =>
              renderField(subKey, subValue, `${path}.${subKey}`)
            )}
          </div>
        </div>
      );
    }

    // Handle long text fields
    if (
      key.includes("description") ||
      key.includes("content") ||
      key.includes("bio") ||
      (typeof value === "string" && value.length > 100)
    ) {
      return (
        <div key={path} className="space-y-2">
          <Label>{key}</Label>
          <Textarea
            value={value || ""}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            placeholder={`Enter ${key}`}
            className="min-h-[100px]"
          />
        </div>
      );
    }

    // Default input field
    return (
      <div key={path} className="space-y-2">
        <Label>{key}</Label>
        <Input
          value={value || ""}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          placeholder={`Enter ${key}`}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create New" : "Edit"}{" "}
            {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? `Create a new ${documentType} document`
              : `Edit document: ${document?._id}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Document Type Badge */}
            <Badge variant="outline">{documentType}</Badge>

            {/* Form Fields */}
            <div className="grid gap-4">
              {Object.entries(formData).map(([key, value]) =>
                renderField(key, value)
              )}

              {/* Add new field button for creating */}
              {isCreating && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const fieldName = prompt("Enter field name:");
                    if (fieldName) {
                      handleFieldChange(fieldName, "");
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : isCreating ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
