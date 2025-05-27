/**
 * FBI Crime Data Proxy Service
 * Provides functionality to interact with the FBI Crime Data API
 * via the secure Express.js proxy server
 */

// Proxy server configuration
const PROXY_BASE_URL = process.env.REACT_APP_PROXY_SERVER_URL || 'http://localhost:3001';

/**
 * Check if the proxy server is available
 * 
 * @PUBLIC_INTERFACE
 * @returns {Promise<boolean>} - True if the proxy server is available
 */
export const checkProxyServer = async () => {
  try {
    const response = await fetch(`${PROXY_BASE_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Server response: ${response.status}`);
    }
    
    const data = await response.json();
    return data.status === 'ok' && data.apiConfigured === true;
  } catch (error) {
    console.error('Proxy server health check failed:', error);
    return false;
  }
};

/**
 * Fetch crime statistics for a specific state and city via the proxy
 * 
 * @PUBLIC_INTERFACE
 * @param {string} state - State abbreviation (e.g., 'CA')
 * @param {string} city - City name (e.g., 'San Francisco')
 * @returns {Promise<Object>} - Crime statistics for the specified location
 */
export const getCrimeStatsByLocation = async (state, city) => {
  try {
    const url = `${PROXY_BASE_URL}/api/fbi/crime/location?state=${state}&city=${encodeURIComponent(city)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching crime data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Proxy API Error:', error);
    return null;
  }
};

/**
 * Get national crime trends for comparison via the proxy
 * 
 * @PUBLIC_INTERFACE
 * @param {number} yearsBack - Number of years back to retrieve trends (default: 5)
 * @returns {Promise<Object>} - National crime trends data
 */
export const getNationalCrimeTrends = async (yearsBack = 5) => {
  try {
    const url = `${PROXY_BASE_URL}/api/fbi/crime/national?years=${yearsBack}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching national crime data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Proxy API Error:', error);
    return null;
  }
};

/**
 * Convert proxy response data into the format expected by the application
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} rawData - Raw data from the proxy API
 * @returns {Object} - Formatted crime data
 */
export const formatProxyResponse = (rawData) => {
  // This function would transform the API response into the format
  // expected by the application's components
  // Implementation depends on the specific data structure returned by the proxy
  
  if (!rawData || !rawData.results) {
    return null;
  }
  
  // Example transformation - adjust based on actual proxy response format
  return {
    results: rawData.results,
    // Add additional fields as needed by the application
    totalCrimeRate: calculateTotalCrimeRate(rawData.results),
    safetyScore: calculateSafetyScore(rawData.results)
  };
};

/**
 * Example calculation function - would need to be implemented based on actual data format
 * @private
 */
const calculateTotalCrimeRate = (results) => {
  // This would calculate a crime rate from the API results
  // Implementation depends on the data structure
  return 0;
};

/**
 * Example calculation function - would need to be implemented based on actual data format
 * @private
 */
const calculateSafetyScore = (results) => {
  // This would calculate a safety score from the API results
  // Implementation depends on the data structure
  return 0;
};
