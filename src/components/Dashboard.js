// Dashboard.js - Main dashboard page
import React from "react";
import Sidebar from "./Sidebar";
import { auth } from "../firebase";
import CrowdStats from "./CrowdStats";
import CrowdHeatmap from "./CrowdHeatmap";
import CrowdAlerts from "./CrowdAlerts";
import IndoorMap from "./IndoorMap";

const handleLogout = async () => {
  await auth.signOut();
  window.location.reload();
};

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CrowdSync Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time crowd monitoring & management
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <CrowdStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          {/* Heatmap
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Live Heatmap
            </h2>
            <CrowdHeatmap />
          </div> */}

          {/* Indoor Map */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Venue Layout
            </h2>
            <IndoorMap />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
