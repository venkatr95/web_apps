import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onImageSelect, isAnalyzing }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isAnalyzing
  });

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          {...getRootProps()}
          className={clsx(
            "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out overflow-hidden bg-white",
            isDragActive ? "border-green-500 bg-green-50 scale-[1.02]" : "border-gray-300 hover:border-green-400 hover:bg-gray-50",
            isAnalyzing && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-0" />

          <div className="z-10 flex flex-col items-center text-center p-6">
            {isAnalyzing ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-lg font-medium text-green-800">Analyzing nature's secrets...</p>
                <p className="text-sm text-green-600 mt-1">This may take a few seconds</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mb-4 rounded-2xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {isDragActive ? (
                    <Upload className="w-8 h-8 text-green-600" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {isDragActive ? "Drop it here!" : "Upload a Plant Photo"}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Drag & drop an image here, or click to select from your device
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
