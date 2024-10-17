import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const UserForm = ({
  user,
  onSubmit,
  onClose,
  onInputChange,
  onVehicleNumberChange,
  onAddVehicleNumber,
  onRemoveVehicleNumber,
}) => {
  const validateVehicleNumber = (number) => {
    const pattern = /\b[A-Z]{2}[-.\s]?\d{2}[-.\s]?[A-Z]{1,2}[-.\s]?\d{4}\b/;
    return pattern.test(number);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-lg mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t">
            <h3 className="text-2xl font-semibold">
              {user.id ? "Edit User" : "Add New User"}
            </h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-gray-300 bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl text-gray-300 outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <form onSubmit={onSubmit} className="px-6 py-4">
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                id="firstName"
                type="text"
                placeholder="First Name"
                name="firstName"
                value={user.firstName}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                id="lastName"
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={user.lastName}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor="role"
              >
                Role
              </label>
              <select
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                id="role"
                name="role"
                value={user.role}
                onChange={onInputChange}
              >
                <option value="user">User</option>
                <option value="mallOwner">Mall Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor="vehicleNumbers"
              >
                Vehicle Numbers
              </label>
              {user.vehicleNumbers.map((vn, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    className="w-full px-3 py-2 mr-2 leading-tight text-gray-700 uppercase border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    type="text"
                    value={vn}
                    onChange={(e) =>
                      onVehicleNumberChange(index, e.target.value)
                    }
                    placeholder={`Vehicle Number ${index + 1}`}
                  />
                  {!validateVehicleNumber(vn) && vn && (
                    <span className="text-red-500 text-sm ml-2">
                      Invalid format
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveVehicleNumber(index)}
                    className="px-2 py-1 ml-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={onAddVehicleNumber}
                className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
              >
                <FaPlus className="inline-block mr-2" />
                Add Vehicle Number
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                className="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {user.id ? "Update" : "Add"}
              </button>
              <button
                className="px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
                type="button"
                onClick={onClose}
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
