import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ userRole, isOpen, toggleSidebar }) => {
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

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const renderSidebarContent = () => (
    <>
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Mallez</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors lg:hidden"
        >
          <FaTimes className="text-white" />
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
            onClick={() => {
              if (window.innerWidth < 1024) {
                toggleSidebar();
              }
            }}
          >
            <span className="text-xl mr-4">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
        {renderSidebarContent()}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-white z-50 overflow-y-auto lg:hidden"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
