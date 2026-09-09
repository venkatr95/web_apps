import { Camera } from 'lucide-react';
import React, { useState } from 'react';
import '../../styles/NewChannelForm.css';

interface NewChannelFormProps {
  onBack: () => void;
  onSubmit: (channelData: { name: string; description: string }) => void;
}

const NewChannelForm: React.FC<NewChannelFormProps> = ({ onBack, onSubmit }) => {
  const [channelData, setChannelData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelData.name.trim()) {
      onSubmit(channelData);
    }
  };

  return (
    <div className="new-channel-container">
      <div className="new-channel-header">
        <button className="new-channel-back" onClick={onBack}>
          ←
        </button>
        <h1 className="new-channel-title">New channel</h1>
      </div>

      <form onSubmit={handleSubmit} className="new-channel-form">
        <div className="new-channel-icon">
          <button type="button" className="new-channel-icon-button">
            <Camera className="new-channel-camera-icon" />
            <span className="new-channel-icon-text">ADD CHANNEL ICON</span>
          </button>
        </div>

        <div className="new-channel-fields">
          <div className="new-channel-field">
            <input
              type="text"
              placeholder="Channel name"
              value={channelData.name}
              onChange={(e) => setChannelData({ ...channelData, name: e.target.value })}
              className="new-channel-input"
            />
            <div className="new-channel-emoji">☺</div>
          </div>

          <div className="new-channel-field">
            <textarea
              placeholder="Describe your channel. Include information to help people understand what your channel is about."
              value={channelData.description}
              onChange={(e) => setChannelData({ ...channelData, description: e.target.value })}
              className="new-channel-textarea"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`new-channel-submit ${!channelData.name.trim() ? 'disabled' : ''}`}
          disabled={!channelData.name.trim()}
        >
          Create channel
        </button>
      </form>
    </div>
  );
};

export default NewChannelForm;
