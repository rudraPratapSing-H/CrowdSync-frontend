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
  const [zoneHistory, setZoneHistory] = useState({});
  const mapRef = useRef(); // Add this line
  // console.log(safeLimits)

  // Update zoneHistory to only keep entries when crowd changes
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
        setLayoutData(layoutData);
        setZoneCounts(zoneCounts);
        setSafeLimits(safeLimitsData);

        // Update zoneHistory: only push entry if crowd changed
        setZoneHistory((prev) => {
          const updated = { ...prev };
          Object.keys(zoneCounts).forEach((zone) => {
            if (!updated[zone]) updated[zone] = [];
            const lastEntry = updated[zone][updated[zone].length - 1];
            if (!lastEntry || lastEntry.count !== zoneCounts[zone]) {
              updated[zone] = [
                ...updated[zone],
                {
                  time: new Date().toLocaleTimeString(),
                  count: zoneCounts[zone],
                },
              ].slice(-5); // Keep last 5 changes
            }
          });
          return updated;
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          background: "linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%)",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(30,64,175,0.08)",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            border: "6px solid #2563eb",
            borderTop: "6px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "18px",
          }}
        />
        <style>
          {`@keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }`}
        </style>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#2563eb",
            letterSpacing: "0.02em",
          }}
        >
          Loading Venue Map...
        </div>
        <div
          style={{
            color: "#64748b",
            fontSize: "0.95rem",
            marginTop: "6px",
          }}
        >
          Please wait while we fetch the latest layout and crowd data.
        </div>
      </div>
    );
  }
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
          //   longitudeExtractor={(m) => m[1]}
          //   latitudeExtractor={(m) => m[0]}
          //   intensityExtractor={(m) => m[2]}
          //   max={Math.max(...heatmapPoints.map((p) => p[2]), 1)}
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
            if (ratio >= 0.6) return "rgba(251,140,0,0.85)"; // yellow
            if (ratio >= 0.3) return "rgba(67,160,71,0.85)"; // green
            return "rgba(67,160,71,0.85)"; // blue
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
              ></Polygon>
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
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {zoneName}: {count}
                  </span>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      <div
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          background: "#f9fafb",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          fontSize: "14px",
          fontWeight: 500,
          color: "#111827",
        }}
      >
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>
          Zone Status Legend
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "rgba(67,160,71,0.85)", // green
                borderRadius: 4,
                display: "inline-block",
              }}
            />
            <span>Safe (&lt;70%)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "rgba(251,192,45,0.85)", // yellow
                borderRadius: 4,
                display: "inline-block",
              }}
            />
            <span>Warning (70–100%)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "rgba(229,57,53,0.85)", // red
                borderRadius: 4,
                display: "inline-block",
              }}
            />
            <span>Overcrowded (&gt;100%)</span>
          </div>
        </div>
        {/* Zone crowd history list */}
        <div style={{ marginTop: "18px" }}>
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Zone Crowd Change (last 5 changes)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
            {Object.keys(zoneHistory)
              .filter((zone) => zoneHistory[zone].length > 1) // Only show if there was a change
              .map((zone) => (
                <div
                  key={zone}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    padding: "8px 12px",
                    minWidth: "120px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#2563eb",
                      marginBottom: "4px",
                    }}
                  >
                    {zone}
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    {zoneHistory[zone].map((entry, idx, arr) => {
                      const prev = arr[idx - 1];
                      const diff =
                        prev !== undefined ? entry.count - prev.count : 0;
                      return (
                        <div
                          key={entry.time + idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{entry.time}</span>
                          <span>
                            {/* {entry.count} */}
                            {prev !== undefined && (
                              <span
                                style={{
                                  color:
                                    diff > 0
                                      ? "#16a34a"
                                      : diff < 0
                                      ? "#dc2626"
                                      : "#64748b",
                                  marginLeft: 6,
                                  fontWeight: 500,
                                }}
                              >
                                {diff > 0 ? `+${diff}` : diff < 0 ? diff : ""}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndoorMap;
