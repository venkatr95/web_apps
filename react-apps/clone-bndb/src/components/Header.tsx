import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, Menu, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { LanguageDialog } from './LanguageDialog';
import { UserMenu } from './UserMenu';
import { AuthDialog } from './AuthDialog';
import { LocationSearch } from './LocationSearch';
import { DateRangeCalendar } from './DateRangeCalendar';
import { GuestSelector } from './GuestSelector';

export const Header: React.FC = () => {
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = React.useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = React.useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = React.useState(false);
  const [searchLocation, setSearchLocation] = React.useState('');
  const [guestCount, setGuestCount] = React.useState(1);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setIsDatePickerOpen(false);
    }
  };

  const closeAllDialogs = () => {
    setIsLocationSearchOpen(false);
    setIsDatePickerOpen(false);
    setIsGuestSelectorOpen(false);
    setIsLanguageDialogOpen(false);
    setIsAuthDialogOpen(false);
    setIsMobileSearchActive(false);
  };

  const openDialog = (dialog: 'location' | 'date' | 'guest' | 'language' | 'auth') => {
    closeAllDialogs();
    switch (dialog) {
      case 'location':
        setIsLocationSearchOpen(true);
        break;
      case 'date':
        setIsDatePickerOpen(true);
        break;
      case 'guest':
        setIsGuestSelectorOpen(true);
        break;
      case 'language':
        setIsLanguageDialogOpen(true);
        break;
      case 'auth':
        setIsAuthDialogOpen(true);
        break;
    }
  };

  const handleSearch = () => {
    closeAllDialogs();
  };

  const isAnyDialogOpen = isLocationSearchOpen || isDatePickerOpen || isGuestSelectorOpen;

  return (
    <>
      {/* Blur Overlay */}
      {(isAnyDialogOpen || isMobileSearchActive) && (
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
          onClick={closeAllDialogs}
        />
      )}

      <header className={`sticky top-0 z-50 bg-white ${isScrolled ? 'border-b' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Search Bar */}
          {!isScrolled && !isMobileSearchActive && (
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsMobileSearchActive(true)}
                className="w-full flex items-center gap-4 bg-white rounded-full border shadow-sm px-4 py-3"
              >
                <Search size={20} />
                <div className="flex-1 text-left">
                  <div className="font-medium">Anywhere</div>
                  <div className="text-sm text-gray-500">Any week · Add guests</div>
                </div>
                <div className="border rounded-full p-2">
                  <Menu size={16} />
                </div>
              </button>
            </div>
          )}

          {/* Mobile Active Search */}
          {isMobileSearchActive && (
            <div className="fixed inset-0 bg-white z-50 pt-4">
              <div className="flex items-center px-4 mb-6">
                <button
                  onClick={() => setIsMobileSearchActive(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Menu size={24} />
                </button>
                <span className="ml-4 font-semibold">Search</span>
              </div>
              <div className="px-4">
                <div className="space-y-4">
                  <button 
                    className="w-full text-left p-4 border rounded-lg"
                    onClick={() => openDialog('location')}
                  >
                    <div className="font-medium">Where</div>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      className="mt-1 w-full text-sm text-gray-500 focus:outline-none"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </button>
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 text-left p-4 border rounded-lg"
                      onClick={() => openDialog('date')}
                    >
                      <div className="font-medium">Check in</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {startDate ? format(startDate, 'MMM d') : 'Add dates'}
                      </div>
                    </button>
                    <button 
                      className="flex-1 text-left p-4 border rounded-lg"
                      onClick={() => openDialog('date')}
                    >
                      <div className="font-medium">Check out</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {endDate ? format(endDate, 'MMM d') : 'Add dates'}
                      </div>
                    </button>
                  </div>
                  <button 
                    className="w-full text-left p-4 border rounded-lg"
                    onClick={() => openDialog('guest')}
                  >
                    <div className="font-medium">Who</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {guestCount} guest{guestCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                </div>
                <button
                  onClick={handleSearch}
                  className="fixed bottom-6 left-4 right-4 bg-[#FF385C] text-white py-4 rounded-lg font-semibold"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <svg className="text-[#FF385C] h-8 w-auto" viewBox="0 0 32 32">
                <path
                  d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.91 3.517 0 2.917-2.403 5.3-5.339 5.3-1.557 0-3.185-.705-4.75-2.005C17.879 29.644 16.16 31 13.677 31 10.753 31 8 28.917 8 26c0-1.045.243-1.926.91-3.517l.146-.353c.986-2.297 5.146-11.007 7.1-14.836l.532-1.025C17.937 1.963 19.392 1 21.4 1z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[#FF385C] font-bold text-xl ml-2 hidden md:inline">
                airbnb
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer">
              <button 
                className="border-r px-4"
                onClick={() => openDialog('location')}
              >
                {searchLocation || 'Anywhere'}
              </button>
              <button 
                className="border-r px-4"
                onClick={() => openDialog('date')}
              >
                {startDate && endDate 
                  ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
                  : 'Any week'
                }
              </button>
              <button 
                className="px-4"
                onClick={() => openDialog('guest')}
              >
                {guestCount === 1 ? 'Add guests' : `${guestCount} guests`}
              </button>
              <button 
                className="bg-[#FF385C] p-2 rounded-full text-white"
                onClick={handleSearch}
              >
                <Search size={16} />
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:block hover:bg-gray-100 px-4 py-2 rounded-full">
                Airbnb your home
              </button>
              <button 
                className="hidden md:flex hover:bg-gray-100 p-2 rounded-full"
                onClick={() => openDialog('language')}
              >
                <Globe size={20} />
              </button>
              <UserMenu onLogin={() => openDialog('auth')} />
            </div>
          </div>
        </div>

        {/* Location Search Dialog */}
        {isLocationSearchOpen && (
          <LocationSearch
            isOpen={isLocationSearchOpen}
            onClose={() => closeAllDialogs()}
          />
        )}

        {/* Date Range Calendar */}
        {isDatePickerOpen && (
          <DateRangeCalendar
            isOpen={isDatePickerOpen}
            onClose={() => closeAllDialogs()}
            startDate={startDate}
            endDate={endDate}
            onDatesChange={handleDateChange}
          />
        )}

        {/* Guest Selector */}
        {isGuestSelectorOpen && (
          <GuestSelector
            isOpen={isGuestSelectorOpen}
            onClose={() => closeAllDialogs()}
          />
        )}

        {/* Language Dialog */}
        <LanguageDialog 
          isOpen={isLanguageDialogOpen}
          onClose={() => closeAllDialogs()}
        />
        
        {/* Auth Dialog */}
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => closeAllDialogs()}
        />
      </header>
    </>
  );
};