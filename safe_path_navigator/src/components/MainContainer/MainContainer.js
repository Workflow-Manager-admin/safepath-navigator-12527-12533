import React from 'react';
import './MainContainer.css';

/**
 * PUBLIC_INTERFACE
 * Main container for SafePath Navigator.
 * This lays out the full-screen experience:
 * - Top or side panel for address (start/destination) input using autocomplete.
 * - Main map area for route display and overlays.
 * - Route summary panel (collapsible) for route selection/scores.
 * Responsive for mobile & desktop.
 */
function MainContainer() {
  return (
    <div className="main-container">
      {/* Address Input Panel */}
      <div className="address-panel">
        {/* Start and Destination input panels (autocomplete to be implemented) */}
        <div className="address-input start">
          <label htmlFor="start-location">Start</label>
          <input id="start-location" placeholder="Enter start location" />
        </div>
        <div className="address-input destination">
          <label htmlFor="destination-location">Destination</label>
          <input id="destination-location" placeholder="Enter destination" />
        </div>
      </div>
      {/* Main map area */}
      <div className="map-panel">
        {/* Map view will be rendered here */}
        <div className="map-placeholder">[ Map will appear here ]</div>
      </div>
      {/* Route Summary (collapsible for mobile) */}
      <div className="route-summary-panel">
        {/* List of routes/rows (placeholder) */}
        <div className="route-summary-header">Available Routes:</div>
        <ul className="route-list">
          <li className="route-item">Route 1 - Safety: --, ETA: --, Distance: -- <button>Choose</button></li>
        </ul>
      </div>
    </div>
  );
}

export default MainContainer;
