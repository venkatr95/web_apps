import React from 'react';
import { X } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="login-dialog">
      <div className="login-dialog__container">
        <div className="login-dialog__left">
          <h2 className="login-dialog__title">Why choose Bigbasket?</h2>
          <div className="login-dialog__features">
            <div className="login-dialog__feature">
              <div className="login-dialog__feature-icon">
                <span className="text-xl">⭐</span>
              </div>
              <span className="login-dialog__feature-text">Quality</span>
            </div>
            <div className="login-dialog__feature">
              <div className="login-dialog__feature-icon">
                <span className="text-xl">⏰</span>
              </div>
              <span className="login-dialog__feature-text">On time</span>
            </div>
            <div className="login-dialog__feature">
              <div className="login-dialog__feature-icon">
                <span className="text-xl">↩️</span>
              </div>
              <span className="login-dialog__feature-text">Return Policy</span>
            </div>
            <div className="login-dialog__feature">
              <div className="login-dialog__feature-icon">
                <span className="text-xl">🚚</span>
              </div>
              <span className="login-dialog__feature-text">Free Delivery</span>
            </div>
          </div>
          <div className="login-dialog__apps">
            <p className="login-dialog__apps-text">Find us on</p>
            <div className="login-dialog__app-buttons">
              <img src="https://www.bbassets.com/static/v2/images/google-play.png" alt="Google Play" className="login-dialog__app-button" />
              <img src="https://www.bbassets.com/static/v2/images/app-store.png" alt="App Store" className="login-dialog__app-button" />
            </div>
          </div>
        </div>

        <div className="login-dialog__right">
          <button onClick={onClose} className="login-dialog__close">
            <X size={20} />
          </button>
          <div>
            <h2 className="login-dialog__form-title">Login/ Sign up</h2>
            <p className="login-dialog__form-subtitle">Using OTP</p>
            <input
              type="text"
              placeholder="Enter Phone number/ Email Id"
              className="login-dialog__input"
            />
            <button className="login-dialog__submit">
              Continue
            </button>
            <p className="login-dialog__terms">
              By continuing, I accept{' '}
              <a href="#" className="login-dialog__link">bigbasket's Terms and Conditions</a>
              {' '}&{' '}
              <a href="#" className="login-dialog__link">Privacy Policy</a>
            </p>
            <p className="login-dialog__terms">
              This site is protected by reCAPTCHA and the Google -{' '}
              <a href="#" className="login-dialog__link">Privacy Policy</a>
              {' '}and{' '}
              <a href="#" className="login-dialog__link">Terms of Service</a>
              {' '}apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;