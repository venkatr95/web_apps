import React from 'react';
import { 
  Home, Tent, Building2, Warehouse, Palmtree, Mountain, 
  Ship, Castle, TreePine, Hotel, ChevronLeft, ChevronRight
} from 'lucide-react';

const categories = [
  { id: 'cabins', name: 'Cabins', Icon: Home },
  { id: 'icons', name: 'Icons', Icon: Castle },
  { id: 'beachfront', name: 'Beachfront', Icon: Palmtree },
  { id: 'amazing-views', name: 'Amazing views', Icon: Mountain },
  { id: 'container', name: 'Container', Icon: Warehouse },
  { id: 'camping', name: 'Camping', Icon: Tent },
  { id: 'lakefront', name: 'Lakefront', Icon: Ship },
  { id: 'treehouses', name: 'Treehouses', Icon: TreePine },
  { id: 'design', name: 'Design', Icon: Building2 },
  { id: 'luxe', name: 'Luxe', Icon: Hotel },
];

const CategoryNav: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <nav className="border-b sticky top-0 bg-white z-40 md:top-20">
      <div className="container mx-auto px-4 relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:scale-110 transition hidden md:block"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:scale-110 transition hidden md:block"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Categories */}
        <div
          ref={containerRef}
          className="flex items-center space-x-8 py-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ 
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>
            {`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {categories.map(({ id, name, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex flex-col items-center min-w-[56px] text-sm
                ${activeCategory === id 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-200'
                }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="whitespace-nowrap">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;