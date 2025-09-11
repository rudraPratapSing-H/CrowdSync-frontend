import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: "linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            border: "6px solid #2563eb",
            borderTop: "6px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "18px",
          }}
        />
        <style>
          {`@keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }`}
        </style>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#2563eb",
            letterSpacing: "0.02em",
            marginLeft: "20px",
          }}
        >
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Dashboard />
            ) : (
              <Login onLogin={() => setUser(auth.currentUser)} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
