import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { FaSearch, FaTimes, FaHistory, FaMapMarkerAlt, FaStar, FaSpinner, FaAngleRight, 
         FaGlobe, FaPhone, FaClock, FaCamera, FaComment, FaExternalLinkAlt } from 'react-icons/fa';
import '../components/MainContainer/MainContainer.css';

// Use REACT_APP_GOOGLE_PLACES_API_KEY if available, otherwise fall back to REACT_APP_GOOGLE_MAPS_API_KEY
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Utility function to extract address components from Google Places result
 * 
 * @PUBLIC_INTERFACE
 * @param {Array} addressComponents - The address_components array from Google Places result
 * @returns {Object} Object containing country, state, and city information
 */
export const extractAddressComponents = (addressComponents) => {
  if (!addressComponents || !Array.isArray(addressComponents)) {
    return { country: null, state: null, city: null };
  }

  let country = null;
  let state = null;
  let city = null;

  // Loop through address components to extract relevant information
  addressComponents.forEach(component => {
    const types = component.types;

    if (types.includes('country')) {
      country = {
        longName: component.long_name,
        shortName: component.short_name
      };
    } else if (types.includes('administrative_area_level_1')) {
      state = {
        longName: component.long_name,
        shortName: component.short_name
      };
    } else if (types.includes('locality') || types.includes('postal_town')) {
      city = {
        longName: component.long_name,
        shortName: component.short_name
      };
    }
  });

  return { country, state, city };
};

/**
 * Format a distance in meters to a human-readable string
 * 
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }
};

/**
 * A React component that implements Google Places Autocomplete and Places Service
 * to search for places and display search results
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} props - Component props
 * @param {Function} props.onPlaceSelect - Callback function when a place is selected from autocomplete
 * @param {Function} props.onPlaceResultSelect - Callback function when a place is selected from search results
 * @param {Function} props.onPlacesSearch - Callback function when places search is performed
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.id - ID for the input element
 * @param {string} props.label - Label for the input
 * @param {boolean} props.showHistory - Whether to show search history
 * @param {number} props.maxHistoryItems - Maximum number of history items to show
 * @param {number} props.searchRadius - Radius in meters for nearby search (default: 5000)
 * @param {string} props.searchButtonText - Text for the search button
 * @returns {JSX.Element} The PlacesSearch component
 */
