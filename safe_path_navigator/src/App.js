import React from 'react';
import MainContainer from './components/MainContainer/MainContainer';
import './App.css';

// For production use, this would be set in environment variables
// This is a placeholder key for development purposes only
if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'AIzaSyBNLrJhOMSqJ-pQHw1NuBLRV-EhtRlr6YA';
}

/**
 * Main App component for SafePath Navigator
 * @PUBLIC_INTERFACE
 */
function App() {
  return (
    <div className="app">
      <MainContainer />
    </div>
  );
}

export default App;
