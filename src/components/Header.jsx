import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaBell } from "react-icons/fa";

const Header = ({ user, onLogout, userRole }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dashboardTitle =
    userRole === "mallOwner"
      ? "Mall Owners Dashboard"
      : "Mallez Admin Dashboard";

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {dashboardTitle}
        </h1>
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center focus:outline-none"
            >
              <FaUserCircle className="h-8 w-8 text-gray-600" />
              <span className="ml-2 text-sm text-gray-700">{user.email}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                <div className="px-4 py-2 text-sm text-gray-700">
                  {userRole}
                </div>
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="inline-block mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
