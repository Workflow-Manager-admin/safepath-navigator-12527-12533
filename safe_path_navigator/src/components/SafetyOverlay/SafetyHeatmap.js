import React from 'react';
import { HeatmapLayer } from '@react-google-maps/api';
import { mockCrimeData } from '../../utils/safetyUtils';

/**
 * Component to render a heatmap overlay for crime data
 * @param {boolean} visible - Whether the heatmap should be visible
 * @PUBLIC_INTERFACE
 */
const SafetyHeatmap = ({ visible = false }) => {
  // Skip rendering if not visible
  if (!visible) return null;
  
  // Skip if Google Maps is not loaded
  if (typeof window === 'undefined' || !window.google || !window.google.maps) return null;
  
  // Options for the heatmap visualization
  const heatmapOptions = {
    radius: 20,
    opacity: 0.7,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ]
  };

  // Convert the mock data points to Google Maps LatLng objects
  const heatmapData = mockCrimeData.map(point => ({
    location: new window.google.maps.LatLng(point.lat, point.lng),
    weight: point.weight
  }));

  return (
    <HeatmapLayer
      data={heatmapData.map(point => point.location)}
      options={heatmapOptions}
    />
  );
};

export default SafetyHeatmap;
