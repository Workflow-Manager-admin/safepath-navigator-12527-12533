/**
 * Test utilities for SafePath Navigator tests
 * Contains mock data, mock API responses, and helper functions for testing
 */
import { render } from '@testing-library/react';
import { MapProvider } from '../context/MapContext';

// Simple test to make Jest happy
describe('Test utilities', () => {
  test('mock data is properly defined', () => {
    expect(mockCrimeDataResponse).toBeDefined();
    expect(mockFetch).toBeDefined();
  });
});
import React from 'react';
import { render } from '@testing-library/react';
import { MapProvider } from '../context/MapContext';

// Mock crime data response from FBI API
export const mockCrimeDataResponse = {
  coordinates: { lat: 37.7749, lng: -122.4194 },
  radius: 0.5,
  crimeStats: {
    'violent-crime': 7.5,
    'property-crime': 18.2,
    'homicide': 0.3,
    'robbery': 5.8,
    'aggravated-assault': 8.2
  },
  totalCrimeRate: 40.0,
  safetyScore: 60
};

// Mock crime data with high crime rate
export const mockHighCrimeDataResponse = {
  coordinates: { lat: 37.774, lng: -122.419 },
  radius: 0.5,
  crimeStats: {
    'violent-crime': 9.2,
    'property-crime': 22.5,
    'homicide': 0.8,
    'robbery': 8.1,
    'aggravated-assault': 12.4
  },
  totalCrimeRate: 53.0,
  safetyScore: 47
};

// Mock crime data with low crime rate
export const mockLowCrimeDataResponse = {
  coordinates: { lat: 37.775, lng: -122.417 },
  radius: 0.5,
  crimeStats: {
    'violent-crime': 2.1,
    'property-crime': 8.6,
    'homicide': 0.1,
    'robbery': 2.3,
    'aggravated-assault': 3.5
  },
  totalCrimeRate: 16.6,
  safetyScore: 84
};

// Mock national crime trends response
export const mockNationalCrimeData = {
  results: [
    {
      year: 2020,
      violent_crime: 380.8,
      homicide: 6.5,
      robbery: 73.9,
      aggravated_assault: 279.7,
      property_crime: 1958.2
    },
    {
      year: 2021,
      violent_crime: 395.7,
      homicide: 7.8,
      robbery: 75.5,
      aggravated_assault: 290.2,
      property_crime: 2015.6
    }
  ]
};

// Mock location data for testing
export const mockLocations = {
  origin: { lat: 37.7749, lng: -122.4194 }, // San Francisco
  destination: { lat: 37.7833, lng: -122.4167 } // Few blocks away
};

// Mock routes with safety data
export const mockRoutesWithSafetyData = [
  {
    id: 'route-1',
    name: 'Recommended Route',
    duration: '12 min',
    distance: '1.2 mi',
    path: [
      mockLocations.origin,
      { lat: 37.778, lng: -122.417 },
      mockLocations.destination
    ],
    safetyScore: {
      overall: 75,
      crime: 70,
      lighting: 82
    },
    crimeData: mockCrimeDataResponse
  },
  {
    id: 'route-2',
    name: 'Alternative Route 1',
    duration: '15 min',
    distance: '1.4 mi',
    path: [
      mockLocations.origin,
      { lat: 37.774, lng: -122.419 },
      mockLocations.destination
    ],
    safetyScore: {
      overall: 45,
      crime: 42,
      lighting: 50
    },
    crimeData: mockHighCrimeDataResponse
  },
  {
    id: 'route-3',
    name: 'Alternative Route 2',
    duration: '10 min',
    distance: '1.1 mi',
    path: [
      mockLocations.origin,
      { lat: 37.775, lng: -122.417 },
      mockLocations.destination
    ],
    safetyScore: {
      overall: 85,
      crime: 82,
      lighting: 90
    },
    crimeData: mockLowCrimeDataResponse
  }
];

// Mock fetch implementation that returns appropriate responses based on URL
export const mockFetch = (url) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => {
      if (url.includes('/agencies/')) {
        return Promise.resolve({ results: [] });
      } else if (url.includes('/national/')) {
        return Promise.resolve(mockNationalCrimeData);
      } else {
        return Promise.resolve({ error: 'Not found' });
      }
    }
  });
};

// Mock fetch implementation that simulates an error
export const mockFetchError = () => {
  return Promise.resolve({
    ok: false,
    status: 500,
    statusText: 'Server Error',
    json: () => Promise.resolve({ error: 'Server Error' })
  });
};

// Mock fetch implementation that simulates network failure
export const mockFetchNetworkError = () => {
  return Promise.reject(new Error('Network failure'));
};

// Custom render function for components that need MapContext
export const renderWithMapContext = (ui, contextProps = {}) => {
  return render(
    <MapProvider>
      {ui}
    </MapProvider>
  );
};
