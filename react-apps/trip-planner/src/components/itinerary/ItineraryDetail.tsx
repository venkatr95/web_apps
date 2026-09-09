import React, { useState } from 'react';
import { Clock, MapPin, MoreVertical, Download, Edit, Trash, MessageCircle, Plus, Move } from 'lucide-react';
import { TravelItinerary, ItineraryActivity } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

interface ItineraryDetailProps {
  itinerary: TravelItinerary;
  onEdit: () => void;
  onDelete: () => void;
  onShare: (activityId?: string) => void;
  onDownload: () => void;
  onUpdateItinerary: (updatedItinerary: TravelItinerary) => void;
}

const ItineraryDetail: React.FC<ItineraryDetailProps> = ({
  itinerary,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onUpdateItinerary
}) => {
  const { theme } = useTheme();
  const [activeDay, setActiveDay] = useState(1);
  const [menuActivity, setMenuActivity] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [movingActivity, setMovingActivity] = useState<ItineraryActivity | null>(null);
  const [targetDay, setTargetDay] = useState(1);
  const [showMoveModal, setShowMoveModal] = useState(false);
  
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    imageUrl: ''
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const getDuration = () => {
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };
  
  const duration = getDuration();
  const days = Array.from({ length: duration }, (_, i) => i + 1);
  
  const toggleActivityMenu = (activityId: string) => {
    setMenuActivity(menuActivity === activityId ? null : activityId);
  };
  
  const getActivitiesForDay = (day: number) => {
    return itinerary.activities
      .filter(activity => activity.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const addDays = (date: string, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days - 1);
    return result.toISOString().split('T')[0];
  };
  
  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({
      title: '',
      description: '',
      time: '',
      location: '',
      imageUrl: ''
    });
    setShowActivityModal(true);
  };
  
  const handleEditActivity = (activity: ItineraryActivity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      description: activity.description,
      time: activity.time,
      location: activity.location || '',
      imageUrl: activity.imageUrl || ''
    });
    setShowActivityModal(true);
  };
  
  const handleDeleteActivity = (activityId: string) => {
    const updatedActivities = itinerary.activities.filter(a => a.id !== activityId);
    onUpdateItinerary({
      ...itinerary,
      activities: updatedActivities
    });
  };
  
  const handleMoveActivity = (activity: ItineraryActivity) => {
    setMovingActivity(activity);
    setTargetDay(activity.day);
    setShowMoveModal(true);
  };
  
  const handleSubmitActivity = () => {
    const activity: ItineraryActivity = {
      id: editingActivity?.id || uuidv4(),
      day: activeDay,
      ...activityForm
    };
    
    const updatedActivities = editingActivity
      ? itinerary.activities.map(a => a.id === editingActivity.id ? activity : a)
      : [...itinerary.activities, activity];
    
    onUpdateItinerary({
      ...itinerary,
      activities: updatedActivities
    });
    
    setShowActivityModal(false);
  };
  
  const handleConfirmMove = () => {
    if (!movingActivity) return;
    
    const updatedActivities = itinerary.activities.map(activity =>
      activity.id === movingActivity.id
        ? { ...activity, day: targetDay }
        : activity
    );
    
    onUpdateItinerary({
      ...itinerary,
      activities: updatedActivities
    });
    
    setShowMoveModal(false);
    setMovingActivity(null);
  };
  
  return (
    <>
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title={editingActivity ? "Edit Activity" : "Add Activity"}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowActivityModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitActivity}>
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={activityForm.title}
              onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Activity title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={activityForm.time}
              onChange={(e) => setActivityForm(prev => ({ ...prev, time: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location (Optional)</label>
            <input
              type="text"
              value={activityForm.location}
              onChange={(e) => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Activity location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={activityForm.description}
              onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Activity description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={activityForm.imageUrl}
              onChange={(e) => setActivityForm(prev => ({ ...prev, imageUrl: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move Activity"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMove}>
              Move Activity
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select the day you want to move this activity to:
          </p>
          
          <select
            value={targetDay}
            onChange={(e) => setTargetDay(parseInt(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {days.map(day => (
              <option key={day} value={day}>
                Day {day} - {formatDate(addDays(itinerary.startDate, day))}
              </option>
            ))}
          </select>
        </div>
      </Modal>
      
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{itinerary.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {itinerary.destination}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Edit size={16} />}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Download size={16} />}
              onClick={onDownload}
            >
              Download
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<MessageCircle size={16} />}
              onClick={() => onShare()}
            >
              Share
            </Button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg transition-colors ${
                activeDay === day
                  ? theme === 'dark'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Day {day}
              <span className="block text-xs opacity-80">
                {formatDate(addDays(itinerary.startDate, day))}
              </span>
            </button>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Day {activeDay} - {formatDate(addDays(itinerary.startDate, activeDay))}
            </h2>
            
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={handleAddActivity}
            >
              Add Activity
            </Button>
          </div>
          
          {getActivitiesForDay(activeDay).length === 0 ? (
            <div className={`p-6 rounded-lg text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className="text-gray-600 dark:text-gray-400">No activities planned for this day yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getActivitiesForDay(activeDay).map(activity => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  onMenuToggle={toggleActivityMenu}
                  menuOpen={menuActivity === activity.id}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => handleDeleteActivity(activity.id)}
                  onMove={() => handleMoveActivity(activity)}
                  onShare={() => onShare(activity.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface ActivityItemProps {
  activity: ItineraryActivity;
  onMenuToggle: (id: string) => void;
  menuOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
  onShare: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  onMenuToggle, 
  menuOpen,
  onEdit,
  onDelete,
  onMove,
  onShare
}) => {
  const { theme } = useTheme();
  
  const formatTime = (time: string) => {
    try {
      const parts = time.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      
      return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return time;
    }
  };
  
  return (
    <div className={`rounded-lg p-4 relative ${
      theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50 border border-gray-200'
    } transition-colors duration-200 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            theme === 'dark' ? 'bg-gray-700 text-teal-400' : 'bg-teal-100 text-teal-600'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          
          <div>
            <h3 className="font-medium text-lg">{activity.title}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatTime(activity.time)}</span>
              {activity.location && (
                <>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {activity.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => onMenuToggle(activity.id)}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-200 text-gray-500'
            }`}
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>
          
          {menuOpen && (
            <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="py-1">
                <button
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={onShare}
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Share to Chat
                </button>
                <button
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={onMove}
                >
                  <Move className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Move to Different Day
                </button>
                <button
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Edit Activity
                </button>
                <button
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                  }`}
                  onClick={onDelete}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {activity.description && (
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          {activity.description}
        </p>
      )}
      
      {activity.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img 
            src={activity.imageUrl} 
            alt={activity.title} 
            className="w-full h-40 object-cover" 
          />
        </div>
      )}
    </div>
  );
};

export default ItineraryDetail;