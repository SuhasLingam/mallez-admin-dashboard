import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Sidebar = ({ userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <FaChartBar /> },
    ...(userRole === "admin"
      ? [{ path: "/users", label: "Users", icon: <FaUsers /> }]
      : []),
    ...(userRole === "mallOwner"
      ? [
          {
            path: "/mall-statistics",
            label: "Mall Statistics",
            icon: <FaChartBar />,
          },
        ]
      : []),
    { path: "/profile", label: "Profile", icon: <FaUserCircle /> },
  ];

  return (
    <div
      className={`bg-gray-800 text-white ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && <h2 className="text-xl font-semibold">Mallez</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center py-2 px-4 ${
              location.pathname === item.path
                ? "bg-gray-700"
                : "hover:bg-gray-700"
            } transition-colors`}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span className="ml-4">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
