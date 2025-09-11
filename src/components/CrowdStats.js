// CrowdStats.js - Enhanced UI with live zone-wise crowd data
import React, { useEffect, useState } from "react";

const CrowdStats = () => {
  const [crowdData, setCrowdData] = useState({});

  // Zone limits fetched from API
  const [zoneLimits, setZoneLimits] = useState({});

  // Use safeLimit from API: warning at 70% of safeLimit, danger at 100%
  const getStatus = (count, safeLimit) => {
    if (!safeLimit) return "safe";
    if (count < 0.7 * safeLimit) return "safe";
    if (count < safeLimit) return "warning";
    return "danger";
  };

  const statusClass = (status) => {
    if (status === "safe") return "zone-safe";
    if (status === "warning") return "zone-warning";
    return "zone-danger";
  };

  // Calculate total people
  const getTotalCount = () => {
    const total = Object.values(crowdData).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
    return total.toString();
  };

  // Fetch crowd data from API every 15 seconds

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Fetch crowd data
        const crowdResponse = await fetch(
          `http://localhost:5000/api/recentZoneCounts?eventName=Test%20Event&date=${dateStr}`
        );
        if (!crowdResponse.ok) {
          const errorText = await crowdResponse.text();
          throw new Error(
            `crowdResponse error: ${crowdResponse.status} - ${errorText}`
          );
        }
        const rawCrowdText = await crowdResponse.text();
        let crowdJson;
        try {
          crowdJson = JSON.parse(rawCrowdText);
        } catch (e) {
          console.error("Failed to parse crowdJson:", e, rawCrowdText);
          crowdJson = {};
        }
        setCrowdData(crowdJson);

        // Fetch safe limits
        const safeLimitResponse = await fetch(
          `http://localhost:5000/api/getSafeLimit?eventName=Test%20Event&date=${dateStr}`
        );
        if (safeLimitResponse.ok) {
          const safeLimitJson = await safeLimitResponse.json();
          setZoneLimits(safeLimitJson);
        } else {
          setZoneLimits({});
        }
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <style>{`
        .crowd-container {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
        
        .crowd-header {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        
        .total-count {
          color: #2563eb;
          font-weight: 800;
        }
        
        .zones-grid { 
          display: grid; 
          grid-template-columns: repeat(1, 1fr);
          gap: 16px; 
          padding: 8px;
        }
        
        @media (min-width: 640px) {
          .zones-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 768px) {
          .zones-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (min-width: 1024px) {
          .zones-grid { grid-template-columns: repeat(6, 1fr); }
        }
        
        .zone-card { 
          min-height: 120px; 
          border-width: 2px; 
          border-style: solid; 
          border-radius: 12px; 
          padding: 1rem; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          transition: all 0.3s ease;
          position: relative;
          backdrop-filter: blur(10px);
          text-align: center;
        }
        
        .zone-title { 
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: inherit;
        }
        
        /* Enhanced shadows for all zones */
        .zone-safe {
          background-color: rgba(220, 252, 231, 0.8);
          border-color: #22c55e;
          color: #15803d;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15), 0 2px 4px rgba(34, 197, 94, 0.1);
        }
        
        .zone-safe:hover {
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.2), 0 4px 8px rgba(34, 197, 94, 0.15);
          transform: translateY(-2px);
        }
        
        .zone-warning {
          background-color: rgba(254, 243, 199, 0.8);
          border-color: #eab308;
          color: #ca8a04;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15), 0 2px 4px rgba(251, 191, 36, 0.1);
        }
        
        .zone-warning:hover {
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.2), 0 4px 8px rgba(251, 191, 36, 0.15);
          transform: translateY(-2px);
        }
        
        /* Enhanced danger zone with glow effect */
        .zone-danger {
          background-color: rgba(254, 226, 226, 0.8);
          border-color: #ef4444;
          color: #dc2626;
          box-shadow: 
            0 4px 12px rgba(239, 68, 68, 0.25), 
            0 2px 4px rgba(239, 68, 68, 0.15),
            0 0 20px rgba(239, 68, 68, 0.3);
          animation: danger-glow 2s ease-in-out infinite alternate;
        }
        
        .zone-danger:hover {
          box-shadow: 
            0 8px 30px rgba(239, 68, 68, 0.4), 
            0 4px 12px rgba(239, 68, 68, 0.25),
            0 0 30px rgba(239, 68, 68, 0.5);
          transform: translateY(-3px);
        }
        
        /* Pulsing glow animation for danger zones */
        @keyframes danger-glow {
          0% { 
            box-shadow: 
              0 4px 12px rgba(239, 68, 68, 0.25), 
              0 2px 4px rgba(239, 68, 68, 0.15),
              0 0 20px rgba(239, 68, 68, 0.3);
          }
          100% { 
            box-shadow: 
              0 6px 20px rgba(239, 68, 68, 0.35), 
              0 3px 8px rgba(239, 68, 68, 0.2),
              0 0 35px rgba(239, 68, 68, 0.5);
          }
        }
        
        /* Enhanced count display */
        .count-display {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          margin: 8px 0;
        }
        
        .zone-danger .count-display {
          text-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        
        /* Limits text styling */
        .limits-text {
          font-size: 0.75rem;
          opacity: 0.8;
          font-weight: 500;
          margin-top: 4px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .zone-card {
            min-height: 100px;
            padding: 0.75rem;
          }
          
          .count-display {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="crowd-container">
        {/* <h2 className="crowd-header">
          Total People Detected:{" "}
          <span className="total-count">{getTotalCount()}</span>
        </h2> */}

        <div className="zones-grid">
          {Object.entries(crowdData).map(([zone, count]) => {
            const zoneCount = count ?? 0;
            const safeLimit = zoneLimits[zone];
            const status = getStatus(zoneCount, safeLimit);

            return (
              <div key={zone} className={`zone-card ${statusClass(status)}`}>
                <div className="zone-title">Zone {zone}</div>
                <div>
                  <div className="count-display">{zoneCount}</div>
                  <div className="limits-text">
                    safeLimit: {safeLimit !== undefined ? safeLimit : "N/A"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CrowdStats;
