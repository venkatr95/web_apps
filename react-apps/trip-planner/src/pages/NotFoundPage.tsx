import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-secondary-800 rounded-xl shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-48 h-48 relative">
            <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full"></div>
            <MapPin size={100} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-secondary-800 dark:text-white mb-2">Oops! Lost in travel</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for seems to have wandered off the map. Let's get you back on track!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            as={Link} 
            to="/" 
            variant="primary" 
            fullWidth
            leftIcon={<Home size={16} />}
          >
            Back to Home
          </Button>
          <Button 
            as={Link} 
            to="/destinations" 
            variant="outline" 
            fullWidth
            leftIcon={<MapPin size={16} />}
          >
            Explore Destinations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;