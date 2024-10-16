import React from "react";

const UnauthorizedModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50"
      id="my-modal"
    >
      <div className="top-20 w-96 relative p-5 mx-auto bg-white border rounded-md shadow-lg">
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Unauthorized Access
          </h3>
          <div className="px-7 py-3 mt-2">
            <p className="text-sm text-gray-500">
              You are not authorized to access this dashboard. Please contact an
              administrator for assistance.
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4 py-2 text-base font-medium text-white bg-blue-500 rounded-md shadow-sm"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedModal;
