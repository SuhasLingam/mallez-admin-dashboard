import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Ensure this is your Firebase configuration file
import { FaUser, FaUserTie, FaUsers } from "react-icons/fa";

const Dashboard = ({ userRole, adminData, mallOwnerData, userData }) => {
  const [selectedUserType, setSelectedUserType] = useState(
    userRole === "admin" ? "users" : "users"
  );
  const [displayData, setDisplayData] = useState([]);
  const [counts, setCounts] = useState({
    admins: 0,
    mallOwners: 0,
    users: 0,
  });

  useEffect(() => {
    setCounts({
      admins: adminData.length,
      mallOwners: mallOwnerData.length,
      users: userData.length,
    });
  }, [adminData, mallOwnerData, userData]);

  useEffect(() => {
    if (userRole === "admin") {
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
      setDisplayData(userData);
    }
  }, [selectedUserType, adminData, mallOwnerData, userData, userRole]);

  const renderUserTable = (data) => (
    <table className="min-w-full leading-normal">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Email
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            First Name
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Last Name
          </th>
          {selectedUserType === "users" && (
            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Vehicle Numbers
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p className="text-gray-900 whitespace-no-wrap">{item.email}</p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p className="text-gray-900 whitespace-no-wrap">
                {item.firstName}
              </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p className="text-gray-900 whitespace-no-wrap">
                {item.lastName}
              </p>
            </td>
            {selectedUserType === "users" && (
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                  {item.vehicleNumbers}
                </p>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {userRole === "admin" && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            User Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <FaUser className="text-3xl text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold">{counts.admins}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <FaUserTie className="text-3xl text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Mall Owners</p>
                <p className="text-2xl font-bold">{counts.mallOwners}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <FaUsers className="text-3xl text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{counts.users}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {userRole === "admin" ? "User Management" : "User List"}
          </h3>
          {userRole === "admin" && (
            <div className="mt-2">
              <label htmlFor="userType" className="mr-2 text-gray-700">
                Select User Type:
              </label>
              <select
                id="userType"
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="border rounded px-3 py-1 text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="users">Users</option>
                <option value="admins">Admins</option>
                <option value="mallOwners">Mall Owners</option>
              </select>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">{renderUserTable(displayData)}</div>
      </div>
    </div>
  );
};

export default Dashboard;
