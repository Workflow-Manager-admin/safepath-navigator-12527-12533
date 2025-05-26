/**
 * Tests for safety recommendations display in RoutePanel component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoutePanel from '../components/RoutePanel/RoutePanel';
import * as fbiCrimeDataService from '../services/fbiCrimeDataService';
import { mockRoutesWithSafetyData } from './test_utils';

// Mock the MapContext hook
jest.mock('../../src/context/MapContext', () => ({
  useMapContext: jest.fn()
}));

// Import the mock after the jest.mock call
import { useMapContext } from '../context/MapContext';

describe('RoutePanel Safety Display', () => {
  // Original implementation backup
  let originalGetSafetyRecommendations;

  beforeEach(() => {
    // Save original implementation
    originalGetSafetyRecommendations = fbiCrimeDataService.getSafetyRecommendations;
    
    // Default mock values for the MapContext
    useMapContext.mockReturnValue({
      routes: [],
      selectedRoute: null,
      setSelectedRoute: jest.fn(),
      isLoading: false,
      origin: null,
      destination: null,
      toggleOverlay: jest.fn(),
      showCrimeOverlay: false,
      showLightingOverlay: false,
      showEmergencyServices: false
    });
  });

  afterEach(() => {
    // Restore original implementation
    fbiCrimeDataService.getSafetyRecommendations = originalGetSafetyRecommendations;
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('should show empty state when no origin/destination', () => {
    render(<RoutePanel />);
    
    expect(screen.getByText(/enter start and end locations/i)).toBeInTheDocument();
  });

  test('should show loading state', () => {
    useMapContext.mockReturnValue({
      routes: [],
      selectedRoute: null,
      isLoading: true,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 }
    });

    render(<RoutePanel />);
    
    expect(screen.getByText(/finding safe routes/i)).toBeInTheDocument();
  });

  test('should display route cards with safety scores', () => {
    useMapContext.mockReturnValue({
      routes: mockRoutesWithSafetyData,
      selectedRoute: null,
      isLoading: false,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 },
      setSelectedRoute: jest.fn(),
      toggleOverlay: jest.fn(),
      showCrimeOverlay: false,
      showLightingOverlay: false,
      showEmergencyServices: false
    });

    render(<RoutePanel />);
    
    // Check if routes are displayed
    expect(screen.getByText('Recommended Route')).toBeInTheDocument();
    expect(screen.getByText('Alternative Route 1')).toBeInTheDocument();
    expect(screen.getByText('Alternative Route 2')).toBeInTheDocument();
    
    // Check if safety scores are displayed with correct colors
    const safetyScores = screen.getAllByText(/Safety Score/);
    expect(safetyScores.length).toBe(3); // One for each route
    
    // Check for crime and lighting percentages
    expect(screen.getByText(/Crime: 70%/)).toBeInTheDocument();
    expect(screen.getByText(/Crime: 42%/)).toBeInTheDocument();
    expect(screen.getByText(/Crime: 82%/)).toBeInTheDocument();
    
    expect(screen.getByText(/Lighting: 82%/)).toBeInTheDocument();
    expect(screen.getByText(/Lighting: 50%/)).toBeInTheDocument();
    expect(screen.getByText(/Lighting: 90%/)).toBeInTheDocument();
  });

  test('should display safety recommendations for the selected route', () => {
    // Mock recommendations returned from the API
    fbiCrimeDataService.getSafetyRecommendations = jest.fn().mockReturnValue([
      'Stay aware of your surroundings at all times',
      'Try to travel with a companion in this area',
      'Keep valuables out of sight or securely stored'
    ]);

    // Use a selected route with crime data
    useMapContext.mockReturnValue({
      routes: mockRoutesWithSafetyData,
      selectedRoute: mockRoutesWithSafetyData[0], // Route with moderate crime rate
      isLoading: false,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 },
      setSelectedRoute: jest.fn(),
      toggleOverlay: jest.fn(),
      showCrimeOverlay: false,
      showLightingOverlay: false,
      showEmergencyServices: false
    });

    render(<RoutePanel />);
    
    // Check if route details are displayed
    expect(screen.getByText(/Route Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance:/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Safety:/i)).toBeInTheDocument();
    
    // Check if safety recommendations are displayed
    expect(screen.getByText(/Safety Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText('Stay aware of your surroundings at all times')).toBeInTheDocument();
    expect(screen.getByText('Try to travel with a companion in this area')).toBeInTheDocument();
    expect(screen.getByText('Keep valuables out of sight or securely stored')).toBeInTheDocument();
    
    // Verify the recommendations function was called with the correct data
    expect(fbiCrimeDataService.getSafetyRecommendations).toHaveBeenCalledWith(mockRoutesWithSafetyData[0].crimeData);
  });

  test('should display fallback safety tip when no crime data is available', () => {
    // Use a selected route without crime data
    const routeWithoutCrimeData = {
      ...mockRoutesWithSafetyData[0],
      crimeData: null
    };
    
    useMapContext.mockReturnValue({
      routes: [routeWithoutCrimeData],
      selectedRoute: routeWithoutCrimeData,
      isLoading: false,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 },
      setSelectedRoute: jest.fn(),
      toggleOverlay: jest.fn(),
      showCrimeOverlay: false,
      showLightingOverlay: false,
      showEmergencyServices: false
    });

    render(<RoutePanel />);
    
    // Check if fallback safety tip is displayed
    expect(screen.getByText(/Stay in well-lit areas and be aware of your surroundings/i)).toBeInTheDocument();
    
    // Verify the recommendations function was not called
    expect(fbiCrimeDataService.getSafetyRecommendations).not.toHaveBeenCalled();
  });

  test('should toggle map overlays when buttons are clicked', async () => {
    const mockToggleOverlay = jest.fn();
    
    useMapContext.mockReturnValue({
      routes: mockRoutesWithSafetyData,
      selectedRoute: null,
      isLoading: false,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 },
      setSelectedRoute: jest.fn(),
      toggleOverlay: mockToggleOverlay,
      showCrimeOverlay: false,
      showLightingOverlay: true,  // Lighting is active
      showEmergencyServices: false
    });

    render(<RoutePanel />);
    
    const user = userEvent.setup();
    
    // Find the toggle buttons
    const crimeButton = screen.getByTitle('Toggle Crime Data');
    const lightingButton = screen.getByTitle('Toggle Lighting Data');
    const servicesButton = screen.getByTitle('Toggle Emergency Services');
    
    // The lighting button should have active class
    expect(lightingButton.className).toContain('active');
    
    // Click the crime button
    await user.click(crimeButton);
    expect(mockToggleOverlay).toHaveBeenCalledWith('crime');
    
    // Click the emergency services button
    await user.click(servicesButton);
    expect(mockToggleOverlay).toHaveBeenCalledWith('emergency');
  });

  test('should show no routes message when routes array is empty', () => {
    useMapContext.mockReturnValue({
      routes: [],
      selectedRoute: null,
      isLoading: false,
      origin: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7833, lng: -122.4167 },
      setSelectedRoute: jest.fn(),
      toggleOverlay: jest.fn(),
      showCrimeOverlay: false,
      showLightingOverlay: false,
      showEmergencyServices: false
    });

    render(<RoutePanel />);
    
    expect(screen.getByText(/No routes found/i)).toBeInTheDocument();
    expect(screen.getByText(/Please try different locations/i)).toBeInTheDocument();
  });
});
