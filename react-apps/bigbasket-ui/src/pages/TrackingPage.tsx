import React, { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { ChevronRight, MapPin, Clock, Phone, User, Package, Truck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './TrackingPage.css';

// Mock data for demonstration
const MOCK_DELIVERY = {
  id: 'DEL123456',
  status: 'in_transit',
  rider: {
    name: 'John Doe',
    phone: '+91 98765 43210',
    rating: 4.8,
  },
  pickup: {
    address: '123 Warehouse St, Bangalore',
    coordinates: { lat: 12.9716, lng: 77.5946 },
  },
  destination: {
    address: '456 Customer Ave, Bangalore',
    coordinates: { lat: 12.9516, lng: 77.5991 },
  },
  currentLocation: {
    coordinates: { lat: 12.9616, lng: 77.5966 },
  },
  eta: '15 mins',
  timeline: [
    { time: '10:30 AM', status: 'Order Placed', completed: true },
    { time: '10:45 AM', status: 'Rider Assigned', completed: true },
    { time: '11:00 AM', status: 'Picked Up', completed: true },
    { time: '11:30 AM', status: 'In Transit', completed: false },
    { time: '11:45 AM', status: 'Delivered', completed: false },
  ],
};

const TrackingPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [path, setPath] = useState<google.maps.Polyline | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      const google = await loader.load();
      
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: MOCK_DELIVERY.currentLocation.coordinates,
        zoom: 14,
        styles: isDark ? darkMapStyle : lightMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
      });

      setMap(mapInstance);

      // Create markers
      const pickupMarker = new google.maps.Marker({
        position: MOCK_DELIVERY.pickup.coordinates,
        map: mapInstance,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
        title: 'Pickup Location',
      });

      const destinationMarker = new google.maps.Marker({
        position: MOCK_DELIVERY.destination.coordinates,
        map: mapInstance,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
        title: 'Destination',
      });

      const riderMarker = new google.maps.Marker({
        position: MOCK_DELIVERY.currentLocation.coordinates,
        map: mapInstance,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
        title: 'Rider Location',
      });

      setMarkers([pickupMarker, destinationMarker, riderMarker]);

      // Draw route
      const routePath = new google.maps.Polyline({
        path: [
          MOCK_DELIVERY.pickup.coordinates,
          MOCK_DELIVERY.currentLocation.coordinates,
          MOCK_DELIVERY.destination.coordinates,
        ],
        geodesic: true,
        strokeColor: '#84c225',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      routePath.setMap(mapInstance);
      setPath(routePath);
    };

    initMap();

    // Cleanup
    return () => {
      markers.forEach(marker => marker.setMap(null));
      if (path) path.setMap(null);
    };
  }, [isDark]);

  // Auto-update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real application, fetch new location data here
      console.log('Updating location data...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`tracking-page ${isDark ? 'tracking-page--dark' : ''}`}>
      <div className="tracking-page__container">
        <div className="tracking-page__breadcrumb">
          <a href="/" className="tracking-page__breadcrumb-link">Home</a>
          <ChevronRight size={16} />
          <span className="tracking-page__breadcrumb-current">Track Order</span>
        </div>

        <div className="tracking-page__content">
          <div className="tracking-page__map-container">
            <div ref={mapRef} className="tracking-page__map" />
          </div>

          <div className="tracking-page__info">
            <div className="tracking-page__order-info">
              <h1 className="tracking-page__title">Order #{MOCK_DELIVERY.id}</h1>
              <div className="tracking-page__eta">
                <Clock size={20} />
                <span>Estimated delivery in {MOCK_DELIVERY.eta}</span>
              </div>
            </div>

            <div className="tracking-page__rider">
              <div className="tracking-page__rider-info">
                <div className="tracking-page__rider-avatar">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="tracking-page__rider-name">{MOCK_DELIVERY.rider.name}</h3>
                  <div className="tracking-page__rider-rating">
                    ★ {MOCK_DELIVERY.rider.rating}
                  </div>
                </div>
              </div>
              <a href={`tel:${MOCK_DELIVERY.rider.phone}`} className="tracking-page__call-btn">
                <Phone size={20} />
                Call Rider
              </a>
            </div>

            <div className="tracking-page__locations">
              <div className="tracking-page__location">
                <MapPin size={20} className="text-green-500" />
                <div>
                  <h3 className="tracking-page__location-title">Pickup Location</h3>
                  <p className="tracking-page__location-address">{MOCK_DELIVERY.pickup.address}</p>
                </div>
              </div>
              <div className="tracking-page__location">
                <MapPin size={20} className="text-red-500" />
                <div>
                  <h3 className="tracking-page__location-title">Delivery Location</h3>
                  <p className="tracking-page__location-address">{MOCK_DELIVERY.destination.address}</p>
                </div>
              </div>
            </div>

            <div className="tracking-page__timeline">
              {MOCK_DELIVERY.timeline.map((event, index) => (
                <div 
                  key={index} 
                  className={`tracking-page__timeline-item ${
                    event.completed ? 'tracking-page__timeline-item--completed' : ''
                  }`}
                >
                  <div className="tracking-page__timeline-icon">
                    {index === 0 && <Package size={16} />}
                    {index === 1 && <User size={16} />}
                    {index === 2 && <MapPin size={16} />}
                    {index === 3 && <Truck size={16} />}
                    {index === 4 && <MapPin size={16} />}
                  </div>
                  <div className="tracking-page__timeline-content">
                    <span className="tracking-page__timeline-time">{event.time}</span>
                    <span className="tracking-page__timeline-status">{event.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const lightMapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

export default TrackingPage;