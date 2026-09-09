import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onImageSelect, 
  selectedImage, 
  onClear,
  isAnalyzing 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isAnalyzing || !!selectedImage
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={clsx(
              "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-4 group overflow-hidden",
              isDragActive ? "border-amber-500 bg-amber-50" : "border-gray-300 hover:border-amber-400 hover:bg-gray-50 bg-white"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-4 bg-amber-100 text-amber-600 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragActive ? "Drop the coin here..." : "Upload a Coin Image"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or click to select. Supports JPG, PNG, WEBP.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-black"
          >
            <img 
              src={selectedImage} 
              alt="Selected coin" 
              className="w-full max-h-[400px] object-contain mx-auto"
            />
            {!isAnalyzing && (
              <button
                onClick={onClear}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">Analyzing Coin...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
