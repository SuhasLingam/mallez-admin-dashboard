import React, { useState, useEffect } from "react";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseService";

const Profile = ({ userData, userRole, updateUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    vehicleNumbers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setEditedData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        vehicleNumbers: userData.vehicleNumbers || [],
      });
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [userData, userRole]);

  const fetchAdditionalData = async () => {
    if (!userData?.email) {
      toast.error("Failed to fetch additional profile data.");
      return;
    }

    try {
      let docRef;
      if (userRole === "admin") {
        docRef = doc(
          db,
          "platform_users",
          "admin",
          "admin",
          "TzHqb42NVOpDazYD1Igx"
        );
      } else if (userRole === "mallOwner") {
        // Assuming mallOwner has a similar structure, adjust if needed
        docRef = doc(
          db,
          "platform_users",
          "mallOwner",
          "mallOwner",
          userData.uid
        );
      }

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEditedData((prevData) => ({ ...prevData, ...docSnap.data() }));
      } else {
        toast.error("User profile data not found.");
      }
    } catch (error) {
      toast.error("Failed to fetch additional profile data.");
    }
  };

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
      // Validate vehicle numbers for user role
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

      // Remove address from editedData
      const { address, ...dataToUpdate } = editedData;

      await updateUserProfile(dataToUpdate);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
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
          value={value || ""}
          onChange={handleInputChange}
          className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
        />
      ) : (
        <p className="mt-1 text-sm text-gray-900">{value || "Not provided"}</p>
      )}
    </div>
  );

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!userData) {
    return <div>Error: User data not available. Please try again later.</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg"
      >
        <div className="px-6 py-4 bg-indigo-600">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-32 h-32 bg-indigo-100 rounded-full">
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
                    <div key={index} className="flex items-center mt-1">
                      <input
                        type="text"
                        value={vn || ""}
                        onChange={(e) =>
                          handleVehicleNumberChange(index, e.target.value)
                        }
                        className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                      {!validateVehicleNumber(vn) && vn && (
                        <span className="ml-2 text-sm text-red-500">
                          Invalid format
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                    {editedData.vehicleNumbers.map((vn, index) => (
                      <li key={index}>{vn || "Not provided"}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {(userRole === "admin" || userRole === "mallOwner") && (
              <>
                {renderField(
                  "Phone Number",
                  editedData.phoneNumber,
                  "phoneNumber"
                )}
              </>
            )}
            <div className="flex justify-end mt-6">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 mr-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md"
                  >
                    <FaTimes className="inline-block mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm"
                  >
                    <FaSave className="inline-block mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm"
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
