import React from 'react';
import { ChevronRight } from 'lucide-react';

const frequentlyBoughtItems = [
  {
    id: 1,
    brand: "Duracell",
    name: "Ultra AA Batteries",
    quantity: "4 pcs",
    mrp: 210,
    price: 189,
    image: "https://images.unsplash.com/photo-1622810820824-f400739c5c48?w=300",
    discount: "SAVE Rs 21",
    rating: 4.5,
    reviews: 245
  },
  {
    id: 2,
    brand: "Duracell",
    name: "Ultra AAA Batteries",
    quantity: "4 pcs",
    mrp: 210,
    price: 189,
    image: "https://images.unsplash.com/photo-1622810820824-f400739c5c48?w=300",
    discount: "SAVE Rs 21"
  },
  {
    id: 3,
    brand: "Eveready",
    name: "Super Heavy Duty 1015 AA Batteries",
    quantity: "10 pcs",
    mrp: 180,
    price: 145,
    image: "https://images.unsplash.com/photo-1622810820824-f400739c5c48?w=300",
    discount: "GET 19% OFF"
  },
  {
    id: 4,
    brand: "Eveready",
    name: "Carbon Zinc 1012 AAA Batteries - 1.5V, Highly Durable & Leak Proof",
    quantity: "10 pcs",
    mrp: 180,
    price: 145,
    image: "https://images.unsplash.com/photo-1622810820824-f400739c5c48?w=300",
    discount: "GET 19% OFF",
    rating: 3.8,
    reviews: 309
  },
  {
    id: 5,
    brand: "Halonix",
    name: "LED Bulb - Aatron Plus 10W With B22 Base, Cool Day Light, White",
    quantity: "1 pc",
    mrp: 199,
    price: 65,
    image: "https://images.unsplash.com/photo-1622810820824-f400739c5c48?w=300",
    discount: "GET 67% OFF"
  }
];

const OfferCard = ({ item }: { item: typeof frequentlyBoughtItems[0] }) => (
  <div className="product-card">
    <div className="product-card__image-container">
      <img src={item.image} alt={item.name} className="product-card__image" />
      <span className="product-card__discount">{item.discount}</span>
    </div>
    <div className="product-card__brand">{item.brand}</div>
    <h3 className="product-card__name">{item.name}</h3>
    <select className="product-card__quantity">
      <option>{item.quantity}</option>
    </select>
    <div className="product-card__price-container">
      <span className="product-card__price">₹{item.price}</span>
      <span className="product-card__mrp">₹{item.mrp}</span>
    </div>
    {item.rating && (
      <div className="flex items-center space-x-2 mb-3">
        <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
          ★ {item.rating}
        </span>
        <span className="text-xs text-gray-500">{item.reviews} Ratings</span>
      </div>
    )}
    <button className="product-card__add">ADD</button>
  </div>
);

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers__container">
        <div className="offers__breadcrumb">
          <a href="/" className="offers__breadcrumb-link">Home</a>
          <ChevronRight size={16} />
          <span className="offers__breadcrumb-current">Offers</span>
        </div>

        <section className="offers__section">
          <div className="offers__header">
            <h2 className="offers__title">Frequently Bought Items</h2>
            <a href="#" className="offers__view-all">View All</a>
          </div>
          <div className="offers__grid">
            {frequentlyBoughtItems.map((item) => (
              <OfferCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Offers;