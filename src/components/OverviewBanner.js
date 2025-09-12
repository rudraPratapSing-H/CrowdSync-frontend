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

        // Alert zones: only zones exceeding safeLimit
        let alertCount = 0;
        zoneNames.forEach((zone) => {
          const count = crowdData[zone] || 0;
          const safeLimit = zoneLimits[zone];
          if (safeLimit && count >= safeLimit) {
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
    const intervalId = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-gray-600 font-medium">Loading metrics...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total in Venue Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {totalPopulation.toLocaleString()}
        </div>
        <div className="text-lg font-medium text-gray-700 mb-1">
          Total in Venue
        </div>
        <div className="text-sm text-gray-500">Live count</div>
      </div>

      {/* Total Zones Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {totalZones}
        </div>
        <div className="text-lg font-medium text-gray-700 mb-1">
          Total Zones
        </div>
        <div className="text-sm text-gray-500">Active monitoring</div>
      </div>

      {/* Peak Occupancy Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-cyan-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {peakOccupancy.toLocaleString()}
        </div>
        <div className="text-lg font-medium text-gray-700 mb-1">
          Peak Occupancy
        </div>
        <div className="text-sm text-gray-500">Highest today</div>
      </div>

      {/* Alert Zones Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              alertZones > 0 ? "bg-red-50" : "bg-gray-50"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                alertZones > 0 ? "text-red-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>
        <div
          className={`text-3xl font-bold mb-1 ${
            alertZones > 0 ? "text-red-500" : "text-gray-900"
          }`}
        >
          {alertZones}
        </div>
        <div
          className={`text-lg font-medium mb-1 ${
            alertZones > 0 ? "text-red-600" : "text-gray-700"
          }`}
        >
          Alert Zones
        </div>
        <div
          className={`text-sm ${
            alertZones > 0 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {alertZones > 0 ? "Need attention" : "All zones normal"}
        </div>
      </div>
    </div>
  );
};

export default OverviewBanner;
