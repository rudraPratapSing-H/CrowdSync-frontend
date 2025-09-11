// CrowdAlerts.js - Predict and display crowd surge alerts
import React, { useEffect, useState } from 'react';

const EVENT_NAME = 'Test Event';
 // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
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
        const safeRes = await fetch(`http://localhost:5000/api/getSafeLimit?eventName=${encodeURIComponent(EVENT_NAME)}&date=${encodeURIComponent(DATE)}`);
        const safeJson = await safeRes.json();
        setSafeLimits(safeJson);
        console.log("Fetched safe limits:", safeJson);

        // Fetch predictions from Gemini
        const geminiRes = await fetch('http://localhost:5000/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventName: EVENT_NAME, date: DATE })
        });
        const geminiJson = await geminiRes.json();
        setPredictions(geminiJson);
        console.log("Fetched predictions:", geminiJson);  

        // Fetch recent zone counts
        const recentRes = await fetch(`http://localhost:5000/api/recentZoneCounts?eventName=${encodeURIComponent(EVENT_NAME)}&date=${encodeURIComponent(DATE)}`);
        const recentJson = await recentRes.json();
        setRecentCounts(recentJson);
        console.log("Fetched recent counts:", recentJson);
      } catch (err) {
        setError('Failed to fetch alert data.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  // Find current breaches
  const currentBreaches = Object.entries(recentCounts)
    .filter(([zone, count]) => safeLimits[zone] !== undefined && count >= safeLimits[zone])
    .map(([zone, count]) => ({ zone, count, limit: safeLimits[zone] }));

  // Find future breaches (for each prediction timestamp)
  const futureBreaches = [];
  Object.entries(predictions).forEach(([timestamp, zones]) => {
    Object.entries(zones).forEach(([zone, count]) => {
      if (safeLimits[zone] !== undefined && count >= safeLimits[zone]) {
        futureBreaches.push({ timestamp, zone, count, limit: safeLimits[zone] });
      }
    });
  });

  return (
    <div className="bg-white p-6 rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
        <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Alerts
      </h2>
      {loading ? (
        <div className="text-gray-500">Loading alerts...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          {/* Current breaches */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2 text-red-700">Current Breaches</h3>
            {currentBreaches.length === 0 ? (
              <div className="flex items-center text-green-600 font-semibold">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                All zones are within safe capacity.
              </div>
            ) : (
              <div className="space-y-3">
                {currentBreaches.map(({ zone, count, limit }) => (
                  <div key={zone} className="flex items-center bg-red-100 border-l-4 border-red-600 p-3 rounded shadow">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-red-700 font-semibold">Warning: Zone {zone} is currently above safe limit ({count} / {limit})!</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Future breaches */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-orange-700">Predicted Future Breaches</h3>
            {futureBreaches.length === 0 ? (
              <div className="flex items-center text-green-600 font-semibold">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                No predicted breaches in the next 2 minutes.
              </div>
            ) : (
              <div className="space-y-3">
                {futureBreaches.map(({ timestamp, zone, count, limit }, i) => (
                  <div key={timestamp + zone + i} className="flex items-center bg-orange-100 border-l-4 border-orange-600 p-3 rounded shadow">
                    <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-orange-700 font-semibold">Prediction: Zone {zone} will exceed safe limit ({count} / {limit}) at {timestamp}.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CrowdAlerts;
