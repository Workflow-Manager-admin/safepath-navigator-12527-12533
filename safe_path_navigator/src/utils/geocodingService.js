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

  // Handle specific problematic address formats
  let formattedAddress = address.trim();
  
  // If address doesn't have a city/state and might be incomplete, try to improve it
  if (formattedAddress.match(/^\d+\s+[NSEW]?\s*[A-Za-z]+\s+[A-Za-z]+$/i)) {
    // Address might be missing city/state - add more context
    console.log(`Adding region context to potentially incomplete address: "${formattedAddress}"`);
    formattedAddress = `${formattedAddress}, FL, USA`;
  }
  
  try {
    // Ensure the Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error('Google Maps API not loaded. Make sure it is properly included in your application.');
      return null;
    }
    
    console.log(`Geocoding address: "${formattedAddress}"`);
    const geocoder = new window.google.maps.Geocoder();
    
    // Try with additional geocoding options for better results
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address: formattedAddress,
          region: 'us', // Bias to US results
          componentRestrictions: { country: 'us' } // Restrict to US
        }, 
        (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const location = results[0].geometry.location;
            console.log(`Geocoding successful for "${formattedAddress}":`, {
              lat: location.lat(),
              lng: location.lng(),
              formattedAddress: results[0].formatted_address
            });
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            console.warn(`Geocoding failed for address "${formattedAddress}". Status: ${status}`);
            
            // Try a fallback method for specific address formats
            if (status === window.google.maps.GeocoderStatus.ZERO_RESULTS && 
                address.includes('Military Trail')) {
              // Try a fallback for Military Trail addresses - modify the query
              const fallbackAddress = address.replace(/\s+N\s+/, ' North ') + ', Florida, USA';
              console.log(`Attempting fallback geocoding with: "${fallbackAddress}"`);
              
              geocoder.geocode({ address: fallbackAddress }, (fallbackResults, fallbackStatus) => {
                if (fallbackStatus === window.google.maps.GeocoderStatus.OK && 
                    fallbackResults && fallbackResults.length > 0) {
                  const fallbackLocation = fallbackResults[0].geometry.location;
                  console.log(`Fallback geocoding successful:`, {
                    lat: fallbackLocation.lat(),
                    lng: fallbackLocation.lng(),
                    formattedAddress: fallbackResults[0].formatted_address
                  });
                  resolve({
                    lat: fallbackLocation.lat(),
                    lng: fallbackLocation.lng()
                  });
                } else {
                  console.warn(`Fallback geocoding also failed. Status: ${fallbackStatus}`);
                  resolve(null);
                }
              });
            } else {
              resolve(null);
            }
          }
        }
      );
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

/**
 * Format an address for better geocoding results
 * Helps standardize address formats and add missing components
 * 
 * @PUBLIC_INTERFACE
 * @param {string} address - Raw address string
 * @returns {string} - Formatted address for geocoding
 */
export const formatAddressForGeocoding = (address) => {
  if (!address) return '';
  
  let formattedAddress = address.trim();
  
  // Handle common address abbreviations
  formattedAddress = formattedAddress
    .replace(/\bN\b\s+/i, 'North ')
    .replace(/\bS\b\s+/i, 'South ')
    .replace(/\bE\b\s+/i, 'East ')
    .replace(/\bW\b\s+/i, 'West ')
    .replace(/\bSt\b/i, 'Street')
    .replace(/\bRd\b/i, 'Road')
    .replace(/\bAve\b/i, 'Avenue')
    .replace(/\bBlvd\b/i, 'Boulevard')
    .replace(/\bPkwy\b/i, 'Parkway');
  
  // Add USA as default country if not present
  if (!formattedAddress.includes('USA') && !formattedAddress.includes('US')) {
    formattedAddress = `${formattedAddress}, USA`;
  }
  
  return formattedAddress;
};
