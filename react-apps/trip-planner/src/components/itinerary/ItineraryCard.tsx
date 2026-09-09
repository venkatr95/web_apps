import React from 'react';
import { Calendar, MapPin, Users, ChevronRight, Download, Edit, Trash, Share } from 'lucide-react';
import { TravelItinerary } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

interface ItineraryCardProps {
  itinerary: TravelItinerary;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDownload: () => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({
  itinerary,
  onView,
  onEdit,
  onDelete,
  onShare,
  onDownload
}) => {
  const { theme } = useTheme();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const getDuration = () => {
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };
  
  const duration = getDuration();
  
  const getBgClass = () => {
    switch(itinerary.travelType) {
      case 'beach':
      case 'relaxation':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'adventure':
        return 'bg-amber-50 dark:bg-amber-900/20';
      case 'business':
        return 'bg-gray-50 dark:bg-gray-800/50';
      case 'family':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-teal-50 dark:bg-teal-900/20';
    }
  };
  
  const getIconClass = () => {
    switch(itinerary.travelType) {
      case 'beach':
      case 'relaxation':
        return 'text-blue-600 dark:text-blue-400';
      case 'adventure':
        return 'text-amber-600 dark:text-amber-400';
      case 'business':
        return 'text-gray-600 dark:text-gray-400';
      case 'family':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-teal-600 dark:text-teal-400';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`p-5 ${getBgClass()}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-1">{itinerary.title}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getIconClass()} bg-white/60 dark:bg-gray-800/60`}>
            {itinerary.travelType.charAt(0).toUpperCase() + itinerary.travelType.slice(1)}
          </span>
        </div>
        
        <div className="space-y-2 mt-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{itinerary.destination}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)} 
              <span className="ml-1 text-xs opacity-70">({duration} days)</span>
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Users className="w-4 h-4 mr-2" />
            <span>{itinerary.numberOfPeople} {itinerary.numberOfPeople === 1 ? 'traveler' : 'travelers'}</span>
          </div>
        </div>
      </div>
      
      <div className={`flex items-center justify-between p-3 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            icon={<Edit size={14} />}
            onClick={onEdit}
            aria-label="Edit itinerary"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Download size={14} />}
            onClick={onDownload}
            aria-label="Download itinerary"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Share size={14} />}
            onClick={onShare}
            aria-label="Share itinerary"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash size={14} />}
            onClick={onDelete}
            aria-label="Delete itinerary"
          />
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          onClick={onView}
        >
          View
        </Button>
      </div>
    </div>
  );
};

export default ItineraryCard;