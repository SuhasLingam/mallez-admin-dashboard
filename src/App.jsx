import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./components/Dashboard/Dashboard";
import Users from "./components/Users/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Profile from "./components/Profile";

function App() {
  const {
    user,
    userRole,
    loading,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
  } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user)
    return <Login onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} />;
  if (userRole === null)
    return (
      <div>
        Your account is not associated with any role. Please contact an
        administrator.
      </div>
    );
  if (userRole === "user")
    return <div>You are not authorized to access this dashboard.</div>;

  return (
    <Router>
      <div className="flex h-screen bg-mainBackgroundColor font-primary">
        <Sidebar userRole={userRole} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header user={user} onLogout={handleLogout} userRole={userRole} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-mainBackgroundColor text-mainTextColor">
            <Routes>
              <Route path="/" element={<Dashboard userRole={userRole} />} />
              {userRole === "admin" && (
                <Route
                  path="/users"
                  element={
                    <Users userRole={userRole} currentUserEmail={user.email} />
                  }
                />
              )}
              {userRole === "mallOwner" && (
                <Route
                  path="/mall-statistics"
                  element={<div>Mall Statistics Page (To be implemented)</div>}
                />
              )}
              <Route
                path="/profile"
                element={<Profile userRole={userRole} userEmail={user.email} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
