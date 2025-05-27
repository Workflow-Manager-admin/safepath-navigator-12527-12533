import React, { useState, useEffect } from 'react';
import { getCrimeStatsByCoordinates, getCrimeStatsByLocation, getSafetyRecommendations } from '../services/fbiCrimeDataService';

/**
 * TestFBIApi component demonstrates the integration of the FBI Crime Data API
 * It shows how to fetch and display crime data for a location
 * 
 * @PUBLIC_INTERFACE
 */
const TestFBIApi = () => {
  // State for crime data and UI controls
  const [crimeData, setCrimeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('coordinates'); // 'coordinates' or 'location'
  
  // State for form inputs
  const [coordinates, setCoordinates] = useState({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco
  const [location, setLocation] = useState({ state: 'CA', city: 'San Francisco' });
  
  // Handle input changes for coordinates
  const handleCoordinateChange = (e, field) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCoordinates(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Handle input changes for location
  const handleLocationChange = (e, field) => {
    setLocation(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  // Fetch crime data based on current search mode
  const fetchCrimeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (searchMode === 'coordinates') {
        data = await getCrimeStatsByCoordinates(coordinates.lat, coordinates.lng);
      } else {
        data = await getCrimeStatsByLocation(location.state, location.city);
      }
      
      if (data) {
        setCrimeData(data);
      } else {
        throw new Error('Failed to fetch crime data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching crime data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get safety color based on score
  const getSafetyColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green (safe)
    if (score >= 60) return '#FFC107'; // Yellow (moderate)
    return '#F44336'; // Red (unsafe)
  };
  
  // Show API key status for demonstration purposes
  const apiKeyStatus = () => {
    if (!process.env.REACT_APP_FBI_CRIME_DATA_API_KEY) {
      return (
        <div className="api-key-warning" style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '4px', marginBottom: '20px', color: '#d32f2f' }}>
          <h3>⚠️ Missing FBI Crime Data API Key</h3>
          <p>The REACT_APP_FBI_CRIME_DATA_API_KEY environment variable is not set.</p>
          <p>Create a .env file in the project root with your API key:</p>
          <pre>REACT_APP_FBI_CRIME_DATA_API_KEY=your_api_key_here</pre>
        </div>
      );
    }
    return (
      <div className="api-key-success" style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '20px', color: '#388e3c' }}>
        <h3>✅ FBI Crime Data API Key Configured</h3>
        <p>The API key is securely loaded from environment variables.</p>
      </div>
    );
  };

  return (
    <div className="fbi-api-test" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>FBI Crime Data API Integration Test</h2>
      {apiKeyStatus()}
      
      <div className="search-controls" style={{ marginBottom: '20px' }}>
        <div className="search-mode-toggle" style={{ marginBottom: '20px' }}>
          <label>
            <input 
              type="radio" 
              name="searchMode" 
              value="coordinates" 
              checked={searchMode === 'coordinates'} 
              onChange={() => setSearchMode('coordinates')} 
            /> Search by Coordinates
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input 
              type="radio" 
              name="searchMode" 
              value="location" 
              checked={searchMode === 'location'} 
              onChange={() => setSearchMode('location')} 
            /> Search by Location
          </label>
        </div>
        
        {searchMode === 'coordinates' ? (
          <div className="coordinate-inputs" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="latitude">Latitude:</label>
              <input 
                type="number" 
                id="latitude" 
                value={coordinates.lat} 
                onChange={(e) => handleCoordinateChange(e, 'lat')}
                step="0.0001"
                style={{ marginLeft: '5px', padding: '5px' }}
              />
            </div>
            <div>
              <label htmlFor="longitude">Longitude:</label>
              <input 
                type="number" 
                id="longitude" 
                value={coordinates.lng} 
                onChange={(e) => handleCoordinateChange(e, 'lng')}
                step="0.0001"
                style={{ marginLeft: '5px', padding: '5px' }}
              />
            </div>
          </div>
        ) : (
          <div className="location-inputs" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="state">State (abbr):</label>
              <input 
                type="text" 
                id="state" 
                value={location.state} 
                onChange={(e) => handleLocationChange(e, 'state')}
                maxLength="2"
                style={{ marginLeft: '5px', padding: '5px', width: '50px' }}
              />
            </div>
            <div>
              <label htmlFor="city">City:</label>
              <input 
                type="text" 
                id="city" 
                value={location.city} 
                onChange={(e) => handleLocationChange(e, 'city')}
                style={{ marginLeft: '5px', padding: '5px', width: '150px' }}
              />
            </div>
          </div>
        )}
        
        <button 
          onClick={fetchCrimeData} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#E87A41',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Loading...' : 'Fetch Crime Data'}
        </button>
      </div>
      
      {error && (
        <div className="error-message" style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '4px', marginBottom: '20px', color: '#d32f2f' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {crimeData && (
        <div className="crime-data-results">
          <h3>Crime Data Results</h3>
          
          <div className="data-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <h4>Location Information</h4>
            {searchMode === 'coordinates' ? (
              <p>Coordinates: {crimeData.coordinates.lat}, {crimeData.coordinates.lng}</p>
            ) : (
              <p>Location: {location.city}, {location.state}</p>
            )}
          </div>
          
          <div className="data-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <h4>Safety Score</h4>
            <div 
              className="safety-score" 
              style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: getSafetyColor(crimeData.safetyScore),
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                marginBottom: '15px'
              }}
            >
              {crimeData.safetyScore}
            </div>
            <p>Total Crime Rate: {crimeData.totalCrimeRate?.toFixed(2) || 'N/A'}</p>
          </div>
          
          <div className="data-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <h4>Crime Statistics</h4>
            {crimeData.crimeStats ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {Object.entries(crimeData.crimeStats).map(([key, value]) => (
                  <li key={key} style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{key.replace(/-/g, ' ')}: </span>
                    <span>{value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No detailed crime statistics available</p>
            )}
          </div>
          
          <div className="data-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <h4>Safety Recommendations</h4>
            <ul>
              {getSafetyRecommendations(crimeData).map((recommendation, index) => (
                <li key={index} style={{ margin: '8px 0' }}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="usage-instructions" style={{ marginTop: '30px', backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
        <h3>Component Usage</h3>
        <p>This component demonstrates the FBI Crime Data API integration using the fbiCrimeDataService.</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import TestFBIApi from './components/TestFBIApi';

function App() {
  return (
    <div className="app">
      <TestFBIApi />
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
};

export default TestFBIApi;
