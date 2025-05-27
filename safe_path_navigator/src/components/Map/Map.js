import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, HeatmapLayer } from '@react-google-maps/api';
import { useMapContext } from '../../context/MapContext';
import { mockCrimeData, mockLightingData, mockEmergencyServices } from '../../utils/safetyUtils';
import './Map.css';

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Options for the Google Map
const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  scrollwheel: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

/**
 * Map component that displays Google Maps with routes and safety overlays
 * @PUBLIC_INTERFACE
 */
const Map = () => {
  const {
    origin,
    destination,
    selectedRoute,
    mapCenter,
    zoom,
    showCrimeOverlay,
    showLightingOverlay,
    showEmergencyServices
  } = useMapContext();

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['visualization', 'geocoding', 'places']
  });


  // Log any Google Maps loading errors to the console
  if (loadError) {
    console.error("Google Maps loading error:", loadError);
  }

  // Define origin marker options
  const originMarkerOptions = {
    icon: isLoaded && window.google?.maps?.SymbolPath ? {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    } : null
  };

  // Define destination marker options
  const destinationMarkerOptions = {
    icon: isLoaded && window.google?.maps?.SymbolPath ? {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: '#EA4335',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    } : null
  };
  
  // Define polyline options for the selected route
  const selectedRouteOptions = {
    strokeColor: '#4285F4',
    strokeOpacity: 1,
    strokeWeight: 5
  };
  
  // Define heatmap options for crime overlay
  const heatmapOptions = {
    radius: 20,
    opacity: 0.7,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ]
  };
  
  // Icon for emergency services
  const getEmergencyIcon = (type) => {
    if (!isLoaded || !window.google?.maps?.Size) {
      // Return basic icon without scaledSize if Google Maps isn't fully loaded
      switch (type) {
        case 'police':
          return { url: 'https://maps.google.com/mapfiles/ms/icons/police.png' };
        case 'hospital':
          return { url: 'https://maps.google.com/mapfiles/ms/icons/hospitals.png' };
        case 'fire_station':
          return { url: 'https://maps.google.com/mapfiles/ms/icons/firedept.png' };
        default:
          return null;
      }
    }
    
    // If Google Maps is loaded, include scaledSize
    switch (type) {
      case 'police':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/police.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'hospital':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/hospitals.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'fire_station':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/firedept.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      default:
        return null;
    }
  };
  
  // Icon for street lights
  const lightingIcon = isLoaded && window.google?.maps?.Size ? {
    url: 'https://maps.google.com/mapfiles/ms/icons/lightbulb.png',
    scaledSize: new window.google.maps.Size(24, 24)
  } : {
    url: 'https://maps.google.com/mapfiles/ms/icons/lightbulb.png'
  };

  // Render lighting data markers
  const renderLightingMarkers = () => {
    if (!showLightingOverlay || !window.google) return null;
    
    return mockLightingData.map((point, index) => (
      <Marker
        key={`light-${index}`}
        position={{ lat: point.lat, lng: point.lng }}
        icon={lightingIcon}
        title={`Street Light - ${point.level} brightness`}
      />
    ));
  };
  
  // Render emergency services markers
  const renderEmergencyServices = () => {
    if (!showEmergencyServices || !window.google) return null;
    
    return mockEmergencyServices.map((service, index) => (
      <Marker
        key={`emergency-${index}`}
        position={{ lat: service.lat, lng: service.lng }}
        icon={getEmergencyIcon(service.type)}
        title={service.name}
      />
    ));
  };

  // Display an error message if there's a loading error
  if (loadError) {
    return (
      <div className="map-loading" style={{ color: 'red', padding: '20px' }}>
        <h3>Error Loading Google Maps</h3>
        <p>There was an error loading Google Maps. This may be due to:</p>
        <ul>
          <li>Invalid API key</li>
          <li>API key restrictions (domain, IP, etc.)</li>
          <li>API key usage limits</li>
          <li>Network connectivity issues</li>
        </ul>
        <p>Please check your console for more details.</p>
      </div>
    );
  }

  return isLoaded ? (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={() => console.log("Google Map successfully loaded")}
      >
        {/* Display origin marker if available */}
        {origin && (
          <Marker
            position={origin}
            options={originMarkerOptions}
            title="Starting Point"
          />
        )}
        
        {/* Display destination marker if available */}
        {destination && (
          <Marker
            position={destination}
            options={destinationMarkerOptions}
            title="Destination"
          />
        )}
        
        {/* Display the selected route if available */}
        {selectedRoute && (
          <Polyline
            path={selectedRoute.path}
            options={selectedRouteOptions}
          />
        )}
        
        {/* Display crime heatmap overlay if enabled */}
        {showCrimeOverlay && window.google && (
          <HeatmapLayer
            data={mockCrimeData.map(point => new window.google.maps.LatLng(point.lat, point.lng))}
            options={heatmapOptions}
          />
        )}
        
        {/* Display lighting markers if enabled */}
        {renderLightingMarkers()}
        
        {/* Display emergency services if enabled */}
        {renderEmergencyServices()}
      </GoogleMap>
    </div>
  ) : (
    <div className="map-loading">Loading Map...</div>
  );
};

export default Map;
