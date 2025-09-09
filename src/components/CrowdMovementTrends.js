// CrowdMovementTrends.js - Live movement trends and predictions
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Movement patterns (should match main.py)
const MOVEMENTS = [
  ['A', 'B'],
  ['C', 'B', 'A', 'D'],
  ['E', 'F', 'B'],
  ['D', 'C'],
  ['F', 'A'],
];

const GROUP_LABELS = [
  'Group 1',
  'Group 2',
  'Group 3',
  'Group 4',
  'Group 5',
];


const TIME_INTERVALS = [
  { label: '5 min', value: 1 },
  { label: '10 min', value: 2 },
  { label: '15 min', value: 3 },
  { label: '20 min', value: 4 },
  { label: '25 min', value: 5 },
]; // Each step = 5 min

const CrowdMovementTrends = () => {
  const [zoneData, setZoneData] = useState({});
  const [groupPositions, setGroupPositions] = useState([0, 0, 0, 0, 0]);
  const [selectedInterval, setSelectedInterval] = useState(TIME_INTERVALS[0].value);
  const [alert, setAlert] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const prevAlertRef = useRef(null);

  useEffect(() => {
    const db = getDatabase();
    const crowdRef = ref(db, '/crowd');
    const unsubscribe = onValue(crowdRef, (snapshot) => {
      setZoneData(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  // Alert logic: if any zone predicted population is very high, set alert
  const predictFuturePopulation = useCallback((minutes) => {
    const steps = Math.floor(minutes / 5); // 5 min per step
    let futureZoneCounts = { ...zoneData };
    let futureGroupPositions = [...groupPositions];
    for (let step = 0; step < steps; step++) {
      MOVEMENTS.forEach((path, i) => {
        const currentZone = path[futureGroupPositions[i]];
        const nextPos = (futureGroupPositions[i] + 1) % path.length;
        const nextZone = path[nextPos];
        // Move 10 people per group
        if (futureZoneCounts[currentZone] >= 10) {
          futureZoneCounts[currentZone] -= 10;
          futureZoneCounts[nextZone] = (futureZoneCounts[nextZone] || 0) + 10;
        }
        futureGroupPositions[i] = nextPos;
      });
    }
    return futureZoneCounts;
  }, [zoneData, groupPositions]);

  useEffect(() => {
    const selectedMinutes = TIME_INTERVALS.find(t => t.value === selectedInterval)?.value * 5;
    const futurePopulation = predictFuturePopulation(selectedMinutes);
    let newAlert = null;
    Object.entries(futurePopulation).forEach(([zone, val]) => {
      if (val >= 180) {
        newAlert = `Crowd surge predicted in Zone ${zone} (${val} people)`;
      }
    });
    setAlert(newAlert);
  }, [selectedInterval, zoneData, groupPositions, predictFuturePopulation]);

  // Show notification when alert changes
  useEffect(() => {
    if (alert && alert !== prevAlertRef.current) {
      setShowNotification(true);
      prevAlertRef.current = alert;
      // Hide after 4 seconds
      setTimeout(() => setShowNotification(false), 4000);
    }
  }, [alert]);

  // Simulate group positions (for demo, cycles through movement patterns)
  useEffect(() => {
    const interval = setInterval(() => {
      setGroupPositions(prev => prev.map((pos, i) => (pos + 1) % MOVEMENTS[i].length));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Predict change in each zone for next step
  const predictedChange = {};
  MOVEMENTS.forEach((path, i) => {
    const nextZone = path[(groupPositions[i] + 1) % path.length];
    predictedChange[nextZone] = (predictedChange[nextZone] || 0) + 10; // Assume 10 people move per group
  });

  // Find selected interval in minutes
  const selectedMinutes = TIME_INTERVALS.find(t => t.value === selectedInterval)?.value * 5;
  const futurePopulation = predictFuturePopulation(selectedMinutes);

  return (
    <div className="bg-white p-6 rounded shadow mb-4 relative">
      {showNotification && alert && (
        <div className="fixed top-8 right-8 z-[9999] bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl transition-opacity duration-500 opacity-100 flex items-center space-x-3" style={{ minWidth: '320px', fontSize: '1.15rem' }}>
          <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19a9 9 0 1113.86 0M12 17v.01" /></svg>
          <span className="font-bold">Alert:</span> <span>{alert}</span>
        </div>
      )}
  {/* Live Movement Trends removed as requested */}

      {/* Zone-wise movement summary */}
      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h3 className="text-lg font-bold mb-2">Zone-wise Movement Directions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["A","B","C","D","E","F"].map(zone => {
            // For each zone, count how many people are heading to each other zone and stationary
            let headingCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, stationary: 0 };
            MOVEMENTS.forEach((path, i) => {
              const current = path[groupPositions[i]];
              const next = path[(groupPositions[i] + 1) % path.length];
              if (current === zone) {
                if (next !== current) {
                  headingCounts[next] += 10; // 10 people per group
                } else {
                  headingCounts.stationary += 10;
                }
              }
            });
            return (
              <div key={zone} className="p-3 border rounded bg-white">
                <div className="font-semibold mb-2">Zone {zone}</div>
                <div className="text-sm mb-1">Heading:</div>
                <ul className="mb-1">
                  {["A","B","C","D","E","F"].filter(z => z !== zone).map(z => (
                    <li key={z} className="ml-2">→ Zone {z}: <span className="font-bold text-blue-700">{headingCounts[z]}</span></li>
                  ))}
                </ul>
                <div className="text-sm">Stationary: <span className="font-bold text-gray-700">{headingCounts.stationary}</span></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded shadow">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-bold mr-4">Predicted Population in Zones</h3>
          <label className="mr-2 font-semibold">Time Interval:</label>
          <select
            value={selectedInterval}
            onChange={e => setSelectedInterval(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {TIME_INTERVALS.map(interval => (
              <option key={interval.value} value={interval.value}>{interval.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['A','B','C','D','E','F'].map(zone => {
            const val = futurePopulation[zone] ?? 0;
            let color = 'text-gray-600';
            if (val < 50) color = 'text-green-700';
            else if (val < 120) color = 'text-yellow-600';
            else if (val < 180) color = 'text-orange-600';
            else color = 'text-red-600';
            return (
              <div key={zone} className="p-3 border rounded text-center">
                <div className="font-semibold">Zone {zone}</div>
                <div className={`text-lg font-bold ${color}`}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CrowdMovementTrends;
