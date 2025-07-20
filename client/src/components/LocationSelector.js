import React from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import PetsIcon from '@mui/icons-material/Pets';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const LocationSelector = ({
  locations,
  selectedStart,
  setSelectedStart,
  selectedEnd,
  setSelectedEnd,
  onGetDirections,
}) => {
  // Combine all locations into one array with a type property, sorted by name
  const allLocations = [
    ...(locations.dogRuns?.features.map((f) => ({ ...f, locType: 'dogrun' })) ||
      []),
    ...(locations.skateParks?.features.map((f) => ({
      ...f,
      locType: 'skatepark',
    })) || []),
  ].sort((a, b) => {
    const nameA = (
      a.properties.name ||
      a.properties.dog_run_name ||
      a.properties.skate_park_name ||
      ''
    ).toLowerCase();
    const nameB = (
      b.properties.name ||
      b.properties.dog_run_name ||
      b.properties.skate_park_name ||
      ''
    ).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const [search, setSearch] = React.useState('');

  const getLocationName = (feature) => {
    return (
      feature.properties.name ||
      feature.properties.dog_run_name ||
      feature.properties.skate_park_name ||
      'Unknown Location'
    );
  };

  const getIcon = (locType) =>
    locType === 'dogrun' ? (
      <PetsIcon fontSize='small' sx={{ color: '#4caf50', mr: 1 }} />
    ) : (
      <SportsEsportsIcon fontSize='small' sx={{ color: '#ff9800', mr: 1 }} />
    );

  // Filter locations for search and exclude already selected
  const filteredLocations = allLocations.filter((feature) => {
    const name = getLocationName(feature);
    if (selectedStart && getLocationName(selectedStart) === name) return false;
    if (selectedEnd && getLocationName(selectedEnd) === name) return false;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleLocationClick = (feature) => {
    if (!selectedStart) {
      setSelectedStart(feature);
    } else if (!selectedEnd) {
      if (getLocationName(feature) !== getLocationName(selectedStart)) {
        setSelectedEnd(feature);
      }
    }
  };

  const handleClearStart = () => setSelectedStart(null);
  const handleClearEnd = () => setSelectedEnd(null);

  const handleGetDirections = () => {
    if (selectedStart && selectedEnd) {
      onGetDirections(selectedStart, selectedEnd);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Select Locations
      </Typography>

      {/* Selected chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {selectedStart && (
          <Chip
            icon={getIcon(selectedStart.locType)}
            label={`Start: ${getLocationName(selectedStart)}`}
            onDelete={handleClearStart}
            color='primary'
            sx={{ fontWeight: 'bold' }}
          />
        )}
        {selectedEnd && (
          <Chip
            icon={getIcon(selectedEnd.locType)}
            label={`Destination: ${getLocationName(selectedEnd)}`}
            onDelete={handleClearEnd}
            color='secondary'
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>

      <TextField
        fullWidth
        size='small'
        placeholder='Search locations...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

      <List
        dense
        sx={{
          maxHeight: 250,
          overflow: 'auto',
          border: '1px solid #eee',
          borderRadius: 1,
          mb: 2,
        }}
      >
        {filteredLocations.length === 0 && (
          <ListItem>
            <ListItemText primary='No locations found' />
          </ListItem>
        )}
        {filteredLocations.map((feature, index) => (
          <ListItemButton
            key={index}
            onClick={() => handleLocationClick(feature)}
          >
            <ListItemIcon>{getIcon(feature.locType)}</ListItemIcon>
            <ListItemText
              primary={getLocationName(feature)}
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
          </ListItemButton>
        ))}
      </List>

      <Button
        fullWidth
        variant='contained'
        startIcon={<DirectionsIcon />}
        onClick={handleGetDirections}
        disabled={!selectedStart || !selectedEnd}
        sx={{ mt: 2 }}
      >
        Get Skating Directions
      </Button>

      {/* Stats */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Available Locations:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${locations.dogRuns?.features.length || 0} Dog Runs`}
            size='small'
            color='success'
          />
          <Chip
            label={`${locations.skateParks?.features.length || 0} Skate Parks`}
            size='small'
            color='warning'
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LocationSelector;
