import React, { useState } from 'react';
import { MapProvider } from '../../context/MapContext';
import Map from '../Map/Map';
import RoutePanel from '../RoutePanel/RoutePanel';
import { FaSearch, FaTimes, FaWalking, FaCar, FaBars } from 'react-icons/fa';
import { useMapContext } from '../../context/MapContext';
import './MainContainer.css';

/**
 * Search form component for origin and destination input
 */
const SearchForm = () => {
  const { setOriginLocation, setDestinationLocation, clearRoutes, origin, destination } = useMapContext();
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  // Handle form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would geocode the addresses
    // For demo, we'll use mock coordinates
    if (originInput) {
      setOriginLocation({
        lat: 37.7749,
        lng: -122.4194
      });
    }
    
    if (destinationInput) {
      setDestinationLocation({
        lat: 37.7833,
        lng: -122.4167
      });
    }
  };

  // Clear all route data
  const handleClearSearch = () => {
    setOriginInput('');
    setDestinationInput('');
    clearRoutes();
  };

  return (
    <form className="search-form" onSubmit={handleSearchSubmit}>
      <div className="form-group">
        <label htmlFor="origin">Start:</label>
        <div className="input-wrapper">
          <input
            type="text"
            id="origin"
            placeholder="Enter starting point"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
          />
          {origin && (
            <button 
              type="button" 
              className="clear-input"
              onClick={() => {
                setOriginInput('');
                setOriginLocation(null);
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="destination">End:</label>
        <div className="input-wrapper">
          <input
            type="text"
            id="destination"
            placeholder="Enter destination"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
          />
          {destination && (
            <button 
              type="button" 
              className="clear-input"
              onClick={() => {
                setDestinationInput('');
                setDestinationLocation(null);
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn-search" disabled={!originInput || !destinationInput}>
          <FaSearch /> Find Routes
        </button>
        
        {(origin || destination) && (
          <button type="button" className="btn-clear" onClick={handleClearSearch}>
            <FaTimes /> Clear
          </button>
        )}
      </div>
      
      <div className="transport-mode">
        <button type="button" className="btn-mode active">
          <FaWalking /> Walking
        </button>
        <button type="button" className="btn-mode">
          <FaCar /> Driving
        </button>
      </div>
    </form>
  );
};

/**
 * MainContainer is the primary component for SafePath Navigator
 * It integrates the map, route panel, and search functionality
 * @PUBLIC_INTERFACE
 */
const MainContainer = () => {
  const [showPanel, setShowPanel] = useState(true);
  
  return (
    <MapProvider>
      <div className="safe-path-container">
        <header className="app-header">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            SafePath Navigator
          </div>
          <button className="toggle-panel" onClick={() => setShowPanel(!showPanel)}>
            <FaBars />
          </button>
        </header>
        
        <div className="app-content">
          <aside className={`side-panel ${showPanel ? 'visible' : 'hidden'}`}>
            <SearchForm />
            <RoutePanel />
          </aside>
          
          <main className="map-wrapper">
            <Map />
          </main>
        </div>
      </div>
    </MapProvider>
  );
};

export default MainContainer;
