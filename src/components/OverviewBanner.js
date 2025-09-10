// OverviewBanner.js - Key metrics overview component (Dynamic zones, API-based)
import React, { useState, useEffect } from "react";

const OverviewBanner = () => {
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [peakOccupancy, setPeakOccupancy] = useState(0);
  const [alertZones, setAlertZones] = useState(0);
  const [totalZones, setTotalZones] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
        let crowdData = {};
        if (crowdResponse.ok) {
          const rawCrowdText = await crowdResponse.text();
          try {
            crowdData = JSON.parse(rawCrowdText);
          } catch (e) {
            crowdData = {};
          }
        }

        // Fetch safe limits
        const safeLimitResponse = await fetch(
          `http://localhost:5000/api/getSafeLimit?eventName=Test%20Event&date=${dateStr}`
        );
        let zoneLimits = {};
        if (safeLimitResponse.ok) {
          zoneLimits = await safeLimitResponse.json();
        }

        // Calculate metrics
        const zoneNames = Object.keys(crowdData);
        setTotalZones(zoneNames.length);

        const total = Object.values(crowdData).reduce(
          (sum, count) => sum + (count || 0),
          0
        );
        setTotalPopulation(total);

        setPeakOccupancy((prev) => Math.max(prev, total));

        // Alert zones: warning or danger (>= 70% of safeLimit)
        let alertCount = 0;
        zoneNames.forEach((zone) => {
          const count = crowdData[zone] || 0;
          const safeLimit = zoneLimits[zone];
          if (safeLimit && count >= 0.7 * safeLimit) {
            alertCount++;
          }
        });
        setAlertZones(alertCount);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-center items-center">
          <span className="text-blue-600 font-semibold">
            Loading metrics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Population */}
        <div className="rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {totalPopulation.toLocaleString()}
          </div>
          <div className="text-blue-500 text-sm font-medium">
            Total Population
          </div>
        </div>

        {/* Peak Occupancy */}
        <div className="rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {peakOccupancy.toLocaleString()}
          </div>
          <div className="text-blue-500 text-sm font-medium">
            Peak Occupancy
          </div>
        </div>

        {/* Alert Zones */}
        <div className="rounded-lg p-4 text-center">
          <div
            className={`text-3xl font-bold mb-1 ${
              alertZones > 0 ? "text-red-500" : "text-blue-700"
            }`}
          >
            {alertZones}
          </div>
          <div className="text-red-500 text-sm font-medium">Alert Zones</div>
        </div>

        {/* Total Zones */}
        <div className="rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {totalZones}
          </div>
          <div className="text-blue-500 text-sm font-medium">Total Zones</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewBanner;
