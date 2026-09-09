import { format } from "date-fns";
import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Calendar, Edit, FileText, Plus, Trash2 } from "../components/ui/Icons";
import { useResume } from "../hooks/useResume";

export const Dashboard: React.FC = () => {
  const { resumes, loading, deleteResume } = useResume();
  const navigate = useNavigate();

  const createNewResume = () => {
    navigate("/editor");
  };

  const editResume = (id: string) => {
    navigate(`/editor/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Resumes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your professional resumes
            </p>
          </div>
          <Button onClick={createNewResume} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Resume
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first professional resume to get started
            </p>
            <Button onClick={createNewResume}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Resume
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="p-6 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Updated{" "}
                        {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editResume(resume.id)}
                        className="p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResume(resume.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => editResume(resume.id)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Resume
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
