/**
 * FBI Crime Data API Service
 * Provides functionality to interact with the FBI Crime Data API
 * for retrieving crime statistics by location for use in safety scoring.
 */

// FBI Crime Data API configuration
const FBI_API_BASE_URL = 'https://api.usa.gov/crime/fbi/sapi';
const API_KEY = process.env.REACT_APP_FBI_CRIME_DATA_API_KEY || '2kEBAO7elawjoAAKFdgfErFxPS8ODR8zCW6xTkjx';

/**
 * Fetch crime statistics for a specific state and city
 * 
 * @PUBLIC_INTERFACE
 * @param {string} state - State abbreviation (e.g., 'CA')
 * @param {string} city - City name (e.g., 'San Francisco')
 * @returns {Promise<Object>} - Crime statistics for the specified location
 */
export const getCrimeStatsByLocation = async (state, city) => {
  try {
    // Construct URL for city/state lookups
    const url = `${FBI_API_BASE_URL}/api/summarized/agencies/${state}/${encodeURIComponent(city)}/offenses?api_key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching crime data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('FBI Crime Data API Error:', error);
    return null;
  }
};

/**
 * Fetch crime statistics for an area based on coordinates
 * 
 * @PUBLIC_INTERFACE
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Radius in miles to search (default: 1)
 * @returns {Promise<Object>} - Crime statistics for the specified coordinates
 */
export const getCrimeStatsByCoordinates = async (lat, lng, radius = 1) => {
  try {
    // The FBI API doesn't directly support coordinate-based lookups
    // This would require first geocoding to get city/state, then using that info
    // For now, we'll use a mock implementation based on proximity to known crime spots
    
    // Simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Sample crime index calculation based on proximity to high-crime areas
    // In a real implementation, this would use the FBI API data
    const crimeRatesByType = {
      'violent-crime': getRandomWeightedValue(lat, lng, 10),
      'property-crime': getRandomWeightedValue(lat, lng, 25),
      'homicide': getRandomWeightedValue(lat, lng, 1),
      'robbery': getRandomWeightedValue(lat, lng, 8),
      'aggravated-assault': getRandomWeightedValue(lat, lng, 15)
    };
    
    const totalCrimeRate = Object.values(crimeRatesByType).reduce((sum, value) => sum + value, 0);
    
    return {
      coordinates: { lat, lng },
      radius,
      crimeStats: crimeRatesByType,
      totalCrimeRate: totalCrimeRate,
      safetyScore: calculateSafetyScore(totalCrimeRate)
    };
  } catch (error) {
    console.error('FBI Crime Data API Error:', error);
    return null;
  }
};

/**
 * Calculate a safety score from 0-100 based on crime rate
 * Higher score = safer area
 * 
 * @param {number} crimeRate - Crime rate value
 * @returns {number} - Safety score between 0-100
 */
const calculateSafetyScore = (crimeRate) => {
  // Lower scores for higher crime rates
  // This is a simplified calculation - a real implementation would use proper statistical methods
  const maxExpectedCrimeRate = 100;
  const rawScore = 100 - ((crimeRate / maxExpectedCrimeRate) * 100);
  return Math.max(0, Math.min(100, Math.round(rawScore)));
};

/**
 * Get a random crime value weighted by proximity to high-crime areas
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxValue - Maximum value for this crime type
 * @returns {number} - Weighted crime value
 */
const getRandomWeightedValue = (lat, lng, maxValue) => {
  // These are known high-crime areas in our mock data
  const highCrimeAreas = [
    { lat: 37.774, lng: -122.419, weight: 0.8 },
    { lat: 37.776, lng: -122.418, weight: 0.9 },
    { lat: 37.775, lng: -122.417, weight: 0.7 }
  ];
  
  // Find closest high-crime area and use its weight as a factor
  let closestDistance = Number.MAX_VALUE;
  let closestWeight = 0;
  
  highCrimeAreas.forEach(area => {
    const distance = Math.sqrt(
      Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestWeight = area.weight;
    }
  });
  
  // Use distance and weight to calculate a crime value
  // Closer to high-crime areas = higher crime value
  const proximityFactor = Math.max(0, 1 - (closestDistance * 100)); // Convert small lat/lng distances
  const randomVariation = 0.7 + (Math.random() * 0.6); // Random value between 0.7-1.3
  
  return Math.min(maxValue, maxValue * closestWeight * proximityFactor * randomVariation);
};

/**
 * Get national crime trends for comparison
 * 
 * @PUBLIC_INTERFACE
 * @param {number} yearsBack - Number of years back to retrieve trends (default: 5)
 * @returns {Promise<Object>} - National crime trends data
 */
export const getNationalCrimeTrends = async (yearsBack = 5) => {
  try {
    // Calculate year range
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack;
    
    // Construct URL for national data
    const url = `${FBI_API_BASE_URL}/api/estimates/national/${startYear}/${currentYear}?api_key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching national crime data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('FBI Crime Data API Error:', error);
    return null;
  }
};

/**
 * Get safety recommendations based on crime statistics
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} crimeStats - Crime statistics object
 * @returns {Array<string>} - Array of safety recommendations
 */
export const getSafetyRecommendations = (crimeStats) => {
  if (!crimeStats) return [];
  
  const recommendations = [];
  const totalRate = crimeStats.totalCrimeRate || 0;
  
  // General recommendations
  recommendations.push('Stay aware of your surroundings at all times');
  
  // Add specific recommendations based on crime types and rates
  if (crimeStats.crimeStats) {
    if (crimeStats.crimeStats['violent-crime'] > 5) {
      recommendations.push('Try to travel with a companion in this area');
    }
    
    if (crimeStats.crimeStats['property-crime'] > 15) {
      recommendations.push('Keep valuables out of sight or securely stored');
    }
    
    if (crimeStats.crimeStats['robbery'] > 5) {
      recommendations.push('Avoid displaying expensive items in public');
      recommendations.push('Stay in well-lit areas at night');
    }
  }
  
  // General recommendations based on overall crime rate
  if (totalRate > 40) {
    recommendations.push('Consider alternate routes if possible');
    recommendations.push('Stay on main streets and avoid shortcuts through less populated areas');
  } else if (totalRate < 10) {
    recommendations.push('This area generally has lower crime rates compared to surrounding areas');
  }
  
  return recommendations;
};
