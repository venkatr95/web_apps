import { useState, useEffect } from 'react';
import { Resume } from '../models/resume';
import { useAuth } from './useAuth';
import { resumeService } from '../services/resumeService';
import toast from 'react-hot-toast';

export const useResume = (resumeId?: string) => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadResume = async (id: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const resumeData = await resumeService.getResume(id, user.uid);
      setResume(resumeData);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const resumesList = await resumeService.getUserResumes(user.uid);
      setResumes(resumesList);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (resumeData: Partial<Resume>) => {
    if (!user) return;

    try {
      setLoading(true);
      const savedResume = await resumeService.saveResume(resumeData, user.uid);
      setResume(savedResume);
      toast.success('Resume saved successfully');
      return savedResume;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to save resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) return;

    try {
      await resumeService.deleteResume(id, user.uid);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to delete resume');
    }
  };

  useEffect(() => {
    if (resumeId && user) {
      loadResume(resumeId);
    }
  }, [resumeId, user]);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  return {
    resume,
    resumes,
    loading,
    error,
    saveResume,
    deleteResume,
    loadResume,
    loadResumes
  };
};