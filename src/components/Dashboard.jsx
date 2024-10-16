import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Ensure this is your Firebase configuration file
import { FaUsers, FaUserTie, FaUserShield, FaUser } from "react-icons/fa";

const Dashboard = ({ userRole }) => {
  const [selectedUserType, setSelectedUserType] = useState(
    userRole === "admin" ? "users" : "users"
  );
  const [adminData, setAdminData] = useState([]);
  const [mallOwnerData, setMallOwnerData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetching users collection data
  useEffect(() => {
    fetchData();
  }, [selectedUserType]);

  useEffect(() => {
    console.log("Current displayData:", displayData);
  }, [displayData]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (userRole === "admin") {
        const adminSnapshot = await getDocs(collection(db, "admins"));
        const adminData = adminSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdminData(adminData);

        const mallOwnerSnapshot = await getDocs(collection(db, "mallOwners"));
        const mallOwnerData = mallOwnerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMallOwnerData(mallOwnerData);

        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserData(userData);

        switch (selectedUserType) {
          case "admins":
            setDisplayData(adminData);
            break;
          case "mallOwners":
            setDisplayData(mallOwnerData);
            break;
          case "users":
            setDisplayData(userData);
            break;
          default:
            setDisplayData([]);
        }
      } else if (userRole === "mallOwner") {
        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserData(userData);
        setDisplayData(userData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Name
            </th>
            {selectedUserType === "users" && (
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vehicle Numbers
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {item.email}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {item.firstName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {item.lastName}
              </td>
              {selectedUserType === "users" && (
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {item.vehicleNumbers && item.vehicleNumbers.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {item.vehicleNumbers.map((vn, index) => (
                        <li key={index}>{vn}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUserTypeSelector = () => (
    <div className="mb-6">
      <label
        htmlFor="userType"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select User Type:
      </label>
      <div className="flex space-x-4">
        {["users", "admins", "mallOwners"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedUserType(type)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              selectedUserType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type === "users" && <FaUsers className="mr-2" />}
            {type === "admins" && <FaUserShield className="mr-2" />}
            {type === "mallOwners" && <FaUserTie className="mr-2" />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderUserCounts = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <FaUserShield className="text-3xl text-purple-500 mr-4" />
        <div>
          <h4 className="text-lg font-semibold">Admins</h4>
          <p className="text-2xl font-bold">{adminData.length}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <FaUserTie className="text-3xl text-green-500 mr-4" />
        <div>
          <h4 className="text-lg font-semibold">Mall Owners</h4>
          <p className="text-2xl font-bold">{mallOwnerData.length}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <FaUsers className="text-3xl text-blue-500 mr-4" />
        <div>
          <h4 className="text-lg font-semibold">Total Users</h4>
          <p className="text-2xl font-bold">{userData.length}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Dashboard</h2>
      {userRole === "admin" && renderUserCounts()}
      {userRole === "admin" && renderUserTypeSelector()}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {userRole === "admin"
              ? selectedUserType.charAt(0).toUpperCase() +
                selectedUserType.slice(1)
              : "Users"}
          </h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            renderUserTable(displayData)
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
