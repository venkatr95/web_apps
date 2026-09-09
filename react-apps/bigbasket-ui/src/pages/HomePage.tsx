import React from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const topOffers = [
  {
    title: "DEALS OF THE WEEK",
    background: "bg-red-600",
    link: "#"
  },
  {
    title: "BIGGER DISCOUNTS",
    background: "bg-red-600",
    link: "#"
  },
  {
    title: "COMBOS YOU CAN'T MISS",
    background: "bg-red-600",
    link: "#"
  },
  {
    title: "THE ₹30 CORNER",
    background: "bg-red-600",
    link: "#"
  }
];

const fruitCategories = [
  {
    title: "Fresh Vegetables",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800",
    discount: "MIN 27% OFF"
  },
  {
    title: "Fresh Fruits",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800",
    discount: "MIN 27% OFF"
  },
  {
    title: "Cuts & Exotics",
    image: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=800",
    discount: "MIN 27% OFF"
  },
  {
    title: "Herbs & Seasonings",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
    discount: "MIN 27% OFF"
  }
];

const dailyStaples = [
  { title: "Atta & Flour", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" },
  { title: "Rice & Rice Products", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800" },
  { title: "Dals & Pulses", image: "https://images.unsplash.com/photo-1515594619890-cd2d7c126209?w=800" },
  { title: "Cooking Oils & Ghee", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800" },
  { title: "Dry Fruits", image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=800" },
  { title: "Salt, Sugar & Jaggery", image: "https://images.unsplash.com/photo-1582128818834-c2d41197ba63?w=800" }
];

const beverages = [
  { title: "Health Drinks & Supplements", discount: "UP TO 20% OFF", image: "https://images.unsplash.com/photo-1578021127722-1f1ff98f5904?w=800" },
  { title: "Tea & Coffee", discount: "UP TO 40% OFF", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800" },
  { title: "Flavoured & Soya Milk", discount: "UP TO 30% OFF", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800" },
  { title: "Juices", discount: "UP TO 30% OFF", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800" },
  { title: "Energy Drinks", discount: "UP TO 15% OFF", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800" },
  { title: "Soft Drinks", discount: "UP TO 15% OFF", image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=800" }
];

const HomePage = () => {
  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <a href="/" className="hover:text-gray-900">Home</a>
            <ChevronRight size={16} />
            <span className="text-gray-900">All Categories</span>
          </div>

          {/* Top Offers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Top Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topOffers.map((offer, index) => (
                <div key={index} className={`${offer.background} rounded-lg p-6 text-white hover:opacity-90 transition-opacity`}>
                  <h3 className="text-xl font-bold mb-4">{offer.title}</h3>
                  <a href={offer.link} className="text-sm font-medium hover:underline">View offers &gt;</a>
                </div>
              ))}
            </div>
          </section>

          {/* Fruits and Vegetables Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Fruits and Vegetables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fruitCategories.map((category, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={category.image} alt={category.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-medium text-[var(--color-text)]">{category.title}</h3>
                    <p className="text-red-600 font-semibold mt-2">{category.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Your Daily Staples Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Your Daily Staples</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dailyStaples.map((staple, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <img src={staple.image} alt={staple.title} className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" />
                  <h3 className="text-sm font-medium text-[var(--color-text)]">{staple.title}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* Beverages Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Beverages</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {beverages.map((beverage, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img src={beverage.image} alt={beverage.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">{beverage.title}</h3>
                    <p className="text-red-600 text-sm font-semibold">{beverage.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pet Food Banner */}
          <section className="mb-12 bg-purple-50 rounded-lg overflow-hidden relative">
            <div className="flex items-center justify-between p-8">
              <div className="max-w-lg">
                <h2 className="text-3xl font-bold mb-2">Fur-baby Feasts</h2>
                <p className="text-gray-600 mb-4">Yummy food to keep your pets healthy.</p>
                <div className="bg-red-600 text-white text-2xl font-bold inline-block px-4 py-2 rounded mb-4">
                  UP TO 50% OFF
                </div>
                <div>
                  <a href="#" className="bg-red-600 text-white px-6 py-2 rounded-full inline-flex items-center hover:bg-red-700 transition-colors">
                    SHOP NOW
                    <ChevronRight size={20} />
                  </a>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://www.bbassets.com/static/v2/images/pet-food.png"
                  alt="Pet Food"
                  className="max-h-[300px] object-contain"
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button className="w-2 h-2 rounded-full bg-purple-300"></button>
              <button className="w-2 h-2 rounded-full bg-purple-500"></button>
              <button className="w-2 h-2 rounded-full bg-purple-300"></button>
              <button className="w-2 h-2 rounded-full bg-purple-300"></button>
              <button className="w-2 h-2 rounded-full bg-purple-300"></button>
            </div>
          </section>

          {/* About Section */}
          <section className="mb-12">
            <div className="prose prose-lg max-w-none text-[var(--color-text)]">
              <h2 className="text-2xl font-semibold mb-4">bigbasket – online grocery store</h2>
              <p className="mb-4">Did you ever imagine that the freshest of fruits and vegetables, top-quality pulses and food grains, dairy products, and hundreds of branded items could be handpicked and delivered to your home, all at the click of a button? In today's fast-paced world, bigbasket.com, India's pioneering online grocery store, continues to bring a staggering array of over 40,000 products from more than 1,000 brands to the doorsteps of over 10 million satisfied customers. From essential household cleaning products to the latest beauty and makeup trends, bigbasket remains your one-stop shop for daily needs.</p>
              <p className="mb-4">In these times, we've eliminated the stress associated with shopping for daily essentials. You can now effortlessly order all your household products and groceries online. Plus, the added convenience of finding all your requirements at a single source, coupled with substantial savings, demonstrates that bigbasket, India's largest online supermarket, has transformed the way we shop for groceries. Online grocery shopping has become second nature. And when it comes to freshness, whether it's fruits and vegetables or dairy and meat, we've got you covered! Easily obtain fresh eggs, meat, fish, and more with just a few clicks.</p>
              <p className="mb-4">We now serve 300+ cities and towns across India and ensure swift delivery times, guaranteeing that all your groceries, snacks and branded foods reach you on time.</p>
              <p className="mb-4">Slotted Delivery: Choose the most convenient delivery slot to receive your groceries, ranging from early morning delivery for early birds to late-night delivery for those on the night shift. bigbasket caters to every schedule.</p>
              <p>Instant delivery from bbdnow: In response to the ever-increasing demand for convenience, bbnow by bigbasket offers lightning-fast grocery delivery, ensuring that your essentials are at your doorstep within 15-30 minutes. Our quick delivery service has revolutionized the way you shop for groceries. Choose from 5000+ grocery essentials. bbnow is available only in select cities.</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;