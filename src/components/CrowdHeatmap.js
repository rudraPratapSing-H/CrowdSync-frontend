// CrowdMapHeatmap.js - Centered on user's live location
import React, { useState, useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import {
  MapContainer,
  TileLayer,
  Circle,
  Tooltip,
  useMap,
} from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";

// Helper component to automatically recenter the map view
const RecenterAutomatically = ({ center }) => {
  const map = useMap(); // This hook gives you access to the map instance
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom()); // Set the view to the new center
    }
  }, [center, map]); // Rerun this effect when the center changes
  return null; // This component does not render anything itself
};

const ZoomListener = ({ setZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
      console.log("Zoom level changed to:", e.target.getZoom());
    }
  });
  return null;
};

const CrowdMapHeatmap = () => {
  const [crowdData, setCrowdData] = useState({});
  const [zoneCoords, setZoneCoords] = useState({});
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [zoom, setZoom] = useState(17); // default zoom
  console.log("Current zoom level:", zoom);
  const [showHeatmap, setShowHeatmap] = useState(true);

  
  // 1. State for the map's center. Default to a fallback location.
  const [mapCenter, setMapCenter] = useState([22.728, 75.8785]);
  
  // 2. Effect to get the user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User location:", latitude, longitude);
        // If successful, update the map center to the user's location
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        // If user denies permission or an error occurs, log it and keep the default center
        console.error("Error getting user location:", error);
      }
    );
  }, []); // The empty array [] ensures this runs only once on mount

  // Effect to fetch all data and poll for updates (no changes here)
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const [crowdResponse, coordsResponse] = await Promise.all([
          fetch(
            `http://localhost:5000/api/recentZoneCounts?eventName=Test%20Event&date=${dateStr}`
          ),
          fetch("http://localhost:5000/api/zoneCoordinates"),
        ]);

        // Log status for debugging
        // console.log("crowdResponse status:", crowdResponse.status);
        // console.log("coordsResponse status:", coordsResponse.status);

        if (!crowdResponse.ok) {
          const errorText = await crowdResponse.text();
          throw new Error(
            `crowdResponse error: ${crowdResponse.status} - ${errorText}`
          );
        }
        if (!coordsResponse.ok) {
          const errorText = await coordsResponse.text();
          throw new Error(
            `coordsResponse error: ${coordsResponse.status} - ${errorText}`
          );
        }
        console.log("Responses OK, parsing JSON...");
        const rawCrowdText = await crowdResponse.text();
        const rawCoordsText = await coordsResponse.text();
        // console.log("Raw crowdResponse text:", rawCrowdText);
        // console.log("Raw coordsResponse text:", rawCoordsText);
        let crowdJson;
        let coordsJson;
        try {
         ;
          crowdJson = JSON.parse(rawCrowdText);
        } catch (e) {
          console.error("Failed to parse crowdJson:", e, rawCrowdText);
          crowdJson = {};
        }
        try {
        
          coordsJson = JSON.parse(rawCoordsText);
        } catch (e) {
          console.error("Failed to parse coordsJson:", e, rawCoordsText);
          coordsJson = {};
        }
        // Check if parsed values are objects
        // if (typeof crowdJson === 'object' && crowdJson !== null && !Array.isArray(crowdJson)) {
        //   console.log("Fetched crowdJson (object):", crowdJson);
        // } else {
        //   console.log("crowdJson is not a JSON object:", crowdJson);
        // }
        // if (typeof coordsJson === 'object' && coordsJson !== null && !Array.isArray(coordsJson)) {
        //   console.log("Fetched coordsJson (object):", coordsJson);
        // } else {
        //   console.log("coordsJson is not a JSON object:", coordsJson);
        // }
        setCrowdData(crowdJson);
        setZoneCoords(coordsJson);
        
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  // Effect to merge data for the heatmap (no changes here)
  useEffect(() => {
    if (
      Object.keys(crowdData).length === 0 ||
      Object.keys(zoneCoords).length === 0
    ) {
      setHeatmapPoints([]);
      return;
    }
    const points = Object.entries(crowdData)
      .map(([zone, count]) => {
        const coords = zoneCoords[zone];
        if (!coords) return null;
        return [coords.lat, coords.lng, count];
      })
      .filter((p) => p !== null);
    setHeatmapPoints(points);
  }, [crowdData, zoneCoords]);

  return (
    <div className="bg-white p-6 rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-4">Live Crowd Density</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowHeatmap((prev) => !prev)}
      >
        {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
      </button>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
        
      >
        <ZoomListener setZoom={setZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={30}
        />

        {/* 3. Add the helper component inside the MapContainer */}
        <RecenterAutomatically center={mapCenter} />
        <ZoomListener setZoom={setZoom} />

        {/* Show user's location with a label */}
        <Circle
          center={mapCenter}
          radius={2}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.7 }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            <span className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-xs shadow">
              You
            </span>
          </Tooltip>
        </Circle>

        {/* ... The rest of your JSX for HeatmapLayer and Circles remains the same ... */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapLayer
            points={heatmapPoints}
            longitudeExtractor={(p) => p[1]}
            latitudeExtractor={(p) => p[0]}
            intensityExtractor={(p) => p[2]}
            
            radius={10 * Math.pow(2, zoom - 17)}
            blur={25}
            max={200}
          />
        )}

        {heatmapPoints.map((point) => {
          const zoneName = Object.keys(zoneCoords).find(
            (key) =>
              zoneCoords[key].lat === point[0] &&
              zoneCoords[key].lng === point[1]
          );
          const count = point[2];
          return (
            <Circle
              // key={zoneName}
              center={[point[0], point[1]]}
              radius={5}
              pathOptions={{
                color: "transparent",
                fillColor: "rgba(0,0,0,0.2)",
                fillOpacity: 0.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <span
                  className={`px-3 py-1 rounded-md font-bold shadow text-white text-sm ${
                    count < 50
                      ? "bg-green-600"
                      : count < 120
                      ? "bg-yellow-500"
                      : count < 180
                      ? "bg-orange-500"
                      : "bg-red-600"
                  }`}
                >
                  Zone {zoneName}: {count}
                </span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Add labeled markers for each zone coordinate */}
        
  {/* {console.log('zoneCoords:', zoneCoords)} */}
  {Object.entries(zoneCoords).map(([zone, coords]) => (
          <Circle
            key={`label-${zone}`}
            center={[coords.lat, coords.lng]}
            radius={1.5}
            pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.8 }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <span className="px-2 py-1 rounded bg-black text-white font-bold text-xs shadow">
                Zone {zone}
              </span>
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default CrowdMapHeatmap;
