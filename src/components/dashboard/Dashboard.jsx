import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseService";
import { FaUsers, FaUserTie, FaUserShield, FaSearch } from "react-icons/fa";

const Dashboard = ({ userRole }) => {
  const [selectedUserType, setSelectedUserType] = useState(
    userRole === "admin" ? "users" : "users"
  );
  const [adminData, setAdminData] = useState([]);
  const [mallOwnerData, setMallOwnerData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedUserType]);

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedUserType, adminData, mallOwnerData, userData]);

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
      // Error handling could be improved here, e.g., setting an error state
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let dataToFilter = [];
    switch (selectedUserType) {
      case "admins":
        dataToFilter = adminData;
        break;
      case "mallOwners":
        dataToFilter = mallOwnerData;
        break;
      case "users":
        dataToFilter = userData;
        break;
      default:
        dataToFilter = [];
    }

    const filteredData = dataToFilter.filter((item) => {
      const searchString = searchTerm.toLowerCase();
      return (
        item.email.toLowerCase().includes(searchString) ||
        item.firstName.toLowerCase().includes(searchString) ||
        item.lastName.toLowerCase().includes(searchString) ||
        (item.vehicleNumbers &&
          item.vehicleNumbers.some((vn) =>
            vn.toLowerCase().includes(searchString)
          ))
      );
    });

    setDisplayData(filteredData);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderSearchBar = () => (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or vehicle number"
          value={searchTerm}
          onChange={handleSearchChange}
          className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderUserTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Email
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              First Name
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Last Name
            </th>
            {selectedUserType === "users" && (
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                Vehicle Numbers
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.email}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.firstName}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.lastName}
              </td>
              {selectedUserType === "users" && (
                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
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
        className="block mb-2 text-sm font-medium text-gray-700"
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
    <div className="md:grid-cols-3 grid grid-cols-1 gap-4 mb-6">
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUserShield className="mr-4 text-3xl text-purple-500" />
        <div>
          <h4 className="text-lg font-semibold">Admins</h4>
          <p className="text-2xl font-bold">{adminData.length}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUserTie className="mr-4 text-3xl text-green-500" />
        <div>
          <h4 className="text-lg font-semibold">Mall Owners</h4>
          <p className="text-2xl font-bold">{mallOwnerData.length}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUsers className="mr-4 text-3xl text-blue-500" />
        <div>
          <h4 className="text-lg font-semibold">Total Users</h4>
          <p className="text-2xl font-bold">{userData.length}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">Dashboard</h2>
      {userRole === "admin" && renderUserCounts()}
      {userRole === "admin" && renderUserTypeSelector()}
      {renderSearchBar()}
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            {userRole === "admin"
              ? selectedUserType.charAt(0).toUpperCase() +
                selectedUserType.slice(1)
              : "Users"}
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-12 h-12 border-b-2 border-gray-900 rounded-full"></div>
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
