import React from "react";
import { FaUserCircle, FaSignOutAlt, FaBell, FaBars } from "react-icons/fa";

const Header = ({ user, onLogout, userRole, toggleSidebar }) => {
  const dashboardTitle =
    userRole === "admin" ? "Admin Dashboard" : "Mall Owner Dashboard";

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center">
          <span className="hidden sm:inline mr-4 text-sm lg:text-base">
            {user.email}
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm lg:text-base flex items-center"
          >
            <span className="hidden sm:inline mr-2">Logout</span>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
