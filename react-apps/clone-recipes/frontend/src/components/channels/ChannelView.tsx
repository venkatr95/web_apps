import { Camera, Share2 } from 'lucide-react';
import React, { useState } from 'react';

import '../../styles/ChannelView.css';
import RecipeFeed from '../recipe/RecipeFeed';

import ChannelOptionsMenu from './ChannelOptionsMenu';
import ShareLinkModal from './ShareLinkModal';

interface ChannelViewProps {
  channel: {
    name: string;
    followers: number;
  };
  onAddDescription: () => void;
  onShareLink: () => void;
}

const ChannelView: React.FC<ChannelViewProps> = ({ channel, onAddDescription, onShareLink }) => {
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleChannelInfo = () => {
    setIsOptionsMenuOpen(false);
    // TODO: Implement channel info
  };

  const handleChannelSettings = () => {
    setIsOptionsMenuOpen(false);
    // TODO: Implement channel settings
  };

  const handleSelectUpdates = () => {
    setIsOptionsMenuOpen(false);
    // TODO: Implement select updates
  };

  const handleCloseChannel = () => {
    setIsOptionsMenuOpen(false);
    // TODO: Implement close channel
  };

  const handleReport = () => {
    setIsOptionsMenuOpen(false);
    // TODO: Implement report
  };

  // Mock channel link - in production this would come from your backend
  const channelLink = `https://whatsapp.com/channel/0029VbAffxdBKfhyu0YRFn1i`;

  return (
    <div className="channel-view">
      <div className="channel-view-header">
        <div className="channel-view-info">
          <h1 className="channel-view-name">{channel.name}</h1>
          <span className="channel-view-followers">{channel.followers} followers</span>
        </div>
        <div className="channel-view-actions">
          <button className="channel-view-share" onClick={() => setIsShareModalOpen(true)}>
            <Share2 className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              className="channel-view-more"
              onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            >
              ⋮
            </button>
            <ChannelOptionsMenu
              isOpen={isOptionsMenuOpen}
              onClose={() => setIsOptionsMenuOpen(false)}
              onChannelInfo={handleChannelInfo}
              onChannelSettings={handleChannelSettings}
              onSelectUpdates={handleSelectUpdates}
              onCloseChannel={handleCloseChannel}
              onReport={handleReport}
            />
          </div>
        </div>
      </div>

      <div className="channel-view-notice">
        <span className="channel-view-notice-icon">📢</span>
        <p className="channel-view-notice-text">
          This channel is public and visible to anyone, including WhatsApp. There is added privacy
          for your profile and phone number.{' '}
          <button className="channel-view-notice-link">Click to learn more.</button>
        </p>
      </div>

      <div className="channel-view-created">You created this channel, "{channel.name}"</div>

      <div className="channel-view-content">
        <div className="channel-view-start">
          <div className="channel-view-start-icon">
            <Camera className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="channel-view-start-title">Start growing "{channel.name}"</h2>
          <p className="channel-view-start-text">
            Get started by adding an icon, description, and your first update. Invite people by
            sharing your link.
          </p>
          <div className="channel-view-start-actions">
            <button className="channel-view-action-button" onClick={onAddDescription}>
              Add description
            </button>
            <button className="channel-view-action-button" onClick={onShareLink}>
              Share channel link
            </button>
          </div>
        </div>

        <div className="channel-view-recipes">
          <RecipeFeed />
        </div>
      </div>

      <div className="channel-view-input">
        <button className="channel-view-input-attach">+</button>
        <input type="text" placeholder="Type an update" className="channel-view-input-field" />
        <button className="channel-view-input-emoji">☺</button>
        <button className="channel-view-input-voice">🎤</button>
      </div>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        channelName={channel.name}
        channelLink={channelLink}
      />
    </div>
  );
};

export default ChannelView;
