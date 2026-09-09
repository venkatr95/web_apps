import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`footer ${isDark ? 'footer--dark' : ''}`}>
      <div className="footer__container">
        <div className="footer__grid">
          <div>
            <h3 className="footer__section-title">Categories</h3>
            <div className="footer__links">
              <a href="#" className="footer__link">Fruits & Vegetables</a>
              <a href="#" className="footer__link">Foodgrains, Oil & Masala</a>
              <a href="#" className="footer__link">Bakery, Cakes & Dairy</a>
              <a href="#" className="footer__link">Beverages</a>
              <a href="#" className="footer__link">Snacks & Branded Foods</a>
            </div>
          </div>
          
          <div>
            <h3 className="footer__section-title">Useful Links</h3>
            <div className="footer__links">
              <a href="#" className="footer__link">About Us</a>
              <a href="#" className="footer__link">Contact Us</a>
              <a href="#" className="footer__link">FAQ</a>
              <a href="#" className="footer__link">Terms & Conditions</a>
              <a href="#" className="footer__link">Privacy Policy</a>
            </div>
          </div>
          
          <div>
            <h3 className="footer__section-title">My Account</h3>
            <div className="footer__links">
              <a href="#" className="footer__link">Sign In</a>
              <a href="#" className="footer__link">View Cart</a>
              <a href="#" className="footer__link">My Wishlist</a>
              <a href="#" className="footer__link">Track My Order</a>
              <a href="#" className="footer__link">Help</a>
            </div>
          </div>
          
          <div>
            <h3 className="footer__section-title">Contact Info</h3>
            <div className="footer__links">
              <a href="#" className="footer__link">support@bigbasket.com</a>
              <a href="#" className="footer__link">+1 234 567 8900</a>
              <a href="#" className="footer__link">
                123 Street Name, City, State, Country
              </a>
            </div>
          </div>
        </div>

        <div className="footer__newsletter">
          <h3 className="footer__newsletter-title">Subscribe to our Newsletter</h3>
          <p className="footer__newsletter-description">
            Get email updates about our latest shops and special offers
          </p>
          <form className="footer__form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="footer__input"
            />
            <button type="submit" className="footer__button">
              Subscribe
            </button>
          </form>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">
            © 2025 BigBasket. All rights reserved.
          </div>
          <div className="footer__social">
            <a href="#" className="footer__social-link">
              <Facebook size={20} />
            </a>
            <a href="#" className="footer__social-link">
              <Twitter size={20} />
            </a>
            <a href="#" className="footer__social-link">
              <Instagram size={20} />
            </a>
            <a href="#" className="footer__social-link">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;