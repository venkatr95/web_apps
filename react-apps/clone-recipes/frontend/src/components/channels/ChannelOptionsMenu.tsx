import React from 'react';
import '../../styles/ChannelOptionsMenu.css';

interface ChannelOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelInfo: () => void;
  onChannelSettings: () => void;
  onSelectUpdates: () => void;
  onCloseChannel: () => void;
  onReport: () => void;
}

const ChannelOptionsMenu: React.FC<ChannelOptionsMenuProps> = ({
  isOpen,
  onChannelInfo,
  onChannelSettings,
  onSelectUpdates,
  onCloseChannel,
  onReport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="channel-options-menu">
      <button className="channel-options-item" onClick={onChannelInfo}>
        Channel info
      </button>
      <button className="channel-options-item" onClick={onChannelSettings}>
        Channel settings
      </button>
      <button className="channel-options-item" onClick={onSelectUpdates}>
        Select updates
      </button>
      <button className="channel-options-item text-red-600" onClick={onCloseChannel}>
        Close channel
      </button>
      <button className="channel-options-item" onClick={onReport}>
        Report
      </button>
    </div>
  );
};

export default ChannelOptionsMenu;
