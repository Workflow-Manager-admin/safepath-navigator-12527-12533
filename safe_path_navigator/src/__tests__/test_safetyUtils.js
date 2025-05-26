/**
 * Tests for safety utility functions
 */
import { 
  calculateSafetyScore, 
  generateMockRoutes, 
  mockCrimeData,
  mockLightingData
} from '../utils/safetyUtils';
import { mockLocations } from './test_utils';

describe('Safety Utility Functions', () => {
  describe('calculateSafetyScore', () => {
    test('should return zero scores when given no route path', () => {
      const score = calculateSafetyScore(null);
      expect(score).toEqual({ overall: 0, crime: 0, lighting: 0 });
    });

    test('should return zero scores when given empty path', () => {
      const score = calculateSafetyScore([]);
      expect(score).toEqual({ overall: 0, crime: 0, lighting: 0 });
    });

    test('should calculate proper safety scores for a route path', () => {
      // Create a test route that passes through known crime/lighting data points
      const testRoute = [
        { lat: 37.774, lng: -122.419 }, // High crime area
        { lat: 37.772, lng: -122.416 }, // Medium crime, medium lighting
        { lat: 37.770, lng: -122.413 }  // Low crime, high lighting
      ];
      
      const score = calculateSafetyScore(testRoute);
      
      // Scores should be numbers between 0-100
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.crime).toBeGreaterThanOrEqual(0);
      expect(score.crime).toBeLessThanOrEqual(100);
      expect(score.lighting).toBeGreaterThanOrEqual(0);
      expect(score.lighting).toBeLessThanOrEqual(100);
      
      // Overall should be weighted average of crime (60%) and lighting (40%)
      const expectedOverall = Math.round((score.crime * 0.6) + (score.lighting * 0.4));
      expect(score.overall).toEqual(expectedOverall);
    });
    
    test('should calculate lower crime safety scores for routes through high crime areas', () => {
      // Route directly through several high crime areas
      const highCrimeRoute = [
        { lat: 37.774, lng: -122.419 }, // High crime area (weight 0.8)
        { lat: 37.776, lng: -122.418 }, // High crime area (weight 0.9)
        { lat: 37.775, lng: -122.417 }, // High crime area (weight 0.7)
      ];
      
      // Route far away from crime areas
      const lowCrimeRoute = [
        { lat: 38.0, lng: -123.0 }, // Far from any crime area
        { lat: 38.1, lng: -123.1 }, // Far from any crime area
        { lat: 38.2, lng: -123.2 }, // Far from any crime area
      ];
      
      const highCrimeScore = calculateSafetyScore(highCrimeRoute);
      const lowCrimeScore = calculateSafetyScore(lowCrimeRoute);
      
      // The route through high crime areas should have a lower crime safety score
      expect(highCrimeScore.crime).toBeLessThan(lowCrimeScore.crime);
    });
    
    test('should calculate better lighting scores for routes through well-lit areas', () => {
      // Route through well-lit areas
      const wellLitRoute = [
        { lat: 37.770, lng: -122.413 }, // High lighting level
        { lat: 37.771, lng: -122.412 }, // Near high lighting
        { lat: 37.772, lng: -122.411 }  // Near medium lighting
      ];
      
      // Route through poorly lit areas
      const poorlyLitRoute = [
        { lat: 37.774, lng: -122.419 }, // Low lighting level
        { lat: 37.775, lng: -122.418 }, // Near low lighting
        { lat: 37.776, lng: -122.417 }  // Away from lighting
      ];
      
      const wellLitScore = calculateSafetyScore(wellLitRoute);
      const poorlyLitScore = calculateSafetyScore(poorlyLitRoute);
      
      // The route through well-lit areas should have a higher lighting score
      expect(wellLitScore.lighting).toBeGreaterThan(poorlyLitScore.lighting);
    });
  });

  describe('generateMockRoutes', () => {
    test('should return empty array when origin or destination is missing', () => {
      // Neither provided
      expect(generateMockRoutes(null, null)).toEqual([]);
      
      // Only origin provided
      expect(generateMockRoutes(mockLocations.origin, null)).toEqual([]);
      
      // Only destination provided
      expect(generateMockRoutes(null, mockLocations.destination)).toEqual([]);
    });
    
    test('should generate three mock routes between provided points', () => {
      const routes = generateMockRoutes(mockLocations.origin, mockLocations.destination);
      
      // Should return 3 routes
      expect(routes.length).toBe(3);
      
      // Each route should have the required properties
      routes.forEach(route => {
        expect(route).toHaveProperty('id');
        expect(route).toHaveProperty('name');
        expect(route).toHaveProperty('duration');
        expect(route).toHaveProperty('distance');
        expect(route).toHaveProperty('path');
        
        // Path should include origin and destination
        expect(route.path[0]).toEqual(mockLocations.origin);
        expect(route.path[route.path.length - 1]).toEqual(mockLocations.destination);
        
        // Path should have at least 3 points (origin, waypoint, destination)
        expect(route.path.length).toBeGreaterThanOrEqual(3);
      });
    });
    
    test('should generate unique routes with different paths', () => {
      const routes = generateMockRoutes(mockLocations.origin, mockLocations.destination);
      
      // Compare each pair of routes to ensure they have different paths
      expect(JSON.stringify(routes[0].path)).not.toEqual(JSON.stringify(routes[1].path));
      expect(JSON.stringify(routes[0].path)).not.toEqual(JSON.stringify(routes[2].path));
      expect(JSON.stringify(routes[1].path)).not.toEqual(JSON.stringify(routes[2].path));
    });
  });

  describe('Mock Safety Data', () => {
    test('mockCrimeData should contain valid crime data points', () => {
      expect(mockCrimeData.length).toBeGreaterThan(0);
      
      mockCrimeData.forEach(point => {
        expect(point).toHaveProperty('lat');
        expect(point).toHaveProperty('lng');
        expect(point).toHaveProperty('weight');
        
        // Weight should be between 0 and 1
        expect(point.weight).toBeGreaterThanOrEqual(0);
        expect(point.weight).toBeLessThanOrEqual(1);
      });
    });
    
    test('mockLightingData should contain valid lighting data points', () => {
      expect(mockLightingData.length).toBeGreaterThan(0);
      
      mockLightingData.forEach(point => {
        expect(point).toHaveProperty('lat');
        expect(point).toHaveProperty('lng');
        expect(point).toHaveProperty('level');
        
        // Level should be one of the valid values
        expect(['low', 'medium', 'high']).toContain(point.level);
      });
    });
  });
});
