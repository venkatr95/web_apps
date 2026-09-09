import React from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useStore } from '../store';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const PropertyMap: React.FC = () => {
  const { properties, selectedProperty, setSelectedProperty } = useStore();
  const [viewport, setViewport] = React.useState({
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 11
  });

  return (
    <Map
      {...viewport}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      onMove={(evt) => setViewport(evt.viewState)}
    >
      {properties.map((property) => (
        <Marker
          key={property.id}
          latitude={property.coordinates.latitude}
          longitude={property.coordinates.longitude}
          onClick={() => setSelectedProperty(property)}
        >
          <div className="bg-white rounded-full p-2 shadow-lg cursor-pointer">
            <span className="font-semibold">{property.currency}{property.price}</span>
          </div>
        </Marker>
      ))}

      {selectedProperty && (
        <Popup
          latitude={selectedProperty.coordinates.latitude}
          longitude={selectedProperty.coordinates.longitude}
          onClose={() => setSelectedProperty(null)}
          closeButton={true}
          closeOnClick={false}
          anchor="bottom"
        >
          <div className="p-2">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <h3 className="font-semibold">{selectedProperty.title}</h3>
            <p className="text-sm text-gray-600">{selectedProperty.location}</p>
            <p className="font-semibold mt-1">
              {selectedProperty.currency}{selectedProperty.price} / night
            </p>
          </div>
        </Popup>
      )}
    </Map>
  );
};