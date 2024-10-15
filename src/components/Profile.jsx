import React, { useState } from "react";
import { FaUser, FaEnvelope, FaIdCard, FaCar } from "react-icons/fa";

const Profile = ({ userData, userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData || {});

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically update the user data in your database
    console.log("Updated user data:", editedData);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold mr-4">
              {userData.firstName ? userData.firstName[0].toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">
                {userData.firstName} {userData.lastName}
              </h3>
              <p className="text-gray-600">{userRole}</p>
            </div>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editedData.firstName}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editedData.lastName}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedData.email}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    readOnly
                  />
                </div>
                {userRole === "user" && (
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="vehicleNumbers"
                    >
                      Vehicle Numbers
                    </label>
                    <input
                      type="text"
                      id="vehicleNumbers"
                      name="vehicleNumbers"
                      value={editedData.vehicleNumbers}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaUser className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-semibold">
                    First Name:
                  </span>
                  <span className="ml-2">{userData.firstName}</span>
                </div>
                <div className="flex items-center">
                  <FaUser className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-semibold">
                    Last Name:
                  </span>
                  <span className="ml-2">{userData.lastName}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-semibold">Email:</span>
                  <span className="ml-2">{userData.email}</span>
                </div>
                <div className="flex items-center">
                  <FaIdCard className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-semibold">Role:</span>
                  <span className="ml-2">{userRole}</span>
                </div>
                {userRole === "user" && (
                  <div className="flex items-center">
                    <FaCar className="text-gray-500 mr-2" />
                    <span className="text-gray-700 font-semibold">
                      Vehicle Numbers:
                    </span>
                    <span className="ml-2">{userData.vehicleNumbers}</span>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
