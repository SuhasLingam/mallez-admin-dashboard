import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const Header = ({ user, onLogout, userRole }) => {
  const dashboardTitle =
    userRole === "mallOwner"
      ? "Mall Owners Dashboard"
      : "Mallez Admin Dashboard";

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{dashboardTitle}</h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-4">
            Welcome, <span className="font-semibold">{user.email}</span>{" "}
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {userRole}
            </span>
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
