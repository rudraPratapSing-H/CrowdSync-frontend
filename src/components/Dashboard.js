// Dashboard.js - Main dashboard page (placeholder)
import React from 'react';
import Sidebar from './Sidebar';
import { auth } from '../firebase';
import CrowdStats from './CrowdStats';
import CrowdHeatmap from './CrowdHeatmap';

import CrowdAlerts from './CrowdAlerts';
import IndoorMap from './IndoorMap';


const handleLogout = async () => {
  await auth.signOut();
  window.location.reload();
};

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Crowd Management Dashboard</h1>
        <button
          onClick={handleLogout}
          className="mb-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 float-right"
        >
          Logout
        </button>
  <CrowdStats />
  <CrowdHeatmap />
  <CrowdAlerts />
  <IndoorMap />

      </div>
    </div>
  );
};

export default Dashboard;
