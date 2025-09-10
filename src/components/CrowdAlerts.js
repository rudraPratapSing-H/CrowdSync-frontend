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
  const generateSuggestions = () => {
    if (currentBreaches.length === 0 && futureBreaches.length === 0) return [];

    // Find safe zones with available capacity
    const safeZones = Object.entries(recentCounts)
      .filter(
        ([zone, count]) =>
          safeLimits[zone] !== undefined && count < safeLimits[zone]
      )
      .map(([zone, count]) => ({
        zone,
        count,
        limit: safeLimits[zone],
        availableCapacity: safeLimits[zone] - count,
        utilizationPercent: Math.round((count / safeLimits[zone]) * 100),
      }))
      .sort((a, b) => b.availableCapacity - a.availableCapacity); // Sort by most available capacity

    const suggestions = [];

    // Suggestions for current breaches
    currentBreaches.forEach(({ zone, count, limit }) => {
      const excessPeople = count - limit;
      const bestSafeZones = safeZones
        .filter((sz) => sz.availableCapacity >= Math.min(excessPeople, 10))
        .slice(0, 2);

      if (bestSafeZones.length > 0) {
        suggestions.push({
          type: "current",
          fromZone: zone,
          excessPeople,
          recommendations: bestSafeZones,
          priority: "high",
        });
      }
    });

    // Suggestions for future breaches
    if (currentBreaches.length === 0 && futureBreaches.length > 0) {
      const futureZones = [...new Set(futureBreaches.map((fb) => fb.zone))];
      futureZones.forEach((zone) => {
        const bestSafeZones = safeZones.slice(0, 2);
        if (bestSafeZones.length > 0) {
          suggestions.push({
            type: "preventive",
            fromZone: zone,
            recommendations: bestSafeZones,
            priority: "medium",
          });
        }
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  return (
    <>
      <style>{`
        .alerts-container {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
        
        .alerts-header {
          display: flex;
          align-items: center;
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #dc2626;
        }
        
        .header-icon {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.5rem;
          color: #dc2626;
        }
        
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #6b7280;
          font-size: 1rem;
        }
        
        .loading-spinner {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .error-state {
          background: rgba(254, 226, 226, 0.8);
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 1rem;
          color: #dc2626;
          font-weight: 600;
          text-align: center;
        }
        
        .section {
          margin-bottom: 1.5rem;
        }
        
        .section:last-child {
          margin-bottom: 0;
        }
        
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .current-title { color: #dc2626; }
        .future-title { color: #ea580c; }
        .suggestions-title { color: #0d9488; }
        
        .safe-status {
          display: flex;
          align-items: center;
          background: rgba(220, 252, 231, 0.8);
          border: 2px solid #22c55e;
          border-radius: 8px;
          padding: 1rem;
          color: #15803d;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }
        
        .safe-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
          color: #15803d;
        }
        
        .alerts-list, .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .alert-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          border-left-width: 4px;
          border-left-style: solid;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .alert-card:hover {
          transform: translateX(4px);
        }
        
        .current-alert {
          background: rgba(254, 226, 226, 0.9);
          border-left-color: #dc2626;
          color: #dc2626;
          box-shadow: 
            0 4px 12px rgba(239, 68, 68, 0.2), 
            0 2px 4px rgba(239, 68, 68, 0.15);
          animation: urgent-pulse 2s ease-in-out infinite alternate;
        }
        
        .current-alert:hover {
          box-shadow: 
            0 8px 25px rgba(239, 68, 68, 0.3), 
            0 4px 8px rgba(239, 68, 68, 0.2);
        }
        
        .future-alert {
          background: rgba(255, 237, 213, 0.9);
          border-left-color: #ea580c;
          color: #ea580c;
          box-shadow: 
            0 4px 12px rgba(234, 88, 12, 0.15), 
            0 2px 4px rgba(234, 88, 12, 0.1);
        }
        
        .future-alert:hover {
          box-shadow: 
            0 8px 25px rgba(234, 88, 12, 0.25), 
            0 4px 8px rgba(234, 88, 12, 0.15);
        }
        
        .suggestion-card {
          background: rgba(204, 251, 241, 0.9);
          border-left-color: #0d9488;
          color: #0f766e;
          box-shadow: 
            0 4px 12px rgba(13, 148, 136, 0.15), 
            0 2px 4px rgba(13, 148, 136, 0.1);
          padding: 1.25rem;
        }
        
        .suggestion-card:hover {
          box-shadow: 
            0 8px 25px rgba(13, 148, 136, 0.25), 
            0 4px 8px rgba(13, 148, 136, 0.15);
          transform: translateX(4px);
        }
        
        @keyframes urgent-pulse {
          0% { 
            box-shadow: 
              0 4px 12px rgba(239, 68, 68, 0.2), 
              0 2px 4px rgba(239, 68, 68, 0.15);
          }
          100% { 
            box-shadow: 
              0 6px 20px rgba(239, 68, 68, 0.3), 
              0 3px 8px rgba(239, 68, 68, 0.2);
          }
        }
        
        .alert-icon, .suggestion-icon {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        
        .alert-text, .suggestion-text {
          flex: 1;
        }
        
        .zone-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.9);
          color: inherit;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          margin: 0 0.25rem;
          font-size: 0.9em;
        }
        
        .count-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.9);
          color: inherit;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          margin: 0 0.25rem;
          font-size: 0.9em;
        }
        
        .recommendations {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .recommendation-item {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.9em;
          font-weight: 500;
        }
        
        .capacity-bar {
          display: inline-block;
          width: 40px;
          height: 6px;
          background: rgba(13, 148, 136, 0.2);
          border-radius: 3px;
          margin: 0 0.5rem;
          position: relative;
          overflow: hidden;
        }
        
        .capacity-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: #0d9488;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .alerts-container {
            padding: 1rem;
          }
          
          .alerts-header {
            font-size: 1.125rem;
          }
          
          .section-title {
            font-size: 1rem;
          }
          
          .alert-card, .suggestion-card {
            padding: 0.75rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .alert-icon, .suggestion-icon {
            margin-right: 0;
          }
          
          .recommendations {
            width: 100%;
          }
        }
      `}</style>

      <div className="alerts-container">
        <h2 className="alerts-header">
          <svg
            className="header-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Crowd Alerts
        </h2>

        {loading ? (
          <div className="loading-state">
            <svg
              className="loading-spinner"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Loading alerts...
          </div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            {/* Current breaches */}
            <div className="section">
              <h3 className="section-title current-title">
                🚨 Current Breaches
              </h3>
              {currentBreaches.length === 0 ? (
                <div className="safe-status">
                  <svg
                    className="safe-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  All zones are within safe capacity.
                </div>
              ) : (
                <div className="alerts-list">
                  {currentBreaches.map(({ zone, count, limit }) => (
                    <div key={zone} className="alert-card current-alert">
                      <svg
                        className="alert-icon"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="alert-text">
                        Critical: Zone{" "}
                        <span className="zone-badge">{zone}</span> is currently
                        above safe limit (
                        <span className="count-badge">{count}</span> /{" "}
                        <span className="count-badge">{limit}</span>)!
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Future breaches */}
            <div className="section">
              <h3 className="section-title future-title">
                ⚠️ Predicted Future Breaches
              </h3>
              {futureBreaches.length === 0 ? (
                <div className="safe-status">
                  <svg
                    className="safe-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  No predicted breaches in the next 2 minutes.
                </div>
              ) : (
                <div className="alerts-list">
                  {futureBreaches.map(
                    ({ timestamp, zone, count, limit }, i) => (
                      <div
                        key={timestamp + zone + i}
                        className="alert-card future-alert"
                      >
                        <svg
                          className="alert-icon"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="alert-text">
                          Prediction: Zone{" "}
                          <span className="zone-badge">{zone}</span> will exceed
                          safe limit (
                          <span className="count-badge">{count}</span> /{" "}
                          <span className="count-badge">{limit}</span>) at{" "}
                          <strong>{timestamp}</strong>
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="section">
                <h3 className="section-title suggestions-title">
                  💡 Smart Recommendations
                </h3>
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="alert-card suggestion-card">
                      <svg
                        className="suggestion-icon"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <div className="suggestion-text">
                        <div>
                          {suggestion.type === "current" ? (
                            <>
                              <strong>Immediate Action:</strong> Redirect{" "}
                              <span className="count-badge">
                                {suggestion.excessPeople}
                              </span>{" "}
                              people from Zone{" "}
                              <span className="zone-badge">
                                {suggestion.fromZone}
                              </span>{" "}
                              to safer areas:
                            </>
                          ) : (
                            <>
                              <strong>Preventive Measure:</strong> Consider
                              directing new arrivals away from Zone{" "}
                              <span className="zone-badge">
                                {suggestion.fromZone}
                              </span>{" "}
                              to:
                            </>
                          )}
                        </div>
                        <div className="recommendations">
                          {suggestion.recommendations.map((rec, i) => (
                            <div key={rec.zone} className="recommendation-item">
                              🎯 Zone{" "}
                              <span className="zone-badge">{rec.zone}</span>
                              <span className="capacity-bar">
                                <span
                                  className="capacity-fill"
                                  style={{
                                    width: `${rec.utilizationPercent}%`,
                                  }}
                                ></span>
                              </span>
                              <span className="count-badge">
                                {rec.availableCapacity}
                              </span>{" "}
                              spots available ({rec.utilizationPercent}% full)
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CrowdAlerts;
