import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaChartBar, FaUser } from "react-icons/fa";

const Sidebar = ({ userRole }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center py-3 px-4 rounded transition duration-200 ${
      isActive(path)
        ? "bg-blue-500 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav className="space-y-2">
        <Link to="/" className={linkClass("/")}>
          <FaHome className="mr-3" />
          Dashboard
        </Link>
        {userRole === "admin" && (
          <Link to="/users" className={linkClass("/users")}>
            <FaUsers className="mr-3" />
            Users
          </Link>
        )}
        {userRole === "mallOwner" && (
          <Link to="/mall-statistics" className={linkClass("/mall-statistics")}>
            <FaChartBar className="mr-3" />
            Mall Statistics
          </Link>
        )}
        <Link to="/profile" className={linkClass("/profile")}>
          <FaUser className="mr-3" />
          Profile
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
