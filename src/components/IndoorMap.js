
import React, { useEffect, useState } from 'react';
import { MapContainer, Polyline, Polygon, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Helper: convert [x, y] to [y, x] for Leaflet (since it expects [lat, lng])
const toLatLng = ([x, y]) => [y, x];

const IndoorMap = () => {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      setLoading(true);
      setError(null);
      try {
        // Change eventName as needed
        const eventName = encodeURIComponent('Test Event');
        const res = await fetch(`http://localhost:5000/api/eventLayout?eventName=${eventName}`);
        if (!res.ok) throw new Error('Failed to fetch layout data');
        const data = await res.json();
        setLayoutData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, []);

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!layoutData) return <div>No layout data</div>;

  const { walls = [], objects = [], sensors = [], doors = [] } = layoutData;
  const bounds = [[0, 0], [100, 100]];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      style={{ height: '500px', width: '100%' }}
  minZoom={-4}
  maxZoom={17}
      scrollWheelZoom={true}
    >
      {/* Render walls as polylines */}
      {walls.map((wall, idx) => (
        <Polyline key={`wall-${idx}`} positions={wall.map(toLatLng)} color="black" />
      ))}

      {/* Render doors as polylines (different color) */}
      {doors.map((door, idx) => (
        <Polyline key={`door-${idx}`} positions={door.map(toLatLng)} color="green" weight={6} />
      ))}

      {/* Render objects as polygons */}
      {objects.map((polygon, idx) => (
        <Polygon key={`object-${idx}`} positions={polygon.map(toLatLng)} color="blue" fillOpacity={0.3} />
      ))}

      {/* Render sensors as transparent squares with tooltips and a small dot at center */}
      {sensors.map((sensor, idx) => {
        const { center, radius, zoneName } = sensor;
        const [x, y] = center;
        // Top-left, top-right, bottom-right, bottom-left
        const square = [
          [y - radius, x - radius],
          [y - radius, x + radius],
          [y + radius, x + radius],
          [y + radius, x - radius],
        ];
        const squareLatLng = square.map(([yy, xx]) => [yy, xx]);
        return (
          <React.Fragment key={`sensor-${idx}`}> 
            <Polygon
              positions={squareLatLng}
              pathOptions={{ color: 'transparent', fillColor: 'transparent', fillOpacity: 0, opacity: 0 }}
            >
              <Tooltip>{zoneName}</Tooltip>
            </Polygon>
            <CircleMarker
              center={toLatLng(center)}
              radius={2}
              pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 1, opacity: 1 }}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default IndoorMap;
