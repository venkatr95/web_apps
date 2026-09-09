import {
  Archive,
  Bell,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SettingsPage from "../../pages/settings/SettingsPage";

import "../../styles/ChannelsSidebar.css";
import AddChannelMenu from "./AddChannelMenu";
import ChannelsList from "./ChannelsList";
import ChannelView from "./ChannelView";
import CreateChannelModal from "./CreateChannelModal";
import NewChannelForm from "./NewChannelForm";

interface Channel {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  verified: boolean;
  description?: string;
}

const ChannelsSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreateChannel = () => {
    setIsAddMenuOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleFindChannels = () => {
    setIsAddMenuOpen(false);
    // TODO: Implement find channels functionality
  };

  const handleContinueToForm = () => {
    setIsCreateModalOpen(false);
    setShowNewChannelForm(true);
  };

  const handleChannelSubmit = (channelData: {
    name: string;
    description: string;
  }) => {
    setShowNewChannelForm(false);
    setSelectedChannel({
      id: Date.now().toString(),
      name: channelData.name,
      avatar: `https://source.unsplash.com/random/100x100/?cooking&${Date.now()}`,
      followers: "0",
      verified: false,
      description: channelData.description,
    });
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    if (!showSettings) {
      setIsCollapsed(false);
    }
  };

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    if (window.innerWidth <= 768) {
      setIsCollapsed(true);
    }
  };

  const renderToolbar = () => (
    <div className="channels-toolbar">
      <button className="toolbar-button active">
        <MessageSquare className="toolbar-icon" />
      </button>
      <button className="toolbar-button">
        <Archive className="toolbar-icon" />
      </button>
      <button className="toolbar-button">
        <Bell className="toolbar-icon" />
      </button>
      <button className="toolbar-button">
        <Users className="toolbar-icon" />
      </button>
    </div>
  );

  const renderContent = () => {
    if (showSettings) {
      return <SettingsPage onClose={() => setShowSettings(false)} />;
    }

    if (showNewChannelForm) {
      return (
        <NewChannelForm
          onBack={() => setShowNewChannelForm(false)}
          onSubmit={handleChannelSubmit}
        />
      );
    }

    return (
      <>
        <div className="channels-header">
          <h1 className="channels-title">Channels</h1>
          <div className="relative">
            <button
              className="channels-add-button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            >
              +
            </button>
            <AddChannelMenu
              isOpen={isAddMenuOpen}
              onCreateChannel={handleCreateChannel}
              onFindChannels={handleFindChannels}
            />
          </div>
        </div>

        <div className="channels-search">
          <Search className="channels-search-icon" />
          <input
            type="text"
            placeholder="Search"
            className="channels-search-input"
          />
        </div>

        <div className="channels-nav">
          <button className="channels-nav-item active">
            <Archive className="channels-nav-icon" />
            <span className="channels-nav-text">All channels</span>
          </button>
          <button className="channels-nav-item">
            <Bell className="channels-nav-icon" />
            <span className="channels-nav-text">Notifications</span>
          </button>
          <button className="channels-nav-item">
            <Users className="channels-nav-icon" />
            <span className="channels-nav-text">Find Channels</span>
          </button>
        </div>

        <div className="channels-section">
          <h2 className="channels-section-title">Find channels to follow</h2>
          <ChannelsList
            isCollapsed={isCollapsed}
            onChannelClick={handleChannelClick}
            selectedChannelId={selectedChannel?.id}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className={`channels-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="channels-collapse-button" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>

        {isCollapsed ? (
          <>
            {renderToolbar()}
            <div className="channels-section">
              <ChannelsList
                isCollapsed={isCollapsed}
                onChannelClick={handleChannelClick}
                selectedChannelId={selectedChannel?.id}
              />
            </div>
          </>
        ) : (
          renderContent()
        )}

        <div className="channels-footer">
          <button
            className={`channels-settings ${showSettings ? "active" : ""}`}
            onClick={handleSettingsClick}
          >
            <Settings className="channels-settings-icon" />
          </button>
        </div>
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContinue={handleContinueToForm}
      />

      {selectedChannel && (
        <ChannelView
          channel={{
            name: selectedChannel.name,
            followers: parseInt(
              selectedChannel.followers.replace(/[^0-9]/g, ""),
            ),
            description: selectedChannel.description,
          }}
          onAddDescription={() => {}}
          onShareLink={() => {}}
        />
      )}
    </>
  );
};

export default ChannelsSidebar;
