import { useState } from 'react';
import { ResumeAnalysis } from '../models/analysis';
import { analysisService } from '../services/analysisService';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const analyzeResume = async (resumeText: string, jobDescription: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const result = await analysisService.analyzeResume(resumeText, jobDescription, user.uid);
      setAnalysis(result);
      toast.success('Resume analysis completed!');
      return result;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to analyze resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizedResume = async (originalResume: any) => {
    if (!analysis || !user) return;

    try {
      setLoading(true);
      const optimized = await analysisService.generateOptimizedResume(analysis, originalResume);
      setOptimizedResume(optimized);
      toast.success('Optimized resume generated!');
      return optimized;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to generate optimized resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setOptimizedResume(null);
    setError(null);
  };

  return {
    analysis,
    optimizedResume,
    loading,
    error,
    analyzeResume,
    generateOptimizedResume,
    reset
  };
};