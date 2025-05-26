import React from 'react';
import { useMapContext } from '../../context/MapContext';
import { FaWalking, FaCar, FaShieldAlt, FaLightbulb, FaSun, FaExclamationTriangle } from 'react-icons/fa';
import { getSafetyRecommendations } from '../../services/fbiCrimeDataService';
import './RoutePanel.css';

/**
 * RoutePanel component for displaying route options and their safety scores
 * @PUBLIC_INTERFACE
 */
const RoutePanel = () => {
  const {
    routes,
    selectedRoute,
    setSelectedRoute,
    isLoading,
    origin,
    destination,
    toggleOverlay,
    showCrimeOverlay,
    showLightingOverlay,
    showEmergencyServices
  } = useMapContext();

  // Helper function to determine the safety level color based on the score
  const getSafetyColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green (safe)
    if (score >= 60) return '#FFC107'; // Yellow (moderate)
    return '#F44336'; // Red (unsafe)
  };

  // Toggle map overlays
  const handleToggleOverlay = (type) => {
    toggleOverlay(type);
  };

  // Render the route summary
  const renderRouteSummary = (route) => {
    const isSelected = selectedRoute && selectedRoute.id === route.id;
    const safetyScore = route.safetyScore.overall;
    const safetyColor = getSafetyColor(safetyScore);
    
    return (
      <div 
        key={route.id} 
        className={`route-card ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedRoute(route)}
      >
        <div className="route-header">
          <h3>{route.name}</h3>
          <div className="route-stats">
            <span><FaWalking /> {route.duration}</span>
            <span>{route.distance}</span>
          </div>
        </div>
        
        <div className="route-safety">
          <div className="safety-score" style={{ backgroundColor: safetyColor }}>
            <span>{safetyScore}</span>
          </div>
          <div className="safety-details">
            <h4>Safety Score</h4>
            <div className="safety-factors">
              <div className="safety-factor">
                <FaShieldAlt /> Crime: {route.safetyScore.crime}%
              </div>
              <div className="safety-factor">
                <FaLightbulb /> Lighting: {route.safetyScore.lighting}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If no origin or destination, show search prompt
  if (!origin || !destination) {
    return (
      <div className="route-panel">
        <div className="routes-container empty">
          <div className="routes-placeholder">
            <FaCar className="placeholder-icon" />
            <p>Enter start and end locations to find the safest route</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="route-panel">
        <div className="routes-container loading">
          <div className="loading-spinner"></div>
          <p>Finding safe routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-panel">
      <div className="panel-header">
        <h2>Safe Routes</h2>
        <div className="overlay-toggles">
          <button 
            className={`toggle-btn ${showCrimeOverlay ? 'active' : ''}`} 
            onClick={() => handleToggleOverlay('crime')}
            title="Toggle Crime Data"
          >
            <FaShieldAlt /> Crime
          </button>
          <button 
            className={`toggle-btn ${showLightingOverlay ? 'active' : ''}`}
            onClick={() => handleToggleOverlay('lighting')}
            title="Toggle Lighting Data"
          >
            <FaLightbulb /> Lighting
          </button>
          <button 
            className={`toggle-btn ${showEmergencyServices ? 'active' : ''}`}
            onClick={() => handleToggleOverlay('emergency')}
            title="Toggle Emergency Services"
          >
            <FaSun /> Services
          </button>
        </div>
      </div>
      
      <div className="routes-container">
        {routes.length > 0 ? (
          <>
            {routes.map(route => renderRouteSummary(route))}
          </>
        ) : (
          <div className="no-routes">
            <p>No routes found. Please try different locations.</p>
          </div>
        )}
      </div>
      
      {selectedRoute && (
        <div className="route-details">
          <h3>Route Details</h3>
          <div className="route-detail-item">
            <strong>Distance:</strong> {selectedRoute.distance}
          </div>
          <div className="route-detail-item">
            <strong>Duration:</strong> {selectedRoute.duration}
          </div>
          <div className="route-detail-item">
            <strong>Overall Safety:</strong> {selectedRoute.safetyScore.overall}%
          </div>
          <p className="safety-tip">
            <FaShieldAlt /> Safety Tip: Stay in well-lit areas and be aware of your surroundings.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutePanel;
