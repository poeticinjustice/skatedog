const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Environment variables for API URLs
const DOG_RUNS_API_URL = process.env.NYC_DOG_RUNS_API_URL;
const SKATE_PARKS_API_URL = process.env.NYC_SKATE_PARKS_API_URL;
const ORS_API_KEY = process.env.ORS_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Cache for data to avoid repeated API calls
let dogRunsCache = null;
let skateParksCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to check if cache is valid
const isCacheValid = () => {
  return cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION;
};

// Fetch dog runs data
const fetchDogRuns = async () => {
  try {
    const response = await axios.get(DOG_RUNS_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching dog runs:', error.message);
    throw error;
  }
};

// Fetch skate parks data
const fetchSkateParks = async () => {
  try {
    const response = await axios.get(SKATE_PARKS_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching skate parks:', error.message);
    throw error;
  }
};

// Get all locations (dog runs and skate parks)
app.get('/api/locations', async (req, res) => {
  try {
    // Check if we have valid cached data
    if (isCacheValid() && dogRunsCache && skateParksCache) {
      return res.json({
        dogRuns: dogRunsCache,
        skateParks: skateParksCache,
      });
    }

    // Fetch fresh data
    const [dogRuns, skateParks] = await Promise.all([
      fetchDogRuns(),
      fetchSkateParks(),
    ]);

    // Cache the data
    dogRunsCache = dogRuns;
    skateParksCache = skateParks;
    cacheTimestamp = Date.now();

    res.json({
      dogRuns,
      skateParks,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get dog runs only
app.get('/api/dog-runs', async (req, res) => {
  try {
    if (isCacheValid() && dogRunsCache) {
      return res.json(dogRunsCache);
    }

    const dogRuns = await fetchDogRuns();
    dogRunsCache = dogRuns;
    cacheTimestamp = Date.now();

    res.json(dogRuns);
  } catch (error) {
    console.error('Error fetching dog runs:', error);
    res.status(500).json({ error: 'Failed to fetch dog runs' });
  }
});

// Get skate parks only
app.get('/api/skate-parks', async (req, res) => {
  try {
    if (isCacheValid() && skateParksCache) {
      return res.json(skateParksCache);
    }

    const skateParks = await fetchSkateParks();
    skateParksCache = skateParks;
    cacheTimestamp = Date.now();

    res.json(skateParks);
  } catch (error) {
    console.error('Error fetching skate parks:', error);
    res.status(500).json({ error: 'Failed to fetch skate parks' });
  }
});

// Proxy endpoint for walking directions using OpenRouteService
app.post('/api/directions', async (req, res) => {
  const { start, end } = req.body;
  if (!ORS_API_KEY) {
    return res.status(500).json({ error: 'ORS API key not configured' });
  }
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end coordinates' });
  }
  // Validate coordinates
  if (
    !Array.isArray(start) ||
    start.length !== 2 ||
    !Array.isArray(end) ||
    end.length !== 2 ||
    start.some((v) => typeof v !== 'number' || isNaN(v)) ||
    end.some((v) => typeof v !== 'number' || isNaN(v))
  ) {
    console.error('Invalid coordinates:', { start, end });
    return res
      .status(400)
      .json({ error: 'Start or end coordinates are invalid.' });
  }
  try {
    const orsUrl =
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
    const response = await axios.post(
      orsUrl,
      {
        coordinates: [start, end],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching directions from ORS:',
      error.response?.data || error.message
    );
    res.status(500).json({
      error: 'Failed to fetch directions from ORS',
      details: error.response?.data,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataSources: {
      dogRuns: DOG_RUNS_API_URL,
      skateParks: SKATE_PARKS_API_URL,
    },
    orsConfigured: !!ORS_API_KEY,
  });
});

const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all: send back React's index.html for any route not handled
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  if (ORS_API_KEY) {
    // do nothing
  } else {
    // Remove this console.log as well
    // console.log('WARNING: OpenRouteService API key is NOT configured. Directions will not work.');
  }
});
