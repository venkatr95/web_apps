import React from 'react';
import { Globe, Euro, Facebook, Twitter, Instagram } from 'lucide-react';

const categories = [
  'Popular',
  'Arts & culture',
  'Outdoors',
  'Mountains',
  'Beach',
  'Unique stays',
  'Categories',
  'Things to do',
  'Travel tips & inspiration',
  'Airbnb-friendly apartments'
];

const destinations = [
  { name: 'Canmore', type: 'Apartment rentals' },
  { name: 'Benalmádena', type: 'Beach house rentals' },
  { name: 'Marbella', type: 'Apartment rentals' },
  { name: 'Mijas', type: 'House rentals' },
  { name: 'Prescott', type: 'Pet-friendly rentals' },
  { name: 'Scottsdale', type: 'House rentals' },
  { name: 'Tucson', type: 'Pet-friendly rentals' },
  { name: 'Jasper', type: 'Cabin rentals' },
  { name: 'Mountain View', type: 'Family-friendly rentals' },
  { name: 'Devonport', type: 'Cottage rentals' },
  { name: 'Mallacota', type: 'Beach house rentals' },
  { name: 'Ibiza', type: 'Vacation rentals' },
  { name: 'Anaheim', type: 'House rentals' },
  { name: 'Monterey', type: 'Condo rentals' },
  { name: 'Paso Robles', type: 'House rentals' },
  { name: 'Santa Barbara', type: 'Pet-friendly rentals' },
  { name: 'Sonoma', type: 'House rentals' }
];

const footerLinks = {
  Support: [
    'Help Center',
    'AirCover',
    'Anti-discrimination',
    'Disability support',
    'Cancellation options',
    'Report neighborhood concern'
  ],
  Hosting: [
    'Airbnb your home',
    'AirCover for Hosts',
    'Hosting resources',
    'Community forum',
    'Hosting responsibly',
    'Airbnb-friendly apartments',
    'Join a free Hosting class',
    'Find a co-host'
  ],
  Airbnb: [
    'Newsroom',
    'New features',
    'Careers',
    'Investors',
    'Gift cards',
    'Airbnb.org emergency stays'
  ]
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        {/* Inspiration Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Inspiration for future getaways</h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  className="whitespace-nowrap text-gray-600 hover:text-black hover:underline"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map(({ name, type }) => (
              <div key={name} className="space-y-1">
                <h3 className="font-semibold hover:underline cursor-pointer">{name}</h3>
                <p className="text-sm text-gray-500">{type}</p>
              </div>
            ))}
            <button className="text-black underline font-semibold">Show more</button>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-600 hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>© 2025 Airbnb, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:underline">Sitemap</a>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <button className="hover:underline">Your Privacy Choices</button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <button className="flex items-center hover:underline">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>English (US)</span>
                </button>
                <button className="flex items-center hover:underline">
                  <Euro className="w-4 h-4 mr-2" />
                  <span>EUR</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};