import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface Language {
  name: string;
  region: string;
}

const suggestedLanguages: Language[] = [
  { name: 'Deutsch', region: 'Deutschland' },
  { name: 'Deutsch', region: 'Österreich' },
  { name: 'Deutsch', region: 'Schweiz' },
  { name: 'Deutsch', region: 'Luxemburg' },
  { name: 'Français', region: 'Belgique' },
];

const allLanguages: Language[] = [
  { name: 'English', region: 'United States' },
  { name: 'Azərbaycan dili', region: 'Azərbaycan' },
  { name: 'Bahasa Indonesia', region: 'Indonesia' },
  { name: 'Bosanski', region: 'Bosna i Hercegovina' },
  { name: 'Català', region: 'Espanya' },
  { name: 'Čeština', region: 'Česká republika' },
  { name: 'Crnogorski', region: 'Crna Gora' },
  { name: 'Dansk', region: 'Danmark' },
  { name: 'Eesti', region: 'Eesti' },
  { name: 'English', region: 'Australia' },
  { name: 'English', region: 'Canada' },
  { name: 'English', region: 'Guyana' },
  { name: 'English', region: 'India' },
  { name: 'English', region: 'Ireland' },
  { name: 'English', region: 'New Zealand' },
  { name: 'English', region: 'Singapore' },
  { name: 'English', region: 'United Arab Emirates' },
  { name: 'English', region: 'United Kingdom' },
  { name: 'Español', region: 'Argentina' },
  { name: 'Español', region: 'Belice' },
  { name: 'Español', region: 'Bolivia' },
  { name: 'Español', region: 'Chile' },
  { name: 'Español', region: 'Colombia' },
  { name: 'Español', region: 'Costa Rica' },
  { name: 'Español', region: 'Ecuador' },
];

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = React.useState('language');
  const [translation, setTranslation] = React.useState(true);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={16} />
            </button>
            <div className="flex space-x-6">
              <button
                className={`pb-4 px-4 ${
                  selectedTab === 'language'
                    ? 'border-b-2 border-black font-semibold'
                    : 'text-gray-500'
                }`}
                onClick={() => setSelectedTab('language')}
              >
                Language and region
              </button>
              <button
                className={`pb-4 px-4 ${
                  selectedTab === 'currency'
                    ? 'border-b-2 border-black font-semibold'
                    : 'text-gray-500'
                }`}
                onClick={() => setSelectedTab('currency')}
              >
                Currency
              </button>
            </div>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

          {/* Content */}
          <div className="p-6">
            {selectedTab === 'language' ? (
              <div className="space-y-6">
                {/* Translation toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Translation</h3>
                    <p className="text-sm text-gray-500">
                      Automatically translate descriptions and reviews to English.
                    </p>
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors ${
                      translation ? 'bg-black' : 'bg-gray-200'
                    }`}
                    onClick={() => setTranslation(!translation)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                        translation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Suggested languages */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Suggested languages and regions
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {suggestedLanguages.map((lang, index) => (
                      <button
                        key={index}
                        className="text-left p-4 rounded-lg hover:bg-gray-50"
                      >
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-sm text-gray-500">{lang.region}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All languages */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Choose a language and region
                  </h3>
                  <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {allLanguages.map((lang, index) => (
                      <button
                        key={index}
                        className="text-left p-4 rounded-lg hover:bg-gray-50"
                      >
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-sm text-gray-500">{lang.region}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                Currency selection coming soon
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};