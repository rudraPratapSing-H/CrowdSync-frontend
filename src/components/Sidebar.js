// Sidebar.js - Sidebar navigation
import React from 'react';


import { auth } from '../firebase';

const handleLogout = async () => {
  await auth.signOut();
  window.location.reload();
};

const Sidebar = () => (
  <nav className="w-64 bg-gray-800 text-white flex flex-col py-8 px-4 min-h-screen justify-between">
    <div>
      <div className="text-2xl font-bold mb-8">Event Organizer</div>
      <ul className="space-y-4">
        <li><a href="#" className="hover:text-blue-400">Home</a></li>
        <li><a href="#" className="hover:text-blue-400">Analytics</a></li>
        <li><a href="#" className="hover:text-blue-400">Alerts</a></li>
        <li><a href="#" className="hover:text-blue-400">Settings</a></li>
      </ul>
    </div>
    <button
      onClick={handleLogout}
      className="mt-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
    >
      Logout
    </button>
  </nav>
);

export default Sidebar;
