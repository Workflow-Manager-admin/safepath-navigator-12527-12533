/**
 * Utility functions for safety calculations and mock data for the SafePath Navigator
 */

// Mock crime data for safety overlay - represents crime density in different areas
export const mockCrimeData = [
  { lat: 37.774, lng: -122.419, weight: 0.8 }, // High crime area
  { lat: 37.775, lng: -122.417, weight: 0.7 },
  { lat: 37.776, lng: -122.418, weight: 0.9 },
  { lat: 37.773, lng: -122.415, weight: 0.5 }, // Medium crime area
  { lat: 37.772, lng: -122.416, weight: 0.4 },
  { lat: 37.771, lng: -122.414, weight: 0.6 },
  { lat: 37.770, lng: -122.413, weight: 0.2 }, // Low crime area
  { lat: 37.769, lng: -122.412, weight: 0.1 },
  { lat: 37.768, lng: -122.410, weight: 0.3 }
];

// Mock lighting data for safety considerations
export const mockLightingData = [
  { lat: 37.774, lng: -122.419, level: 'low' },
  { lat: 37.772, lng: -122.416, level: 'medium' },
  { lat: 37.770, lng: -122.413, level: 'high' }
];

// Mock emergency services data (police stations, hospitals, etc.)
export const mockEmergencyServices = [
  { lat: 37.773, lng: -122.415, type: 'police', name: 'Central Police Station' },
  { lat: 37.769, lng: -122.412, type: 'hospital', name: 'City Hospital' },
  { lat: 37.775, lng: -122.417, type: 'fire_station', name: 'Fire Station 3' }
];

/**
 * Calculate safety score for a route based on proximity to crime and lighting
 * @param {Array} routePath - Array of latitude and longitude points along the route
 * @returns {Object} - Safety score details including overall score and factors
 */
export const calculateSafetyScore = (routePath) => {
  if (!routePath || routePath.length === 0) {
    return { overall: 0, crime: 0, lighting: 0 };
  }

  // The actual implementation would use the FBI Crime Data API
  // For now, we use locally weighted values based on crime data points
  let crimeScore = 0;
  let lightingScore = 0;
  
  // Calculate weighted score based on proximity to known crime areas
  // For each point in the route, check distance to crime data points
  routePath.forEach(routePoint => {
    // Calculate crime score component based on proximity to crime data
    let pointCrimeScore = 0;
    
    // Check distance to each crime data point
    mockCrimeData.forEach(crimePoint => {
      const distance = Math.sqrt(
        Math.pow(routePoint.lat - crimePoint.lat, 2) + 
        Math.pow(routePoint.lng - crimePoint.lng, 2)
      );
      
      // Closer to crime point = lower safety score
      // Weight is higher for higher crime weight
      if (distance < 0.01) { // Within approximately 1km
        pointCrimeScore += (crimePoint.weight * (1 - (distance * 100)));
      }
    });
    
    // Accumulate point score to total
    crimeScore += pointCrimeScore;
    
    // Calculate lighting score component
    let pointLightingScore = 0.5; // Default medium lighting
    
    // Check lighting at each route point
    mockLightingData.forEach(lightPoint => {
      const distance = Math.sqrt(
        Math.pow(routePoint.lat - lightPoint.lat, 2) + 
        Math.pow(routePoint.lng - lightPoint.lng, 2)
      );
      
      // If near a light source, adjust lighting score
      if (distance < 0.005) { // Within approximately 500m
        if (lightPoint.level === 'high') {
          pointLightingScore = Math.max(pointLightingScore, 0.9);
        } else if (lightPoint.level === 'medium') {
          pointLightingScore = Math.max(pointLightingScore, 0.6);
        } else {
          pointLightingScore = Math.max(pointLightingScore, 0.3);
        }
      }
    });
    
    // Accumulate lighting score
    lightingScore += pointLightingScore;
  });
  
  // Average the scores over the route
  crimeScore = (routePath.length > 0) ? 100 - ((crimeScore / routePath.length) * 100) : 50;
  lightingScore = (routePath.length > 0) ? (lightingScore / routePath.length) * 100 : 50;
  
  // Ensure scores are in range 0-100
  crimeScore = Math.max(0, Math.min(100, crimeScore));
  lightingScore = Math.max(0, Math.min(100, lightingScore));
  
  // Weighted average favoring crime data slightly more than lighting
  const overallScore = (crimeScore * 0.6) + (lightingScore * 0.4);
  
  return {
    overall: Math.round(overallScore),
    crime: Math.round(crimeScore),
    lighting: Math.round(lightingScore)
  };
};

/**
 * Generate mock route options between two points
 * @param {Object} origin - Starting location {lat, lng}
 * @param {Object} destination - Ending location {lat, lng}
 * @returns {Array} - Array of mock route objects with paths and metadata
 */
export const generateMockRoutes = (origin, destination) => {
  if (!origin || !destination) return [];
  
  // Create 3 mock routes with slightly different paths
  return [
    {
      id: 'route-1',
      name: 'Recommended Route',
      duration: '12 min',
      distance: '1.2 mi',
      path: [
        origin,
        { lat: origin.lat + 0.003, lng: origin.lng + 0.002 },
        { lat: origin.lat + 0.005, lng: origin.lng + 0.005 },
        { lat: destination.lat - 0.002, lng: destination.lng - 0.003 },
        destination
      ]
    },
    {
      id: 'route-2',
      name: 'Alternative Route 1',
      duration: '15 min',
      distance: '1.4 mi',
      path: [
        origin,
        { lat: origin.lat + 0.002, lng: origin.lng + 0.004 },
        { lat: origin.lat + 0.006, lng: origin.lng + 0.003 },
        { lat: destination.lat - 0.001, lng: destination.lng - 0.005 },
        destination
      ]
    },
    {
      id: 'route-3',
      name: 'Alternative Route 2',
      duration: '10 min',
      distance: '1.1 mi',
      path: [
        origin,
        { lat: origin.lat + 0.004, lng: origin.lng + 0.001 },
        { lat: origin.lat + 0.007, lng: origin.lng + 0.002 },
        { lat: destination.lat - 0.003, lng: destination.lng - 0.001 },
        destination
      ]
    }
  ];
};
