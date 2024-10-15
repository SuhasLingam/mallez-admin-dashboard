import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Ensure this is your Firebase configuration file

const Dashboard = ({ userRole }) => {
  const [selectedUserType, setSelectedUserType] = useState(
    userRole === "admin" ? "users" : "users"
  );
  const [adminData, setAdminData] = useState([]);
  const [mallOwnerData, setMallOwnerData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [displayData, setDisplayData] = useState([]);

  // Fetching users collection data
  useEffect(() => {
    fetchData();
  }, [selectedUserType]);

  useEffect(() => {
    console.log("Current displayData:", displayData);
  }, [displayData]);

  const fetchData = async () => {
    try {
      if (userRole === "admin") {
        switch (selectedUserType) {
          case "admins":
            const adminSnapshot = await getDocs(collection(db, "admins"));
            setAdminData(
              adminSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
            setDisplayData(
              adminSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
            break;
          case "mallOwners":
            const mallOwnerSnapshot = await getDocs(
              collection(db, "mallOwners")
            );
            setMallOwnerData(
              mallOwnerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
            );
            setDisplayData(
              mallOwnerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
            );
            break;
          case "users":
            const userSnapshot = await getDocs(collection(db, "users"));
            setUserData(
              userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
            setDisplayData(
              userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
            break;
          default:
            setDisplayData([]);
        }
      } else if (userRole === "mallOwner") {
        const userSnapshot = await getDocs(collection(db, "users"));
        setUserData(
          userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setDisplayData(
          userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderUserTable = (data) => (
    <table className="min-w-full leading-normal">
      <thead>
        <tr>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Email
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            First Name
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Last Name
          </th>
          {selectedUserType === "users" && (
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
              Vehicle Number
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
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
                {item.vehicleNumber}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4 text-mainTextColor">
        Dashboard
      </h2>
      {userRole === "admin" && (
        <div className="mb-4">
          <label htmlFor="userType" className="mr-2">
            Select User Type:
          </label>
          <select
            id="userType"
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="users">Users</option>
            <option value="admins">Admins</option>
            <option value="mallOwners">Mall Owners</option>
          </select>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
        <h3 className="text-xl font-semibold m-4 text-mainTextColor">
          {userRole === "admin"
            ? selectedUserType.charAt(0).toUpperCase() +
              selectedUserType.slice(1)
            : "Users"}
        </h3>
        {renderUserTable(displayData)}
      </div>
    </div>
  );
};

export default Dashboard;
