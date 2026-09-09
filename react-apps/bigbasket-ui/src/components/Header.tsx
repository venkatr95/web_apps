import React, { useState } from 'react';
import { Search, ShoppingBasket, User, MapPin, ChevronDown, Menu, X, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LoginDialog from './LoginDialog';
import LocationDialog from './LocationDialog';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <header className={`header ${isDark ? 'header--dark' : ''}`}>
        <div className={`header__top ${isDark ? 'header__top--dark' : ''}`}>
          <div className="header__container">
            <div className="header__left">
              {/* Mobile Menu Button */}
              <button 
                className="header__mobile-menu-btn lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu size={24} className={isDark ? 'text-white' : 'text-gray-700'} />
              </button>

              <Link to="/" className="header__logo">bigbasket</Link>
              <div className="header__search">
                <input
                  type="text"
                  placeholder="Search for Products..."
                  className={`header__search-input ${isDark ? 'header__search-input--dark' : ''}`}
                />
                <Search className="header__search-icon" size={20} />
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="header__right hidden lg:flex">
              <ThemeToggle />
              <button 
                onClick={() => setIsLocationOpen(true)}
                className={`header__location-btn ${isDark ? 'header__location-btn--dark' : ''}`}
              >
                <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
                <span className={`header__location-text ${isDark ? 'header__location-text--dark' : ''}`}>
                  Select Location
                </span>
              </button>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className={`header__login-btn ${isDark ? 'header__login-btn--dark' : ''}`}
              >
                <User size={16} />
                <span>Login/Sign Up</span>
              </button>
              <div className="header__cart">
                <ShoppingBasket size={24} className="header__cart-icon" />
                <span className="header__cart-count">0</span>
              </div>
            </div>

            {/* Mobile Cart Icon */}
            <div className="lg:hidden">
              <div className="header__cart">
                <ShoppingBasket size={24} className="header__cart-icon" />
                <span className="header__cart-count">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={`header__nav hidden lg:block ${isDark ? 'header__nav--dark' : ''}`}>
          <div className="header__container">
            <div className="header__nav-container">
              <button className="header__category-btn">
                <Menu size={16} />
                <span>Shop by Category</span>
                <ChevronDown size={16} />
              </button>
              <div className="header__nav-links">
                <Link to="/" className="header__nav-link header__nav-link--active">Tea</Link>
                <Link to="/" className={`header__nav-link header__nav-link--inactive ${isDark ? 'header__nav-link--inactive-dark' : ''}`}>Ghee</Link>
                <Link to="/" className={`header__nav-link header__nav-link--inactive ${isDark ? 'header__nav-link--inactive-dark' : ''}`}>Nandini</Link>
                <Link to="/" className={`header__nav-link header__nav-link--inactive ${isDark ? 'header__nav-link--inactive-dark' : ''}`}>Fresh Vegetables</Link>
              </div>
              <div className="header__actions">
                <Link to="/smart-basket" className="header__action-link">
                  <div className="header__action-icon">🛒</div>
                  <span className={`header__action-text ${isDark ? 'header__action-text--dark' : ''}`}>
                    Smart Basket
                  </span>
                </Link>
                <Link to="/offers" className="header__action-link">
                  <div className="header__action-icon">%</div>
                  <span className={`header__action-text ${isDark ? 'header__action-text--dark' : ''}`}>
                    Offers
                  </span>
                </Link>
                <Link to="/track" className="header__action-link">
                  <div className="header__action-icon">
                    <Navigation size={12} />
                  </div>
                  <span className={`header__action-text ${isDark ? 'header__action-text--dark' : ''}`}>
                    Track
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`header__mobile-menu lg:hidden ${isMobileMenuOpen ? 'header__mobile-menu--open' : ''} ${isDark ? 'header__mobile-menu--dark' : ''}`}>
          <div className="header__mobile-menu-header">
            <button 
              className="header__mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} className={isDark ? 'text-white' : 'text-gray-700'} />
            </button>
          </div>
          <div className="header__mobile-menu-content">
            <div className="header__mobile-menu-section">
              <ThemeToggle />
              <button 
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`header__login-btn ${isDark ? 'header__login-btn--dark' : ''} w-full justify-center`}
              >
                <User size={16} />
                <span>Login/Sign Up</span>
              </button>
              <button 
                onClick={() => {
                  setIsLocationOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`header__location-btn ${isDark ? 'header__location-btn--dark' : ''} w-full justify-center`}
              >
                <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
                <span className={`header__location-text ${isDark ? 'header__location-text--dark' : ''}`}>
                  Select Location
                </span>
              </button>
            </div>
            <div className="header__mobile-menu-section">
              <Link 
                to="/smart-basket" 
                className="header__mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Smart Basket
              </Link>
              <Link 
                to="/offers" 
                className="header__mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Offers
              </Link>
            </div>
            <div className="header__mobile-menu-section">
              <div className="header__mobile-menu-subtitle">Shop by Category</div>
              <Link to="/" className="header__mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Tea</Link>
              <Link to="/" className="header__mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Ghee</Link>
              <Link to="/" className="header__mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Nandini</Link>
              <Link to="/" className="header__mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Fresh Vegetables</Link>
            </div>
          </div>
        </div>
      </header>

      <LoginDialog 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      
      <LocationDialog
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
    </>
  );
}

export default Header;