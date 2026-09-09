import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const recommendedProducts = [
  {
    id: 1,
    brand: "fresho!",
    name: "Capsicum - Green (Loose)",
    quantity: "1 kg",
    mrp: 78.98,
    price: 48,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800",
    discount: "39% OFF"
  },
  {
    id: 2,
    brand: "fresho!",
    name: "Carrot - Orange (Loose)",
    quantity: "1 kg",
    mrp: 61.64,
    price: 38,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
    discount: "38% OFF"
  },
  {
    id: 3,
    brand: "fresho!",
    name: "Cauliflower",
    quantity: "1 pc - (approx. 400 to 600 g)",
    mrp: 34.25,
    price: 25,
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800",
    discount: "27% OFF"
  },
  {
    id: 4,
    brand: "fresho!",
    name: "Coriander Leaves",
    quantity: "1 kg",
    mrp: 110.96,
    price: 88.77,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
    discount: "20% OFF"
  },
  {
    id: 5,
    brand: "fresho!",
    name: "Cucumber",
    quantity: "10 kg",
    mrp: 490,
    price: 490,
    image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800"
  },
  {
    id: 6,
    brand: "fresho!",
    name: "Ladies' Fingers - Premium",
    quantity: "4 kg",
    mrp: 68,
    price: 68,
    image: "https://images.unsplash.com/photo-1633436375564-2c721f185d22?w=800"
  }
];

const categories = [
  "Baby Care",
  "Eggs, Meat & Fish",
  "Beverages",
  "Electronics",
  "Fruits & Vegetables",
  "Snacks & Branded Foods"
];

const SmartBasket = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="smart-basket">
      <div className="smart-basket__container">
        <div className="smart-basket__breadcrumb">
          <a href="/" className="smart-basket__breadcrumb-link">Home</a>
          <ChevronRight size={16} />
          <span className="smart-basket__breadcrumb-current">Smart Basket</span>
        </div>

        <div className="smart-basket__layout">
          {/* Left Sidebar - Categories */}
          <div className="smart-basket__sidebar">
            <div className="smart-basket__categories">
              <h2 className="smart-basket__categories-title">Shop by Category</h2>
              <ul className="smart-basket__categories-list">
                {categories.map((category, index) => (
                  <li key={index}>
                    <a href="#" className="smart-basket__category-link">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="smart-basket__main">
            <div className="smart-basket__header">
              <h1 className="smart-basket__title">Our Recommendations For You</h1>
              <p className="smart-basket__subtitle">buy these products</p>
            </div>

            <div className="smart-basket__products">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  mrp={product.mrp}
                  image={product.image}
                  quantity={product.quantity}
                  discount={product.discount || ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBasket;