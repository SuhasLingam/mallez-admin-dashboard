import React from "react";
import { FaUserCircle, FaSignOutAlt, FaBell, FaBars } from "react-icons/fa";

const Header = ({ user, onLogout, userRole, toggleSidebar }) => {
  const dashboardTitle =
    userRole === "admin" ? "Admin Dashboard" : "Mall Owner Dashboard";

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl sm:px-6 lg:px-8 flex items-center justify-between px-4 py-4 mx-auto">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden hover:text-gray-700 mr-4 text-gray-500"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="sm:text-2xl lg:text-3xl text-xl font-bold text-gray-900">
            {dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center">
          <span className="sm:inline lg:text-base hidden mr-4 text-sm">
            {user.email}
          </span>
          <button
            onClick={onLogout}
            className="hover:bg-red-700 lg:text-base flex items-center px-4 py-2 text-sm font-bold text-white bg-red-500 rounded"
          >
            <span className="sm:inline hidden mr-2">Logout</span>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
