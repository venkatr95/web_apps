import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ResultCard } from './components/ResultCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { analyzeCoinImage } from './services/openai';
import { CoinData } from './types';
import { AlertCircle } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CoinData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is present (either from env or local state)
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      // Small delay to prevent flash if env loads fast
      const timer = setTimeout(() => setShowKeyModal(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowKeyModal(false);
    }
  }, [apiKey]);

  const handleImageSelect = async (file: File) => {
    setError(null);
    setResult(null);
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setShowKeyModal(true);
        return;
      }

      await processImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeCoinImage(base64Image, apiKey);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    // If an image was already selected waiting for a key, process it now
    if (selectedImage) {
      processImage(selectedImage);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="space-y-8">
          
          {/* Hero Text */}
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Identify Coins Instantly
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-lg">
              Upload a photo of any coin to discover its origin, history, and estimated value using advanced AI.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Main Interaction Area */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] items-start">
            <div className="lg:sticky lg:top-24 space-y-6">
              <UploadZone 
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClear}
                isAnalyzing={isAnalyzing}
              />
              
              {!selectedImage && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">Tips for best results:</h4>
                  <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                    <li>Ensure good lighting</li>
                    <li>Center the coin in the frame</li>
                    <li>Avoid blurry images</li>
                    <li>Capture both sides if possible (upload one side first)</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="min-h-[200px]">
              {result ? (
                <ResultCard data={result} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-12 bg-gray-50/50">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CoinsIcon className="opacity-20" size={32} />
                  </div>
                  <p className="text-sm font-medium">Results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ApiKeyModal isOpen={showKeyModal} onSave={handleSaveKey} />
    </div>
  );
}

// Simple placeholder icon for empty state
const CoinsIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

export default App;
