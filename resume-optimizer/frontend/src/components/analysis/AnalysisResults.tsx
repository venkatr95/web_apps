import { motion } from "framer-motion";
import React from "react";
import { AnalysisResults as AnalysisResultsType } from "../../models/analysis";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
} from "../ui/Icons";

interface AnalysisResultsProps {
  results: AnalysisResultsType;
  onOptimize: () => void;
  loading?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  onOptimize,
  loading = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resume Analysis Results
          </h2>
          <div
            className={`px-4 py-2 rounded-full ${getScoreBgColor(results.overallScore)}`}
          >
            <span
              className={`text-2xl font-bold ${getScoreColor(results.overallScore)}`}
            >
              {results.overallScore}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keyword Match
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {results.keywordMatch.matchPercentage}%
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Skills Alignment
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {results.skillsAlignment.alignmentScore}%
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Experience Relevance
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {results.experienceRelevance.relevanceScore}%
            </p>
          </div>
        </div>

        <Button onClick={onOptimize} loading={loading} className="w-full">
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate Optimized Resume
        </Button>
      </Card>

      {/* Keyword Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Keyword Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Well Matched Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {results.keywordMatch.wellMatched.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              Missing Critical Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {results.keywordMatch.criticalMissing.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
          Improvement Suggestions
        </h3>

        <div className="space-y-4">
          {results.suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {suggestion.title}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}
                >
                  {suggestion.priority}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {suggestion.description}
              </p>

              {suggestion.originalText && suggestion.suggestedText && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                      Before:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.originalText}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      After:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.suggestedText}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Strength Areas
          </h3>
          <ul className="space-y-2">
            {results.strengthAreas.map((strength, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {results.improvementAreas.map((area, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
