import React from 'react';
import { Menu } from '@headlessui/react';
import { Menu as MenuIcon, User } from 'lucide-react';

interface UserMenuProps {
  onLogin: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogin }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center border rounded-full p-2 hover:shadow-md transition">
        <MenuIcon size={20} className="mr-2" />
        <User size={20} className="bg-gray-500 text-white rounded-full" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border focus:outline-none divide-y">
        <div className="py-2">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm font-semibold`}
                onClick={onLogin}
              >
                Sign up
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm`}
                onClick={onLogin}
              >
                Log in
              </button>
            )}
          </Menu.Item>
        </div>
        <div className="py-2">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Gift cards
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Airbnb your home
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Host an experience
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Help Center
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};