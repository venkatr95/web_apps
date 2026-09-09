import React from 'react';
import '../../styles/AddChannelMenu.css';

interface AddChannelMenuProps {
  onCreateChannel: () => void;
  onFindChannels: () => void;
  isOpen: boolean;
}

const AddChannelMenu: React.FC<AddChannelMenuProps> = ({
  onCreateChannel,
  onFindChannels,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="add-channel-menu">
      <button className="add-channel-menu-item" onClick={onCreateChannel}>
        Create channel
      </button>
      <button className="add-channel-menu-item" onClick={onFindChannels}>
        Find channels
      </button>
    </div>
  );
};

export default AddChannelMenu;