const PlacesSearch = ({ 
  onPlaceSelect,
  onPlaceResultSelect,
  onPlacesSearch,
  placeholder = "Enter a location",
  id = "places-search",
  label = "Search",
  showHistory = true,
  maxHistoryItems = 5,
  searchRadius = 5000,
  searchButtonText = "Search This Area"
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  // Places service states
  const [placesService, setPlacesService] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const historyDropdownRef = useRef(null);
  const resultsRef = useRef(null);
  const mapRef = useRef(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('placesSearchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading search history from localStorage:', error);
    }

    // Check if Google Maps API is loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      
      // Initialize Places Service if maps API is loaded
      if (window.google.maps.places) {
        // We need a map instance to create a PlacesService
        // This map won't be displayed, it's just for the Places API
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: 0, lng: 0 },
          zoom: 1
        });
        mapRef.current = map;
        
        // Create the Places Service
        const service = new window.google.maps.places.PlacesService(map);
        setPlacesService(service);
      }
    } else {
      // If not loaded, we set error and component will display appropriate message
      setLoadError('Google Maps API not loaded');
      console.log('Using API key from:', process.env.REACT_APP_GOOGLE_PLACES_API_KEY ? 'REACT_APP_GOOGLE_PLACES_API_KEY' : 'REACT_APP_GOOGLE_MAPS_API_KEY');
    }

    // Add click event listener to close history dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowHistoryDropdown(false);
      }
      
      // Also close results if clicking outside results and not on input
      if (resultsRef.current && !resultsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        // Keep results open if we're clicking on the input
        if (!inputRef.current.contains(event.target)) {
          setShowResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('placesSearchHistory', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history to localStorage:', error);
    }
  }, [searchHistory]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.formatted_address) {
      setSearchInput(place.formatted_address);
      
      // Extract address components
      const addressDetails = extractAddressComponents(place.address_components);
      
      // Add to search history
      const historyItem = {
        id: Date.now(),
        placeId: place.place_id,
        address: place.formatted_address,
        location: place.geometry?.location ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        } : null,
        country: addressDetails.country?.longName,
        state: addressDetails.state?.longName,
        city: addressDetails.city?.longName,
        timestamp: new Date().toISOString()
      };
      
      // Add to history, avoid duplicates by address
      setSearchHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(
          item => item.address !== historyItem.address
        );
        return [historyItem, ...filteredHistory].slice(0, maxHistoryItems);
      });
      
      // Hide dropdown
      setShowHistoryDropdown(false);
      
      // Store location for later search
      if (place.geometry?.location) {
        setSearchLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
      
      // Call the parent's onPlaceSelect callback
      if (onPlaceSelect && typeof onPlaceSelect === 'function') {
        onPlaceSelect(place, addressDetails);
      }
      
      // Reset search results
      setSearchResults([]);
      setShowResults(false);
    }
  }, [onPlaceSelect, maxHistoryItems]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Clear search input
  const handleClearInput = () => {
    setSearchInput('');
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Focus on input and show history dropdown
  const handleInputFocus = () => {
    if (showHistory && searchHistory.length > 0) {
      setShowHistoryDropdown(true);
      setShowResults(false);
    }
  };

  // Select item from history
  const handleHistoryItemClick = (historyItem) => {
    setSearchInput(historyItem.address);
    setShowHistoryDropdown(false);
    
    if (historyItem.location) {
      setSearchLocation(historyItem.location);
    }
    
    if (onPlaceSelect && typeof onPlaceSelect === 'function') {
      // Create a simplified place object for history items
      const place = {
        formatted_address: historyItem.address,
        place_id: historyItem.placeId,
        geometry: historyItem.location ? {
          location: {
            lat: () => historyItem.location.lat,
            lng: () => historyItem.location.lng
          }
        } : null,
        address_components: []
      };
      
      // Create addressDetails from history item
      const addressDetails = {
        country: historyItem.country ? { longName: historyItem.country } : null,
        state: historyItem.state ? { longName: historyItem.state } : null,
        city: historyItem.city ? { longName: historyItem.city } : null
      };
      
      onPlaceSelect(place, addressDetails);
    }
  };

  // Remove item from history
  const handleRemoveHistoryItem = (e, itemId) => {
    e.stopPropagation();
    setSearchHistory(prevHistory => 
      prevHistory.filter(item => item.id !== itemId)
    );
  };
  
  // Search for places nearby the selected location
  const handlePlacesSearch = () => {
    if (!placesService || !searchLocation) return;
    
    setIsSearching(true);
    setShowResults(true);
    setShowHistoryDropdown(false);
    
    // Create request for nearby search
    const request = {
      location: new window.google.maps.LatLng(searchLocation.lat, searchLocation.lng),
      radius: searchRadius,
      type: ['establishment'] // Search for all establishment types
    };
    
    // If there's text input, use text search instead
    if (searchInput.trim()) {
      placesService.textSearch({
        query: searchInput,
        location: new window.google.maps.LatLng(searchLocation.lat, searchLocation.lng),
        radius: searchRadius
      }, handlePlacesResults);
    } else {
      placesService.nearbySearch(request, handlePlacesResults);
    }
  };
  
  // Handle places search results
  const handlePlacesResults = (results, status) => {
    setIsSearching(false);
    
    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
      setSearchResults(results);
      
      // Call the parent's onPlacesSearch callback if provided
      if (onPlacesSearch && typeof onPlacesSearch === 'function') {
        onPlacesSearch(results);
      }
    } else {
      console.error('Places search failed:', status);
      setSearchResults([]);
    }
  };
  
  // Handle selection of a place from search results
  const handlePlaceResultClick = (placeResult) => {
    setSelectedResult(placeResult);
    
    // If we have a callback for result selection, call it
    if (onPlaceResultSelect && typeof onPlaceResultSelect === 'function') {
      onPlaceResultSelect(placeResult);
    }
    
    // Optionally fetch more details about the place
    if (placesService && placeResult.place_id) {
      placesService.getDetails({
        placeId: placeResult.place_id,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry', 'rating', 
                 'user_ratings_total', 'website', 'photos', 'opening_hours', 'reviews',
                 'address_components']
      }, (placeDetails, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // If we have a callback for result selection with details, call it
          if (onPlaceResultSelect && typeof onPlaceResultSelect === 'function') {
            const addressDetails = extractAddressComponents(placeDetails.address_components);
            onPlaceResultSelect(placeDetails, addressDetails);
          }
        }
      });
    }
  };

  // Render error if Google Maps API is not loaded
  if (loadError) {
    return (
      <div className="form-group">
        {label && <label htmlFor={id}>{label}</label>}
        <div className="input-wrapper">
          <input
            type="text"
            id={id}
            placeholder={placeholder}
            disabled
          />
          <div className="geocode-error">
            <p>Google Maps API not loaded. Places search is unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group places-search-container">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="input-wrapper" ref={inputRef}>
        {isLoaded ? (
          <Autocomplete
            onLoad={autocomplete => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handlePlaceSelect}
            restrictions={{ country: [] }} // No country restrictions for global search
            options={{
              types: ['geocode', 'establishment'], // Allow both addresses and places
              fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
            }}
          >
            <input
              type="text"
              id={id}
              placeholder={placeholder}
              value={searchInput}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="places-search-input"
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            id={id}
            placeholder="Loading Places search..."
            disabled
          />
        )}
        
        {searchInput ? (
          <button 
            type="button" 
            className="clear-input"
            onClick={handleClearInput}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        ) : (
          <span className="input-icon">
            <FaSearch />
          </span>
        )}
      </div>
      
      {/* Search button */}
      {isLoaded && searchLocation && (
        <div className="places-search-actions">
          <button 
            className="btn-search-places" 
            onClick={handlePlacesSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <FaSpinner className="spinning" /> Searching...
              </>
            ) : (
              <>
                <FaSearch /> {searchButtonText}
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Search history dropdown */}
      {showHistory && showHistoryDropdown && searchHistory.length > 0 && (
        <div className="search-history-dropdown" ref={historyDropdownRef}>
          <div className="search-history-header">
            <FaHistory /> Recent searches
          </div>
          <ul className="search-history-list">
            {searchHistory.map(item => (
              <li 
                key={item.id} 
                className="search-history-item"
                onClick={() => handleHistoryItemClick(item)}
              >
                <div className="history-item-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="history-item-content">
                  <div className="history-item-address">{item.address}</div>
                  {item.city && (
                    <div className="history-item-details">
                      {[item.city, item.state?.longName, item.country?.longName]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
                <button 
                  className="history-item-remove"
                  onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                  aria-label="Remove from history"
                >
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Places search results */}
      {showResults && (
        <div className="places-results-container" ref={resultsRef}>
          <div className="places-results-header">
            <h3>Places nearby</h3>
            {!isSearching && searchResults.length > 0 && (
              <span className="results-count">{searchResults.length} results found</span>
            )}
          </div>
          
          {isSearching ? (
            <div className="places-loading">
              <FaSpinner className="spinning" />
              <p>Searching for places...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="places-results-list">
              {searchResults.map(place => (
                <li 
                  key={place.place_id} 
                  className={`place-result-item ${selectedResult?.place_id === place.place_id ? 'selected' : ''}`}
                  onClick={() => handlePlaceResultClick(place)}
                >
                  <div className="place-info">
                    <h4 className="place-name">{place.name}</h4>
                    
                    {place.vicinity && (
                      <div className="place-vicinity">{place.vicinity}</div>
                    )}
                    
                    {place.formatted_address && !place.vicinity && (
                      <div className="place-vicinity">{place.formatted_address}</div>
                    )}
                    
                    <div className="place-details">
                      {place.rating && (
                        <div className="place-rating">
                          <span className="stars">
                            <FaStar />
                          </span>
                          {place.rating.toFixed(1)}
                          {place.user_ratings_total && (
                            <span className="rating-count">
                              ({place.user_ratings_total})
                            </span>
                          )}
                        </div>
                      )}
                      
                      {place.distance && (
                        <div className="place-distance">
                          {formatDistance(place.distance)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="place-action">
                    <FaAngleRight />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="places-no-results">
              <p>No places found nearby. Try a different location or search terms.</p>
            </div>
          )}
        </div>
      )}
      
      <style jsx="true">{`
        .places-search-container {
          position: relative;
        }
        
        .places-search-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .places-search-actions {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-search-places {
          background-color: #4285F4;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s;
        }
        
        .btn-search-places:hover {
          background-color: #3367D6;
        }
        
        .btn-search-places:disabled {
          background-color: #A8C7FA;
          cursor: not-allowed;
        }
        
        .places-results-container {
          margin-top: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 5;
        }
        
        .places-results-header {
          padding: 12px 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .places-results-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .results-count {
          font-size: 0.8rem;
          color: #666;
        }
        
        .places-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 0;
          color: #666;
        }
        
        .places-loading .spinning {
          font-size: 1.5rem;
          margin-bottom: 8px;
          animation: spin 1s linear infinite;
        }
        
        .places-no-results {
          padding: 24px 16px;
          text-align: center;
          color: #666;
        }
        
        .places-results-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .place-result-item {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .place-result-item:hover {
          background-color: #f5f5f5;
        }
        
        .place-result-item.selected {
          background-color: #e8f0fe;
        }
        
        .place-info {
          flex: 1;
        }
        
        .place-name {
          margin: 0 0 4px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #333;
        }
        
        .place-vicinity {
          font-size: 0.85rem;
          color: #555;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }
        
        .place-details {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        
        .place-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #666;
        }
        
        .stars {
          color: #FBBC04;
          display: flex;
          align-items: center;
        }
        
        .rating-count {
          color: #999;
          margin-left: 2px;
        }
        
        .place-distance {
          font-size: 0.8rem;
          color: #666;
        }
        
        .place-action {
          color: #ccc;
          margin-left: 8px;
        }
        
        .place-result-item:hover .place-action {
          color: #666;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .search-history-dropdown {
          position: absolute;
          width: 100%;
          max-height: 300px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 0 0 4px 4px;
          z-index: 10;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .search-history-header {
          padding: 8px 12px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .search-history-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .search-history-item {
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #eee;
        }
        
        .search-history-item:hover {
          background-color: #f5f5f5;
        }
        
        .history-item-icon {
          color: #666;
          margin-right: 10px;
          display: flex;
          align-items: center;
        }
        
        .history-item-content {
          flex: 1;
        }
        
        .history-item-address {
          font-size: 0.95rem;
          margin-bottom: 2px;
        }
        
        .history-item-details {
          font-size: 0.8rem;
          color: #666;
        }
        
        .history-item-remove {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          visibility: hidden;
        }
        
        .search-history-item:hover .history-item-remove {
          visibility: visible;
        }
        
        .history-item-remove:hover {
          color: #E87A41;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PlacesSearch;
