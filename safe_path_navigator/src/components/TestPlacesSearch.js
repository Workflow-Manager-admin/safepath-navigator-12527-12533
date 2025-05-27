import React, { useState } from 'react';
import PlacesSearch, { extractAddressComponents } from './PlacesSearch';
import { FaInfoCircle, FaCheck } from 'react-icons/fa';

/**
 * Demo component for the PlacesSearch component
 * Shows how to use the PlacesSearch component and displays selected place information
 *
 * @PUBLIC_INTERFACE
 */
const TestPlacesSearch = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [addressComponents, setAddressComponents] = useState(null);

  // Handle place selection
  const handlePlaceSelect = (place, addressDetails) => {
    console.log('Selected place:', place);
    console.log('Address details:', addressDetails);
    setSelectedPlace(place);
    setAddressComponents(addressDetails);
  };

  return (
    <div className="test-places-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Google Places Autocomplete Demo</h2>
      
      <div className="api-info" style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> Using Google Places API
        </h3>
        <p>
          This component demonstrates the Google Places Autocomplete integration. 
          It supports address search with suggestions, maintains search history, 
          and extracts address components like country, state, and city.
        </p>
        <p>
          <strong>API Key:</strong> Uses <code>REACT_APP_GOOGLE_PLACES_API_KEY</code> environment variable 
          (falls back to <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> if not available).
        </p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <PlacesSearch 
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search for any global address"
          label="Address Search"
          id="demo-places-search"
          showHistory={true}
          maxHistoryItems={5}
        />
      </div>
      
      {selectedPlace && (
        <div className="selected-place-info" style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheck style={{ color: '#4CAF50' }} /> Selected Place Information
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Formatted Address:</strong>
            <p>{selectedPlace.formatted_address}</p>
          </div>
          
          {selectedPlace.geometry?.location && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Coordinates:</strong>
              <p>
                Latitude: {selectedPlace.geometry.location.lat()}, 
                Longitude: {selectedPlace.geometry.location.lng()}
              </p>
            </div>
          )}
          
          {addressComponents && (
            <div className="address-components">
              <strong>Address Components:</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Component</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>Country</td>
                    <td style={{ padding: '8px' }}>{addressComponents.country?.longName || 'N/A'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>State/Province</td>
                    <td style={{ padding: '8px' }}>{addressComponents.state?.longName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>City</td>
                    <td style={{ padding: '8px' }}>{addressComponents.city?.longName || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      <div className="usage-instructions" style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
        <h3>Component Usage</h3>
        <p>Here's how to incorporate this component into your React application:</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import PlacesSearch, { extractAddressComponents } from './components/PlacesSearch';

// In your component:
const MyComponent = () => {
  const handlePlaceSelect = (place, addressDetails) => {
    console.log('Selected place:', place);
    console.log('Address details:', addressDetails);
    // Use place.geometry.location.lat() and place.geometry.location.lng() for coordinates
    // Use addressDetails.country, addressDetails.state, and addressDetails.city
  };

  return (
    <PlacesSearch
      onPlaceSelect={handlePlaceSelect}
      placeholder="Enter an address"
      label="Location"
      showHistory={true}
    />
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default TestPlacesSearch;
