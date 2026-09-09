import React from 'react';
import { motion } from 'framer-motion';
import { CoinData } from '../types';
import { MapPin, Calendar, DollarSign, Hammer, BookOpen, Sparkles } from 'lucide-react';

interface ResultCardProps {
  data: CoinData;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">{data.name}</h2>
        <div className="flex items-center gap-2 text-amber-100 text-sm font-medium">
          <MapPin size={16} />
          <span>{data.country}</span>
        </div>
      </div>

      <div className="p-6 grid gap-6 sm:grid-cols-2">
        {/* Key Stats */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-amber-600 font-semibold mb-1">
              <DollarSign size={18} />
              <h3>Estimated Value</h3>
            </div>
            <p className="text-xl font-bold text-gray-900">{data.value_estimate}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar size={14} />
                Year
              </div>
              <p className="font-medium text-gray-900">{data.year}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Hammer size={14} />
                Metal
              </div>
              <p className="font-medium text-gray-900 truncate" title={data.composition}>{data.composition}</p>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
              <BookOpen size={18} className="text-amber-600" />
              <h3>Historical Context</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {data.history}
            </p>
          </div>
          
          {data.fun_fact && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1 text-sm">
                <Sparkles size={16} />
                <span>Did you know?</span>
              </div>
              <p className="text-blue-900 text-sm italic">
                "{data.fun_fact}"
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
