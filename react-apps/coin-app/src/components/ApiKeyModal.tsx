import React, { useState } from 'react';
import { Key, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">OpenAI API Key Required</h2>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          To analyze coins, this app requires an OpenAI API Key. Your key is used only locally in your browser to communicate with OpenAI and is never stored on our servers.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Enter API Key (sk-...)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => onSave(inputKey)}
            disabled={!inputKey.startsWith('sk-')}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Save & Continue
          </button>
          
          <p className="text-xs text-center text-gray-400">
            Don't have a key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">Get one here</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
