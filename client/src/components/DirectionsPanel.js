import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  DirectionsWalk,
  AccessTime,
  Straighten,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useState } from 'react';

const DirectionsPanel = ({ directions, dogRun, skatePark }) => {
  const [expanded, setExpanded] = useState(false);

  // Robustly extract steps from ORS GeoJSON response
  const steps = Array.isArray(directions?.steps)
    ? directions.steps
    : directions?.features?.[0]?.properties?.segments?.[0]?.steps || [];

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDistance = (meters) => {
    const km = meters / 1000;
    if (km < 1) {
      return `${Math.round(meters)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const getLocationName = (feature) => {
    if (!feature || !feature.properties) return '';
    return (
      feature.properties.name ||
      feature.properties.dog_run_name ||
      feature.properties.skate_park_name ||
      'Unknown Location'
    );
  };

  const formatStep = (step) => {
    let instruction = step.maneuver?.instruction || step.instruction || '';
    instruction = instruction.replace(/<[^>]*>/g, '');

    // Add distance to the instruction
    const distance = formatDistance(step.distance || step.length || 0);
    return `${instruction} (${distance})`;
  };

  // If either dogRun or skatePark is null, render nothing
  if (!dogRun || !skatePark) return null;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant='h6'
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <DirectionsWalk color='primary' />
          Skating Directions
        </Typography>
        <IconButton size='small' onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Route Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          From: <strong>{getLocationName(dogRun)}</strong>
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          To: <strong>{getLocationName(skatePark)}</strong>
        </Typography>
      </Box>

      {/* Route Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip
          icon={<AccessTime />}
          label={formatDuration(
            directions.duration ||
              directions?.features?.[0]?.properties?.segments?.[0]?.duration ||
              0
          )}
          size='small'
          color='primary'
        />
        <Chip
          icon={<Straighten />}
          label={formatDistance(
            directions.distance ||
              directions?.features?.[0]?.properties?.segments?.[0]?.distance ||
              0
          )}
          size='small'
          color='secondary'
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Step-by-step directions */}
      <Collapse in={expanded}>
        <Typography variant='subtitle2' gutterBottom>
          Step-by-step directions:
        </Typography>
        <List dense>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <DirectionsWalk fontSize='small' color='action' />
                </ListItemIcon>
                <ListItemText
                  primary={formatStep(step)}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary='No step-by-step directions available.' />
            </ListItem>
          )}
        </List>
      </Collapse>

      {/* Expand/Collapse hint */}
      {!expanded && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontStyle: 'italic' }}
        >
          Click to see step-by-step directions
        </Typography>
      )}
    </Paper>
  );
};

export default DirectionsPanel;
