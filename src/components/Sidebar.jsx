import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ userRole }) => {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <Link
          to="/"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
        >
          Dashboard
        </Link>
        {userRole === "admin" && (
          <Link
            to="/users"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
          >
            Users
          </Link>
        )}
        {userRole === "mallOwner" && (
          <Link
            to="/mall-statistics"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
          >
            Mall Statistics
          </Link>
        )}
        <Link
          to="/profile"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
        >
          Profile
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
