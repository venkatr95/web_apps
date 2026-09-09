import React from 'react';
import { PlantData } from '../types';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Globe, 
  Droplets, 
  Sun, 
  History, 
  DollarSign, 
  BookOpen,
  Sparkles
} from 'lucide-react';

interface PlantDetailsProps {
  data: PlantData;
  imagePreview: string;
  onReset: () => void;
}

export function PlantDetails({ data, imagePreview, onReset }: PlantDetailsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-20">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left Column: Image & Key Identity */}
        <motion.div variants={item} className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-green-100 aspect-[4/5] group">
            <img 
              src={imagePreview} 
              alt="Uploaded Plant" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="text-green-300 font-medium tracking-wider text-sm uppercase mb-1">
                {data.plant_type}
              </span>
              <h2 className="text-3xl font-bold text-white mb-1">{data.common_name}</h2>
              <p className="text-gray-300 italic font-serif">{data.scientific_name}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Fun Fact</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{data.fun_fact}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Detailed Info */}
        <motion.div variants={item} className="lg:col-span-7 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard 
              icon={<Globe className="w-5 h-5" />}
              label="Origin"
              value={data.origin_country}
              color="blue"
            />
            <InfoCard 
              icon={<DollarSign className="w-5 h-5" />}
              label="Est. Value"
              value={data.estimated_value}
              color="emerald"
            />
            <InfoCard 
              icon={<Sun className="w-5 h-5" />}
              label="Environment"
              value={data.growth_suitability}
              color="orange"
            />
            <InfoCard 
              icon={<Droplets className="w-5 h-5" />}
              label="Water Needs"
              value={data.water_needs}
              color="cyan"
            />
          </div>

          {/* Detailed Sections */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
            <Section 
              icon={<Sprout className="w-5 h-5" />}
              title="Nourishment"
              content={data.nourishment_needs}
            />
            <div className="h-px bg-gray-100" />
            <Section 
              icon={<History className="w-5 h-5" />}
              title="History & Background"
              content={data.history}
            />
          </div>

          <button 
            onClick={onReset}
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Analyze Another Plant
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function InfoCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex items-center gap-4 transition-transform hover:-translate-y-1`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Section({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg h-fit">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
