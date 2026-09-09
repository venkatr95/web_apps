import { Resume } from '../models/resume';

// Mock service for demo purposes
// In production, this would integrate with Firebase Firestore
class ResumeService {
  private resumes: Resume[] = [];

  async getUserResumes(userId: string): Promise<Resume[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.resumes.filter(resume => resume.userId === userId);
  }

  async getResume(id: string, userId: string): Promise<Resume> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const resume = this.resumes.find(r => r.id === id && r.userId === userId);
    if (!resume) {
      throw new Error('Resume not found');
    }
    return resume;
  }

  async saveResume(resumeData: Partial<Resume>, userId: string): Promise<Resume> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date().toISOString();
    const resume: Resume = {
      id: resumeData.id || this.generateId(),
      userId,
      title: resumeData.title || 'Untitled Resume',
      templateId: resumeData.templateId || 'modern',
      personalInfo: resumeData.personalInfo || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: ''
      },
      summary: resumeData.summary || '',
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      certificates: resumeData.certificates || [],
      createdAt: resumeData.createdAt || now,
      updatedAt: now
    };

    const existingIndex = this.resumes.findIndex(r => r.id === resume.id);
    if (existingIndex >= 0) {
      this.resumes[existingIndex] = resume;
    } else {
      this.resumes.push(resume);
    }

    return resume;
  }

  async deleteResume(id: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.resumes = this.resumes.filter(r => !(r.id === id && r.userId === userId));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const resumeService = new ResumeService();