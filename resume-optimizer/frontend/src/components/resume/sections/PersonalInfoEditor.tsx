import React from 'react';
import { PersonalInfo } from '../../../models/resume';
import { Input } from '../../ui/Input';

interface PersonalInfoEditorProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({ data = {} as PersonalInfo, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={data.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="John"
        />
        <Input
          label="Last Name"
          value={data.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Doe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="john.doe@example.com"
        />
        <Input
          label="Phone"
          value={data.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <Input
        label="Location"
        value={data.location || ''}
        onChange={(e) => handleChange('location', e.target.value)}
        placeholder="New York, NY"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Website (Optional)"
          value={data.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://johndoe.com"
        />
        <Input
          label="LinkedIn (Optional)"
          value={data.linkedin || ''}
          onChange={(e) => handleChange('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/johndoe"
        />
      </div>

      <Input
        label="GitHub (Optional)"
        value={data.github || ''}
        onChange={(e) => handleChange('github', e.target.value)}
        placeholder="https://github.com/johndoe"
      />
    </div>
  );
};