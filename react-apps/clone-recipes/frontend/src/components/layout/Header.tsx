import { Bell, ChefHat, Search, User as UserIcon } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store/store";
import "../../styles/Header.css";

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-logo">
            <Link to="/" className="flex items-center">
              <ChefHat className="header-logo-icon" />
              <span className="header-logo-text">RecipeShare</span>
            </Link>
          </div>

          <div className="header-search">
            <div className="header-search-container">
              <Search className="header-search-icon" />
              <input
                type="text"
                placeholder="Search recipes..."
                className="header-search-input"
              />
            </div>
          </div>

          <div className="header-actions">
            {user ? (
              <>
                <Link to="/create" className="btn-primary">
                  Create Recipe
                </Link>
                <Bell className="header-notification" />
                <Link to="/profile" className="header-profile">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="header-profile-avatar"
                    />
                  ) : (
                    <UserIcon className="header-profile-icon" />
                  )}
                </Link>
              </>
            ) : (
              <div className="header-auth-buttons">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
