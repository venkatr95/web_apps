import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 md:hidden">
      <div className="flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center">
          <Search size={24} />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        <Link to="/wishlists" className="flex flex-col items-center">
          <Heart size={24} />
          <span className="text-xs mt-1">Wishlists</span>
        </Link>
        <Link to="/login" className="flex flex-col items-center">
          <User size={24} />
          <span className="text-xs mt-1">Log in</span>
        </Link>
      </div>
    </nav>
  );
}