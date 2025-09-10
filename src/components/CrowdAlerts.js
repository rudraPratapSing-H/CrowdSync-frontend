// CrowdAlerts.js - Enhanced UI with crowd surge alerts and smart zone suggestions
import React, { useEffect, useState } from "react";

const EVENT_NAME = "Test Event";
// Get today's date in YYYY-MM-DD format
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const dateStr = `${yyyy}-${mm}-${dd}`;

const DATE = dateStr;

const CrowdAlerts = () => {
  const [safeLimits, setSafeLimits] = useState({});
  const [predictions, setPredictions] = useState({});
  const [recentCounts, setRecentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // Fetch safe limits
        const safeRes = await fetch(
          `http://localhost:5000/api/getSafeLimit?eventName=${encodeURIComponent(
            EVENT_NAME
          )}&date=${encodeURIComponent(DATE)}`
        );
        const safeJson = await safeRes.json();
        setSafeLimits(safeJson);
        console.log("Fetched safe limits:", safeJson);

        // Fetch predictions from Gemini
        const geminiRes = await fetch("http://localhost:5000/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventName: EVENT_NAME, date: DATE }),
        });
        const geminiJson = await geminiRes.json();
        setPredictions(geminiJson);
        console.log("Fetched predictions:", geminiJson);

        // Fetch recent zone counts
        const recentRes = await fetch(
          `http://localhost:5000/api/recentZoneCounts?eventName=${encodeURIComponent(
            EVENT_NAME
          )}&date=${encodeURIComponent(DATE)}`
        );
        const recentJson = await recentRes.json();
        setRecentCounts(recentJson);
        console.log("Fetched recent counts:", recentJson);
      } catch (err) {
        setError("Failed to fetch alert data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  // Find current breaches
  const currentBreaches = Object.entries(recentCounts)
    .filter(
      ([zone, count]) =>
        safeLimits[zone] !== undefined && count >= safeLimits[zone]
    )
    .map(([zone, count]) => ({ zone, count, limit: safeLimits[zone] }));

  // Find zones approaching limit (80-99% capacity)
  const approachingLimit = Object.entries(recentCounts)
    .filter(([zone, count]) => {
      if (safeLimits[zone] === undefined) return false;
      const utilizationPercent = (count / safeLimits[zone]) * 100;
      return utilizationPercent >= 80 && utilizationPercent < 100;
    })
    .map(([zone, count]) => ({
      zone,
      count,
      limit: safeLimits[zone],
      spotsRemaining: safeLimits[zone] - count,
    }));

  // Find future breaches (for each prediction timestamp)
  const futureBreaches = [];
  Object.entries(predictions).forEach(([timestamp, zones]) => {
    Object.entries(zones).forEach(([zone, count]) => {
      if (safeLimits[zone] !== undefined && count >= safeLimits[zone]) {
        futureBreaches.push({
          timestamp,
          zone,
          count,
          limit: safeLimits[zone],
        });
      }
    });
  });

  // Generate smart suggestions for crowd redistribution
  const generateSuggestions = (targetZone) => {
    // Find safe zones with available capacity
    const safeZones = Object.entries(recentCounts)
      .filter(
        ([zone, count]) =>
          safeLimits[zone] !== undefined && count < safeLimits[zone] * 0.7 // Less than 70% capacity
      )
      .map(([zone, count]) => ({
        zone,
        count,
        limit: safeLimits[zone],
        availableCapacity: safeLimits[zone] - count,
        utilizationPercent: Math.round((count / safeLimits[zone]) * 100),
      }))
      .sort((a, b) => b.availableCapacity - a.availableCapacity)
      .slice(0, 3); // Top 3 alternatives

    return safeZones.map((sz) => sz.zone);
  };

  const hasAlerts =
    currentBreaches.length > 0 ||
    approachingLimit.length > 0 ||
    futureBreaches.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">
            Loading alerts...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <svg
          className="w-6 h-6 text-red-500 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h2 className="text-xl font-bold text-gray-900">
          Active Alerts & Recommendations
        </h2>
      </div>

      {!hasAlerts ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span className="text-green-700 font-medium">
              All zones are operating within safe capacity
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Breaches */}
          {currentBreaches.map(({ zone, count, limit }) => {
            const excessCount = count - limit;
            const suggestions = generateSuggestions(zone);

            return (
              <div
                key={zone}
                className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="text-lg font-semibold text-red-700">
                      Zone {zone} Overcrowded
                    </span>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {count}/{limit}
                  </span>
                </div>
                <div className="text-red-600 mb-3">
                  Current: <span className="font-semibold">{count} people</span>{" "}
                  • Capacity exceeded by{" "}
                  <span className="font-semibold">{excessCount}</span>
                </div>

                {suggestions.length > 0 && (
                  <div className="bg-white bg-opacity-60 rounded-lg p-3">
                    <div className="flex items-center text-red-700">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        ></path>
                      </svg>
                      <span className="font-medium">Suggestion:</span>
                      <span className="ml-2">
                        Redirect flow: Zone {zone} → {suggestions.join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Approaching Limit */}
          {approachingLimit.map(({ zone, count, limit, spotsRemaining }) => (
            <div
              key={zone}
              className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-lg font-semibold text-yellow-700">
                    Zone {zone} Approaching Limit
                  </span>
                </div>
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {count}/{limit}
                </span>
              </div>
              <div className="text-yellow-700">
                Monitor closely •{" "}
                <span className="font-semibold">
                  {spotsRemaining} spots remaining
                </span>
              </div>
            </div>
          ))}

          {/* Future Breaches */}
          {futureBreaches.map(({ timestamp, zone, count, limit }, index) => (
            <div
              key={`${timestamp}-${zone}-${index}`}
              className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-lg font-semibold text-orange-700">
                    Zone {zone} Predicted Breach
                  </span>
                </div>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {count}/{limit}
                </span>
              </div>
              <div className="text-orange-700">
                Predicted at <span className="font-semibold">{timestamp}</span>{" "}
                • Expected:{" "}
                <span className="font-semibold">{count} people</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrowdAlerts;
