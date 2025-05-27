import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { calculateSafetyScore } from '../utils/safetyUtils';
import { getCrimeStatsByCoordinates } from '../services/fbiCrimeDataService';

// Create context
const MapContext = createContext();

/**
 * MapProvider component provides map-related state and functionality for the application
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} MapProvider component
 */
export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSafetyHeatmap, setShowSafetyHeatmap] = useState(false);
  const [showSafetyMarkers, setShowSafetyMarkers] = useState(true);
  const [travelMode, setTravelMode] = useState('WALKING');
  
  // Places-related state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [placesService, setPlacesService] = useState(null);

  // Initialize Places service when map is available
  useEffect(() => {
    if (window.google && map) {
      setPlacesService(new window.google.maps.places.PlacesService(map));
    }
  }, [map]);

  // Calculate routes when origin, destination or travel mode changes
  useEffect(() => {
    if (!origin || !destination || !window.google) return;

    const calculateRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const directionsService = new window.google.maps.DirectionsService();
        
        const result = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: { lat: origin.lat, lng: origin.lng },
              destination: { lat: destination.lat, lng: destination.lng },
              travelMode: window.google.maps.TravelMode[travelMode],
              provideRouteAlternatives: true,
              optimizeWaypoints: false
            },
            (result, status) => {
              if (status === 'OK') {
                resolve(result);
              } else {
                reject(new Error(`Directions request failed: ${status}`));
              }
            }
          );
        });
        
        // Process and enhance routes with safety information
        const processedRoutes = await Promise.all(
          result.routes.map(async (route, index) => {
            const points = route.overview_path.map(point => ({
              lat: point.lat(),
              lng: point.lng()
            }));
            
            // Sample points along the route for crime data
            const sampleSize = Math.min(5, Math.max(3, Math.floor(points.length / 10)));
            const sampledPoints = [];
            
            for (let i = 0; i < sampleSize; i++) {
              const pointIndex = Math.floor(i * (points.length / sampleSize));
              sampledPoints.push(points[pointIndex]);
            }
            
            // Get crime data for the sampled points
            const crimeDataPromises = sampledPoints.map(point =>
              getCrimeStatsByCoordinates(point.lat, point.lng)
                .catch(() => ({ violent_crime: 0, property_crime: 0 }))
            );
            
            const crimeDataResults = await Promise.all(crimeDataPromises);
            
            // Calculate safety score based on crime data
            const safetyScore = calculateSafetyScore(crimeDataResults);
            
            return {
              ...route,
              index,
              points,
              safetyScore,
              duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
              distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0)
            };
          })
        );
        
        setRoutes(processedRoutes);
        
        // Select the safest route by default
        if (processedRoutes.length > 0) {
          const safestRoute = [...processedRoutes].sort((a, b) => b.safetyScore - a.safetyScore)[0];
          setSelectedRoute(safestRoute);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    calculateRoutes();
  }, [origin, destination, travelMode]);

  // Handle place selection from PlacesSearch component
  const handlePlaceSelect = useCallback((place) => {
    setSelectedPlace(place);
    
    if (placesService && place && place.place_id) {
      placesService.getDetails(
        {
          placeId: place.place_id,
          fields: [
            'name', 'rating', 'formatted_address', 'formatted_phone_number',
            'website', 'opening_hours', 'photos', 'reviews', 'price_level',
            'geometry', 'place_id', 'types', 'user_ratings_total'
          ]
        },
        (details, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setPlaceDetails(details);
          } else {
            setError(`Error fetching place details: ${status}`);
          }
        }
      );
    }
  }, [placesService]);

  // Handle search results from PlacesSearch component
  const handleSearchComplete = useCallback((results) => {
    setSearchResults(results);
  }, []);

  // Reset the map context state
  const resetState = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setRoutes([]);
    setSelectedRoute(null);
    setError(null);
    setSelectedPlace(null);
    setPlaceDetails(null);
    setSearchResults([]);
  }, []);

  // Set a location as either origin or destination
  const setLocationAsOriginOrDestination = useCallback((location, type) => {
    if (type === 'origin') {
      setOrigin(location);
    } else if (type === 'destination') {
      setDestination(location);
    }
  }, []);

  const value = {
    map,
    setMap,
    origin,
    setOrigin,
    destination,
    setDestination,
    routes,
    selectedRoute,
    setSelectedRoute,
    isLoading,
    error,
    showSafetyHeatmap,
    setShowSafetyHeatmap,
    showSafetyMarkers,
    setShowSafetyMarkers,
    travelMode,
    setTravelMode,
    resetState,
    // Places-related values
    selectedPlace,
    setSelectedPlace: handlePlaceSelect,
    placeDetails,
    searchResults,
    handleSearchComplete,
    setLocationAsOriginOrDestination
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

/**
 * Hook to access the MapContext
 * 
 * @PUBLIC_INTERFACE
 * @returns {Object} MapContext values and functions
 */
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export default MapContext;
