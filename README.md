# 🚦 Crowd Dashboard

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen)

A modern, responsive dashboard for real-time crowd management, visualization, and analytics. Integrates seamlessly with a Node.js/Express backend, MongoDB Atlas, and supports JWT authentication for users and volunteers.

---

## 🎬 Demo Video
[Watch the demo on Google Drive](https://drive.google.com/drive/folders/1CpuSH3ARzO7YxDgj9sGSa0s3UJev6z7K)

---

![Crowd Dashboard Screenshot](docs/screenshot.png)

---

## ✨ Features

- 🗺️ **Live Indoor Map**: Zone-wise crowd heatmap and safe limit coloring
- 📊 **Real-Time Stats**: Live zone statistics and alerts
- 🔒 **JWT Authentication**: User & volunteer login/signup
- 📱 **Responsive UI**: Mobile-friendly and accessible
- 🔗 **REST API Integration**: Fetches live data from backend

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm
- Backend API running (see main project README)

### Installation
```bash
cd crowd-dashboard
npm install
```

### Running the App
```bash
npm start
```
The app will run at [http://localhost:3000](http://localhost:3000) by default.

### Environment Variables
Create a `.env` file if you need to override the default API URL:
```
REACT_APP_API_URL=http://localhost:5000
```

## 🗂️ Project Structure
```
crowd-dashboard/
  src/
    components/
      IndoorMap.js
      CrowdStats.js
      CrowdAlerts.js
      Login.js
      Dashboard.js
      ...
    App.js
    index.js
  public/
  package.json
  README.md
```

## 🔌 API Endpoints Used
- `/api/recentZoneCounts` — Live zone headcounts
- `/api/getSafeLimit` — Safe limits for each zone
- `/api/signup`, `/api/login` — User authentication
- `/api/volunteer/signup`, `/api/volunteer/login` — Volunteer authentication
- `/api/eventLayout` — Event layout and zone coordinates

## 🛠️ Customization
- Edit `src/components/IndoorMap.js` for map logic and coloring
- Edit `src/components/CrowdStats.js` for stats display
- Edit `src/components/CrowdAlerts.js` for alert logic
- Edit `src/components/Login.js` for authentication UI
- Edit `src/components/Dashboard.js` for dashboard layout

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
MIT

---

> _This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)._

For advanced usage, scripts, and troubleshooting, see the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
