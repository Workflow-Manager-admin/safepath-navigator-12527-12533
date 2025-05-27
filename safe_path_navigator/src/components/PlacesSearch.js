import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { FaSearch, FaTimes, FaHistory, FaMapMarkerAlt } from 'react-icons/fa';
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
 * A React component that implements Google Places Autocomplete with search history
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} props - Component props
 * @param {Function} props.onPlaceSelect - Callback function when a place is selected
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.id - ID for the input element
 * @param {string} props.label - Label for the input
 * @param {boolean} props.showHistory - Whether to show search history
 * @param {number} props.maxHistoryItems - Maximum number of history items to show
 * @returns {JSX.Element} The PlacesSearch component
 */
const PlacesSearch = ({ 
  onPlaceSelect,
  placeholder = "Enter a location",
  id = "places-search",
  label = "Search",
  showHistory = true,
  maxHistoryItems = 5
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const historyDropdownRef = useRef(null);

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
      
      // Call the parent's onPlaceSelect callback
      if (onPlaceSelect && typeof onPlaceSelect === 'function') {
        onPlaceSelect(place, addressDetails);
      }
    }
  }, [onPlaceSelect, maxHistoryItems]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Clear search input
  const handleClearInput = () => {
    setSearchInput('');
    inputRef.current?.focus();
  };

  // Focus on input and show history dropdown
  const handleInputFocus = () => {
    if (showHistory && searchHistory.length > 0) {
      setShowHistoryDropdown(true);
    }
  };

  // Select item from history
  const handleHistoryItemClick = (historyItem) => {
    setSearchInput(historyItem.address);
    setShowHistoryDropdown(false);
    
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
    <div className="form-group">
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
      
      <style jsx="true">{`
        .places-search-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
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
      `}</style>
    </div>
  );
};

export default PlacesSearch;
