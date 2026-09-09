import {
  Bell,
  HelpCircle,
  Keyboard,
  Lock,
  LogOut,
  MessageSquare,
  Search,
  User,
  X,
} from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../store/slices/authSlice";
import "../../styles/Settings.css";

interface SettingsPageProps {
  onClose?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const settingsItems = [
    { icon: User, label: "Account", path: "/settings/account" },
    { icon: Lock, label: "Privacy", path: "/settings/privacy" },
    { icon: MessageSquare, label: "Chats", path: "/settings/chats" },
    { icon: Bell, label: "Notifications", path: "/settings/notifications" },
    {
      icon: Keyboard,
      label: "Keyboard shortcuts",
      path: "/settings/shortcuts",
    },
    { icon: HelpCircle, label: "Help", path: "/settings/help" },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        {onClose && (
          <button className="settings-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="settings-search-container">
        <div className="settings-search">
          <Search className="settings-search-icon" />
          <input
            type="text"
            placeholder="Search settings"
            className="settings-search-input"
          />
        </div>
      </div>

      <div className="settings-profile">
        <img
          src="https://source.unsplash.com/random/200x200/?portrait"
          alt="Profile"
          className="settings-avatar"
        />
        <div className="settings-profile-info">
          <h2 className="settings-profile-name">Venkat</h2>
          <p className="settings-profile-status">Online</p>
        </div>
      </div>

      <nav className="settings-menu">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="settings-menu-item"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="settings-menu-icon" />
            <span className="settings-menu-text">{item.label}</span>
          </button>
        ))}

        <button
          className="settings-menu-item settings-logout"
          onClick={handleLogout}
        >
          <LogOut className="settings-menu-icon" />
          <span className="settings-menu-text">Log out</span>
        </button>
      </nav>
    </div>
  );
};

export default SettingsPage;
