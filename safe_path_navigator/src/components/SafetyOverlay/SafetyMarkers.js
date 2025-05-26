import React from 'react';
import { Marker } from '@react-google-maps/api';
import { mockLightingData, mockEmergencyServices } from '../../utils/safetyUtils';

/**
 * Component to render safety-related markers like lighting and emergency services
 * @param {Object} props - Component props
 * @param {boolean} props.showLighting - Whether to show lighting markers
 * @param {boolean} props.showEmergency - Whether to show emergency service markers
 * @PUBLIC_INTERFACE
 */
const SafetyMarkers = ({ showLighting = false, showEmergency = false }) => {
  // Skip rendering if nothing is visible or Google Maps is not loaded
  if ((!showLighting && !showEmergency) || typeof window.google === 'undefined') return null;

  // Icon for street lights
  const lightingIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/lightbulb.png',
    scaledSize: window.google?.maps ? new window.google.maps.Size(24, 24) : null
  };

  // Get appropriate icon for different emergency service types
  const getEmergencyIcon = (type) => {
    switch (type) {
      case 'police':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/police.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'hospital':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/hospitals.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      case 'fire_station':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/firedept.png',
          scaledSize: new window.google.maps.Size(32, 32)
        };
      default:
        return null;
    }
  };

  return (
    <>
      {/* Render lighting markers if enabled */}
      {showLighting && mockLightingData.map((point, index) => (
        <Marker
          key={`light-${index}`}
          position={{ lat: point.lat, lng: point.lng }}
          icon={lightingIcon}
          title={`Street Light - ${point.level} brightness`}
        />
      ))}
      
      {/* Render emergency service markers if enabled */}
      {showEmergency && mockEmergencyServices.map((service, index) => (
        <Marker
          key={`emergency-${index}`}
          position={{ lat: service.lat, lng: service.lng }}
          icon={getEmergencyIcon(service.type)}
          title={service.name}
        />
      ))}
    </>
  );
};

export default SafetyMarkers;
