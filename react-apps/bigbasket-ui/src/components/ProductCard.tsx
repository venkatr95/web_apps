import React from 'react';
import { ChevronDown, Bookmark } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  name: string;
  price: number;
  mrp: number;
  image: string;
  quantity: string;
  discount: string;
  brand?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  name, 
  price, 
  mrp, 
  image, 
  quantity, 
  discount, 
  brand = "fresho!" 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`product-card ${isDark ? 'product-card--dark' : ''}`}>
      <div className="product-card__image-container">
        <img src={image} alt={name} className="product-card__image" />
        <span className="product-card__discount">{discount}</span>
      </div>
      <div className={`product-card__brand ${isDark ? 'product-card__brand--dark' : ''}`}>
        {brand}
      </div>
      <h3 className={`product-card__name ${isDark ? 'product-card__name--dark' : ''}`}>
        {name}
      </h3>
      <select className={`product-card__quantity ${isDark ? 'product-card__quantity--dark' : ''}`}>
        <option value={quantity}>{quantity}</option>
      </select>
      <div className="product-card__price-container">
        <span className={`product-card__price ${isDark ? 'product-card__price--dark' : ''}`}>₹{price}</span>
        <span className={`product-card__mrp ${isDark ? 'product-card__mrp--dark' : ''}`}>₹{mrp}</span>
      </div>
      <select className={`product-card__offer ${isDark ? 'product-card__offer--dark' : ''}`}>
        <option>Har Din Sasta!</option>
      </select>
      <div className="product-card__actions">
        <button className={`product-card__bookmark ${isDark ? 'product-card__bookmark--dark' : ''}`}>
          <Bookmark size={16} className={`product-card__bookmark-icon ${isDark ? 'product-card__bookmark-icon--dark' : ''}`} />
        </button>
        <button className={`product-card__add ${isDark ? 'product-card__add--dark' : ''}`}>
          Add
        </button>
      </div>
    </div>
  );
}

export default ProductCard;