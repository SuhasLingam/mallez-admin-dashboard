import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaUserTag,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = ({ userData, userRole, updateUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...userData });

  const validateVehicleNumber = (number) => {
    const pattern = /\b[A-Z]{2}[-.\s]?\d{2}[-.\s]?[A-Z]{1,2}[-.\s]?\d{4}\b/;
    return pattern.test(number);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleVehicleNumberChange = (index, value) => {
    const newVehicleNumbers = [...editedData.vehicleNumbers];
    newVehicleNumbers[index] = value;
    setEditedData({ ...editedData, vehicleNumbers: newVehicleNumbers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate vehicle numbers
      if (userRole === "user") {
        const invalidVehicleNumbers = editedData.vehicleNumbers.filter(
          (vn) => vn && !validateVehicleNumber(vn)
        );
        if (invalidVehicleNumbers.length > 0) {
          toast.error(
            "Invalid vehicle number format. Please check and try again."
          );
          return;
        }
      }

      await updateUserProfile(editedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditedData({ ...userData });
    setIsEditing(false);
  };

  const renderField = (label, value, name) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      ) : (
        <p className="mt-1 text-sm text-gray-900">{value}</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="px-6 py-4 bg-indigo-600">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
              <FaUser className="text-6xl text-indigo-600" />
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {renderField("First Name", editedData.firstName, "firstName")}
            {renderField("Last Name", editedData.lastName, "lastName")}
            {renderField("Email", editedData.email, "email")}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {userRole}
              </p>
            </div>
            {userRole === "user" && editedData.vehicleNumbers && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Numbers
                </label>
                {isEditing ? (
                  editedData.vehicleNumbers.map((vn, index) => (
                    <div key={index} className="mt-1 flex items-center">
                      <input
                        type="text"
                        value={vn}
                        onChange={(e) =>
                          handleVehicleNumberChange(index, e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      {!validateVehicleNumber(vn) && vn && (
                        <span className="ml-2 text-red-500 text-sm">
                          Invalid format
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                    {editedData.vehicleNumbers.map((vn, index) => (
                      <li key={index}>{vn}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTimes className="inline-block mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaSave className="inline-block mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaEdit className="inline-block mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
