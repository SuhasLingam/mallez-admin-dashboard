import React, { useState } from "react";
import { FaUser, FaEnvelope, FaIdCard, FaUserTag } from "react-icons/fa";

const Profile = ({ userData, userRole, updateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData || {});
  const [updateMessage, setUpdateMessage] = useState("");

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4 text-mainTextColor">
          Your Profile
        </h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage("");

    // Check if any data has changed
    const hasChanges = Object.keys(editedData).some(
      (key) => editedData[key] !== userData[key]
    );

    if (!hasChanges) {
      setUpdateMessage("No changes detected.");
      return;
    }

    try {
      await updateUser(userData.id, userRole, editedData);
      setUpdateMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage("Failed to update profile. Please try again.");
    }
  };

  const renderField = (icon, label, value, name, type = "text") => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{label}:</span>
        </div>
      </label>
      {isEditing ? (
        type === "select" && userRole === "admin" ? (
          <select
            name={name}
            value={editedData[name] || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="user">User</option>
            <option value="mallOwner">Mall Owner</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={editedData[name] || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={name === "role" && userRole !== "admin"}
          />
        )
      ) : (
        <p className="text-gray-600">{value || "N/A"}</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4 text-mainTextColor">
        Your Profile
      </h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {renderField(
            <FaEnvelope className="text-gray-500" />,
            "Email",
            userData.email,
            "email",
            "email"
          )}
          {renderField(
            <FaUser className="text-gray-500" />,
            "First Name",
            userData.firstName,
            "firstName"
          )}
          {renderField(
            <FaUser className="text-gray-500" />,
            "Last Name",
            userData.lastName,
            "lastName"
          )}
          {renderField(
            <FaUserTag className="text-gray-500" />,
            "Role",
            userRole,
            "role",
            userRole === "admin" ? "select" : "text"
          )}
          {userRole === "user" &&
            userData.vehicleNumbers &&
            renderField(
              <FaIdCard className="text-gray-500" />,
              "Vehicle Numbers",
              userData.vehicleNumbers,
              "vehicleNumbers",
              "text"
            )}

          <div className="mt-6">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData(userData);
                    setUpdateMessage("");
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
        {updateMessage && (
          <p
            className={`mt-4 ${
              updateMessage.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {updateMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
