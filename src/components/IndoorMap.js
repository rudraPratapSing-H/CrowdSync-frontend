import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  Polyline,
  Polygon,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
// import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import L from "leaflet";

// Helper: convert [x, y] to [y, x] for Leaflet (since it expects [lat, lng])
const toLatLng = ([x, y]) => [y, x];

const IndoorMap = () => {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneCounts, setZoneCounts] = useState({});
  const [safeLimits, setSafeLimits] = useState({});
  const [showHeatmap, setShowHeatmap] = useState(true);
  const mapRef = useRef(); // Add this line
  // console.log(safeLimits)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventName = encodeURIComponent("Test Event");
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const [layoutRes, countsRes, safeRes] = await Promise.all([
          fetch(`http://localhost:5000/api/eventLayout?eventName=${eventName}`),
          fetch(
            `http://localhost:5000/api/recentZoneCounts?eventName=${eventName}&date=${dateStr}`
          ),
          fetch(
            `http://localhost:5000/api/getSafeLimit?eventName=${eventName}&date=${dateStr}`
          ),
        ]);
        if (!layoutRes.ok) throw new Error("Failed to fetch layout data");
        if (!countsRes.ok) throw new Error("Failed to fetch zone counts");
        if (!safeRes.ok) throw new Error("Failed to fetch safe limits");
        const layoutData = await layoutRes.json();
        const zoneCounts = await countsRes.json();
        const safeLimitsData = await safeRes.json();
        // safeLimitsData: { A: 120, B: 100, ... }
        setLayoutData(layoutData);
        setZoneCounts(zoneCounts);
        setSafeLimits(safeLimitsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const bounds = [
    [0, 0],
    [100, 100],
  ];

  // Update this function for proper centering and zoom
  const handleCenterMap = () => {
    // For react-leaflet v3+, mapRef.current is the map instance
    const map = mapRef.current;
    if (map) {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [10, 10], maxZoom: 0 }); // maxZoom: 0 ensures full view
    }
  };

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!layoutData) return <div>No layout data</div>;

  const { walls = [], objects = [], sensors = [], doors = [] } = layoutData;

  // Prepare heatmap points: [lat, lng, intensity] for each sensor
  const heatmapPoints = sensors.map((sensor) => {
    const count = zoneCounts[sensor.zoneName] ?? 0;
    const [x, y] = sensor.center;
    return [y, x, count]; // [lat, lng, intensity]
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button
          style={{
            padding: "6px 16px",
            fontWeight: 600,
            borderRadius: 6,
            background: showHeatmap ? "#1976d2" : "#eee",
            color: showHeatmap ? "#fff" : "#222",
            border: "1px solid #1976d2",
            cursor: "pointer",
          }}
          onClick={() => setShowHeatmap((h) => !h)}
        >
          {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
        </button>
        <button
          style={{
            padding: "6px 16px",
            fontWeight: 600,
            borderRadius: 6,
            background: "#fff",
            color: "#1976d2",
            border: "1px solid #1976d2",
            cursor: "pointer",
          }}
          onClick={handleCenterMap}
        >
          Center Map
        </button>
      </div>
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        style={{ height: "500px", width: "100%" }}
        minZoom={-4}
        maxZoom={17}
        scrollWheelZoom={true}
        ref={mapRef} // Add this prop
      >
        {/* Conditionally render HeatmapLayer */}
        {/* {showHeatmap && heatmapPoints.length > 0 && (
        // <HeatmapLayer
        //   fitBoundsOnLoad={false}
        //   fitBoundsOnUpdate={false}
        //   points={heatmapPoints}
        //   longitudeExtractor={m => m[1]}
        //   latitudeExtractor={m => m[0]}
        //   intensityExtractor={m => m[2]}
        //   max={Math.max(...heatmapPoints.map(p => p[2]), 1)}
        //   min={0}
        //   radius={20}
        //   blur={18}
        // />
      )} */}

        {/* Render walls as polylines */}
        {walls.map((wall, idx) => (
          <Polyline
            key={`wall-${idx}`}
            positions={wall.map(toLatLng)}
            color="black"
          />
        ))}

        {/* Render doors as polylines (different color) */}
        {doors.map((door, idx) => (
          <Polyline
            key={`door-${idx}`}
            positions={door.map(toLatLng)}
            color="green"
            weight={6}
          />
        ))}

        {/* Render objects as polygons */}
        {objects.map((polygon, idx) => (
          <Polygon
            key={`object-${idx}`}
            positions={polygon.map(toLatLng)}
            color="blue"
            fillOpacity={0.3}
          />
        ))}

        {/* Render sensors as transparent squares with tooltips and a small dot at center, and show zone count above */}
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
          const count = zoneCounts[zoneName] ?? 0;
          const safeLimit = safeLimits[zoneName] ?? 100; // fallback if not found

          // Ratio: 0 (far below) → 1 (at/exceeding limit)
          console.log(
            "Zone:",
            zoneName,
            "Count:",
            count,
            "Safe Limit:",
            safeLimit
          );
          let ratio = count / safeLimit;
          if (ratio > 1) ratio = 1;
          if (ratio < 0) ratio = 0;

          // Blue (0) → Green (0.3) → Yellow (0.6) → Orange (0.85) → Red (1)

          function getSafeColor(ratio) {
            if (!showHeatmap) {
              return null;
            }
            if (ratio >= 1) return "rgba(229,57,53,0.85)"; // red
            if (ratio >= 0.85) return "rgba(251,140,0,0.85)"; // orange
            if (ratio >= 0.6) return "rgba(251,192,45,0.85)"; // yellow
            if (ratio >= 0.3) return "rgba(67,160,71,0.85)"; // green
            return "rgba(30,136,229,0.7)"; // blue
          }

          return (
            <React.Fragment key={`sensor-${idx}`}>
              <Polygon
                positions={squareLatLng}
                pathOptions={{
                  color: "transparent",
                  fillColor: getSafeColor(ratio),
                  fillOpacity: 0.85,
                  opacity: 0,
                }}
              >
                <Tooltip>
                  {zoneName} (Safe: {safeLimit})
                </Tooltip>
              </Polygon>
              <CircleMarker
                center={toLatLng(center)}
                radius={6}
                pathOptions={{
                  color: "black",
                  fillColor: getSafeColor(ratio),
                  fillOpacity: 0.95,
                  opacity: 1,
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                  permanent
                >
                  <span
                    style={{
                      background: "#222",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {count}
                  </span>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndoorMap;
