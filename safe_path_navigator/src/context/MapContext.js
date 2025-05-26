import React, { createContext, useState, useContext, useEffect } from 'react';
import { calculateSafetyScore, generateMockRoutes } from '../utils/safetyUtils';

// Create a context for managing map state
const MapContext = createContext();

/**
 * Provider component for MapContext that manages state for the map and routes
 * @PUBLIC_INTERFACE
 */
export const MapProvider = ({ children }) => {
  // State for origin, destination, and selected locations
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Map display controls
  const [showCrimeOverlay, setShowCrimeOverlay] = useState(false);
  const [showLightingOverlay, setShowLightingOverlay] = useState(false);
  const [showEmergencyServices, setShowEmergencyServices] = useState(false);

  // Default map center (San Francisco)
  const [mapCenter, setMapCenter] = useState({
    lat: 37.7749,
    lng: -122.4194
  });

  // Map view settings
  const [zoom, setZoom] = useState(13);
  const [isLoading, setIsLoading] = useState(false);

  // Update routes when origin or destination changes
  useEffect(() => {
    if (origin && destination) {
      setIsLoading(true);
      
      // In a real app, this would be an API call to a routing service
      // We're using mock data for demonstration
      setTimeout(() => {
        const newRoutes = generateMockRoutes(origin, destination);
        
        // Calculate safety scores for each route
        const routesWithScores = newRoutes.map(route => ({
          ...route,
          safetyScore: calculateSafetyScore(route.path)
        }));
        
        setRoutes(routesWithScores);
        
        // Select the first route by default
        if (routesWithScores.length > 0) {
          setSelectedRoute(routesWithScores[0]);
        }
        
        setIsLoading(false);
      }, 1000); // Simulate network delay
    }
  }, [origin, destination]);
  
  // Reset the map when there are no routes
  useEffect(() => {
    if (routes.length === 0) {
      setSelectedRoute(null);
    }
  }, [routes]);

  /**
   * Set a new origin location
   * @param {Object} location - Location with lat and lng properties
   * @PUBLIC_INTERFACE
   */
  const setOriginLocation = (location) => {
    setOrigin(location);
    if (!destination) {
      setMapCenter(location);
    }
  };

  /**
   * Set a new destination location
   * @param {Object} location - Location with lat and lng properties
   * @PUBLIC_INTERFACE
   */
  const setDestinationLocation = (location) => {
    setDestination(location);
    if (!origin) {
      setMapCenter(location);
    }
  };

  /**
   * Clear all route data and reset the map
   * @PUBLIC_INTERFACE
   */
  const clearRoutes = () => {
    setOrigin(null);
    setDestination(null);
    setRoutes([]);
    setSelectedRoute(null);
  };

  /**
   * Toggle a specific overlay on the map
   * @param {string} overlayType - Type of overlay to toggle
   * @PUBLIC_INTERFACE
   */
  const toggleOverlay = (overlayType) => {
    switch (overlayType) {
      case 'crime':
        setShowCrimeOverlay(!showCrimeOverlay);
        break;
      case 'lighting':
        setShowLightingOverlay(!showLightingOverlay);
        break;
      case 'emergency':
        setShowEmergencyServices(!showEmergencyServices);
        break;
      default:
        break;
    }
  };

  // Value to be provided by the context
  const contextValue = {
    origin,
    destination,
    routes,
    selectedRoute,
    mapCenter,
    zoom,
    isLoading,
    showCrimeOverlay,
    showLightingOverlay,
    showEmergencyServices,
    setOriginLocation,
    setDestinationLocation,
    setSelectedRoute,
    setMapCenter,
    setZoom,
    clearRoutes,
    toggleOverlay
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

/**
 * Custom hook to use the MapContext
 * @returns {Object} The MapContext value
 * @PUBLIC_INTERFACE
 */
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export default MapContext;
