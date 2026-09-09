import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Destination } from "../../types";
import Card from "../../ui/Card";
import Rating from "../../ui/Rating";

interface FeaturedDestinationsProps {
  destinations: Destination[];
}

const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
  destinations,
}) => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Destinations</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Explore our handpicked destinations for your next adventure
            </p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center text-primary-500 font-medium mt-4 md:mt-0 group"
          >
            View all destinations
            <ArrowRight
              size={16}
              className="ml-2 transform group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link to={`/destinations/${destination.id}`} key={destination.id}>
              <Card hoverable className="h-full">
                <div className="w-full h-44 overflow-hidden rounded-t-xl">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">
                      {destination.name}
                    </h3>
                    <div className="flex items-center">
                      <Rating value={destination.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-light-gray-500 dark:text-gray-400 mb-3">
                    {destination.location}
                  </p>
                  <p className="text-sm line-clamp-2 text-gray-600 dark:text-white mb-4">
                    {destination.description}
                  </p>

                  {destination.tags && (
                    <div className="flex flex-wrap gap-2">
                      {destination.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-secondary-800 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
