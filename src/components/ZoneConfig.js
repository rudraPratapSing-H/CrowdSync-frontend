import React, { useState, useEffect } from "react";

const EVENT_NAME = "Test Event";

const ZoneConfig = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch zones and safe limits from API
    const fetchZones = async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const safeLimitRes = await fetch(
          `http://localhost:5000/api/getSafeLimit?eventName=${encodeURIComponent(
            EVENT_NAME
          )}&date=${encodeURIComponent(dateStr)}`
        );
        const safeLimits = await safeLimitRes.json();

        // For now, just use the keys as zone names
        const zoneList = Object.keys(safeLimits).map((zoneName) => ({
          name: zoneName,
          safeLimit: safeLimits[zoneName],
        }));

        setZones(zoneList);
      } catch (err) {
        setZones([]);
      }
      setLoading(false);
    };

    fetchZones();
  }, []);

  const handleLimitChange = (idx, value) => {
    const updated = zones.map((zone, i) =>
      i === idx ? { ...zone, safeLimit: Number(value) } : zone
    );
    setZones(updated);
  };

  const handleSave = () => {
    // TODO: Implement API call to update all safe limits
    alert("Safe limits updated (not yet saved to API)");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4 mb-4 flex justify-center items-center">
        <span className="text-blue-500 font-semibold">
          Loading zone configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4 mb-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Zone Configuration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {zones.map((zone, idx) => (
          <div
            key={zone.name}
            className="flex flex-col bg-gray-50 rounded-lg p-4 shadow-sm"
          >
            <div className="font-semibold text-gray-800 mb-2">{zone.name}</div>
            <label className="text-sm text-gray-600 mb-1">Safe Limit</label>
            <input
              type="number"
              min={1}
              value={zone.safeLimit}
              onChange={(e) => handleLimitChange(idx, e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-500 text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 transition"
      >
        Save
      </button>
    </div>
  );
};

export default ZoneConfig;
