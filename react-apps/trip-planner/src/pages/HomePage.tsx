import React from "react";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import { Destination } from "../types";

const HomePage: React.FC = () => {
  // Mock data for featured destinations
  const destinations: Destination[] = [
    {
      id: "tokyo",
      name: "Tokyo",
      location: "Japan",
      description:
        "Explore the perfect blend of traditional culture and futuristic innovation in Japan's bustling capital.",
      imageUrl:
        "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 4.8,
      tags: ["City", "Culture", "Food"],
    },
    {
      id: "santorini",
      name: "Santorini",
      location: "Greece",
      description:
        "Experience the iconic white-washed buildings and breathtaking sunsets on this stunning Greek island.",
      imageUrl:
        "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 4.9,
      tags: ["Beach", "Island", "Romantic"],
    },
    {
      id: "bali",
      name: "Bali",
      location: "Indonesia",
      description:
        "Discover a paradise of lush rice terraces, ancient temples, and pristine beaches in this tropical haven.",
      imageUrl:
        "https://images.pexels.com/photos/1694621/pexels-photo-1694621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 4.7,
      tags: ["Beach", "Nature", "Temples"],
    },
    {
      id: "paris",
      name: "Paris",
      location: "France",
      description:
        "Fall in love with the city of lights, home to iconic landmarks, world-class museums, and exquisite cuisine.",
      imageUrl:
        "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 4.6,
      tags: ["City", "Romance", "History"],
    },
  ];

  return (
    <main>
      <FeaturedDestinations destinations={destinations} />
    </main>
  );
};

export default HomePage;
