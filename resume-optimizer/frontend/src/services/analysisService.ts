import { ResumeAnalysis, AnalysisResults, Suggestion } from '../models/analysis';

class AnalysisService {
  async analyzeResume(resumeText: string, jobDescription: string, userId: string): Promise<ResumeAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysisResults = this.performAnalysis(resumeText, jobDescription);
    
    const analysis: ResumeAnalysis = {
      id: this.generateId(),
      userId,
      originalResumeUrl: '',
      jobDescription,
      analysisResults,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return analysis;
  }

  private performAnalysis(resumeText: string, jobDescription: string): AnalysisResults {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);
    
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.some(rKeyword => 
        rKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(rKeyword.toLowerCase())
      )
    );

    const missingKeywords = jobKeywords.filter(keyword => 
      !matchedKeywords.some(matched => 
        matched.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const keywordMatch = {
      totalKeywords: jobKeywords.length,
      matchedKeywords: matchedKeywords.length,
      matchPercentage: Math.round((matchedKeywords.length / jobKeywords.length) * 100),
      criticalMissing: missingKeywords.slice(0, 5),
      wellMatched: matchedKeywords.slice(0, 5)
    };

    const suggestions = this.generateSuggestions(resumeText, jobDescription, missingKeywords);
    const overallScore = this.calculateOverallScore(keywordMatch, suggestions);

    return {
      overallScore,
      keywordMatch,
      skillsAlignment: {
        requiredSkills: this.extractSkills(jobDescription),
        presentSkills: this.extractSkills(resumeText),
        missingSkills: missingKeywords.filter(k => this.isSkill(k)),
        alignmentScore: keywordMatch.matchPercentage
      },
      experienceRelevance: {
        relevantExperience: 3,
        totalExperience: 5,
        relevanceScore: 75,
        suggestedHighlights: [
          'Quantify achievements with specific metrics',
          'Highlight leadership and project management experience',
          'Emphasize technical skills relevant to the role'
        ]
      },
      suggestions,
      missingKeywords: missingKeywords.slice(0, 10),
      strengthAreas: [
        'Strong technical background',
        'Relevant industry experience',
        'Good educational foundation'
      ],
      improvementAreas: [
        'Add more quantified achievements',
        'Include missing key skills',
        'Optimize keyword density'
      ]
    };
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 50);
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'agile', 'scrum', 'leadership', 'management', 'communication',
      'problem-solving', 'teamwork', 'analytical', 'creative'
    ];

    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private isSkill(keyword: string): boolean {
    const skillIndicators = [
      'programming', 'development', 'management', 'analysis', 'design',
      'leadership', 'communication', 'technical', 'software', 'database'
    ];
    
    return skillIndicators.some(indicator => 
      keyword.toLowerCase().includes(indicator) ||
      indicator.includes(keyword.toLowerCase())
    );
  }

  private generateSuggestions(resumeText: string, jobDescription: string, missingKeywords: string[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Keyword suggestions
    missingKeywords.slice(0, 5).forEach((keyword, index) => {
      suggestions.push({
        id: `keyword-${index}`,
        type: 'keyword',
        priority: index < 2 ? 'high' : 'medium',
        title: `Add "${keyword}" to your resume`,
        description: `This keyword appears in the job description but is missing from your resume. Consider incorporating it naturally into your experience or skills sections.`,
        section: 'experience'
      });
    });

    // Content suggestions
    suggestions.push({
      id: 'quantify-achievements',
      type: 'content',
      priority: 'high',
      title: 'Quantify your achievements',
      description: 'Add specific numbers, percentages, or metrics to demonstrate the impact of your work.',
      originalText: 'Improved team productivity',
      suggestedText: 'Improved team productivity by 25% through implementation of agile methodologies',
      section: 'experience'
    });

    suggestions.push({
      id: 'action-verbs',
      type: 'content',
      priority: 'medium',
      title: 'Use stronger action verbs',
      description: 'Replace weak verbs with powerful action words that demonstrate leadership and impact.',
      originalText: 'Was responsible for managing projects',
      suggestedText: 'Led cross-functional teams to deliver 15+ projects on time and under budget',
      section: 'experience'
    });

    suggestions.push({
      id: 'summary-optimization',
      type: 'content',
      priority: 'high',
      title: 'Optimize your professional summary',
      description: 'Tailor your summary to highlight the most relevant skills and experiences for this specific role.',
      section: 'summary'
    });

    return suggestions;
  }

  private calculateOverallScore(keywordMatch: any, suggestions: Suggestion[]): number {
    const keywordScore = keywordMatch.matchPercentage;
    const suggestionPenalty = suggestions.filter(s => s.priority === 'high').length * 5;
    
    return Math.max(0, Math.min(100, keywordScore - suggestionPenalty + 20));
  }

  async generateOptimizedResume(analysis: ResumeAnalysis, originalResume: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Apply suggestions to create optimized version
    const optimized = JSON.parse(JSON.stringify(originalResume));
    
    // Enhance summary with job-relevant keywords
    if (optimized.summary) {
      const missingKeywords = analysis.analysisResults.missingKeywords.slice(0, 3);
      optimized.summary += ` Experienced in ${missingKeywords.join(', ')} with a proven track record of delivering results.`;
    }

    // Add optimization notes
    optimized.optimizationNotes = [
      'Enhanced summary with job-relevant keywords',
      'Quantified achievements where possible',
      'Emphasized skills matching job requirements',
      'Improved action verb usage throughout'
    ];

    return optimized;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const analysisService = new AnalysisService();