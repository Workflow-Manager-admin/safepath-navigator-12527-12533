import React, { useState } from 'react';
import PlacesSearch from '../PlacesSearch';
import { useMapContext } from '../../context/MapContext';
import './PlacesPanel.css';

/**
 * PlacesPanel component that provides place search functionality and displays details
 * 
 * @PUBLIC_INTERFACE
 * @returns {JSX.Element} PlacesPanel component
 */
const PlacesPanel = () => {
  const {
    map,
    selectedPlace,
    setSelectedPlace,
    placeDetails,
    searchResults,
    handleSearchComplete,
    setLocationAsOriginOrDestination
  } = useMapContext();

  const [activeTab, setActiveTab] = useState('search');

  // Format place types for display
  const formatPlaceType = (type) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Set selected place as either origin or destination
  const setAsOriginOrDestination = (type) => {
    if (placeDetails && placeDetails.geometry) {
      const location = {
        lat: placeDetails.geometry.location.lat(),
        lng: placeDetails.geometry.location.lng(),
        address: placeDetails.formatted_address || placeDetails.name,
        name: placeDetails.name
      };
      
      setLocationAsOriginOrDestination(location, type);
    }
  };

  return (
    <div className="places-panel">
      <div className="places-panel-tabs">
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
          disabled={!placeDetails}
        >
          Details
        </button>
      </div>
      
      <div className="places-panel-content">
        {activeTab === 'search' ? (
          <div className="search-tab">
            <h3>Find Places</h3>
            <PlacesSearch
              onPlaceSelect={setSelectedPlace}
              onPlacesSearch={handleSearchComplete}
              mapInstance={map}
            />
          </div>
        ) : (
          <div className="details-tab">
            {placeDetails ? (
              <div className="place-details">
                <h3>{placeDetails.name}</h3>
                
                {placeDetails.photos && placeDetails.photos.length > 0 && (
                  <div className="photo-gallery">
                    {placeDetails.photos.slice(0, 3).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.getUrl({ maxWidth: 400, maxHeight: 300 })}
                        alt={`${placeDetails.name} - Photo ${index + 1}`}
                        className="place-photo"
                      />
                    ))}
                  </div>
                )}
                
                <div className="details-content">
                  {placeDetails.rating && (
                    <div className="rating-container">
                      <span className="rating">
                        {placeDetails.rating} ★
                      </span>
                      <span className="rating-count">
                        {placeDetails.user_ratings_total} reviews
                      </span>
                      {placeDetails.price_level && (
                        <span className="price-level">
                          {'$'.repeat(placeDetails.price_level)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {placeDetails.types && placeDetails.types.length > 0 && (
                    <div className="place-types">
                      {placeDetails.types.slice(0, 3).map((type, index) => (
                        <span key={index} className="place-type">{formatPlaceType(type)}</span>
                      ))}
                    </div>
                  )}
                  
                  <address className="address">
                    {placeDetails.formatted_address}
                  </address>
                  
                  <div className="action-buttons">
                    <button
                      className="set-location-button origin"
                      onClick={() => setAsOriginOrDestination('origin')}
                    >
                      Set as Starting Point
                    </button>
                    <button
                      className="set-location-button destination"
                      onClick={() => setAsOriginOrDestination('destination')}
                    >
                      Set as Destination
                    </button>
                  </div>
                  
                  {placeDetails.formatted_phone_number && (
                    <div className="phone">
                      <strong>Phone:</strong> {placeDetails.formatted_phone_number}
                    </div>
                  )}
                  
                  {placeDetails.website && (
                    <div className="website">
                      <strong>Website:</strong>{' '}
                      <a href={placeDetails.website} target="_blank" rel="noopener noreferrer">
                        {placeDetails.website}
                      </a>
                    </div>
                  )}
                  
                  {placeDetails.opening_hours && (
                    <div className="hours">
                      <strong>Hours:</strong>
                      <ul className="hours-list">
                        {placeDetails.opening_hours.weekday_text.map((day, index) => (
                          <li key={index}>{day}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                    <div className="reviews-section">
                      <h4>Top Reviews</h4>
                      <div className="reviews">
                        {placeDetails.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="review">
                            <div className="review-header">
                              <div className="reviewer">{review.author_name}</div>
                              <div className="review-rating">{review.rating} ★</div>
                            </div>
                            <div className="review-time">{new Date(review.time * 1000).toLocaleDateString()}</div>
                            <div className="review-text">{review.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a place to see details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesPanel;
