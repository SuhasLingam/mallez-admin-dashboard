import React from "react";
import { FaUserCircle, FaSignOutAlt, FaBell, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ user, onLogout, userRole, toggleSidebar }) => {
  const dashboardTitle =
    userRole === "admin" ? "Admin Dashboard" : "Mall Owner Dashboard";

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{dashboardTitle}</h1>
        <div className="flex items-center">
          <span className="mr-4">{user.email}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
          <button
            onClick={toggleSidebar}
            className="ml-4 lg:hidden bg-gray-200 p-2 rounded-md"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
