import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import './Map.css';

/**
 * TestMap component demonstrates the integration of Google Maps with React
 * using @react-google-maps/api and secure environment variable handling.
 * 
 * @PUBLIC_INTERFACE
 */
const TestMap = () => {
  // Default center coordinates (San Francisco)
  const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
  };

  // State for the selected location and InfoWindow
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Map container style
  const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '8px'
  };
  
  // Map options for styling and behavior
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  };
  
  // Sample marker locations for demonstration
  const locations = [
    { id: 1, name: "Golden Gate Park", position: { lat: 37.7694, lng: -122.4862 }, description: "Large urban park with museums and gardens" },
    { id: 2, name: "Fisherman's Wharf", position: { lat: 37.8080, lng: -122.4177 }, description: "Popular waterfront area with restaurants and shops" },
    { id: 3, name: "Union Square", position: { lat: 37.7879, lng: -122.4074 }, description: "Central shopping and hotel district" }
  ];

  // Load the Google Maps JavaScript API using environment variable for the API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['visualization']
  });

  // Handle marker click to show InfoWindow
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };
  
  // Handle InfoWindow close
  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };
  
  // Show API key status for demonstration purposes
  const apiKeyStatus = () => {
    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      return (
        <div className="api-key-warning">
          <h3>⚠️ Missing Google Maps API Key</h3>
          <p>The REACT_APP_GOOGLE_MAPS_API_KEY environment variable is not set.</p>
          <p>Create a .env file in the project root with your API key:</p>
          <pre>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
        </div>
      );
    }
    return (
      <div className="api-key-success">
        <h3>✅ Google Maps API Key Configured</h3>
        <p>The API key is securely loaded from environment variables.</p>
      </div>
    );
  };

  // Display error message if there's a loading error
  if (loadError) {
    return (
      <div className="test-map-container">
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
        {apiKeyStatus()}
      </div>
    );
  }

  return (
    <div className="test-map-container">
      <h2>Google Maps Integration Test</h2>
      {apiKeyStatus()}
      
      {isLoaded ? (
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={13}
            options={mapOptions}
            onLoad={() => console.log("TestMap: Google Map successfully loaded")}
          >
            {/* Display sample markers */}
            {locations.map(location => (
              <Marker
                key={location.id}
                position={location.position}
                title={location.name}
                onClick={() => handleMarkerClick(location)}
              />
            ))}
            
            {/* Display info window for selected location */}
            {selectedLocation && (
              <InfoWindow
                position={selectedLocation.position}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="info-window">
                  <h3>{selectedLocation.name}</h3>
                  <p>{selectedLocation.description}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      ) : (
        <div className="map-loading">Loading Map...</div>
      )}
      
      <div className="usage-instructions">
        <h3>Component Usage</h3>
        <p>This component demonstrates the secure integration of Google Maps using environment variables for API keys.</p>
        <pre>{`import TestMap from './components/Map/TestMap';

function App() {
  return (
    <div className="app">
      <TestMap />
    </div>
  );
}`}</pre>
      </div>
    </div>
  );
};

export default TestMap;
