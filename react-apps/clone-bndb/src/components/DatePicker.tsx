import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholderText,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border rounded-lg"
        placeholder={placeholderText}
        value={selected ? selected.toLocaleDateString() : ''}
        onClick={() => setIsOpen(true)}
        readOnly
      />
      {isOpen && (
        <div className="absolute top-full left-0 z-50 bg-white shadow-lg rounded-lg mt-1">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};