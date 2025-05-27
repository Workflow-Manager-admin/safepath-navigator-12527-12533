import React, { useState, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import PlacesSearch from '../PlacesSearch';
import { FaMapMarkerAlt, FaRoute, FaInfo, FaStar, FaPhone, FaGlobe, FaClock } from 'react-icons/fa';

/**
 * PlacesPanel component for SafePath Navigator
 * Provides place search functionality and displays place details
 * 
 * @PUBLIC_INTERFACE
 */
const PlacesPanel = () => {
  const { setMapCenter, setZoom, setOriginLocation, setDestinationLocation } = useMapContext();
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  // Reset details visibility when selected place changes
  useEffect(() => {
    if (selectedPlace) {
      setDetailsVisible(true);
    }
  }, [selectedPlace]);
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = (place) => {
    if (place && place.geometry && place.geometry.location) {
      // Update map center to the selected place
      const location = {
        lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
        lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
      };
      
      setMapCenter(location);
      setZoom(15); // Zoom in to show the place
    }
  };
  
  // Handle place search results
  const handlePlacesSearch = (results) => {
    // Could implement additional functionality here if needed
    console.log('Places search complete:', results.length, 'results found');
  };
  
  // Handle selection of a place from search results
  const handlePlaceResultSelect = (place) => {
    if (place) {
      setSelectedPlace(place);
      
      // Update map center to the selected place
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
          lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
        };
        
        setMapCenter(location);
        setZoom(16); // Zoom in more to show place details
      }
    }
  };
  
  // Set this place as origin for route planning
  const setAsOrigin = () => {
    if (selectedPlace && selectedPlace.geometry && selectedPlace.geometry.location) {
      const location = {
        lat: typeof selectedPlace.geometry.location.lat === 'function' ? selectedPlace.geometry.location.lat() : selectedPlace.geometry.location.lat,
        lng: typeof selectedPlace.geometry.location.lng === 'function' ? selectedPlace.geometry.location.lng() : selectedPlace.geometry.location.lng
      };
      
      setOriginLocation(location);
    }
  };
  
  // Set this place as destination for route planning
  const setAsDestination = () => {
    if (selectedPlace && selectedPlace.geometry && selectedPlace.geometry.location) {
      const location = {
        lat: typeof selectedPlace.geometry.location.lat === 'function' ? selectedPlace.geometry.location.lat() : selectedPlace.geometry.location.lat,
        lng: typeof selectedPlace.geometry.location.lng === 'function' ? selectedPlace.geometry.location.lng() : selectedPlace.geometry.location.lng
      };
      
      setDestinationLocation(location);
    }
  };
  
  // Format opening hours for display
  const formatOpeningHours = (openingHours) => {
    if (!openingHours || !openingHours.weekday_text) {
      return 'Hours not available';
    }
    
    return openingHours.weekday_text.map((day, index) => (
      <div key={index} className="opening-hours-day">{day}</div>
    ));
  };
  
  return (
    <div className="places-panel">
      <div className="panel-header">
        <h2>Find Places</h2>
      </div>
      
      <div className="panel-content">
        <PlacesSearch 
          onPlaceSelect={handlePlaceSelect}
          onPlacesSearch={handlePlacesSearch}
          onPlaceResultSelect={handlePlaceResultSelect}
          placeholder="Search for places"
          label="Find cafes, restaurants, etc."
          showHistory={true}
          maxHistoryItems={5}
          searchRadius={2000}
          searchButtonText="Search This Area"
        />
        
        {/* Place details section */}
        {selectedPlace && detailsVisible && (
          <div className="place-details">
            <div className="place-details-header">
              <h3>{selectedPlace.name}</h3>
              <button 
                className="close-details" 
                onClick={() => setDetailsVisible(false)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            
            <div className="place-details-content">
              {/* Place address */}
              <div className="detail-section">
                <div className="detail-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="detail-text">
                  {selectedPlace.vicinity || selectedPlace.formatted_address || 'Address not available'}
                </div>
              </div>
              
              {/* Place rating */}
              {selectedPlace.rating !== undefined && (
                <div className="detail-section">
                  <div className="detail-icon">
                    <FaStar />
                  </div>
                  <div className="detail-text">
                    {selectedPlace.rating.toFixed(1)} / 5
                    {selectedPlace.user_ratings_total && (
                      <span className="rating-count"> ({selectedPlace.user_ratings_total} reviews)</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Phone number */}
              {selectedPlace.formatted_phone_number && (
                <div className="detail-section">
                  <div className="detail-icon">
                    <FaPhone />
                  </div>
                  <div className="detail-text">
                    {selectedPlace.formatted_phone_number}
                  </div>
                </div>
              )}
              
              {/* Website */}
              {selectedPlace.website && (
                <div className="detail-section">
                  <div className="detail-icon">
                    <FaGlobe />
                  </div>
                  <div className="detail-text">
                    <a 
                      href={selectedPlace.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {selectedPlace.website.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Opening hours */}
              {selectedPlace.opening_hours && (
                <div className="detail-section">
                  <div className="detail-icon">
                    <FaClock />
                  </div>
                  <div className="detail-text">
                    <div className="opening-status">
                      {selectedPlace.opening_hours.open_now 
                        ? <span className="status-open">Open now</span> 
                        : <span className="status-closed">Closed now</span>
                      }
                    </div>
                    <div className="opening-hours-toggle" onClick={(e) => {
                      e.currentTarget.nextElementSibling.classList.toggle('visible');
                    }}>
                      See hours
                    </div>
                    <div className="opening-hours-list">
                      {formatOpeningHours(selectedPlace.opening_hours)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Place type */}
              {selectedPlace.types && selectedPlace.types.length > 0 && (
                <div className="detail-section">
                  <div className="detail-icon">
                    <FaInfo />
                  </div>
                  <div className="detail-text">
                    {selectedPlace.types
                      .filter(type => !['point_of_interest', 'establishment'].includes(type))
                      .map(type => type.replace(/_/g, ' '))
                      .map(type => type.charAt(0).toUpperCase() + type.slice(1))
                      .join(', ')}
                  </div>
                </div>
              )}
              
              {/* Route planning actions */}
              <div className="place-actions">
                <button className="action-button start-button" onClick={setAsOrigin}>
                  <FaMapMarkerAlt /> Set as Starting Point
                </button>
                <button className="action-button destination-button" onClick={setAsDestination}>
                  <FaRoute /> Set as Destination
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .places-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: white;
        }
        
        .panel-header {
          padding: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .panel-header h2 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }
        
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .place-details {
          background-color: #f8f9fe;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: hidden;
        }
        
        .place-details-header {
          padding: 12px 16px;
          background-color: #4285F4;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .place-details-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .close-details {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
        }
        
        .place-details-content {
          padding: 16px;
        }
        
        .detail-section {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        
        .detail-icon {
          color: #5f6368;
          margin-right: 12px;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .detail-text {
          flex: 1;
          color: #202124;
          font-size: 0.95rem;
        }
        
        .rating-count {
          color: #5f6368;
          font-size: 0.9rem;
        }
        
        .website-link {
          color: #1a73e8;
          text-decoration: none;
        }
        
        .website-link:hover {
          text-decoration: underline;
        }
        
        .opening-status {
          margin-bottom: 4px;
        }
        
        .status-open {
          color: #34a853;
          font-weight: 500;
        }
        
        .status-closed {
          color: #ea4335;
          font-weight: 500;
        }
        
        .opening-hours-toggle {
          font-size: 0.9rem;
          color: #1a73e8;
          cursor: pointer;
          display: inline-block;
        }
        
        .opening-hours-toggle:hover {
          text-decoration: underline;
        }
        
        .opening-hours-list {
          margin-top: 8px;
          display: none;
        }
        
        .opening-hours-list.visible {
          display: block;
        }
        
        .opening-hours-day {
          font-size: 0.9rem;
          margin-bottom: 2px;
        }
        
        .place-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-direction: column;
        }
        
        .action-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .start-button {
          background-color: #4285F4;
          color: white;
        }
        
        .destination-button {
          background-color: #E87A41;
          color: white;
        }
        
        .start-button:hover {
          background-color: #3367D6;
        }
        
        .destination-button:hover {
          background-color: #D35F30;
        }
      `}</style>
    </div>
  );
};

export default PlacesPanel;
