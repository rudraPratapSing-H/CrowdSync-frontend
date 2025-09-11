// Dashboard.js - Main dashboard page
import React, { useRef } from "react";
import { auth } from "../firebase";
import CrowdStats from "./CrowdStats";
import CrowdHeatmap from "./CrowdHeatmap";
import CrowdAlerts from "./CrowdAlerts";
import IndoorMap from "./IndoorMap";
import OverviewBanner from "./OverviewBanner";

const handleLogout = async () => {
  await auth.signOut();
  window.location.reload();
};

const Dashboard = () => {
  const venueLayoutRef = useRef(null);
  const alertsRef = useRef(null);

  const handleMapClick = () => {
    if (venueLayoutRef.current) {
      venueLayoutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAlertsClick = () => {
    if (alertsRef.current) {
      alertsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CrowdSync Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Organizer Command Center • Real-time Crowd Intelligence
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                // onClick={...}
              >
                Zone Configuration
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                // onClick={...}
              >
                Attendee Details
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 shadow-sm"
                onClick={handleAlertsClick}
              >
                Alerts
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 shadow-sm"
                onClick={handleMapClick}
              >
                Venue Layout
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <OverviewBanner />
        </div>
        {/* Stats Section */}
        <div className="mb-6">
          <CrowdStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          {/* Indoor Map */}
          <div
            ref={venueLayoutRef}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Venue Layout
            </h2>
            <IndoorMap />
          </div>
        </div>

        {/* Alerts Section */}
        <div ref={alertsRef} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Alerts
          </h2>
          <CrowdAlerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
