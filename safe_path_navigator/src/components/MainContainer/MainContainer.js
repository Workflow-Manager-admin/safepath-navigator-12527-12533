import React, { useState } from 'react';
import { MapProvider } from '../../context/MapContext';
import Map from '../Map/Map';
import RoutePanel from '../RoutePanel/RoutePanel';
import PlacesPanel from '../PlacesPanel/PlacesPanel';
import { FaSearch, FaTimes, FaWalking, FaCar, FaBars, FaSpinner, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';
import { useMapContext } from '../../context/MapContext';
import { geocodeAddress } from '../../utils/geocodingService';
import './MainContainer.css';

/**
 * Search form component for origin and destination input
 */
const SearchForm = () => {
  const { setOriginLocation, setDestinationLocation, clearRoutes, origin, destination, setMapCenter } = useMapContext();
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  // Handle form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setGeocodeError(null);
    
    try {
      // Geocode origin address if provided
      if (originInput) {
        setIsGeocodingOrigin(true);
        console.log(`Attempting to geocode origin: "${originInput}"`);
        const originCoords = await geocodeAddress(originInput);
        setIsGeocodingOrigin(false);
        
        if (originCoords) {
          setOriginLocation(originCoords);
          setMapCenter(originCoords); // Update map center to the origin
          console.log("Origin geocoded successfully:", originCoords);
        } else {
          // Provide more helpful error message for specific addresses
          if (originInput.includes('Military Trail')) {
            setGeocodeError(
              `Could not find coordinates for "${originInput}". Try adding city and state (e.g., "5539 N Military Trail, West Palm Beach, FL")`
            );
          } else {
            setGeocodeError(`Could not find coordinates for origin address: "${originInput}"`);
          }
          return;
        }
      }
      
      // Geocode destination address if provided
      if (destinationInput) {
        setIsGeocodingDestination(true);
        console.log(`Attempting to geocode destination: "${destinationInput}"`);
        const destCoords = await geocodeAddress(destinationInput);
        setIsGeocodingDestination(false);
        
        if (destCoords) {
          setDestinationLocation(destCoords);
          if (!originInput) {
            setMapCenter(destCoords); // If no origin, center on destination
          }
          console.log("Destination geocoded successfully:", destCoords);
        } else {
          // Provide more helpful error message for specific addresses
          if (destinationInput.includes('Military Trail')) {
            setGeocodeError(
              `Could not find coordinates for "${destinationInput}". Try adding city and state (e.g., "5539 N Military Trail, West Palm Beach, FL")`
            );
          } else {
            setGeocodeError(`Could not find coordinates for destination address: "${destinationInput}"`);
          }
          return;
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodeError("An error occurred while geocoding the addresses. Please try again.");
      setIsGeocodingOrigin(false);
      setIsGeocodingDestination(false);
    }
  };

  // Clear all route data
  const handleClearSearch = () => {
    setOriginInput('');
    setDestinationInput('');
    clearRoutes();
    setGeocodeError(null);
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
            disabled={isGeocodingOrigin || isGeocodingDestination}
          />
          {isGeocodingOrigin ? (
            <span className="input-icon spinning">
              <FaSpinner />
            </span>
          ) : origin && (
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
            disabled={isGeocodingOrigin || isGeocodingDestination}
          />
          {isGeocodingDestination ? (
            <span className="input-icon spinning">
              <FaSpinner />
            </span>
          ) : destination && (
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
      
      {geocodeError && (
        <div className="geocode-error">
          <p>{geocodeError}</p>
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-search" 
          disabled={(!originInput && !destinationInput) || isGeocodingOrigin || isGeocodingDestination}
        >
          {(isGeocodingOrigin || isGeocodingDestination) ? <FaSpinner className="spinning" /> : <FaSearch />}
          {(isGeocodingOrigin || isGeocodingDestination) ? ' Searching...' : ' Find Routes'}
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
