import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, Alert } from '@mui/material';
import MapComponent from './components/MapComponent';
import LocationSelector from './components/LocationSelector';
import DirectionsPanel from './components/DirectionsPanel';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [locations, setLocations] = useState({
    dogRuns: null,
    skateParks: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations. Please try again later.');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = (start, end) => {
    setSelectedStart(start);
    setSelectedEnd(end);
    setDirections(null); // Clear previous directions
  };

  const handleDirectionsReceived = (directionsData) => {
    setDirections(directionsData);
  };

  // Handler for marker click on the map
  const handleMarkerClick = (feature) => {
    if (!selectedStart) {
      setSelectedStart(feature);
    } else if (
      !selectedEnd &&
      (!selectedStart ||
        getLocationName(selectedStart) !== getLocationName(feature))
    ) {
      setSelectedEnd(feature);
    }
  };

  // Helper to get location name
  const getLocationName = (feature) => {
    return (
      feature?.properties?.name ||
      feature?.properties?.dog_run_name ||
      feature?.properties?.skate_park_name ||
      'Unknown Location'
    );
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth='lg' sx={{ mt: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            NYC Dog Runs to Skate Parks
          </Typography>
          <Typography>Loading locations...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant='h4' component='h1'>
            NYC Dog Runs to Skate Parks
          </Typography>
          <Typography variant='subtitle1'>
            Find skating directions between dog runs and skate parks
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: '50vh', md: '100%' },
              position: 'relative',
            }}
          >
            <MapComponent
              locations={locations}
              selectedDogRun={selectedStart}
              selectedSkatePark={selectedEnd}
              onDirectionsReceived={handleDirectionsReceived}
              onMarkerClick={handleMarkerClick}
            />
          </Box>
          <Box
            sx={{
              width: { xs: '100%', md: 350 },
              p: 2,
              backgroundColor: 'grey.50',
            }}
          >
            <LocationSelector
              locations={locations}
              selectedStart={selectedStart}
              setSelectedStart={setSelectedStart}
              selectedEnd={selectedEnd}
              setSelectedEnd={setSelectedEnd}
              onGetDirections={handleGetDirections}
            />
            {directions && (
              <DirectionsPanel
                directions={directions}
                dogRun={selectedStart}
                skatePark={selectedEnd}
              />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
