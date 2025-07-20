import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Chip } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41],
});

const dogRunIcon = new L.DivIcon({
  html: '<div style="color:#4caf50;font-size:24px;"><span>🐕</span></div>',
  iconSize: [30, 30],
  className: 'dog-run-marker',
});
const skateParkIcon = new L.DivIcon({
  html: '<div style="color:#ff9800;font-size:24px;"><span>🛹</span></div>',
  iconSize: [30, 30],
  className: 'skate-park-marker',
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

const MapComponent = ({
  locations,
  selectedDogRun,
  selectedSkatePark,
  onDirectionsReceived,
  onMarkerClick,
}) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);

  // Center on NYC by default
  const defaultCenter = [40.7128, -74.006];

  // Get coordinates from GeoJSON feature
  const getLatLng = (feature) => {
    if (
      !feature ||
      !feature.geometry ||
      !feature.geometry.type ||
      !feature.geometry.coordinates
    )
      return null;
    let coords = feature.geometry.coordinates;

    if (feature.geometry.type === 'Point') {
      // [lng, lat]
      return [coords[1], coords[0]];
    }

    if (feature.geometry.type === 'Polygon') {
      // [[ [lng, lat], ... ]]
      if (
        Array.isArray(coords) &&
        coords.length > 0 &&
        Array.isArray(coords[0]) &&
        coords[0].length > 0
      ) {
        const [lng, lat] = coords[0][0];
        return [lat, lng];
      }
    }

    if (feature.geometry.type === 'MultiPolygon') {
      // [[[ [ [lng, lat], ... ] ]]]
      if (
        Array.isArray(coords) &&
        coords.length > 0 &&
        Array.isArray(coords[0]) &&
        coords[0].length > 0 &&
        Array.isArray(coords[0][0]) &&
        coords[0][0].length > 0
      ) {
        const [lng, lat] = coords[0][0][0];
        return [lat, lng];
      }
    }

    return null;
  };

  // Fetch directions from backend when both locations are selected
  useEffect(() => {
    const fetchDirections = async () => {
      setRouteCoords([]);
      setError(null);
      if (!selectedDogRun || !selectedSkatePark) return;
      setLoadingRoute(true);
      try {
        // Use robust getLatLng and reverse for ORS [lng, lat]
        const start = getLatLng(selectedDogRun)
          ? getLatLng(selectedDogRun).slice().reverse()
          : null;
        const end = getLatLng(selectedSkatePark)
          ? getLatLng(selectedSkatePark).slice().reverse()
          : null;
        if (!start || !end) {
          setError('Invalid start or end coordinates.');
          setLoadingRoute(false);
          return;
        }
        const response = await fetch('/api/directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start, end }),
        });
        if (!response.ok) throw new Error('Failed to fetch directions');
        const data = await response.json();
        // Robustly handle both LineString and MultiLineString
        const geometry = data.features[0]?.geometry;
        let coords = [];
        if (geometry?.type === 'LineString') {
          coords = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        } else if (geometry?.type === 'MultiLineString') {
          coords = geometry.coordinates
            .flat(Infinity)
            .map(([lng, lat]) => [lat, lng]);
        } else {
          setError('Invalid route geometry type from directions API.');
          setRouteCoords([]);
          return;
        }
        if (
          Array.isArray(coords) &&
          coords.length > 0 &&
          coords.every(
            (pair) =>
              Array.isArray(pair) &&
              pair.length === 2 &&
              typeof pair[0] === 'number' &&
              typeof pair[1] === 'number'
          )
        ) {
          setRouteCoords(coords);
          if (onDirectionsReceived) {
            onDirectionsReceived(data);
          }
        } else {
          setError('Invalid route data received from directions API.');
          setRouteCoords([]);
        }
      } catch (err) {
        setError('Could not fetch walking directions.');
        setRouteCoords([]);
      } finally {
        setLoadingRoute(false);
      }
    };
    fetchDirections();
    // eslint-disable-next-line
  }, [selectedDogRun, selectedSkatePark]);

  // Center map on selected dog run or skate park
  const flyTo =
    getLatLng(selectedDogRun) || getLatLng(selectedSkatePark) || defaultCenter;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={flyTo}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <FlyToLocation position={flyTo} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {/* Dog Runs */}
        {locations.dogRuns &&
          locations.dogRuns.features.map((feature, idx) => {
            const latLng = getLatLng(feature);
            if (!latLng) return null;
            return (
              <Marker
                key={`dogrun-${idx}`}
                position={latLng}
                icon={dogRunIcon}
                eventHandlers={
                  onMarkerClick ? { click: () => onMarkerClick(feature) } : {}
                }
              >
                <Popup>
                  <Typography variant='h6'>
                    {feature.properties.name ||
                      feature.properties.dog_run_name ||
                      'Dog Run'}
                  </Typography>
                  {feature.properties.address && (
                    <Typography variant='body2' color='text.secondary'>
                      {feature.properties.address}
                    </Typography>
                  )}
                </Popup>
              </Marker>
            );
          })}
        {/* Skate Parks */}
        {locations.skateParks &&
          locations.skateParks.features.map((feature, idx) => {
            const latLng = getLatLng(feature);
            if (!latLng) return null;
            return (
              <Marker
                key={`skatepark-${idx}`}
                position={latLng}
                icon={skateParkIcon}
                eventHandlers={
                  onMarkerClick ? { click: () => onMarkerClick(feature) } : {}
                }
              >
                <Popup>
                  <Typography variant='h6'>
                    {feature.properties.name ||
                      feature.properties.skate_park_name ||
                      'Skate Park'}
                  </Typography>
                  {feature.properties.address && (
                    <Typography variant='body2' color='text.secondary'>
                      {feature.properties.address}
                    </Typography>
                  )}
                </Popup>
              </Marker>
            );
          })}
        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color='#1976d2' weight={5} />
        )}
      </MapContainer>
      {loadingRoute && (
        <Typography
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: '#fff',
            p: 1,
            borderRadius: 1,
          }}
        >
          Loading route...
        </Typography>
      )}
      {error && (
        <Typography
          color='error'
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: '#fff',
            p: 1,
            borderRadius: 1,
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default MapComponent;
