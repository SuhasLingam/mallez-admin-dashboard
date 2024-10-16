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
    <header className="px-6 py-4 bg-white shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden focus:outline-none mr-4 text-gray-600"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="focus:outline-none flex items-center"
            >
              <FaUserCircle className="w-8 h-8 text-gray-600" />
              <span className="md:inline-block hidden ml-2 text-sm text-gray-700">
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
                  className="absolute right-0 z-10 w-48 mt-2 overflow-hidden bg-white rounded-md shadow-xl"
                >
                  <div className="px-4 py-2 text-sm text-gray-700">
                    {userRole}
                  </div>
                  <button
                    onClick={onLogout}
                    className="hover:bg-gray-100 block w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors duration-150"
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
