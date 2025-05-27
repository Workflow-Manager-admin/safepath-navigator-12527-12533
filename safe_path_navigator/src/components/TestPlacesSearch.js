import React, { useState } from 'react';
import PlacesSearch, { extractAddressComponents } from './PlacesSearch';
import { FaInfoCircle, FaCheck, FaMapMarkedAlt, FaList, FaInfoCircle as FaInfo } from 'react-icons/fa';

/**
 * Demo component for the PlacesSearch component
 * Shows how to use the PlacesSearch component and displays selected place information
 *
 * @PUBLIC_INTERFACE
 */
const TestPlacesSearch = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [addressComponents, setAddressComponents] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultsMode, setResultsMode] = useState(false);

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place, addressDetails) => {
    console.log('Selected place from autocomplete:', place);
    console.log('Address details:', addressDetails);
    setSelectedPlace(place);
    setAddressComponents(addressDetails);
    setResultsMode(false);
  };
  
  // Handle places search results
  const handlePlacesSearch = (results) => {
    console.log('Places search results:', results);
    setSearchResults(results);
    setResultsMode(true);
  };
  
  // Handle selection of a place from search results
  const handlePlaceResultSelect = (place, addressDetails) => {
    console.log('Selected place from results:', place);
    if (addressDetails) {
      console.log('Place details address components:', addressDetails);
    }
    setSelectedResult(place);
    // Also update the main selected place for consistency in UI display
    setSelectedPlace(place);
    if (addressDetails) {
      setAddressComponents(addressDetails);
    }
  };

  return (
    <div className="test-places-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Google Places Search Demo</h2>
      
      <div className="api-info" style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> Using Google Places API
        </h3>
        <p>
          This component demonstrates the Google Places Autocomplete and Places Service integration. 
          It supports address search with suggestions, maintains search history, 
          and allows searching for places near a location.
        </p>
        <p>
          <strong>Features:</strong>
        </p>
        <ul>
          <li>Autocomplete for addresses and places</li>
          <li>Search history management</li>
          <li>Nearby places search</li>
          <li>Text-based places search</li>
          <li>Place details fetching</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <PlacesSearch 
          onPlaceSelect={handlePlaceSelect}
          onPlacesSearch={handlePlacesSearch}
          onPlaceResultSelect={handlePlaceResultSelect}
          placeholder="Search for any address or place"
          label="Location Search"
          id="demo-places-search"
          showHistory={true}
          maxHistoryItems={5}
          searchRadius={5000}
          searchButtonText="Search This Area"
        />
      </div>
      
      {/* Display mode toggle between selected place and search results */}
      {(selectedPlace || searchResults.length > 0) && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setResultsMode(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: !resultsMode ? '#4285F4' : '#f1f1f1',
              color: !resultsMode ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaMapMarkedAlt /> Selected Place
          </button>
          <button 
            onClick={() => setResultsMode(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: resultsMode ? '#4285F4' : '#f1f1f1',
              color: resultsMode ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={searchResults.length === 0}
          >
            <FaList /> Search Results ({searchResults.length})
          </button>
        </div>
      )}
      
      {/* Show selected place details */}
      {!resultsMode && selectedPlace && (
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
            <strong>Name:</strong>
            <p>{selectedPlace.name || selectedPlace.formatted_address}</p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Address:</strong>
            <p>{selectedPlace.formatted_address || selectedPlace.vicinity || 'N/A'}</p>
          </div>
          
          {selectedPlace.geometry?.location && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Coordinates:</strong>
              <p>
                Latitude: {typeof selectedPlace.geometry.location.lat === 'function' 
                  ? selectedPlace.geometry.location.lat() 
                  : selectedPlace.geometry.location.lat}, 
                Longitude: {typeof selectedPlace.geometry.location.lng === 'function'
                  ? selectedPlace.geometry.location.lng()
                  : selectedPlace.geometry.location.lng}
              </p>
            </div>
          )}
          
          {selectedPlace.rating && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Rating:</strong>
              <p>{selectedPlace.rating} / 5 ({selectedPlace.user_ratings_total || 0} reviews)</p>
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
      
      {/* Show search results */}
      {resultsMode && searchResults.length > 0 && (
        <div className="search-results-container" style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaList /> Places Search Results
          </h3>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e0e0e0' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Rating</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(result => (
                    <tr 
                      key={result.place_id} 
                      style={{ 
                        borderBottom: '1px solid #ddd',
                        backgroundColor: selectedResult?.place_id === result.place_id ? '#e8f0fe' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePlaceResultSelect(result)}
                    >
                      <td style={{ padding: '8px' }}>{result.name}</td>
                      <td style={{ padding: '8px' }}>
                        {result.rating 
                          ? `${result.rating.toFixed(1)} (${result.user_ratings_total || 0})`
                          : 'N/A'
                        }
                      </td>
                      <td style={{ padding: '8px' }}>{result.vicinity || result.formatted_address || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {selectedResult && (
              <div style={{ flex: '1', backgroundColor: 'white', padding: '15px', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaInfo /> Selected Result Details
                </h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Name:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedResult.name}</p>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Address:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedResult.vicinity || selectedResult.formatted_address || 'N/A'}</p>
                </div>
                
                {selectedResult.rating !== undefined && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Rating:</strong>
                    <p style={{ margin: '5px 0' }}>
                      {selectedResult.rating.toFixed(1)} / 5 
                      {selectedResult.user_ratings_total ? ` (${selectedResult.user_ratings_total} reviews)` : ''}
                    </p>
                  </div>
                )}
                
                {selectedResult.types && selectedResult.types.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Types:</strong>
                    <p style={{ margin: '5px 0' }}>{selectedResult.types.join(', ')}</p>
                  </div>
                )}
                
                {selectedResult.price_level !== undefined && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Price Level:</strong>
                    <p style={{ margin: '5px 0' }}>
                      {'$'.repeat(selectedResult.price_level) || 'N/A'}
                    </p>
                  </div>
                )}
                
                {selectedResult.place_id && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Place ID:</strong>
                    <p style={{ margin: '5px 0', wordBreak: 'break-all' }}>{selectedResult.place_id}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="usage-instructions" style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
        <h3>Enhanced PlacesSearch Component Usage</h3>
        <p>Here's how to incorporate the enhanced PlacesSearch component with Places Service:</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import PlacesSearch from './components/PlacesSearch';

// In your component:
const MyComponent = () => {
  // For autocomplete selection
  const handlePlaceSelect = (place, addressDetails) => {
    console.log('Selected place:', place);
    // Use place data as needed
  };
  
  // For places search results
  const handlePlacesSearch = (results) => {
    console.log('Places search results:', results);
    // Process search results
  };
  
  // For selection of a place from results list
  const handlePlaceResultSelect = (place, addressDetails) => {
    console.log('Selected place from results:', place);
    // Use selected place data
  };

  return (
    <PlacesSearch
      onPlaceSelect={handlePlaceSelect}
      onPlacesSearch={handlePlacesSearch}
      onPlaceResultSelect={handlePlaceResultSelect}
      placeholder="Search for places"
      label="Location"
      showHistory={true}
      searchRadius={5000}
      searchButtonText="Find Places Nearby"
    />
  );
};`}</pre>
      </div>
    </div>
  );
};

export default TestPlacesSearch;
