import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBuilding,
  FaFilm,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ userRole, isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <FaChartBar /> },
    ...(userRole === "admin"
      ? [
          { path: "/users", label: "Users", icon: <FaUsers /> },
          {
            path: "/mall-chains",
            label: "Mall Chains",
            icon: <FaBuilding />,
          },
          {
            path: "/theater-chains",
            label: "Theater Chains",
            icon: <FaFilm />,
          },
        ]
      : []),
    ...(userRole === "mallOwner"
      ? [
          {
            path: "/mall-owner",
            label: "My Location",
            icon: <FaBuilding />,
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
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold text-white">Mallez</h2>
        <button
          onClick={toggleSidebar}
          className="hover:bg-gray-700 lg:hidden p-1 transition-colors rounded-full"
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
            <span className="mr-4 text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="lg:block fixed top-0 left-0 hidden w-64 h-screen overflow-y-auto text-white bg-gray-800">
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
              className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={toggleSidebar}
            />
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-64 overflow-y-auto text-white bg-gray-800"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="bottom-4 right-4 lg:hidden fixed z-50 p-3 text-white bg-gray-800 rounded-full shadow-lg"
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </>
  );
};

export default Sidebar;
