// CrowdStats.js
import React, { useEffect, useState } from "react";

const CrowdStats = () => {
  const [crowdData, setCrowdData] = useState({});
  const [zoneLimits, setZoneLimits] = useState({});
  const [lastMovement, setLastMovement] = useState(""); // For last movement log
  const [divergenceOn, setDivergenceOn] = useState(false); // Divergence status

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

  // Group zones by status
  const groupZones = () => {
    const groups = { safe: [], warning: [], danger: [] };
    Object.entries(crowdData).forEach(([zone, count]) => {
      const zoneCount = count ?? 0;
      const safeLimit = zoneLimits[zone];
      const status = getStatus(zoneCount, safeLimit);
      groups[status].push({
        zone,
        count: zoneCount,
        safeLimit,
        status,
      });
    });
    return groups;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const eventName = "Test Event";

        const crowdResponse = await fetch(
          `http://localhost:5000/api/recentZoneCounts?eventName=${encodeURIComponent(
            eventName
          )}&date=${dateStr}`
        );
        const crowdJson = await crowdResponse.json();
        setCrowdData(crowdJson);

        const safeLimitResponse = await fetch(
          `http://localhost:5000/api/getSafeLimit?eventName=${encodeURIComponent(
            eventName
          )}&date=${dateStr}`
        );
        if (safeLimitResponse.ok) {
          const safeLimitJson = await safeLimitResponse.json();
          setZoneLimits(safeLimitJson);
        } else {
          setZoneLimits({});
        }

        // Fetch last movement log
        const divergenceRes = await fetch(
          `http://localhost:5000/api/divergence/${encodeURIComponent(
            eventName
          )}`
        );
        if (divergenceRes.ok) {
          const divergenceJson = await divergenceRes.json();
          const movements = divergenceJson.movements || [];
          setLastMovement(
            movements.length > 0 ? movements[movements.length - 1] : ""
          );
        } else {
          setLastMovement("");
        }
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const groups = groupZones();

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
  .zone-card {
    min-height: 120px;
        // Fetch divergence status and last movement log
    border-width: 2px;
    border-style: solid;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
          setDivergenceOn(!!divergenceJson.divergence);
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    position: relative;
    z-index: 0;
  }
  @media (min-width: 768px) {
    .zone-card { min-width: 210px; }
  }
  @media (min-width: 1024px) {
    .zone-card { min-width: 280px; }
  }
  .zone-title { font-size: 1rem; font-weight: 600; }
  .count-display { font-size: 1.5rem; font-weight: 700; }
  .limits-text { font-size: 0.75rem; opacity: 0.8; }
  .zone-safe { background: #dcfce7; border-color: #22c55e; color: #15803d; }
  .zone-warning { background: #fef3c7; border-color: #eab308; color: #92400e; }
  .zone-danger {
    background: #fee2e2;
    border-color: #ef4444;
    color: #b91c1c;
    animation: danger-glow 5s infinite alternate;
  }
  @keyframes danger-glow {
    0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
    100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
  }
  .zones-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .zones-scroll::-webkit-scrollbar { height: 6px; }
  .zones-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }
  .movement-log {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: #1e293b;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(30,64,175,0.06);
  }
`}</style>

      <div className="crowd-container">
        {["danger", "warning", "safe"].map(
          (status) =>
            groups[status].length > 0 && (
              <div key={status}>
                <div className="font-semibold mb-2 capitalize">
                  {status} Zones
                </div>
                <div className="zones-scroll">
                  {groups[status].map(({ zone, count, safeLimit }) => (
                    <div
                      key={zone}
                      className={`zone-card ${statusClass(status)}`}
                    >
                      <div className="zone-title">Zone {zone}</div>
                      <div className="count-display">{count}</div>
                      <div className="limits-text">
                        Safe Limit: {safeLimit ?? "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Diverge Crowd button below danger zone list */}
                {status === "danger" && groups["danger"].length > 0 && (
                  <>
                    <div className="flex justify-start mg-b-1 mt-4 mb-2">
                      <button
                        className={
                          divergenceOn
                            ? "bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition border-2 border-green-700"
                            : "bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition border-2 border-red-700"
                        }
                        onClick={async () => {
                          try {
                            const eventName = "Test Event";
                            const response = await fetch(
                              `http://localhost:5000/api/divergence/${encodeURIComponent(
                                eventName
                              )}/toggle`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                              }
                            );
                            if (response.ok) {
                              const data = await response.json();
                              setDivergenceOn(!!data.divergence);
                              alert(
                                `Divergence status toggled!\nCurrent status: ${
                                  data.divergence ? "ON" : "OFF"
                                }`
                              );
                            } else {
                              alert("Failed to trigger diverge crowd action.");
                            }
                          } catch (err) {
                            alert("Error connecting to backend.");
                          }
                        }}
                      >
                        {divergenceOn ? "Divergence ON" : "Diverge Crowd"}
                      </button>
                    </div>
                    {/* Movement log display */}
                    {lastMovement && (
                      <div className="movement-log">
                        <span className="font-semibold text-blue-700">
                          Last Movement Log:
                        </span>
                        <br />
                        {lastMovement}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
        )}
      </div>
    </>
  );
};

export default CrowdStats;
