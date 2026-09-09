import { Eye, Globe, Shield } from 'lucide-react';
import React from 'react';
import '../../styles/CreateChannelModal.css';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-icon">
            <div className="modal-icon-circle">
              <Globe className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <h2 className="modal-title">Create a channel to reach unlimited followers</h2>

          <div className="modal-features">
            <div className="modal-feature">
              <Globe className="feature-icon" />
              <div className="feature-text">
                <h3 className="feature-title">Anyone can discover your channel</h3>
                <p className="feature-description">
                  Channels are public, so anyone can find them and see 30 days of history.
                </p>
              </div>
            </div>

            <div className="modal-feature">
              <Eye className="feature-icon" />
              <div className="feature-text">
                <h3 className="feature-title">People see your channel, not you</h3>
                <p className="feature-description">
                  Followers can't see your phone number, profile picture or name, but other admins
                  can.
                </p>
              </div>
            </div>

            <div className="modal-feature">
              <Shield className="feature-icon" />
              <div className="feature-text">
                <h3 className="feature-title">You're responsible for your channel</h3>
                <p className="feature-description">
                  Your channel needs to follow our guidelines and is reviewed against them.
                </p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="modal-button-secondary" onClick={onClose}>
              Close
            </button>
            <button className="modal-button-primary" onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
