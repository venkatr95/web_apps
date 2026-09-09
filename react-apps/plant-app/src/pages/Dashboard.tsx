import React, { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { PlantDetails } from '../components/PlantDetails';
import { analyzePlantImage, fileToBase64 } from '../utils/openai';
import { PlantData } from '../types';
import { AlertCircle } from 'lucide-react';

export function Dashboard() {
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const data = await analyzePlantImage(base64, apiKey);
      setPlantData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPlantData(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="min-h-full bg-[#FAFAF9] text-gray-900 font-sans selection:bg-green-100 pb-12">
      <main className="relative pt-8">
        {!plantData && (
          <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-200/30 blur-3xl" />
            <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-3xl" />
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Analysis Failed</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
              {error.includes("API Key") && (
                <p className="text-xs mt-2 font-mono bg-red-100 p-2 rounded">
                  Tip: Add VITE_OPENAI_API_KEY to your .env file
                </p>
              )}
            </div>
          </div>
        )}

        {!plantData ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-8 px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Discover Your <br className="md:hidden" />
                <span className="text-green-600">Green World</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                Upload a photo of any plant or tree to instantly get detailed care guides, history, and value estimates powered by AI.
              </p>
            </div>
            
            <UploadZone 
              onImageSelect={handleImageSelect} 
              isAnalyzing={isAnalyzing} 
            />
          </div>
        ) : (
          <PlantDetails 
            data={plantData} 
            imagePreview={imagePreview!} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}
