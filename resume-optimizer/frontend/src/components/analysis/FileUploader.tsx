import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { Button } from "../ui/Button";
import { CheckCircle, Upload, X } from "../ui/Icons";

interface FileUploaderProps {
  onFileUpload: (text: string, fileName: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  accept = ".pdf,.doc,.docx,.txt",
  maxSize = 5,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      setUploadedFile(file.name);
      onFileUpload(text, file.name);
    } catch (error) {
      alert("Error reading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        // For demo purposes, we'll just use the raw text
        // In production, you'd use libraries like pdf-parse for PDFs
        resolve(
          text ||
            "Sample resume content for demonstration purposes. This would contain the actual extracted text from the uploaded resume file."
        );
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <motion.div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
            ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {loading ? "Processing file..." : "Upload your resume"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Supports PDF, DOC, DOCX, TXT (max {maxSize}MB)
              </p>
            </div>

            {!loading && (
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {uploadedFile}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
