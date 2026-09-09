import React from "react";

import ChannelsSidebar from "../../components/channels/ChannelsSidebar";
import FeaturedCard from "../../components/home/FeaturedCard";
import "./HomePage.css";

const HomePage: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChannelsSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <section className="home-featured">
          <FeaturedCard
            title="Spicy Ramen Bowl"
            description="A rich and flavorful Japanese-style ramen with a kick."
            imageUrl="https://source.unsplash.com/featured/?ramen"
          />
          <FeaturedCard
            title="Classic Margherita Pizza"
            description="Simple, fresh, and authentic Italian pizza."
            imageUrl="https://source.unsplash.com/featured/?pizza"
          />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
