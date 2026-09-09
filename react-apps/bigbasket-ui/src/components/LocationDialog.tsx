import React from 'react';
import { X, Search } from 'lucide-react';

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="location-dialog">
      <div className="location-dialog__container">
        <div className="location-dialog__header">
          <h2 className="location-dialog__title">Select a location for delivery</h2>
          <button 
            onClick={onClose}
            className="location-dialog__close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="location-dialog__content">
          <p className="location-dialog__description">
            Choose your address location to see product availability and delivery options
          </p>
          <div className="location-dialog__search">
            <Search className="location-dialog__search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for area or street name"
              className="location-dialog__input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDialog;