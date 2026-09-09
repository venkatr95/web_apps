import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { format, addMonths } from 'date-fns';
import { Star, Heart, Share, Award, MapPin, Key, Shield, ChevronLeft, ChevronRight, Globe, Calendar, Home, Clock, Users } from 'lucide-react';
import { GuestSelector } from './GuestSelector';
import Map from 'react-map-gl';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { properties, toggleFavorite } = useStore();
  const property = {
    id: '1',
    title: 'Alpine ambience with a breathtaking panorama!',
    location: 'Boden, Tirol, Austria',
    type: 'Entire home',
    description: "In our large 180 m2 chalet, you have 2 flats just for you: ideal for 2 families or a group of friends!\n\nYou'll enjoy an impressive south-facing view of the mountains. It is located in the heart of the Lechtal Nature Park, in the small hamlet of Pfafflar, at an altitude of 1600 m, which is inhabited only in summer. Away from the road leading to the Hahntennjoch pass, you can enjoy the peace and quiet, and relax and hike right from your doorstep!",
    amenities: [
      'Kitchen',
      'Wifi',
      'Free parking on premises',
      'Pets allowed'
    ],
    host: {
      id: 'eric123',
      name: 'Eric',
      type: 'Superhost',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      description: 'Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.',
      joinedDate: '2016',
      responseRate: '100%',
      responseTime: 'within an hour',
      rating: 5.0
    },
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6',
      'https://images.unsplash.com/photo-1505015920881-0f83c2f7c95e'
    ],
    price: 358,
    currency: '€',
    maxGuests: 10,
    bedrooms: 3,
    beds: 8,
    baths: 3,
    rating: 5.0,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'John',
        userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        rating: 5,
        date: '2024-01',
        comment: 'Amazing place with breathtaking views!'
      }
    ],
    favorite: false
  };

  const [selectedDates, setSelectedDates] = React.useState({
    checkIn: new Date('2024-09-06'),
    checkOut: new Date('2024-09-13')
  });
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = React.useState(false);
  const [guests, setGuests] = React.useState(1);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [showAllAmenities, setShowAllAmenities] = React.useState(false);
  const [showAllSafety, setShowAllSafety] = React.useState(false);
  const [showAllRules, setShowAllRules] = React.useState(false);

  const calculateTotal = () => {
    const nights = 7;
    const subtotal = property.price * nights;
    const weeklyDiscount = 443;
    const cleaningFee = 150;
    return {
      subtotal,
      weeklyDiscount,
      cleaningFee,
      total: subtotal - weeklyDiscount + cleaningFee
    };
  };

  const { subtotal, weeklyDiscount, cleaningFee, total } = calculateTotal();

  const ratings = {
    overall: 5.0,
    cleanliness: 5.0,
    accuracy: 5.0,
    checkIn: 5.0,
    communication: 5.0,
    location: 5.0,
    value: 4.5
  };

  const reviews = [
    {
      id: '1',
      user: {
        name: 'Florian',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        joinDate: '8 months on Airbnb'
      },
      date: 'September 2024',
      rating: 5,
      text: ''
    },
    {
      id: '2',
      user: {
        name: 'Lea',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        joinDate: '4 years on Airbnb'
      },
      date: 'September 2024',
      rating: 5,
      text: 'Very nice cottage with perfect views! Good for group holidays and as a starting point for hiking tours (for this you get personal tips from the host).'
    },
    {
      id: '3',
      user: {
        name: 'Elena',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        joinDate: '3 years on Airbnb'
      },
      date: 'June 2024',
      rating: 5,
      text: 'The cottage is beautifully located in the middle of colorful flower meadows overlooking the mountains! There is also a pasture with cute sheep right in front of the cabin. Eric is a...'
    },
    {
      id: '4',
      user: {
        name: 'Walter',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        joinDate: '10 years on Airbnb'
      },
      date: 'June 2024',
      rating: 5,
      text: 'The photos Eric posted are absolutely true to life. The house offers everything you need to feel comfortable and the surroundings are just as fantastic as shown in the pictures...'
    },
    {
      id: '5',
      user: {
        name: 'Deepak',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        joinDate: 'Eden Prairie, Minnesota',
        tripType: 'Group trip'
      },
      date: 'June 2024',
      rating: 5,
      text: "Eric's place is in a very beautiful and remote part of Tyrol. I spent three nights here with my extended family that included my parents and adult kids..."
    },
    {
      id: '6',
      user: {
        name: 'Nico',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        joinDate: '1 year on Airbnb'
      },
      date: 'June 2024',
      rating: 5,
      text: 'The place is perfect for group trips. The location and views are a dream. Highly recommended. Host Eric is very friendly and committed.'
    }
  ];

  const rules = {
    checkIn: '5:00 PM - 8:00 PM',
    checkout: '10:00 AM',
    maxGuests: '10 guests maximum'
  };

  const safety = {
    water: 'Nearby lake, river, other body of water',
    alarms: [
      'Carbon monoxide alarm',
      'Smoke alarm'
    ]
  };

  const nearbyLocations = [
    { name: 'Innsbruck', type: 'Vacation rentals' },
    { name: 'Saint Moritz', type: 'Vacation rentals' },
    { name: 'Munich', type: 'Vacation rentals' },
    { name: 'Dolomites', type: 'Vacation rentals' },
    { name: 'Zürich', type: 'Vacation rentals' },
    { name: 'Lake Como', type: 'Vacation rentals' }
  ];

  const renderCalendar = (date: Date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const isSelected = selectedDates.checkIn && selectedDates.checkOut && 
        currentDate >= selectedDates.checkIn && currentDate <= selectedDates.checkOut;
      
      days.push(
        <button
          key={day}
          className={`h-10 w-10 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-black text-white' : 'hover:border-2 hover:border-gray-200'}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm text-gray-500">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-50 md:hidden">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share size={24} />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => toggleFavorite(property.id)}
            >
              <Heart size={24} className={property.favorite ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <nav className="hidden md:block border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/">Airbnb</Link>
              <ChevronRight size={12} />
              <Link to="/austria">Austria</Link>
              <ChevronRight size={12} />
              <span>Boden</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <Share size={16} />
                <span>Share</span>
              </button>
              <button 
                className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg"
                onClick={() => toggleFavorite(property.id)}
              >
                <Heart size={16} className={property.favorite ? 'fill-red-500 text-red-500' : ''} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative mt-4 md:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2 md:row-span-2">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-[300px] md:h-[400px] object-cover rounded-lg md:rounded-l-lg"
              />
            </div>
            <div className="hidden md:grid grid-cols-2 gap-2">
              {property.images.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className="w-full h-[196px] object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-12 md:grid md:grid-cols-3 md:gap-12">
          <div className="md:col-span-2">
            <div className="border-b pb-6">
              <h1 className="text-2xl font-semibold mb-2">{property.title}</h1>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Star size={16} />
                    <span className="font-semibold">{property.rating}</span>
                    <span>·</span>
                    <button className="underline">{property.reviews.length} reviews</button>
                    <span>·</span>
                    <span>{property.location}</span>
                  </div>
                </div>
                <img
                  src={property.host.image}
                  alt={property.host.name}
                  className="w-14 h-14 rounded-full"
                />
              </div>
            </div>

            <div className="py-6 border-b">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold">
                    {property.type} hosted by {property.host.name}
                  </h2>
                  <p className="text-gray-600">
                    {property.maxGuests} guests · {property.bedrooms} bedrooms · 
                    {property.beds} beds · {property.baths} baths
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6 border-b">
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              <button className="mt-4 font-semibold underline">Show more</button>
            </div>

            <div className="py-6 border-b">
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-4">
                    <Shield className="w-6 h-6" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full md:w-auto border rounded-lg px-6 py-3 hover:bg-gray-50 font-semibold">
                Show all amenities
              </button>
            </div>

            <div className="py-12 border-b">
              <h2 className="text-2xl font-semibold mb-6">7 nights in Boden</h2>
              <div className="text-gray-500 mb-6">
                {format(selectedDates.checkIn, 'MMM d, yyyy')} - {format(selectedDates.checkOut, 'MMM d, yyyy')}
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                {renderCalendar(currentMonth)}
                {renderCalendar(addMonths(currentMonth, 1))}
              </div>

              <button className="mt-6 text-sm underline">Clear dates</button>
            </div>

            <div className="py-12 border-b">
              <div className="flex items-center mb-8">
                <Star className="w-6 h-6" />
                <span className="text-2xl font-semibold ml-2">{ratings.overall}</span>
                <span className="mx-2">·</span>
                <span className="text-2xl font-semibold">Guest favorite</span>
              </div>

              <p className="text-gray-600 mb-8">
                This home is a guest favorite based on ratings, reviews, and reliability
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 mb-12">
                <div className="flex items-center justify-between">
                  <span>Cleanliness</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.cleanliness / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.cleanliness}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accuracy</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.accuracy / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.accuracy}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-in</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.checkIn / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.checkIn}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Communication</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.communication / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.communication}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.location / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Value</span>
                  <div className="flex items-center">
                    <div className="w-32 h-1 bg-gray-200 rounded mr-2">
                      <div className="h-full bg-black rounded" style={{ width: `${(ratings.value / 5) * 100}%` }} />
                    </div>
                    <span>{ratings.value}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {reviews.map(review => (
                  <div key={review.id} className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={review.user.image} 
                        alt={review.user.name} 
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{review.user.name}</h3>
                        <div className="text-gray-500 text-sm space-y-1">
                          <p>{review.user.joinDate}</p>
                          {review.user.tripType && (
                            <p className="text-gray-500">· {review.user.tripType}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-black text-black" />
                      ))}
                      <span className="ml-2 text-gray-500">· {review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                    {review.text.endsWith('...') && (
                      <button className="text-black underline font-semibold">Show more</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="py-12 border-b">
              <h2 className="text-2xl font-semibold mb-6">Where you'll be</h2>
              <div className="h-[400px] rounded-lg overflow-hidden mb-6">
                <Map
                  initialViewState={{
                    longitude: 11.6276,
                    latitude: 47.2692,
                    zoom: 12
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                />
              </div>
              <h3 className="font-semibold mb-2">Boden, Tirol, Austria</h3>
              <p className="text-gray-700 mb-4">
                The Berghaus Pfafflar is the highest house in the village and benefit from a unique location in the entire valley. Facing south, The Fundaistal (Fundais Valley) will catch your eyes, it is one of the wildest valleys in the region. To the west, you will admire the sunset over the peaks! Right from the door you have access to a wide range of hikes: from the easiest (e.g. to Anhalter or Hanauerhut) to the most difficult (with many peaks up to 2800 m).
              </p>
              <button className="font-semibold underline">Show more</button>
            </div>

            <div className="py-12 border-b">
              <div className="flex items-center mb-6">
                <img src={property.host.image} alt={property.host.name} className="w-16 h-16 rounded-full mr-4" />
                <div>
                  <h2 className="text-2xl font-semibold">Meet your host</h2>
                  <p>{property.host.name}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold ml-2">{property.host.rating} rating</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="ml-2">Joined in {property.host.joinedDate}</span>
                  </div>
                  <button className="mt-4 px-6 py-3 border rounded-lg hover:bg-gray-50">
                    Message host
                  </button>
                </div>
              </div>
            </div>

            <div className="py-12 border-b">
              <h2 className="text-2xl font-semibold mb-8">Things to know</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">House rules</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Check-in: {rules.checkIn}</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Checkout before {rules.checkout}</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      <span>{rules.maxGuests}</span>
                    </li>
                  </ul>
                  <button 
                    className="mt-4 text-sm underline"
                    onClick={() => setShowAllRules(true)}
                  >
                    Show more
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Safety & property</h3>
                  <ul className="space-y-4">
                    {safety.alarms.map(alarm => (
                      <li key={alarm} className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        <span>{alarm}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="mt-4 text-sm underline"
                    onClick={() => setShowAllSafety(true)}
                  >
                    Show more
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Cancellation policy</h3>
                  <p className="text-gray-700">
                    Free cancellation before Aug 7. Cancel before Aug 30 for a partial refund.
                  </p>
                  <button className="mt-4 text-sm underline">Show more</button>
                </div>
              </div>
            </div>

            <div className="py-12">
              <h2 className="text-2xl font-semibold mb-8">Explore other options in and around Boden</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {nearbyLocations.map(location => (
                  <div key={location.name}>
                    <h3 className="font-semibold hover:underline cursor-pointer">
                      {location.name}
                    </h3>
                    <p className="text-gray-500">{location.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="sticky top-24 border rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-2xl font-semibold">{property.currency}{property.price}</span>
                  <span className="text-gray-500"> night</span>
                </div>
                <div className="flex items-center">
                  <Star size={16} />
                  <span className="ml-1 font-semibold">{property.rating}</span>
                  <span className="mx-1">·</span>
                  <button className="underline">{property.reviews.length} reviews</button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-b">
                    <div className="text-xs font-semibold">CHECK-IN</div>
                    <div>{format(selectedDates.checkIn, 'MMM d, yyyy')}</div>
                  </div>
                  <div className="p-3 border-b">
                    <div className="text-xs font-semibold">CHECKOUT</div>
                    <div>{format(selectedDates.checkOut, 'MMM d, yyyy')}</div>
                  </div>
                  <div className="col-span-2 p-3">
                    <div className="text-xs font-semibold">GUESTS</div>
                    <button 
                      className="w-full text-left"
                      onClick={() => setIsGuestSelectorOpen(true)}
                    >
                      {guests} guest{guests !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold mt-4">
                Reserve
              </button>

              <div className="mt-4 space-y-4">
                <div className="flex justify-between py-2">
                  <span className="underline">
                    {property.currency}{property.price} x 7 nights
                  </span>
                  <span>{property.currency}{subtotal}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="underline">Weekly stay discount</span>
                  <span className="text-green-600">-{property.currency}{weeklyDiscount}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="underline">Cleaning fee</span>
                  <span>{property.currency}{cleaningFee}</span>
                </div>
                <div className="flex justify-between py-2 font-semibold border-t">
                  <span>Total</span>
                  <span>{property.currency}{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-semibold">{property.currency}{property.price}</span>
              <span className="text-gray-500 ml-1">night</span>
            </div>
            <div className="flex items-center mt-1">
              <Star size={12} />
              <span className="ml-1 text-sm">{property.rating}</span>
              <span className="mx-1 text-sm">·</span>
              <button className="text-sm underline">{property.reviews.length} reviews</button>
            </div>
          </div>
          <button className="bg-[#FF385C] text-white px-6 py-2 rounded-lg font-semibold">
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};