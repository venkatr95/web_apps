"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentType {
  value: string;
  label: string;
  icon: string;
}

interface DataTypeSelectorProps {
  documentTypes: DocumentType[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export const DataTypeSelector = ({
  documentTypes,
  selectedType,
  onTypeChange,
}: DataTypeSelectorProps) => {
  return (
    <Select value={selectedType} onValueChange={onTypeChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select document type">
          {documentTypes.find((t) => t.value === selectedType) && (
            <div className="flex items-center gap-2">
              <span>
                {documentTypes.find((t) => t.value === selectedType)?.icon}
              </span>
              <span>
                {documentTypes.find((t) => t.value === selectedType)?.label}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {documentTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex items-center gap-2">
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
