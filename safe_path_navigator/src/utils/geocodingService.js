/**
 * Geocoding Service
 * Provides functionality to convert addresses to coordinates using Google Maps Geocoding API
 */

/**
 * Geocode an address string to coordinates using Google Maps Geocoding API
 * 
 * @PUBLIC_INTERFACE
 * @param {string} address - Address string to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} - Promise resolving to coordinates or null if geocoding fails
 */
export const geocodeAddress = async (address) => {
  if (!address || address.trim() === '') {
    return null;
  }
  
  try {
    // Ensure the Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error('Google Maps API not loaded. Make sure it is properly included in your application.');
      return null;
    }
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.warn(`Geocoding failed for address "${address}". Status: ${status}`);
          resolve(null); // Resolve with null instead of rejecting to make error handling easier
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get an address
 * 
 * @PUBLIC_INTERFACE
 * @param {Object} coordinates - Object with lat and lng properties
 * @returns {Promise<string | null>} - Promise resolving to address string or null if reverse geocoding fails
 */
export const reverseGeocode = async (coordinates) => {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return null;
  }
  
  try {
    // Ensure the Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error('Google Maps API not loaded. Make sure it is properly included in your application.');
      return null;
    }
    
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(coordinates.lat), lng: parseFloat(coordinates.lng) };
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        } else {
          console.warn(`Reverse geocoding failed for coordinates ${coordinates.lat},${coordinates.lng}. Status: ${status}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Validates if the provided string is a valid address format
 * This is a simple validation and can be expanded as needed
 * 
 * @PUBLIC_INTERFACE
 * @param {string} address - Address string to validate
 * @returns {boolean} - True if the address appears valid
 */
export const isValidAddressFormat = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Simple validation - check if address is at least 5 characters and contains numbers or letters
  return address.trim().length >= 5 && /[a-zA-Z0-9]/.test(address);
};
