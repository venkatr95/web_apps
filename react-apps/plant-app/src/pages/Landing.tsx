import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scan, ShieldCheck, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

export function Landing() {
  return (
    <div className="min-h-full bg-[#FAFAF9] flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden pt-12 pb-20">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply animate-blob animation-delay-2000" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-sm font-semibold tracking-wide mb-6">
            AI-Powered Plant Identification
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            Unlock the Secrets of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Your Garden
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly identify plants, get care tips, and discover the history behind every leaf with our advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/auth" 
              className="group px-8 py-4 rounded-full bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto px-4"
        >
          <FeatureCard 
            icon={<Scan className="w-6 h-6" />}
            title="Instant ID"
            desc="Snap a photo and get results in seconds with 99% accuracy."
          />
          <FeatureCard 
            icon={<Sprout className="w-6 h-6" />}
            title="Care Guides"
            desc="Detailed watering, sunlight, and soil requirements."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Secure Access"
            desc="Protect your garden journal with PIN-based security."
          />
        </motion.div>
      </main>
      
      <footer className="py-8 text-center text-gray-400 text-sm bg-white border-t border-gray-100">
        © 2025 FloraLens. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
