import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Target, Sparkles } from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileUploader } from '../components/analysis/FileUploader';
import { AnalysisResults } from '../components/analysis/AnalysisResults';
import { OptimizedResumePreview } from '../components/analysis/OptimizedResumePreview';

export const ResumeAnalyzer: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'analyze' | 'optimize'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { analysis, optimizedResume, loading, analyzeResume, generateOptimizedResume, reset } = useAnalysis();

  const handleFileUpload = (text: string, name: string) => {
    setResumeText(text);
    setFileName(name);
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription.trim()) {
      alert('Please upload a resume and enter a job description');
      return;
    }

    try {
      await analyzeResume(resumeText, jobDescription);
      setStep('analyze');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleOptimize = async () => {
    if (!analysis) return;

    try {
      // Create a mock resume object for optimization
      const mockResume = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY'
        },
        summary: analysis.analysisResults.strengthAreas.join('. ') + '.',
        experience: [
          {
            position: 'Software Developer',
            company: 'Tech Company',
            location: 'New York, NY',
            startDate: '2020-01',
            endDate: '2023-12',
            isCurrentRole: false,
            description: 'Developed and maintained web applications using modern technologies.',
            achievements: [
              'Improved application performance by 30%',
              'Led a team of 5 developers',
              'Implemented automated testing procedures'
            ]
          }
        ],
        skills: [
          { name: 'JavaScript', category: 'Technical', level: 'Advanced' },
          { name: 'React', category: 'Technical', level: 'Advanced' },
          { name: 'Node.js', category: 'Technical', level: 'Intermediate' },
          { name: 'Leadership', category: 'Soft', level: 'Advanced' }
        ]
      };

      await generateOptimizedResume(mockResume);
      setStep('optimize');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStartOver = () => {
    reset();
    setStep('upload');
    setResumeText('');
    setFileName('');
    setJobDescription('');
  };

  const steps = [
    { id: 'upload', title: 'Upload & Input', icon: FileText },
    { id: 'analyze', title: 'Analysis', icon: Target },
    { id: 'optimize', title: 'Optimize', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Analyzer & Optimizer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your resume and job description to get AI-powered analysis and optimization suggestions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = stepItem.id === step;
              const isCompleted = steps.findIndex(s => s.id === step) > index;
              
              return (
                <React.Fragment key={stepItem.id}>
                  <div className={`
                    flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    <StepIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{stepItem.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Your Resume
                </h2>
                <FileUploader onFileUpload={handleFileUpload} />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Job Description
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste the job description you're applying for
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Paste the complete job description here..."
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Include requirements, responsibilities, and preferred qualifications for best results.
                  </p>
                </div>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={handleAnalyze} 
                  loading={loading}
                  disabled={!resumeText || !jobDescription.trim()}
                  size="lg"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Analyze Resume
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'analyze' && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnalysisResults 
                results={analysis.analysisResults} 
                onOptimize={handleOptimize}
                loading={loading}
              />
              
              <div className="flex justify-center mt-8 space-x-4">
                <Button variant="outline" onClick={handleStartOver}>
                  Start Over
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'optimize' && optimizedResume && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <OptimizedResumePreview optimizedResume={optimizedResume} />
              
              <div className="flex justify-center mt-8 space-x-4">
                <Button variant="outline" onClick={handleStartOver}>
                  Analyze Another Resume
                </Button>
                <Button onClick={() => setStep('analyze')}>
                  View Analysis Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};