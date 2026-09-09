import React from 'react';

interface SummaryEditorProps {
  data: string;
  onChange: (data: string) => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({ data = '', onChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Professional Summary
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Summary
        </label>
        <textarea
          value={data}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Write a compelling summary that highlights your key strengths, experience, and career objectives..."
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Tip: Keep it concise and focus on your most relevant qualifications and achievements.
        </p>
      </div>
    </div>
  );
};