import { CheckCircle } from 'lucide-react';
import React from 'react';
import '../../styles/ChannelsList.css';

interface Channel {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  verified: boolean;
  description?: string;
}

interface ChannelsListProps {
  isCollapsed: boolean;
  onChannelClick: (channel: Channel) => void;
  selectedChannelId?: string;
}

const channels: Channel[] = [
  {
    id: '1',
    name: 'Recipe Daily',
    avatar: 'https://source.unsplash.com/random/100x100/?cooking',
    followers: '2.1M',
    verified: true,
    description: 'Daily recipes from professional chefs around the world.',
  },
  {
    id: '2',
    name: 'Healthy Cooking',
    avatar: 'https://source.unsplash.com/random/100x100/?healthy-food',
    followers: '381K',
    verified: true,
    description: 'Nutritious and delicious recipes for a healthy lifestyle.',
  },
  {
    id: '3',
    name: 'Dessert Paradise',
    avatar: 'https://source.unsplash.com/random/100x100/?dessert',
    followers: '239.6M',
    verified: false,
    description: 'Sweet treats and dessert recipes for every occasion.',
  },
  {
    id: '4',
    name: 'Chef Network',
    avatar: 'https://source.unsplash.com/random/100x100/?chef',
    followers: '553K',
    verified: true,
    description: 'Professional cooking techniques and gourmet recipes.',
  },
  {
    id: '5',
    name: 'Food Critics',
    avatar: 'https://source.unsplash.com/random/100x100/?food-critic',
    followers: '197K',
    verified: false,
    description: 'Expert reviews and culinary insights.',
  },
];

const ChannelsList: React.FC<ChannelsListProps> = ({
  isCollapsed,
  onChannelClick,
  selectedChannelId,
}) => {
  return (
    <div className="channels-list">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className={`channel-item ${selectedChannelId === channel.id ? 'selected' : ''}`}
          onClick={() => onChannelClick(channel)}
        >
          <img src={channel.avatar} alt={channel.name} className="channel-avatar" />
          {!isCollapsed && (
            <>
              <div className="channel-info">
                <div className="channel-name-container">
                  <span className="channel-name">{channel.name}</span>
                  {channel.verified && <CheckCircle className="channel-verified-icon" />}
                </div>
                <span className="channel-followers">{channel.followers} followers</span>
              </div>
              <button className="channel-follow-button">Follow</button>
            </>
          )}
        </div>
      ))}
      {!isCollapsed && <button className="channels-discover-more">Discover more</button>}
    </div>
  );
};

export default ChannelsList;
