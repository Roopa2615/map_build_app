import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Box, Card, CardContent, Typography, Container } from '@mui/material';

const defaultIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 38],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const MapMarker = React.memo(({ point, onClick }) => (
  <Marker
    position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]}
    icon={defaultIcon}
    eventHandlers={{ click: onClick }}
  >
    <Popup>{point.properties.place}</Popup>
  </Marker>
));

const MapPolygon = React.memo(({ polygon, onClick }) => (
  <Polygon
    positions={polygon.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])}
    eventHandlers={{ click: onClick }}
  />
));

function App() {
  const [points, setPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-01-01&endtime=2022-01-02')
      .then((response) => {
        setPoints(response.data.features);
      });

    axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then((response) => {
        setPolygons(response.data.features);
      });
  }, []);

  const handleSelectFeature = useCallback((feature) => {
    setSelectedFeature(feature);
  }, []);

  return (
    <Container maxWidth="false" sx={{ padding: 0 }}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Box sx={{ flex: 1 }}>
          <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {points.map((point, idx) => (
              <MapMarker key={idx} point={point} onClick={() => handleSelectFeature(point.properties)} />
            ))}
            {polygons.map((polygon, idx) => (
              <MapPolygon key={idx} polygon={polygon} onClick={() => handleSelectFeature(polygon.properties)} />
            ))}
          </MapContainer>
        </Box>

        <Box sx={{ width: 400, padding: 2, overflowY: 'auto' }}>
          {selectedFeature && (
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {selectedFeature.name || selectedFeature.place}
                </Typography>
                {selectedFeature.mag && (
                  <Typography variant="body2">
                    {selectedFeature.description || `Magnitude: ${selectedFeature.mag}`}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
