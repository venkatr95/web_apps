import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('Germany (+49)');

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl">
          {/* Header */}
          <div className="flex items-center p-4 border-b">
            <button
              onClick={onClose}
              className="absolute left-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>
            <h2 className="flex-1 text-center font-semibold">Log in or sign up</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <Dialog.Title as="h3" className="text-2xl font-semibold mb-6">
              Welcome to Airbnb
            </Dialog.Title>

            <div className="space-y-4">
              {/* Country selector */}
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full p-3 border rounded-lg appearance-none bg-transparent"
                >
                  <option>Germany (+49)</option>
                  <option>United States (+1)</option>
                  <option>United Kingdom (+44)</option>
                  {/* Add more countries */}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" fill="none" stroke="currentColor">
                    <path d="M4 6l4 4 4-4" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Phone input */}
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                  className="w-full p-3 border rounded-lg"
                />
                <p className="mt-2 text-xs text-gray-500">
                  We'll call or text you to confirm your number. Standard message and data
                  rates apply.{' '}
                  <a href="#" className="underline">
                    Privacy Policy
                  </a>
                </p>
              </div>

              {/* Continue button */}
              <button className="w-full bg-[#FF385C] text-white p-3 rounded-lg font-semibold">
                Continue
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Social login buttons */}
              <button className="w-full border p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                <img
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Continue with Google</span>
              </button>

              <button className="w-full border p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="currentColor"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                <span>Continue with Facebook</span>
              </button>

              <button className="w-full border p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="currentColor"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button className="w-full border p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="currentColor"
                    d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"
                  />
                </svg>
                <span>Continue with email</span>
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};