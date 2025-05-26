/**
 * Tests for integration of FBI crime data with MapContext
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { MapProvider, useMapContext } from '../context/MapContext';
import * as fbiCrimeDataService from '../services/fbiCrimeDataService';
import * as safetyUtils from '../utils/safetyUtils';
import { mockLocations, mockCrimeDataResponse } from './test_utils';

// Simple test component that uses MapContext
const TestConsumer = () => {
  const { routes, selectedRoute, isLoading } = useMapContext();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="routes-count">{routes.length}</div>
      {selectedRoute && (
        <div data-testid="selected-route-safety">{selectedRoute.safetyScore.overall}</div>
      )}
    </div>
  );
};

describe('MapContext FBI Crime Data Integration', () => {
  // Original implementation backup
  let originalGetCrimeStats;
  let originalGenerateMockRoutes;
  let originalCalculateSafetyScore;
  
  beforeEach(() => {
    // Save original implementations
    originalGetCrimeStats = fbiCrimeDataService.getCrimeStatsByCoordinates;
    originalGenerateMockRoutes = safetyUtils.generateMockRoutes;
    originalCalculateSafetyScore = safetyUtils.calculateSafetyScore;
    
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
    
    // Mocking for consistent results
    safetyUtils.calculateSafetyScore = jest.fn().mockReturnValue({
      overall: 75, crime: 70, lighting: 82
    });
  });
  
  afterEach(() => {
    // Restore original implementations
    fbiCrimeDataService.getCrimeStatsByCoordinates = originalGetCrimeStats;
    safetyUtils.generateMockRoutes = originalGenerateMockRoutes;
    safetyUtils.calculateSafetyScore = originalCalculateSafetyScore;
    
    // Restore real timers
    jest.useRealTimers();
  });

  test('should fetch crime stats when origin and destination are set', async () => {
    // Mock the crime data API
    fbiCrimeDataService.getCrimeStatsByCoordinates = jest.fn()
      .mockResolvedValue(mockCrimeDataResponse);
    
    // Mock route generation
    safetyUtils.generateMockRoutes = jest.fn().mockReturnValue([
      {
        id: 'route-1',
        name: 'Test Route',
        duration: '10 min',
        distance: '1.0 mi',
        path: [mockLocations.origin, mockLocations.destination]
      }
    ]);

    // Create wrapper component that allows updating context state
    const TestWrapper = () => {
      const { setOriginLocation, setDestinationLocation } = useMapContext();
      
      React.useEffect(() => {
        setOriginLocation(mockLocations.origin);
        setDestinationLocation(mockLocations.destination);
      }, [setOriginLocation, setDestinationLocation]);
      
      return <TestConsumer />;
    };

    // Render component with MapContext
    const { getByTestId } = render(
      <MapProvider>
        <TestWrapper />
      </MapProvider>
    );

    // Initially should show loading
    expect(getByTestId('loading').textContent).toBe('true');
    
    // Wait for the timeout to execute
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verify the API was called
    await waitFor(() => {
      expect(fbiCrimeDataService.getCrimeStatsByCoordinates).toHaveBeenCalled();
      expect(safetyUtils.calculateSafetyScore).toHaveBeenCalled();
      expect(getByTestId('routes-count').textContent).toBe('1');
      expect(getByTestId('loading').textContent).toBe('false');
    });

    // Should have called the safety score calculation
    expect(safetyUtils.calculateSafetyScore).toHaveBeenCalled();
    
    // Verify crime data was integrated into selected route
    expect(getByTestId('selected-route-safety').textContent).toBe('75');
  });

  test('should handle error when fetching crime data fails', async () => {
    // Mock the crime data API to fail
    fbiCrimeDataService.getCrimeStatsByCoordinates = jest.fn()
      .mockResolvedValue(null);

    // Mock route generation
    safetyUtils.generateMockRoutes = jest.fn().mockReturnValue([
      {
        id: 'route-1',
        name: 'Test Route',
        duration: '10 min',
        distance: '1.0 mi',
        path: [mockLocations.origin, mockLocations.destination]
      }
    ]);

    // Create wrapper component that allows updating context state
    const TestWrapper = () => {
      const { setOriginLocation, setDestinationLocation } = useMapContext();
      
      React.useEffect(() => {
        setOriginLocation(mockLocations.origin);
        setDestinationLocation(mockLocations.destination);
      }, [setOriginLocation, setDestinationLocation]);
      
      return <TestConsumer />;
    };

    // Render component with MapContext
    const { getByTestId } = render(
      <MapProvider>
        <TestWrapper />
      </MapProvider>
    );

    // Wait for the timeout to execute
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verify that even with API failure, the routes are still calculated
    await waitFor(() => {
      expect(getByTestId('routes-count').textContent).toBe('1');
      expect(getByTestId('loading').textContent).toBe('false');
    });
  });
  
  test('should recalculate safety scores when crime data is available from API', async () => {
    // Mock the crime data API
    fbiCrimeDataService.getCrimeStatsByCoordinates = jest.fn()
      .mockResolvedValue({
        ...mockCrimeDataResponse,
        safetyScore: 60 // API provided safety score
      });
    
    // Mock safety score calculation to track calculation inputs
    safetyUtils.calculateSafetyScore = jest.fn()
      .mockReturnValue({ overall: 80, crime: 75, lighting: 85 });
    
    // Mock route generation
    safetyUtils.generateMockRoutes = jest.fn().mockReturnValue([
      {
        id: 'route-1',
        name: 'Test Route',
        duration: '10 min',
        distance: '1.0 mi',
        path: [mockLocations.origin, mockLocations.destination]
      }
    ]);

    // Create wrapper component that allows updating context state
    const TestWrapper = () => {
      const { setOriginLocation, setDestinationLocation } = useMapContext();
      
      React.useEffect(() => {
        setOriginLocation(mockLocations.origin);
        setDestinationLocation(mockLocations.destination);
      }, [setOriginLocation, setDestinationLocation]);
      
      return <TestConsumer />;
    };

    // Render component with MapContext
    render(
      <MapProvider>
        <TestWrapper />
      </MapProvider>
    );

    // Wait for the timeout to execute
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verify the crime data API was called
    await waitFor(() => {
      expect(fbiCrimeDataService.getCrimeStatsByCoordinates).toHaveBeenCalled();
    });

    // The safety score calculation should have been called with the route path
    expect(safetyUtils.calculateSafetyScore).toHaveBeenCalled();
  });
});
