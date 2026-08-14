import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EMRPage from "./pages/EMRPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import FormsPage from "./pages/FormsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("hsotap_user");
    return stored ? JSON.parse(stored) : null;
  });

  function handleLogout() {
    localStorage.removeItem("hsotap_token");
    localStorage.removeItem("hsotap_user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      {user && (
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/emr">EMR</Link>
          <Link to="/analytics">Data Analytics</Link>
          <Link to="/forms">Forms</Link>
          {user.role === "admin" && <Link to="/admin">Admin</Link>}
          <span style={{ float: "right" }}>
            {user.name} ({user.role}) <button onClick={handleLogout}>Logout</button>
          </span>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage onLoggedIn={setUser} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emr"
          element={
            <ProtectedRoute user={user}>
              <EMRPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute user={user}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms"
          element={
            <ProtectedRoute user={user}>
              <FormsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}