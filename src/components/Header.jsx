import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaBell, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ user, onLogout, userRole, toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dashboardTitle =
    userRole === "mallOwner"
      ? "Mall Owners Dashboard"
      : "Mallez Admin Dashboard";

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-gray-600 lg:hidden focus:outline-none"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center">
          <button className="mr-4 text-gray-600 focus:outline-none">
            <FaBell className="h-6 w-6" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center focus:outline-none"
            >
              <FaUserCircle className="h-8 w-8 text-gray-600" />
              <span className="ml-2 text-sm text-gray-700 hidden md:inline-block">
                {user.email}
              </span>
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10"
                >
                  <div className="px-4 py-2 text-sm text-gray-700">
                    {userRole}
                  </div>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <FaSignOutAlt className="inline-block mr-2" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
