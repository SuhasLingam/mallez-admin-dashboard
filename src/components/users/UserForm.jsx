import React from "react";
import { FaTimes } from "react-icons/fa";

const UserForm = ({
  user,
  onSubmit,
  onClose,
  onInputChange,
  onVehicleNumberChange,
  onAddVehicleNumber,
  onRemoveVehicleNumber,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {user.id ? "Edit User" : "Add New User"}
          </h3>
          <form onSubmit={onSubmit} className="mt-2 text-left">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={user.email || ""}
                onChange={onInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={user.firstName || ""}
                onChange={onInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={user.lastName || ""}
                onChange={onInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="role"
              >
                Role
              </label>
              <select
                name="role"
                value={user.role || ""}
                onChange={onInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="mallOwner">Mall Owner</option>
                <option value="user">User</option>
              </select>
            </div>
            {user.role === "user" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Vehicle Numbers
                </label>
                {user.vehicleNumbers &&
                  user.vehicleNumbers.map((vn, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={vn || ""}
                        onChange={(e) =>
                          onVehicleNumberChange(index, e.target.value)
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveVehicleNumber(index)}
                        className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                <button
                  type="button"
                  onClick={onAddVehicleNumber}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Vehicle Number
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {user.id ? "Update" : "Add"} User
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
