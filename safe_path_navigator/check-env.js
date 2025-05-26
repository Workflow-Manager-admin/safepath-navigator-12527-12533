// Script to verify environment variables for SafePath Navigator
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load the environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
let problemCount = 0;
let results = {};

console.log('Checking environment variables...');
console.log('================================');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log(`✅ .env file found at: ${envPath}`);
  
  // Parse the .env file
  const envConfig = dotenv.config({ path: envPath });
  
  if (envConfig.error) {
    console.log(`❌ Error parsing .env file: ${envConfig.error}`);
    problemCount++;
  } else {
    console.log('✅ .env file parsed successfully');
    
    // Store parsed variables for comparison
    results.parsed = envConfig.parsed;
  }
} else {
  console.log(`❌ .env file not found at: ${envPath}`);
  problemCount++;
}

// Check required environment variables
const requiredVariables = [
  'REACT_APP_GOOGLE_MAPS_API_KEY'
];

console.log('\nChecking required environment variables:');
console.log('======================================');

// Verify if the required variables are set
requiredVariables.forEach(variable => {
  const value = process.env[variable];
  const fromParsed = results.parsed && results.parsed[variable];
  
  if (!value && !fromParsed) {
    console.log(`❌ ${variable} is missing`);
    problemCount++;
  } else if (!value && fromParsed) {
    console.log(`❗ ${variable} found in .env file but not loaded into process.env`);
    console.log(`   Value in .env: ${fromParsed.substring(0, 4)}...`);
    problemCount++;
  } else {
    const displayValue = value ? `${value.substring(0, 4)}...` : 'empty string';
    console.log(`✅ ${variable} exists: ${displayValue}`);
  }
});

// Check NODE_ENV
console.log('\nChecking NODE_ENV:');
console.log('=================');
if (process.env.NODE_ENV) {
  console.log(`✅ NODE_ENV is set to: ${process.env.NODE_ENV}`);
} else {
  console.log('❗ NODE_ENV is not set. This may be fine for development but should be set for production.');
}

// Check for browser-specific environment variables
const browserEnvVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));

console.log('\nReact app environment variables:');
console.log('===============================');
if (browserEnvVars.length > 0) {
  browserEnvVars.forEach(variable => {
    if (process.env[variable]) {
      const displayValue = `${process.env[variable].substring(0, 4)}...`;
      console.log(`✅ ${variable}: ${displayValue}`);
    } else {
      console.log(`✅ ${variable}: <empty string>`);
    }
  });
} else {
  console.log('❌ No REACT_APP_ environment variables found.');
  problemCount++;
}

// Check for potential security issues
console.log('\nSecurity check:');
console.log('==============');
let securityProblems = 0;

const sensitiveKeys = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
browserEnvVars.forEach(variable => {
  for (const sensitiveKey of sensitiveKeys) {
    if (variable.includes(sensitiveKey) && variable.startsWith('REACT_APP_')) {
      console.log(`❗ Potential security issue: ${variable} might contain sensitive data exposed to the browser`);
      securityProblems++;
      break;
    }
  }
});

if (securityProblems === 0) {
  console.log('✅ No obvious security issues found');
}

// Add manual dotenv loader functionality
console.log('\nTesting manual environment loading:');
console.log('=================================');

try {
  // Load .env file manually
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Successfully read .env file content');
  
  // Parse the content manually
  const envLines = envContent.split('\n').filter(line => 
    line.trim() !== '' && !line.trim().startsWith('#')
  );
  
  console.log(`✅ Found ${envLines.length} environment variables in .env file`);
  
  // Check if Google Maps API Key is properly formatted
  const apiKeyLine = envLines.find(line => line.startsWith('REACT_APP_GOOGLE_MAPS_API_KEY='));
  if (apiKeyLine) {
    const apiKey = apiKeyLine.split('=')[1];
    if (apiKey && apiKey.length > 20) {
      console.log('✅ REACT_APP_GOOGLE_MAPS_API_KEY format appears valid');
    } else {
      console.log('❌ REACT_APP_GOOGLE_MAPS_API_KEY format appears invalid');
      problemCount++;
    }
  }
  
  // Manually inject environment variables
  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY && apiKeyLine) {
    const apiKey = apiKeyLine.split('=')[1];
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = apiKey;
    console.log('✅ Manually injected REACT_APP_GOOGLE_MAPS_API_KEY into process.env');
  }
} catch (error) {
  console.log(`❌ Error manually processing .env file: ${error.message}`);
  problemCount++;
}

// Verify manual injection worked
console.log('\nVerifying manual environment injection:');
console.log('====================================');
if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
  const displayApiKey = `${process.env.REACT_APP_GOOGLE_MAPS_API_KEY.substring(0, 4)}...`;
  console.log(`✅ REACT_APP_GOOGLE_MAPS_API_KEY now exists: ${displayApiKey}`);
} else {
  console.log('❌ REACT_APP_GOOGLE_MAPS_API_KEY still missing after manual injection');
  problemCount++;
}

// Summary
console.log('\nEnvironment Check Summary:');
console.log('=========================');
if (problemCount === 0) {
  console.log('✅ All checks passed. No problems found!');
} else {
  console.log(`❌ ${problemCount} problem${problemCount === 1 ? '' : 's'} found.`);
}

// Export the results for potential use in other scripts
module.exports = {
  problemCount,
  variables: results.parsed || {}
};
