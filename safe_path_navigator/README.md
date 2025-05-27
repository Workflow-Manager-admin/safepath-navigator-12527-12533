# SafePath Navigator: API Integration Module

SafePath Navigator is a web application designed to help users find the safest walking or driving routes between locations. This module integrates Google Maps and FBI Crime Data APIs securely, providing functionality for route visualization and safety scoring.

## Features

- Google Maps integration for interactive maps and route visualization
- FBI Crime Data API integration for safety scoring and crime statistics
- Secure API key management using environment variables
- Optional Express.js backend proxy for added security
- Test components to demonstrate API functionality

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Google Maps JavaScript API key
- FBI Crime Data API key

### Environment Setup

1. Copy `.env.example` to a new file called `.env`
2. Fill in your actual API keys:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   REACT_APP_FBI_CRIME_DATA_API_KEY=your_fbi_crime_data_api_key_here
   ```
3. Run the environment check script to validate your setup:
   ```bash
   npm run check-env
   ```

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Optional: Setting up the Express.js Proxy Server

For enhanced security, you can use the included Express.js proxy server to keep your FBI Crime Data API key secure on the backend:

```bash
# Navigate to the proxy server directory
cd backend/proxy

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your FBI Crime Data API key
# FBI_CRIME_DATA_API_KEY=your_api_key_here

# Start the proxy server
npm start
```

When using the proxy server, you can remove the FBI Crime Data API key from your frontend .env file and set the proxy server URL instead:

```
REACT_APP_PROXY_SERVER_URL=http://localhost:3001
```

## Available Components

### TestMap.js

A standalone component that demonstrates Google Maps API integration:

```jsx
import TestMap from './components/Map/TestMap';

function App() {
  return <TestMap />;
}
```

### TestFBIApi.js

A standalone component that demonstrates FBI Crime Data API integration:

```jsx
import TestFBIApi from './components/TestFBIApi';

function App() {
  return <TestFBIApi />;
}
```

## API Services

### fbiCrimeDataService.js

Direct integration with the FBI Crime Data API:

```javascript
import { getCrimeStatsByCoordinates } from './services/fbiCrimeDataService';

// Example usage
const crimeData = await getCrimeStatsByCoordinates(37.7749, -122.4194);
```

### fbiCrimeDataProxyService.js

Integration with the FBI Crime Data API via the secure Express.js proxy:

```javascript
import { getCrimeStatsByLocation } from './services/fbiCrimeDataProxyService';

// Example usage
const crimeData = await getCrimeStatsByLocation('CA', 'San Francisco');
```

## Security Best Practices

This module implements several security best practices:

1. API keys are stored in environment variables, never in code
2. .env files are ignored by git to prevent accidental key exposure
3. Google Maps API key is restricted to specific domains (recommended)
4. The optional Express.js proxy keeps API keys on the server side
5. The proxy server implements CORS, rate limiting, and Helmet security

## License

This project is licensed under the MIT License.
