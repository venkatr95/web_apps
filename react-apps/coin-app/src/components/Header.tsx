import React from 'react';
import { Coins, Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 border-b border-amber-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-lg text-white shadow-lg shadow-amber-500/20">
            <Coins size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Numisma<span className="text-amber-600">AI</span></h1>
            <p className="text-xs text-gray-500 font-medium">Smart Coin Identifier</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          <Search size={14} />
          <span>Powered by OpenAI Vision</span>
        </div>
      </div>
    </header>
  );
};
