export interface ResumeAnalysis {
  id: string;
  userId: string;
  originalResumeUrl: string;
  jobDescription: string;
  analysisResults: AnalysisResults;
  optimizedResume?: OptimizedResume;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResults {
  overallScore: number;
  keywordMatch: KeywordAnalysis;
  skillsAlignment: SkillsAlignment;
  experienceRelevance: ExperienceRelevance;
  suggestions: Suggestion[];
  missingKeywords: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface KeywordAnalysis {
  totalKeywords: number;
  matchedKeywords: number;
  matchPercentage: number;
  criticalMissing: string[];
  wellMatched: string[];
}

export interface SkillsAlignment {
  requiredSkills: string[];
  presentSkills: string[];
  missingSkills: string[];
  alignmentScore: number;
}

export interface ExperienceRelevance {
  relevantExperience: number;
  totalExperience: number;
  relevanceScore: number;
  suggestedHighlights: string[];
}

export interface Suggestion {
  id: string;
  type: 'keyword' | 'skill' | 'experience' | 'format' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  section: string;
}

export interface OptimizedResume {
  personalInfo: any;
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  optimizationNotes: string[];
}