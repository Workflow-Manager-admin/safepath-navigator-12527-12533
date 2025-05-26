// Simple script to verify environment variables
console.log("Checking environment variables...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REACT_APP_GOOGLE_MAPS_API_KEY exists:", !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
console.log("REACT_APP_GOOGLE_MAPS_API_KEY first 4 chars:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? process.env.REACT_APP_GOOGLE_MAPS_API_KEY.substring(0, 4) + "..." : "N/A");

// Additional environment checks
console.log("Current working directory:", process.cwd());
console.log("Path to .env file:", require('path').join(process.cwd(), '.env'));
console.log("Does .env exist:", require('fs').existsSync('.env') ? "Yes" : "No");
