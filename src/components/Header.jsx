import React from "react";

const Header = ({ user, onLogout, userRole }) => {
  return (
    <header className="bg-white shadow-md py-4 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          Mallez Admin Dashboard
        </h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-4">
            Welcome, {user.email} ({userRole})
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
