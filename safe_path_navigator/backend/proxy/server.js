/**
 * Express.js proxy server for SafePath Navigator
 * Securely forwards requests to the FBI Crime Data API without exposing API keys to the frontend
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration
const PORT = process.env.PORT || 3001;
const FBI_API_KEY = process.env.FBI_CRIME_DATA_API_KEY;
const FBI_API_BASE_URL = 'https://api.usa.gov/crime/fbi/sapi';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000'];

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // CORS preflight cache for 24 hours
}));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all FBI API routes
app.use('/api/fbi', apiLimiter);

// Parse JSON body
app.use(express.json());

// Middleware to check if API key is configured
const checkApiKey = (req, res, next) => {
  if (!FBI_API_KEY) {
    return res.status(500).json({
      error: 'FBI Crime Data API key is not configured on the server'
    });
  }
  next();
};

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiConfigured: Boolean(FBI_API_KEY) });
});

/**
 * Proxy endpoint for getting crime stats by city and state
 * Example: /api/fbi/crime/location?state=CA&city=San%20Francisco
 */
app.get('/api/fbi/crime/location', checkApiKey, async (req, res) => {
  try {
    const { state, city } = req.query;
    
    if (!state || !city) {
      return res.status(400).json({ error: 'Missing state or city parameter' });
    }
    
    const url = `${FBI_API_BASE_URL}/api/summarized/agencies/${state}/${encodeURIComponent(city)}/offenses?api_key=${FBI_API_KEY}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying FBI API request:', error.message);
    
    // Forward the status code if available, otherwise use 500
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || { error: 'Error fetching data from FBI Crime API' };
    
    res.status(statusCode).json(errorMessage);
  }
});

/**
 * Proxy endpoint for getting national crime trends
 * Example: /api/fbi/crime/national?years=5
 */
app.get('/api/fbi/crime/national', checkApiKey, async (req, res) => {
  try {
    const yearsBack = parseInt(req.query.years) || 5;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack;
    
    const url = `${FBI_API_BASE_URL}/api/estimates/national/${startYear}/${currentYear}?api_key=${FBI_API_KEY}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying FBI API request:', error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || { error: 'Error fetching data from FBI Crime API' };
    
    res.status(statusCode).json(errorMessage);
  }
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`SafePath Navigator Proxy Server running on port ${PORT}`);
  console.log(`FBI API key ${FBI_API_KEY ? 'is configured' : 'is NOT configured'}`);
});
