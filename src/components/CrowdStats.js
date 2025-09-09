// CrowdStats.js - Live zone-wise crowd data from Firebase Realtime Database
import React, { useEffect, useState } from 'react';




const CrowdStats = () => {
 
  const [crowdData, setCrowdData] = useState({});


  // Fetch crowd data from API every 15 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
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
       
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);


  const total = "99+"

  return (
    <div className="bg-white p-6 rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">Total People Detected: <span className="text-blue-600">{total}</span></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(crowdData).map(([zone, count]) => (
          <div key={zone} className="p-4 border rounded text-center">
            <div className="text-lg font-semibold">Zone {zone}</div>
            <div
              className={`text-2xl font-bold ${(() => {
                const val = count ?? 0;
                if (val < 50) return 'text-green-700';
                if (val < 120) return 'text-yellow-600';
                if (val < 180) return 'text-orange-600';
                return 'text-red-600';
              })()}`}
            >
              {count ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrowdStats;
